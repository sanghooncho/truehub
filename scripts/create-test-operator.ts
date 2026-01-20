import { prisma } from "../src/infra/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@truehub.kr";
  const password = "admin123!";

  const existing = await prisma.operator.findFirst({
    where: { email },
  });

  const hash = await bcrypt.hash(password, 12);

  if (existing) {
    await prisma.operator.update({
      where: { id: existing.id },
      data: { passwordHash: hash },
    });
    console.log("Updated operator password:", email);
  } else {
    await prisma.operator.create({
      data: {
        email,
        name: "Admin",
        passwordHash: hash,
      },
    });
    console.log("Created operator:", email);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
