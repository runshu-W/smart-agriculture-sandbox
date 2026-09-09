import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// 提供默认值，避免加载时因缺少环境变量而失败
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/temp";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
