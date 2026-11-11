/* GET /api/content — the content published from the panel (404 until the first publish: the page then keeps its built-in copy). */
import { content } from "./_lib.mjs";
export default async () => {
  try {
    const t = await content().get("content.json");
    if (!t) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    return new Response(t, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch { return new Response("", { status: 404, headers: { "cache-control": "no-store" } }); }
};
export const config = { path: "/api/content" };
