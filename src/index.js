export default {
  async fetch(req, env) {
    // Allow your site (add localhost for dev)
    const origin = req.headers.get("Origin");
    const allowed = new Set([
      "https://jvkenny.github.io",
      "http://localhost:5173", // vite dev
      "http://localhost:3000", // alt dev port
    ]);
    const allowOrigin = allowed.has(origin) ? origin : "https://jvkenny.github.io";

    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: cors });
    }

    const body = await req.text(); // forward JSON as-is
    const resp = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const text = await resp.text();
    const headers = new Headers(cors);
    headers.set("Content-Type", resp.headers.get("content-type") || "application/json");
    return new Response(text, { status: resp.status, headers });
  },
};
