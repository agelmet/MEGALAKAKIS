/* POST /api/save {pass, action:"login"}                -> {ok}
   POST /api/save {pass, action:"publish", content}     -> {ok, when}
   Saves to Netlify Blobs only — no Git commit, no rebuild, no deploy, 0 credits.
   The previous version is kept as content-prev.json (and one dated copy per day) so a mistake can be undone. */
import { content, json, checkPass } from "./_lib.mjs";
const okShape = (c) => c && typeof c === "object" && Array.isArray(c.news) && Array.isArray(c.shows) &&
  c.lessons && Array.isArray(c.lessons.items) && c.contact && typeof c.contact === "object";
export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);
  let b; try { b = await req.json(); } catch { return json({ ok: false, error: "json" }, 400); }
  if (!(await checkPass(b.pass))) return json({ ok: false, error: "pass" }, 401);
  if (b.action === "login") return json({ ok: true });
  if (b.action !== "publish") return json({ ok: false, error: "action" }, 400);
  if (!okShape(b.content)) return json({ ok: false, error: "content" }, 400);
  const c = b.content; c.updated = new Date().toISOString();
  const text = JSON.stringify(c);
  if (text.length > 600000) return json({ ok: false, error: "too big" }, 413);
  const st = content();
  try {
    const prev = await st.get("content.json");
    if (prev) { await st.set("content-prev.json", prev); await st.set("history/" + c.updated.slice(0, 10) + ".json", prev); }
    await st.set("content.json", text);
  } catch (e) { return json({ ok: false, error: "store" }, 500); }
  return json({ ok: true, when: c.updated });
};
export const config = { path: "/api/save" };
