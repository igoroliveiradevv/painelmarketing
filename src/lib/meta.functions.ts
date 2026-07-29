import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const REDIRECT_URI = "https://resultscale.com.br/api/public/meta/callback";
const META_SCOPES = ["ads_read", "business_management"].join(",");
const GRAPH = "https://graph.facebook.com/v20.0";

function b64url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function signState(userId: string) {
  const secret = process.env.META_OAUTH_STATE_SECRET!;
  const exp = Date.now() + 10 * 60 * 1000; // 10 min
  const payload = `${userId}.${exp}`;
  const { createHmac } = await import("node:crypto");
  const sig = createHmac("sha256", secret).update(payload).digest();
  return `${b64url(payload)}.${b64url(sig)}`;
}

// Returns the Facebook authorize URL for the current user.
export const getMetaAuthUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const appId = process.env.META_APP_ID;
    if (!appId) throw new Error("META_APP_ID não configurado");
    const state = await signState(context.userId);
    const url = new URL("https://www.facebook.com/v20.0/dialog/oauth");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", META_SCOPES);
    url.searchParams.set("response_type", "code");
    return { url: url.toString() };
  });

export const getMetaConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("meta_ads_connections")
      .select("meta_user_id, selected_ad_account_id, selected_ad_account_name, token_expires_at, last_sync_at, last_sync_status, last_sync_error")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  });

export const disconnectMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("meta_ads_connections").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMetaAdAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: conn } = await supabaseAdmin
      .from("meta_ads_connections").select("access_token").eq("user_id", context.userId).maybeSingle();
    if (!conn?.access_token) throw new Error("Sem conexão Meta");
    const res = await fetch(`${GRAPH}/me/adaccounts?fields=id,account_id,name,currency,account_status&access_token=${encodeURIComponent(conn.access_token)}`);
    const json = await res.json() as { data?: Array<{ id: string; account_id: string; name: string; currency: string; account_status: number }>; error?: { message: string } };
    if (json.error) throw new Error(json.error.message);
    return json.data ?? [];
  });

export const selectMetaAdAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ accountId: z.string().min(1), accountName: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("meta_ads_connections")
      .update({ selected_ad_account_id: data.accountId, selected_ad_account_name: data.accountName ?? null })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMetaCampaigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ adAccountId: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: conn } = await supabaseAdmin
      .from("meta_ads_connections")
      .select("access_token, token_expires_at")
      .eq("user_id", context.userId).maybeSingle();
    if (!conn?.access_token) throw new Error("Sem conexão Meta");
    if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
      throw new Error("Token Meta expirado. Reconecte sua conta.");
    }
    const acct = data.adAccountId.startsWith("act_")
      ? data.adAccountId
      : `act_${data.adAccountId}`;
    const res = await fetch(
      `${GRAPH}/${acct}/campaigns?fields=id,name,status,effective_status&limit=100&access_token=${encodeURIComponent(conn.access_token)}`
    );
    const json = await res.json() as {
      data?: Array<{ id: string; name: string; status: string; effective_status: string }>;
      error?: { message: string };
    };
    if (json.error) throw new Error(json.error.message);
    return (json.data ?? []).filter((c) => c.effective_status === "ACTIVE");
  });

