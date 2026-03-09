import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

function calculateScore(upvotes: number, downvotes: number, createdAt: number): number {
    const ageInHours = (Date.now() - createdAt) / (1000 * 60 * 60);
    const netVotes = upvotes - downvotes;
    return netVotes / Math.pow(ageInHours + 2, 1.5);
}

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        const rateLimitResponse = checkRateLimit(req, "vote", 50, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "METHZod not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { target_type, target_id, vote_value } = body;

        if (!["post", "comment"].includes(target_type) || !target_id || ![-1, 0, 1].includes(vote_value)) {
            return Response.json({ error: "Invalid vote parameters" }, { status: 400 });
        }

        // Fetch the target
        const TargetEntity = target_type === "post" ? base44.asServiceRole.entities.Post : base44.asServiceRole.entities.Comment;
        const targets = await TargetEntity.filter({ id: target_id });
        const target = targets[0];

        if (!target || target.deleted_at) {
            return Response.json({ error: "Target not found" }, { status: 404 });
        }

        // Check for existing vote
        const uniqueVoteId = `${user.email}_${target_id}`;
        let existingVoteValue = 0;

        const existingVotes = await base44.asServiceRole.entities.Vote.filter({
            user_email: user.email,
            target_id: target_id
        });
        const existingVote = existingVotes[0];

        if (existingVote) {
            existingVoteValue = existingVote.vote_value;
        }

        // Return early if no change is needed
        if (existingVoteValue === vote_value) {
            return Response.json({ success: true, unchanged: true }, { status: 200 });
        }

        // Calculate differences
        let dUp = 0;
        let dDown = 0;

        // Undo existing
        if (existingVoteValue === 1) dUp = -1;
        if (existingVoteValue === -1) dDown = -1;

        // Apply new
        if (vote_value === 1) dUp += 1;
        if (vote_value === -1) dDown += 1;

        const newUpvotes = Math.max(0, (target.upvotes || 0) + dUp);
        const newDownvotes = Math.max(0, (target.downvotes || 0) + dDown);
        const newScore = calculateScore(newUpvotes, newDownvotes, target.created_at || Date.now());

        // Update target
        const updateData: any = {
            upvotes: newUpvotes,
            downvotes: newDownvotes
        };
        if (target_type === "post") {
            updateData.score = newScore;
        }
        await TargetEntity.update(target_id, updateData);

        // Update vote record
        if (vote_value === 0) {
            if (existingVote) {
                await base44.asServiceRole.entities.Vote.delete(existingVote.id);
            }
        } else {
            if (existingVote) {
                await base44.asServiceRole.entities.Vote.update(existingVote.id, { vote_value });
            } else {
                await base44.asServiceRole.entities.Vote.create({
                    user_email: user.email,
                    target_type,
                    target_id,
                    vote_value
                });
            }
        }

        return Response.json({
            success: true,
            upvotes: newUpvotes,
            downvotes: newDownvotes
        }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Vote error:", err);
        return Response.json({ error: "Failed to process vote" }, { status: 500 });
    }
}

export default withObservability(handler, "vote");
