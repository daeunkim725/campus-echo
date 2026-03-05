import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { differenceInMinutes } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch all upcoming events. For simplicity, just fetch recent events that are not deleted
        const posts = await base44.asServiceRole.entities.Post.filter({ category: "events", deleted: false }, "-created_date", 100);
        
        const now = new Date();
        
        for (const post of posts) {
            if (!post.event_date || !post.event_time || !post.interested_users || post.interested_users.length === 0) continue;
            
            // Assume America/New_York for event time
            const eventDateTime = new Date(`${post.event_date}T${post.event_time}:00-05:00`);
            
            if (isNaN(eventDateTime.getTime())) continue;
            
            const diffMins = differenceInMinutes(eventDateTime, now);
            
            let updated = false;
            const newInterestedUsers = [...post.interested_users];
            
            for (let i = 0; i < newInterestedUsers.length; i++) {
                const user = newInterestedUsers[i];
                if (!user.notified && diffMins >= 0 && diffMins <= user.reminder_minutes) {
                    // Trigger notification
                    await base44.asServiceRole.entities.Notification.create({
                        user_email: user.email,
                        type: "event_reminder",
                        post_id: post.id,
                        actor_alias: "System",
                        content: `Reminder: ${post.title} is starting in ${diffMins} minutes!`,
                        read: false
                    });
                    newInterestedUsers[i].notified = true;
                    updated = true;
                }
            }
            
            if (updated) {
                await base44.asServiceRole.entities.Post.update(post.id, { interested_users: newInterestedUsers });
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});