import { requireVerified, handleCORS } from './_shared/authMiddleware.ts';

export default async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        if (req.method !== "DELETE") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const url = new URL(req.url);
        const postId = url.searchParams.get("id");

        if (!postId) {
            return Response.json({ error: "Post ID is required" }, { status: 400 });
        }

        // Fetch post using service role to bypass row-level-security 
        // since the author_email isn't known to the client anyway
        const posts = await base44.asServiceRole.entities.Post.filter({ id: postId });
        const post = posts[0];

        if (!post) {
            return Response.json({ error: "Post not found" }, { status: 404 });
        }

        // Verify ownership or admin
        if (post.author_email !== user.email && user.role !== "admin") {
            return Response.json({ error: "Unauthorized to delete this post" }, { status: 403 });
        }

        // Soft delete
        await base44.asServiceRole.entities.Post.update(postId, {
            deleted_at: Date.now()
        });

        return Response.json({ success: true }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Feed delete error:", err);
        return Response.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
