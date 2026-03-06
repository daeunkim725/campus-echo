/**
 * feedList — Get anonymous feed posts for a school
 * POST { school, sort, category, department, limit, offset }
 * Requires: authenticated + verified user
 * Returns: anonymized posts (no author identity exposed)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import {
    requireVerified,
    corsHeaders,
    handleCORS,
} from './_shared/authMiddleware.ts';

Deno.serve(async (req) => {
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "POST" && req.method !== "GET") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        // Require authenticated + verified user
        const { user, base44 } = await requireVerified(req);

        // Parse params from body (POST) or query string (GET)
        let params: any = {};
        if (req.method === "POST") {
            try { params = await req.json(); } catch { params = {}; }
        } else {
            const url = new URL(req.url);
            params = {
                school: url.searchParams.get("school"),
                sort: url.searchParams.get("sort") || "new",
                category: url.searchParams.get("category") || "all",
                department: url.searchParams.get("department") || "all",
                limit: parseInt(url.searchParams.get("limit") || "50"),
                offset: parseInt(url.searchParams.get("offset") || "0"),
            };
        }

        const school = params.school || user.school;
        const sort = params.sort || "new";
        const category = params.category || "all";
        const department = params.department || "all";
        const limit = Math.min(params.limit || 50, 200);
        const offset = params.offset || 0;

        // Fetch posts sorted by newest first
        let posts = await base44.asServiceRole.entities.Post.list("-created_date", 500);

        // Filter to school
        if (school) {
            posts = posts.filter((p: any) => {
                if (!p.department || p.department === "all") return true;
                if (school === "ETH") return p.department.startsWith("D-") || p.department === "ETH";
                return p.department === school;
            });
        }

        // Filter by category
        if (category !== "all") {
            posts = posts.filter((p: any) => p.category === category);
        } else {
            // Default: exclude events category
            posts = posts.filter((p: any) => p.category !== "events");
        }

        // Filter by department
        if (department !== "all") {
            posts = posts.filter((p: any) => p.department === department);
        }

        // Sort
        if (sort === "hot") {
            posts.sort((a: any, b: any) =>
                ((b.upvotes || 0) + (b.comment_count || 0)) -
                ((a.upvotes || 0) + (a.comment_count || 0))
            );
        } else if (sort === "top") {
            posts.sort((a: any, b: any) =>
                ((b.upvotes || 0) - (b.downvotes || 0)) -
                ((a.upvotes || 0) - (a.downvotes || 0))
            );
        }
        // "new" is already sorted by -created_date

        // Paginate
        const total = posts.length;
        const paginated = posts.slice(offset, offset + limit);

        // Anonymize: strip author identity fields
        const anonymized = paginated.map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            department: post.department,
            academic_level: post.academic_level,
            media_url: post.media_url,
            gif_url: post.gif_url,
            poll_options: post.poll_options,
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            comment_count: post.comment_count || 0,
            created_date: post.created_date,
            updated_date: post.updated_date,
            deleted: post.deleted || false,
            // Anonymous author info — only mood/alias, never real identity
            author_mood: post.author_mood || null,
            author_alias: post.author_alias || "Anonymous",
            author_school: post.author_school || school,
            // Whether current user is the author (for edit/delete perms)
            is_own_post: post.created_by === user.id || post.created_by === user.email,
            // Event fields
            event_date: post.event_date,
            event_time: post.event_time,
            event_location: post.event_location,
            interested_users: post.interested_users?.length || 0,
        }));

        return Response.json({
            posts: anonymized,
            total,
            limit,
            offset,
            has_more: offset + limit < total,
        }, { headers: corsHeaders() });

    } catch (error) {
        if (error instanceof Response) return error;
        console.error("Feed list error:", error);
        return Response.json(
            { error: "Failed to load feed." },
            { status: 500, headers: corsHeaders() }
        );
    }
});
