/**
 * Seed script — run AFTER prisma migrate dev
 * Usage: npx tsx scripts/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { createHash } from "crypto";

const db = new PrismaClient();

async function getAnonId(email: string): Promise<string> {
    return createHash("sha256")
        .update("ce:" + email.toLowerCase())
        .digest("hex")
        .substring(0, 16);
}

async function main() {
    console.log("🌱 Seeding database...\n");

    // ── Schools ──────────────────────────────────────────────────────────────
    await db.school.upsert({
        where: { id: "ETHZ" },
        create: { id: "ETHZ", name: "ETH Zürich", domains: ["ethz.ch", "student.ethz.ch"] },
        update: {},
    });
    await db.school.upsert({
        where: { id: "UZH" },
        create: { id: "UZH", name: "University of Zürich", domains: ["uzh.ch"] },
        update: {},
    });
    await db.school.upsert({
        where: { id: "EPFL" },
        create: { id: "EPFL", name: "EPFL", domains: ["epfl.ch"] },
        update: {},
    });
    console.log("✓ Schools seeded");

    // ── Admin user ─────────────────────────────────────────────────────────
    const adminEmail = "daeun.kim725@gmail.com";
    const adminPassword = "Ab71332638!?";
    const passwordHash = hashSync(adminPassword, 10);
    const anonId = await getAnonId(adminEmail);

    const admin = await db.user.upsert({
        where: { email: adminEmail },
        create: {
            email: adminEmail,
            password_hash: passwordHash,
            display_name: "Admin",
            handle: "campus_echo_admin",
            anon_id: anonId,
            role: "admin",
            school_id: "ETHZ",
            school_verified: true,
            age_verified: true,
            verified_at: new Date(),
            mood: "focused",
        },
        update: {
            password_hash: passwordHash,
            role: "admin",
            school_verified: true,
            age_verified: true,
        },
    });
    console.log(`✓ Admin user: ${admin.email} (handle: @${admin.handle})`);

    // ── Extra test users ───────────────────────────────────────────────────
    const additionalAdmins = [
        { email: "daeunkim725@gmail.com", handle: "daeunkim_ethz" },
        { email: "daeunkim@gmail.com", handle: "daeunkim_uzh" },
    ];

    for (const u of additionalAdmins) {
        await db.user.upsert({
            where: { email: u.email },
            create: {
                email: u.email,
                password_hash: passwordHash, // same pw for convenience
                display_name: u.handle,
                handle: u.handle,
                anon_id: await getAnonId(u.email),
                role: "admin",
                school_id: "ETHZ",
                school_verified: true,
                age_verified: true,
                verified_at: new Date(),
                mood: "chill",
            },
            update: { password_hash: passwordHash, role: "admin" },
        });
        console.log(`✓ Admin: ${u.email}`);
    }

    console.log("\n✅ Seed complete!\n");
    console.log("Login credentials:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
}

main()
    .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
    .finally(() => db.$disconnect());
