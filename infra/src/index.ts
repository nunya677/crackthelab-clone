import { PrismaClient, Prisma } from "../generated/client/index.js";

export { PrismaClient, Prisma };

export * from "../generated/client/index.js";

export { hashFlag } from "./flag.js";

const prisma = new PrismaClient();

export { prisma };