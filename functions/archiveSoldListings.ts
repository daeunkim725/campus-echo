import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Use service role since this is a scheduled background task
        const listings = await base44.asServiceRole.entities.MarketListing.list();
        
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        let archivedCount = 0;
        
        for (const listing of listings) {
            if (listing.status === "sold") {
                const updatedTime = new Date(listing.updated_date || listing.created_date).getTime();
                if (updatedTime < thirtyDaysAgo) {
                    await base44.asServiceRole.entities.MarketListing.update(listing.id, { status: "archived" });
                    archivedCount++;
                }
            }
        }

        return Response.json({ success: true, archivedCount });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});