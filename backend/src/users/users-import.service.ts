import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { parse } from "csv-parse/sync";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "./schemas/user.schema";
import { UserImportDto } from "./dto/userImport.dto";
import { Option, OptionDocument } from "../options/schemas/option.schema";
import { Role, RoleDocument } from "../rbac/schema/role.schema";

type ImportUser = { userId?: string; id?: string };

const cleanValue = (value?: string) => {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
};

const parseBooleanValue = (value?: string) => {
  const v = cleanValue(value)?.toLowerCase();
  if (v === undefined) return undefined;
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  return undefined;
};

@Injectable()
export class UsersImportService {
  private readonly BATCH_SIZE = 300;
  private readonly TEMP_PASSWORD = "ChangeMe123!";

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Option.name)
    private readonly optionModel: Model<OptionDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>
  ) {}

  async importFromCsv(file: Buffer, user: ImportUser) {
    if (!file || !file.length) {
      throw new BadRequestException("CSV file is required.");
    }

    const actorId = user?.userId || user?.id;
    if (!actorId) {
      throw new BadRequestException("Authenticated user is required.");
    }

    const rows = parse(file, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    const results: Array<{
      row: number;
      userId: string;
      action: "created" | "updated";
    }> = [];
    const errors: Array<{ row: number; message: string }> = [];
    const errorRows: Array<Record<string, any>> = [];
    let created = 0;
    let updated = 0;
    const globalSeen = new Set<string>();

    for (let start = 0; start < rows.length; start += this.BATCH_SIZE) {
      const batch = rows.slice(start, start + this.BATCH_SIZE);
      const normRows: UserImportDto[] = [];
      const rowNumbers: number[] = [];

      // normalize + validate
      for (let i = 0; i < batch.length; i++) {
        const rowIndex = start + i;
        const rowNumber = rowIndex + 2; // header offset
        const raw = batch[i];
        try {
          const dto = await this.validateRow(this.normalizeRow(raw));
          normRows.push(dto);
          rowNumbers.push(rowNumber);
        } catch (err: any) {
          const message = err?.message || "Unknown error";
          errors.push({ row: rowNumber, message });
          errorRows.push({ row: rowNumber, ...raw, error: message });
        }
      }

      // prefetch roles/designations
      const roleMap = await this.prefetchRoles(
        Array.from(
          new Set(normRows.map((r) => r.role).filter(Boolean) as string[])
        ),
        actorId
      );
      const designationMap = await this.prefetchDesignations(
        Array.from(
          new Set(
            normRows.map((r) => r.designation).filter(Boolean) as string[]
          )
        ),
        actorId
      );

      // prefetch existing users by email
      const emails = Array.from(
        new Set(
          normRows
            .map((r) => r.email?.toLowerCase())
            .filter(Boolean) as string[]
        )
      );
      const existing = await this.userModel
        .find({
          email: { $in: emails },
        })
        .select("_id email")
        .lean();
      const emailToId = new Map(
        existing.map((u) => [u.email?.toLowerCase(), u._id.toString()])
      );

      type Op = {
        filter: any;
        update: any;
        key: string;
        row: number;
        raw: Record<string, any>;
        action: "created" | "updated";
      };
      const ops: Op[] = [];
      const seen = new Set<string>();

      normRows.forEach((dto, idx) => {
        const rowNumber = rowNumbers[idx];
        const raw = batch[idx];
        try {
          const payload: any = { ...dto };
          this.stripUndefined(payload);
          if (payload.status === undefined || payload.status === null) {
            delete payload.status;
          }
          if (payload.designation) {
            const id = designationMap.get(payload.designation);
            payload.designation = id ? new Types.ObjectId(id) : null;
          }
          if (payload.role) {
            const id = roleMap.get(payload.role.trim().toLowerCase());
            payload.roles = id ? [new Types.ObjectId(id)] : [];
          }

          const emailId =
            payload.email && emailToId.get(payload.email.toLowerCase());

          const existingId = emailId;
          const filter = existingId
            ? { _id: new Types.ObjectId(existingId) }
            : { email: payload.email };

          const dedupeKey = payload.email?.toLowerCase();
          if (dedupeKey && (seen.has(dedupeKey) || globalSeen.has(dedupeKey))) {
            const message = "Duplicate user in import (email)";
            errors.push({ row: rowNumber, message });
            errorRows.push({ row: rowNumber, ...raw, error: message });
            return;
          }
          if (dedupeKey) {
            seen.add(dedupeKey);
            globalSeen.add(dedupeKey);
          }

          ops.push({
            filter,
            update: {
              $set: {
                name: payload.name,
                email: payload.email,
                designation: payload.designation ?? null,
                roles: payload.roles ?? [],
                status: payload.status,
                updatedBy: new Types.ObjectId(actorId),
              },
              $setOnInsert: {
                passwordHash: undefined, // set below
                createdBy: new Types.ObjectId(actorId),
                isPasswordChanged: false,
              },
            },
            key: payload.email,
            row: rowNumber,
            raw,
            action: existingId ? "updated" : "created",
          });
        } catch (err: any) {
          const message = err?.message || "Unknown error";
          errors.push({ row: rowNumber, message });
          errorRows.push({ row: rowNumber, ...raw, error: message });
        }
      });

      if (ops.length) {
        const tempHash = await bcrypt.hash(this.TEMP_PASSWORD, 10);
        ops.forEach((op) => {
          op.update.$setOnInsert.passwordHash = tempHash;
        });

        const bulkOps = ops.map((op) => ({
          updateOne: {
            filter: op.filter,
            update: op.update,
            upsert: true,
          },
        }));

        let bulkFailed = false;
        try {
          await this.userModel.bulkWrite(bulkOps, { ordered: false });
        } catch (err: any) {
          if (err?.code !== 11000) {
            throw err;
          }
          bulkFailed = true;
        }

        if (bulkFailed) {
          // fallback per-op to capture dup errors row-level
          for (const op of ops) {
            try {
              const before = await this.userModel
                .findOne(op.filter)
                .select("_id")
                .lean();
              const doc = await this.userModel.findOneAndUpdate(
                op.filter,
                op.update,
                { upsert: true, new: true }
              );
              const action = before ? "updated" : "created";
              action === "created" ? created++ : updated++;
              results.push({
                row: op.row,
                userId: doc._id.toString(),
                action,
              });
            } catch (err: any) {
              const message = err?.message || "Unknown error";
              errors.push({ row: op.row, message });
              errorRows.push({ row: op.row, ...op.raw, error: message });
            }
          }
        } else {
          // bulk success; fetch ids and record
          const docs = await this.userModel
            .find({ $or: ops.map((o) => o.filter) })
            .select("_id email")
            .lean();
          const idMap = new Map(
            docs.map((d) => [d.email, d._id.toString()])
          );
          ops.forEach((op) => {
            const uid = idMap.get(op.key);
            if (uid) {
              op.action === "created" ? created++ : updated++;
              results.push({
                row: op.row,
                userId: uid,
                action: op.action,
              });
            }
          });
        }
      }

      if (rows.length > this.BATCH_SIZE) {
        await new Promise((res) => setTimeout(res, 50));
      }
    }

    const errorFile =
      errorRows.length > 0
        ? this.buildErrorFile(errorRows, Object.keys(rows[0] || {}))
        : null;

    return {
      summary: { total: rows.length, created, updated, failed: errors.length },
      results,
      errors,
      errorFile,
      tempPasswordNote: "New users are created with a temporary password.",
    };
  }

  private normalizeRow(row: Record<string, string>): Partial<UserImportDto> {
    return {
      name: cleanValue(row.name),
      email: cleanValue(row.email)?.toLowerCase(),
      designation: cleanValue(row.designation),
      role: cleanValue(row.role),
      status: parseBooleanValue(row.status),
    };
  }

  private async validateRow(
    row: Partial<UserImportDto>
  ): Promise<UserImportDto> {
    const dto = plainToInstance(UserImportDto, row, {
      enableImplicitConversion: true,
    });
    const errors = await validate(dto, { whitelist: true });
    if (errors.length) {
      const message = errors
        .map((err) => Object.values(err.constraints || {}).join(", "))
        .filter(Boolean)
        .join("; ");
      throw new BadRequestException(message || "Validation failed");
    }
    return dto;
  }

  private async prefetchDesignations(names: string[], actorId: string) {
    const map = new Map<string, string>();
    for (const name of names) {
      if (!name) continue;
      const option = await this.optionModel
        .findOneAndUpdate(
          { name, type: "user-designations" },
          {
            $setOnInsert: {
              name,
              type: "user-designations",
              createdBy: new Types.ObjectId(actorId),
              status: 1,
            },
          },
          { new: true, upsert: true }
        )
        .select("_id")
        .lean();
      if (option?._id) {
        map.set(name, option._id.toString());
      }
    }
    return map;
  }

  private async prefetchRoles(names: string[], actorId: string) {
    const map = new Map<string, string>();
    for (const raw of names) {
      if (!raw) continue;
      const norm = raw.trim().toLowerCase();
      if (!norm) continue;
      const role = await this.roleModel
        .findOneAndUpdate(
          { name: norm },
          {
            $setOnInsert: {
              name: norm,
              createdBy: new Types.ObjectId(actorId),
            },
          },
          { new: true, upsert: true }
        )
        .select("_id")
        .lean();
      if (role?._id) {
        map.set(norm, role._id.toString());
      }
    }
    return map;
  }

  private stripUndefined(payload: Record<string, any>) {
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });
  }

  private buildErrorFile(
    errorRows: Array<Record<string, any>>,
    headers: string[]
  ) {
    const cols = ["row", ...headers.filter((h) => h !== "row"), "error"];
    const lines = [cols.join(",")];
    for (const row of errorRows) {
      const line = cols
        .map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return "";
          const v = String(value).replace(/"/g, '""');
          return `"${v}"`;
        })
        .join(",");
      lines.push(line);
    }
    const csv = lines.join("\n");
    return {
      filename: "user-import-errors.csv",
      contentType: "text/csv",
      data: Buffer.from(csv, "utf8").toString("base64"),
    };
  }
}
