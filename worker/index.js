export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/comments" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM comments ORDER BY id DESC"
      ).all();
      return Response.json(results);
    }

    if (url.pathname === "/comments" && request.method === "POST") {
      const { text } = await request.json();
      await env.DB.prepare(
        "INSERT INTO comments (text) VALUES (?)"
      ).bind(text).run();
      return Response.json({ success: true });
    }

    if (url.pathname === "/ai" && request.method === "POST") {
      const { prompt } = await request.json();

      const aiResponse = await fetch(
        "https://api.cloudflare.com/client/v4/accounts/bbc2491dad2ff892bc90df5c59e51a19/ai/run/@cf/meta/llama-3-8b-instruct",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.AI_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt })
        }
      );

      const result = await aiResponse.json();
      return Response.json({ response: result.result.response });
    }

    return new Response("Not Found", { status: 404 });
  }
};