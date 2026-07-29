import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const PRICE_ID = process.env.STRIPE_PRICE_ID!;
const BASE_URL = process.env.SITE_URL ?? "https://resultscale.com.br";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY!;

async function getStripe() {
  const Stripe = (await import("stripe")).default;
  return new Stripe(STRIPE_SECRET);
}

async function verifyRecaptchaToken(token: string) {
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
  });
  const data = await res.json() as { success: boolean; score?: number; action?: string; "error-codes"?: string[] };
  return data.success;
}

// Server function to verify reCAPTCHA token
export const verifyRecaptcha = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const valid = await verifyRecaptchaToken(data.token);
    if (!valid) throw new Error("Falha na verificação do reCAPTCHA");
    return { ok: true };
  });

// Creates a Stripe Checkout Session for a new user (creates user + checkout in one step)
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      name: z.string().min(1, "Nome obrigatório"),
      email: z.string().email("E-mail inválido"),
      password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
      recaptchaToken: z.string().min(1, "Verificação necessária"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const valid = await verifyRecaptchaToken(data.recaptchaToken);
    if (!valid) throw new Error("Falha na verificação do reCAPTCHA. Tente novamente.");
    const stripe = await getStripe();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Create the user in Supabase
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name },
    });
    if (createErr || !created?.user) {
      const msg = createErr?.message ?? "";
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists") || msg.includes("duplicate")) {
        throw new Error("E-mail já cadastrado");
      }
      throw new Error(createErr?.message ?? "Falha ao criar conta");
    }

    const userId = created.user.id;

    // 2. Insert user_roles
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: "user" },
      { onConflict: "user_id" }
    );

    // 3. Insert a pending subscription record
    await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      status: "pending",
    });

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: data.email,
      client_reference_id: userId,
      success_url: `${BASE_URL}/auth?registered=true`,
      cancel_url: `${BASE_URL}/cadastro?cancelado=true`,
      metadata: { user_id: userId },
    });

    if (!session.url) throw new Error("Falha ao criar sessão de pagamento");
    return { url: session.url };
  });

// Renews subscription for existing authenticated user
export const createRenewalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const stripe = await getStripe();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = userData?.user?.email;
    if (!email) throw new Error("Usuário não encontrado");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: email,
      client_reference_id: context.userId,
      success_url: `${BASE_URL}/dashboard?renovado=true`,
      cancel_url: `${BASE_URL}/dashboard?cancelado=true`,
      metadata: { user_id: context.userId },
    });

    if (!session.url) throw new Error("Falha ao criar sessão de renovação");
    return { url: session.url };
  });

// Check subscription status for the current user
export const getSubscriptionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("subscriptions")
      .select("status, stripe_subscription_id, current_period_end")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? { status: "none", stripe_subscription_id: null, current_period_end: null };
  });
