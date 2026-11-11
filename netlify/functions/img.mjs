/* GET /api/img/<key> — photos uploaded from the panel (served from the site's own domain). */
import { images } from "./_lib.mjs";
export default async (req, context) => {
  const key = (context.params && context.params.key) || new URL(req.url).pathname.split("/").pop();
  if (!/^[\w.-]+$/.test(key)) return new Response("", { status: 400 });
  const r = await images().getWithMetadata(key, { type: "arrayBuffer" });
  if (!r || !r.data) return new Response("", { status: 404 });
  return new Response(r.data, { headers: { "content-type": (r.metadata && r.metadata.type) || "image/webp",
    "cache-control": "public, max-age=31536000, immutable" } });
};
export const config = { path: "/api/img/:key" };
