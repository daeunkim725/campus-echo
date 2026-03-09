import { db } from "@/lib/db";
import { requireVerified } from "@/lib/auth";

// POST /api/polls/vote
// Body: { option_id: string }
export async function POST(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const { option_id } = await request.json();

        if (!option_id) {
            return Response.json({ error: "option_id is required" }, { status: 400 });
        }

        const option = await db.pollOption.findUnique({ where: { id: option_id } });
        if (!option) return Response.json({ error: "Poll option not found" }, { status: 404 });

        // Check if user already voted on this poll (any option for the same post)
        const existingVote = await db.pollVote.findFirst({
            where: {
                user_id: user.id,
                option: { post_id: option.post_id },
            },
            include: { option: true },
        });

        if (existingVote) {
            if (existingVote.option_id === option_id) {
                return Response.json({ error: "Already voted on this option" }, { status: 400 });
            }
            // Change vote: decrement old, increment new
            await db.pollOption.update({
                where: { id: existingVote.option_id },
                data: { votes_count: { decrement: 1 } },
            });
            await db.pollVote.update({
                where: { id: existingVote.id },
                data: { option_id },
            });
        } else {
            await db.pollVote.create({ data: { option_id, user_id: user.id } });
        }

        await db.pollOption.update({
            where: { id: option_id },
            data: { votes_count: { increment: 1 } },
        });

        const updatedOptions = await db.pollOption.findMany({ where: { post_id: option.post_id } });
        return Response.json({ options: updatedOptions });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Poll vote error:", err);
        return Response.json({ error: "Failed to register poll vote" }, { status: 500 });
    }
}
