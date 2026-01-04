import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersSeeder } from "./seeder/users/users.seeder";
import { UserDetailsSeeder } from "./seeder/users/userDetails.seeder";
import { UserDocumentsSeeder } from "./seeder/users/userDocuments.seeder";
import { RoleSeeder } from "./seeder/roles/role.seeder";
import { OptionsSeeder } from "./seeder/options/options.seeder";
import { Types } from "mongoose";

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    // 🔹 Retrieve seeders from Nest’s dependency injection
    const roleSeeder = app.get(RoleSeeder);
    const usersSeeder = app.get(UsersSeeder);
    const userDetailsSeeder = app.get(UserDetailsSeeder);
    const userDocumentsSeeder = app.get(UserDocumentsSeeder);
    const optionsSeeder = app.get(OptionsSeeder);

    // 🔹 Step 1: Seed Roles
    await roleSeeder.seed();

    // 🔹 Step 2: Seed Admin User
    const userId = await usersSeeder.seedAdmin();

    // 🔹 Step 3: Seed Related Data
    await userDetailsSeeder.seed(userId as unknown as Types.ObjectId);
    await userDocumentsSeeder.seed(userId as unknown as Types.ObjectId);
    await optionsSeeder.seed(userId as unknown as Types.ObjectId);

    console.log("✅ Seeding completed successfully!");
  } catch (e) {
    console.error("❌ Seeding failed:", e);
  } finally {
    await app.close();
    process.exit(0);
  }
})();
