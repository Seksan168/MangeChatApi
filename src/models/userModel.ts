import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userModel = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  create: (data: { username: string; email: string; password: string; role: string }) =>
    prisma.user.create({ data }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
};
