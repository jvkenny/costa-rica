export default {
  async fetch(req, env) {
    // Log to confirm we’re running the right code
    console.log("cr-form-proxy hit:", req.method, new URL(req.url).pathname);

    // Allow your site (and localhost for dev)
    const origin = req.headers.get("Origin");
    const allowed = new Set([
      "https://jvkenny.github.io",
      "http://localhost:5173",
      "http://localhost:3000",
    ]);
    const allowOrigin = allowed.has(origin) ? origin : "https://jvkenny.github.io";

    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "X-Worker": "cr-form-proxy",                 // <-- fingerprint so we can see it in curl
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (req.method === "GET") {
      // Handy probe to make sure this code is live
      return new Response("OK: cr-form-proxy alive", { status: 200, headers: cors });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed (use POST)", { status: 405, headers: cors });
    }

    // Forward JSON body to Apps Script
    const body = await req.text();
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
