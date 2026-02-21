export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Enable CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    try {

      // GET COMMENTS
      if (url.pathname === "/comments" && request.method === "GET") {
        const videoId = url.searchParams.get("video_id");

        const { results } = await env.DB.prepare(
          "SELECT * FROM comments WHERE video_id = ? ORDER BY id DESC"
        )
        .bind(videoId)
        .all();

        return jsonResponse(results);
      }

      // POST COMMENT
      if (url.pathname === "/comments" && request.method === "POST") {
        const { text, video_id } = await request.json();

        if (!text || text.length < 2)
          return jsonResponse({ error: "Comment too short" }, 400);

        if (text.includes("http"))
          return jsonResponse({ error: "Links not allowed" }, 400);

        await env.DB.prepare(
          "INSERT INTO comments (video_id, text) VALUES (?, ?)"
        )
        .bind(video_id, text)
        .run();

        return jsonResponse({ success: true });
      }

      // AI ASSISTANT
      if (url.pathname === "/ai" && request.method === "POST") {
        const { prompt } = await request.json();

        const result = await env.AI.run(
          "@cf/meta/llama-3-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content: "You are the StreamSphere AI assistant. Be helpful and concise."
              },
              {
                role: "user",
                content: prompt
              }
            ]
          }
        );

        return jsonResponse({ response: result.response });
      }

      return jsonResponse({ error: "Not Found" }, 404);

    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}