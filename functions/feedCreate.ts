/**
 * feedCreate — Create a new anonymous post
 * POST { title, content, category, department, poll_options, media_url, gif_url, event_date, event_time, event_location }
 * Requires: authenticated + verified user
 * Stores author internally but never exposes in feed responses
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import {
    requireVerified,
    checkRateLimit,
    corsHeaders,
    handleCORS,
} from './_shared/authMiddleware.ts';

Deno.serve(async (req) => {
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
    }

    // Rate limit: 10 posts per user per hour
    const rateLimited = checkRateLimit(req, "feed-create", 10, 60 * 60 * 1000);
    if (rateLimited) return rateLimited;

    try {
        // Require authenticated + verified user
        const { payload, user, base44 } = await requireVerified(req);

        const body = await req.json();
        const {
            title,
            content,
            category,
            department,
            academic_level,
            poll_options,
            media_url,
            gif_url,
            event_date,
            event_time,
            event_location,
        } = body;

        // Validate required fields
        if (!content && !title) {
            return Response.json(
                { error: "Post must have a title or content" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Build the post object
        const postData: any = {
            title: title || "",
            content: content || "",
            category: category || "general",
            department: department || user.school || "all",
            academic_level: academic_level || null,
            upvotes: 0,
            downvotes: 0,
            comment_count: 0,
            deleted: false,
            // Internal author tracking (never exposed in feed)
            created_by: user.id,
            author_email: user.email,
            // Anonymous identity (exposed in feed)
            author_mood: user.mood || null,
            author_alias: user.mood
                ? `${user.mood.charAt(0).toUpperCase() + user.mood.slice(1)} Student`
                : "Anonymous",
            author_school: user.school,
        };

        // Optional fields
        if (poll_options && Array.isArray(poll_options)) {
            postData.poll_options = poll_options;
        }
        if (media_url) postData.media_url = media_url;
        if (gif_url) postData.gif_url = gif_url;
        if (event_date) postData.event_date = event_date;
        if (event_time) postData.event_time = event_time;
        if (event_location) postData.event_location = event_location;

        // Create the post
        const post = await base44.asServiceRole.entities.Post.create(postData);

        // Return anonymized version
        return Response.json({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            department: post.department,
            academic_level: post.academic_level,
            media_url: post.media_url,
            gif_url: post.gif_url,
            poll_options: post.poll_options,
            upvotes: 0,
            downvotes: 0,
            comment_count: 0,
            created_date: post.created_date,
            author_mood: postData.author_mood,
            author_alias: postData.author_alias,
            author_school: postData.author_school,
            is_own_post: true,
            event_date: post.event_date,
            event_time: post.event_time,
            event_location: post.event_location,
        }, { status: 201, headers: corsHeaders() });

    } catch (error) {
        if (error instanceof Response) return error;
        console.error("Feed create error:", error);
        return Response.json(
            { error: "Failed to create post. Please try again." },
            { status: 500, headers: corsHeaders() }
        );
    }
});
