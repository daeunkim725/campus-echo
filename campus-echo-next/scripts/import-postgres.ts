/**
 * Postgres import script: reads JSON export files from /tmp/base44-export/
 * and inserts them into the local Postgres DB via Prisma.
 *
 * Run AFTER:
 *   1. npx tsx scripts/export-base44.ts
 *   2. npx prisma migrate dev
 *
 * Usage: npx tsx scripts/import-postgres.ts
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const db = new PrismaClient();
const IN_DIR = path.join(__dirname, "../tmp/base44-export");

function readJSON(name: string): any[] {
    const p = path.join(IN_DIR, `${name}.json`);
    if (!fs.existsSync(p)) {
        console.warn(`  ⚠ ${name}.json not found, skipping`);
        return [];
    }
    return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function main() {
    console.log("Starting import...\n");

    // ── Schools (seed) ─────────────────────────────────────────────────────────
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

    // ── Users ──────────────────────────────────────────────────────────────────
    const users = readJSON("User");
    let userOk = 0, userFail = 0;
    for (const u of users) {
        try {
            await db.user.upsert({
                where: { id: u.id ?? "" },
                create: {
                    id: u.id,
                    email: u.email?.toLowerCase() ?? "",
                    password_hash: u.password_hash ?? "",
                    display_name: u.display_name ?? u.email?.split("@")[0],
                    handle: u.handle ?? `user_${u.id?.substring(0, 6)}`,
                    anon_id: u.anon_id ?? u.id,
                    role: u.role ?? "user",
                    school_id: u.school_id || u.school || null,
                    school_email: u.school_email ?? null,
                    school_verified: u.school_verified ?? u.is_verified_student ?? false,
                    age_verified: u.age_verified ?? false,
                    verified_at: u.verified_at ? new Date(u.verified_at) : null,
                    mood: u.mood ?? "chill",
                },
                update: { email: u.email?.toLowerCase() },
            });
            userOk++;
        } catch (e: any) {
            console.warn(`  User ${u.email}: ${e.message}`);
            userFail++;
        }
    }
    console.log(`Users: ${userOk} OK, ${userFail} failed`);

    // ── Posts ──────────────────────────────────────────────────────────────────
    const posts = readJSON("Post");
    let postOk = 0, postFail = 0;
    for (const p of posts) {
        if (p.deleted_at) continue; // skip hard-deleted
        try {
            const authorUser = await db.user.findFirst({ where: { email: p.author_email?.toLowerCase() } });
            if (!authorUser) { postFail++; continue; }

            await db.post.upsert({
                where: { id: p.id },
                create: {
                    id: p.id,
                    school_id: p.school_id ?? p.school ?? "ETHZ",
                    author_id: authorUser.id,
                    author_anon_id: p.author_anon_id ?? authorUser.anon_id,
                    author_mood: p.author_mood,
                    content: p.content ?? "",
                    category: p.category ?? "general",
                    post_type: p.post_type ?? "text",
                    upvotes: p.upvotes ?? 0,
                    downvotes: p.downvotes ?? 0,
                    score: p.score ?? 0,
                    comment_count: p.comment_count ?? 0,
                    repost_count: p.repost_count ?? 0,
                    quote_count: p.quote_count ?? 0,
                    parent_post_id: p.parent_post_id ?? null,
                    root_post_id: p.root_post_id ?? null,
                    created_at: p.created_at ? new Date(Number.isFinite(p.created_at) ? p.created_at : Date.parse(p.created_at)) : new Date(),
                },
                update: {},
            });
            postOk++;
        } catch (e: any) {
            console.warn(`  Post ${p.id}: ${e.message}`);
            postFail++;
        }
    }
    console.log(`Posts: ${postOk} OK, ${postFail} failed`);

    // ── Comments ───────────────────────────────────────────────────────────────
    const comments = readJSON("Comment");
    let commentOk = 0, commentFail = 0;
    for (const c of comments) {
        if (c.deleted_at) continue;
        try {
            const author = await db.user.findFirst({ where: { email: c.author_email?.toLowerCase() } });
            if (!author) { commentFail++; continue; }
            await db.comment.upsert({
                where: { id: c.id },
                create: {
                    id: c.id,
                    post_id: c.post_id,
                    author_id: author.id,
                    author_anon_id: c.author_anon_id ?? author.anon_id,
                    author_mood: c.author_mood,
                    content: c.content ?? "",
                    upvotes: c.upvotes ?? 0,
                    downvotes: c.downvotes ?? 0,
                    created_at: new Date(c.created_at ?? Date.now()),
                },
                update: {},
            });
            commentOk++;
        } catch (e: any) {
            console.warn(`  Comment ${c.id}: ${e.message}`);
            commentFail++;
        }
    }
    console.log(`Comments: ${commentOk} OK, ${commentFail} failed`);

    // ── Market Listings ────────────────────────────────────────────────────────
    const listings = readJSON("MarketListing");
    let listingOk = 0, listingFail = 0;
    for (const l of listings) {
        if (l.deleted_at) continue;
        try {
            const seller = await db.user.findFirst({ where: { email: l.seller_email?.toLowerCase() } });
            if (!seller) { listingFail++; continue; }
            await db.listing.upsert({
                where: { id: l.id },
                create: {
                    id: l.id,
                    school_id: l.school_id ?? "ETHZ",
                    seller_id: seller.id,
                    seller_anon_id: l.seller_anon_id ?? seller.anon_id,
                    title: l.title ?? "Untitled",
                    description: l.description,
                    price: l.price ?? 0,
                    is_free: l.is_free ?? false,
                    category: l.category ?? "other",
                    condition: l.condition ?? "good",
                    pickup_location_tag: l.pickup_location_tag,
                    status: l.status ?? "active",
                    created_at: new Date(l.created_at ?? Date.now()),
                    images: l.images?.length
                        ? { create: (l.images as string[]).map((url, i) => ({ url, order_index: i })) }
                        : undefined,
                },
                update: {},
            });
            listingOk++;
        } catch (e: any) {
            console.warn(`  Listing ${l.id}: ${e.message}`);
            listingFail++;
        }
    }
    console.log(`Listings: ${listingOk} OK, ${listingFail} failed\n`);

    console.log("Import complete. Review any warnings above.");
    await db.$disconnect();
}

main().catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
});
