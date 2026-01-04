import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Option, OptionDocument } from "../../options/schemas/option.schema";
import { allOptions } from "./options.data";

@Injectable()
export class OptionsSeeder {
  constructor(
    @InjectModel(Option.name)
    private readonly optionModel: Model<OptionDocument>
  ) {}

  // ✅ Use Mongoose's Model methods instead of native Collection
  private async ensureIndexes() {
    await this.optionModel.collection.createIndex(
      { name: 1, type: 1 },
      { unique: true }
    );
  }

  async seed(createdBy: Types.ObjectId) {
    await this.ensureIndexes();
    const now = new Date();

    const ops = allOptions.map((item) => ({
      updateOne: {
        filter: { name: item.name, type: item.type },
        update: {
          $setOnInsert: {
            ...item,
            createdBy,
            createdAt: now,
          },
          $set: { updatedAt: now },
        },
        upsert: true,
      },
    }));

    const res = await this.optionModel.bulkWrite(ops, { ordered: false });

    console.log(
      `✅ Options upserted: ${res.upsertedCount ?? 0}, modified: ${
        res.modifiedCount ?? 0
      }`
    );
  }
}
