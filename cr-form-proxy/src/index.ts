const TARGET = "https://script.google.com/macros/s/AKfycbzZY-BmzLZVWXAJ7bKl0Z2J71Qm6kw6ECNvO8PKarEsvDdzSX7LLe3QnR7B0qRpW4CD/exec";
const ORIGIN = "https://jvkenny.github.io";

export default {
  async fetch(req: Request): Promise<Response> {
    const cors = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method === "GET") return new Response("OK: cr-form-proxy alive", { status: 200, headers: cors });
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

    const bodyText = await req.text();

    // 15s timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), 15000);

    try {
      // 1) POST to Apps Script, but don't auto-follow
      const first = await fetch(TARGET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyText,
        redirect: "manual",
        signal: controller.signal,
      });

      // If Apps Script replied 302 with a Location, follow it with GET
      if (first.status === 302 || first.status === 301 || first.status === 303) {
        const loc = first.headers.get("Location");
        if (!loc) {
          clearTimeout(timer);
          return new Response(JSON.stringify({ ok: false, error: "missing_redirect_location" }), {
            status: 502, headers: { ...cors, "Content-Type": "application/json" }
          });
        }
        const second = await fetch(loc, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
        });
        clearTimeout(timer);
        const text = await second.text();
        const headers = new Headers(cors);
        headers.set("Content-Type", second.headers.get("content-type") || "application/json");
        return new Response(text, { status: second.status, headers });
      }

      // If no redirect, just proxy the response through
      clearTimeout(timer);
      const passthrough = await first.text();
      const headers = new Headers(cors);
      headers.set("Content-Type", first.headers.get("content-type") || "application/json");
      return new Response(passthrough, { status: first.status, headers });
    } catch (err: any) {
      clearTimeout(timer);
      const status = err?.message === "timeout" ? 504 : 502;
      return new Response(JSON.stringify({ ok: false, error: "proxy_failed", message: String(err) }), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
} satisfies ExportedHandler;
