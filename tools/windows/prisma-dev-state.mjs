import { getServerStatus } from "@prisma/dev/internal/state";

const name = process.argv[2] || "smart-v2";
const status = await getServerStatus(name);
const databaseUrl = status.exports?.database?.prismaORMConnectionString
  ?? status.exports?.database?.connectionString
  ?? null;

process.stdout.write(JSON.stringify({
  name: status.name,
  status: status.status,
  databasePort: status.databasePort > 0 ? status.databasePort : null,
  databaseUrl,
}));
