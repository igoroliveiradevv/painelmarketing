import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
// Force loading of server route type augmentation (declare module 'router-core')
import "@tanstack/start-client-core";

const REDIRECT_URI = "https://resultscale.com.br/api/public/meta/callback";
const GRAPH = "https://graph.facebook.com/v20.0";
const RETURN_TO = "https://resultscale.com.br/aparencia";

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function verifyState(state: string, secret: string): string | null {
  const [payloadB64, sigB64] = state.split(".");
  if (!payloadB64 || !sigB64) return null;
  const payload = b64urlDecode(payloadB64).toString("utf8");
  const sig = b64urlDecode(sigB64);
  const expected = createHmac("sha256", secret).update(payload).digest();
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  const [userId, expStr] = payload.split(".");
  const exp = Number(expStr);
  if (!userId || !exp || exp < Date.now()) return null;
  return userId;
}

function redirect(status: string, detail?: string) {
  const url = new URL(RETURN_TO);
  url.searchParams.set("meta", status);
  if (detail) url.searchParams.set("meta_detail", detail);
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
}

const routeOptions: any = {
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");
        if (errorParam) return redirect("error", errorParam);
        if (!code || !state) return redirect("error", "missing_params");

        const secret = process.env.META_OAUTH_STATE_SECRET!;
        const userId = verifyState(state, secret);
        if (!userId) return redirect("error", "invalid_state");

        const appId = process.env.META_APP_ID!;
        const appSecret = process.env.META_APP_SECRET!;

        try {
          // Exchange code for short-lived token
          const tokRes = await fetch(
            `${GRAPH}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`,
          );
          const tokJson = await tokRes.json() as { access_token?: string; expires_in?: number; error?: { message: string } };
          if (!tokJson.access_token) throw new Error(tokJson.error?.message ?? "Falha ao obter token");

          // Upgrade to long-lived (~60d)
          const llRes = await fetch(
            `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(tokJson.access_token)}`,
          );
          const llJson = await llRes.json() as { access_token?: string; expires_in?: number; error?: { message: string } };
          const finalToken = llJson.access_token ?? tokJson.access_token;
          const expiresIn = llJson.expires_in ?? tokJson.expires_in ?? 60 * 24 * 3600;
          const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

          // Get user info
          const meRes = await fetch(`${GRAPH}/me?fields=id,name&access_token=${encodeURIComponent(finalToken)}`);
          const meJson = await meRes.json() as { id?: string; name?: string; error?: { message: string } };

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("meta_ads_connections").upsert({
            user_id: userId,
            access_token: finalToken,
            token_expires_at: expiresAt,
            meta_user_id: meJson.id ?? null,
            last_sync_status: null,
            last_sync_error: null,
          }, { onConflict: "user_id" });
          if (error) throw new Error(error.message);

          return redirect("connected");
        } catch (e) {
          const msg = e instanceof Error ? e.message : "unknown";
          return redirect("error", msg.slice(0, 200));
        }
      },
    },
  },
};

export const Route = createFileRoute("/api/public/meta/callback")(routeOptions);