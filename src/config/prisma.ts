import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {env} from "./env.js";

// L'adaptateur reçoit la DATABASE_URL et gère la connexion mysql2
const adapter = new PrismaMariaDb(env.databaseUrl);

let prisma: PrismaClient;

// Singleton : réutilise l'instance existante en dev (hot-reload nodemon)
if (!globalThis.prisma) {
  prisma = new PrismaClient({ adapter });

  if (env.nodeEnv !== "production") {
    globalThis.prisma = prisma;   // stocké globalement seulement en dev
  }
} else {
  prisma = globalThis.prisma;
}

export default prisma;