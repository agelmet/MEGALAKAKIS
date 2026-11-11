/* POST /api/upload  (header x-pass, body = the image, already shrunk on the phone) -> {url:"/api/img/<key>"} */
import { images, json, checkPass } from "./_lib.mjs";
const TYPES = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
export default async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!(await checkPass(req.headers.get("x-pass")))) return json({ ok: false, error: "pass" }, 401);
  const type = (req.headers.get("content-type") || "").split(";")[0];
  if (!TYPES[type]) return json({ ok: false, error: "type" }, 415);
  const buf = await req.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > 5 * 1024 * 1024) return json({ ok: false, error: "size" }, 413);
  const key = new Date().toISOString().slice(0, 10) + "-" + crypto.randomUUID().slice(0, 8) + "." + TYPES[type];
  await images().set(key, buf, { metadata: { type } });
  return json({ ok: true, url: "/api/img/" + key });
};
export const config = { path: "/api/upload" };
