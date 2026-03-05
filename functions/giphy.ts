import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const action = payload.action; // 'trending' or 'search'
        const query = payload.query || '';
        const limit = payload.limit || 20;
        
        const apiKey = Deno.env.get("GIPHY_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'GIPHY_API_KEY is not set' }, { status: 500 });
        }

        let url = '';
        if (action === 'search') {
            url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`;
        } else {
            url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=g`;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log("Giphy data:", data);

        return Response.json({ data: data.data });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});