export const syncMetaInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: conn } = await supabaseAdmin
      .from("meta_ads_connections")
      .select("access_token, selected_ad_account_id, token_expires_at")
      .eq("user_id", context.userId).maybeSingle();
    if (!conn?.access_token) throw new Error("Sem conexão Meta");
    if (!conn.selected_ad_account_id) throw new Error("Selecione uma conta de anúncio");
    if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
      await supabaseAdmin.from("meta_ads_connections")
        .update({ last_sync_status: "reauth_required", last_sync_error: "Token expirado. Reconecte." })
        .eq("user_id", context.userId);
      throw new Error("Token Meta expirado. Reconecte sua conta.");
    }
    const today = new Date().toISOString().slice(0, 10);
    const from = data.dateFrom ?? new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const to = data.dateTo ?? today;
    const acct = conn.selected_ad_account_id.startsWith("act_") ? conn.selected_ad_account_id : `act_${conn.selected_ad_account_id}`;
    const url = new URL(`${GRAPH}/${acct}/insights`);
    url.searchParams.set("fields", "spend,actions,impressions,clicks");
    url.searchParams.set("time_increment", "1");
    url.searchParams.set("time_range", JSON.stringify({ since: from, until: to }));
    url.searchParams.set("access_token", conn.access_token);

    let processed = 0;
    try {
      const res = await fetch(url);
      const json = await res.json() as {
        data?: Array<{ date_start: string; spend?: string; actions?: Array<{ action_type: string; value: string }> }>;
        error?: { message: string };
      };
      if (json.error) throw new Error(json.error.message);
      for (const row of json.data ?? []) {
        const spend = Number(row.spend ?? 0);
        const leadAction = row.actions?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");
        const leads = leadAction ? Number(leadAction.value) : 0;
        const { data: existing } = await context.supabase
          .from("daily_entries").select("id").eq("user_id", context.userId).eq("entry_date", row.date_start).maybeSingle();
        if (existing) {
          await context.supabase.from("daily_entries")
            .update({ investment: spend, traffic_leads: leads }).eq("id", existing.id);
        } else {
          await context.supabase.from("daily_entries").insert({
            user_id: context.userId, entry_date: row.date_start,
            investment: spend, traffic_leads: leads,
          });
        }
        processed++;
      }
      await supabaseAdmin.from("meta_ads_connections")
        .update({ last_sync_at: new Date().toISOString(), last_sync_status: "ok", last_sync_error: null })
        .eq("user_id", context.userId);
      return { processed, from, to };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabaseAdmin.from("meta_ads_connections")
        .update({ last_sync_at: new Date().toISOString(), last_sync_status: "error", last_sync_error: msg })
        .eq("user_id", context.userId);
      throw e;
    }
  });

// Fetches Meta Ads data for a single day WITHOUT persisting — used by the
// "Puxar dados Meta Ads" button in the daily entry form.
// Optionally filter by campaignId.
export const fetchMetaDayData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      adAccountId: z.string().min(1, "Selecione uma conta de anúncio"),
      campaignId: z.string().min(1, "Selecione uma campanha"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: conn } = await supabaseAdmin
      .from("meta_ads_connections")
      .select("access_token, token_expires_at")
      .eq("user_id", context.userId).maybeSingle();
    if (!conn?.access_token) throw new Error("Conecte sua conta Meta Ads em Editar painel → Integrações");
    if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
      throw new Error("Token Meta expirado. Reconecte sua conta.");
    }
    const acct = data.adAccountId.startsWith("act_")
      ? data.adAccountId
      : `act_${data.adAccountId}`;
    const url = new URL(`${GRAPH}/${acct}/insights`);
    url.searchParams.set("fields", "spend,actions");
    url.searchParams.set("time_increment", "1");
    url.searchParams.set("time_range", JSON.stringify({ since: data.date, until: data.date }));
    url.searchParams.set("filtering", JSON.stringify([{ field: "campaign.id", operator: "IN", value: [data.campaignId] }]));
    url.searchParams.set("access_token", conn.access_token);
    const res = await fetch(url);
    const json = await res.json() as {
      data?: Array<{ date_start: string; spend?: string; actions?: Array<{ action_type: string; value: string }> }>;
      error?: { message: string };
    };
    if (json.error) throw new Error(json.error.message);
    const row = json.data?.[0];
    if (!row) return { date: data.date, investment: 0, trafficLeads: 0, empty: true as const };
    const spend = Number(row.spend ?? 0);
    const leadAction = row.actions?.find((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped");
    const leads = leadAction ? Number(leadAction.value) : 0;
    return { date: data.date, investment: spend, trafficLeads: leads, empty: false as const };
  });