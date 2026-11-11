/* Shared helpers for the Megalakakis panel functions.
   Edits are stored in Netlify Blobs: they show on the site at once and NEVER trigger a deploy (0 credits). */
import { getStore } from "@netlify/blobs";
// sha-256 of the passcode. Change it here, or set ADMIN_PASS in the site's environment variables (wins).
export const PASS_SHA256 = "06e5e167e28bb5368929f37b6e41cae96ff914c18873171832c90d356c3ca0af";
export const content = () => getStore({ name: "megalakakis-content", consistency: "strong" });
export const images = () => getStore("megalakakis-images");
export const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
async function sha256(t) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
export async function checkPass(p) {
  if (typeof p !== "string" || !p) return false;
  const ok = process.env.ADMIN_PASS ? p === process.env.ADMIN_PASS : (await sha256(p)) === PASS_SHA256;
  if (!ok) await new Promise((r) => setTimeout(r, 700)); // slow down guessing
  return ok;
}
