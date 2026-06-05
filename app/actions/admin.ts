"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userSchema } from "@/lib/validation";

export async function createUserAction(formData: FormData) {
  const admin = await requireUser(Role.ADMIN);
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.password) throw new Error("Invalid user data");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      plan: parsed.data.plan,
      active: parsed.data.active,
      expiredAt: parsed.data.expiredAt
    }
  });
  await prisma.activityLog.create({ data: { userId: admin.id, action: `ADMIN_CREATE_USER:${parsed.data.email}` } });
  revalidatePath("/admin/users");
}

export async function updateUserAction(formData: FormData) {
  const admin = await requireUser(Role.ADMIN);
  const id = String(formData.get("id"));
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid user data");

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      plan: parsed.data.plan,
      active: parsed.data.active,
      expiredAt: parsed.data.expiredAt,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 12) } : {})
    }
  });
  await prisma.activityLog.create({ data: { userId: admin.id, action: `ADMIN_UPDATE_USER:${id}` } });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireUser(Role.ADMIN);
  const id = String(formData.get("id"));
  if (id === admin.id) throw new Error("Admin cannot delete own account");
  await prisma.user.delete({ where: { id } });
  await prisma.activityLog.create({ data: { userId: admin.id, action: `ADMIN_DELETE_USER:${id}` } });
  revalidatePath("/admin/users");
}
