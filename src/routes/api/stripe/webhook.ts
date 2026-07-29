import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/start-client-core";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const routeOptions: any = {
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(STRIPE_SECRET);
        const sig = request.headers.get("stripe-signature");

        if (!sig) {
          return new Response("Missing stripe-signature header", { status: 400 });
        }

        let event: any;
        try {
          const body = await request.text();
          event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
        } catch (err) {
          return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const userId = session.metadata?.user_id ?? session.client_reference_id;

          if (userId) {
            const subscriptionId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

            if (subscriptionId) {
              // Get subscription details to get period end
              const sub = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
              const periodEndSec = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
              const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;

              await supabaseAdmin.from("subscriptions").upsert({
                user_id: userId,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
                status: "active",
                current_period_end: periodEnd,
              }, { onConflict: "user_id" });
            }
          }
        }

        if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
          const subscription = event.data.object as any;
          const { data: rows } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscription.id)
            .maybeSingle();

          if (rows?.user_id) {
            const periodEndSec = subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end;
            const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;
            await supabaseAdmin.from("subscriptions").update({
              status: subscription.status === "active" ? "active" : "inactive",
              current_period_end: periodEnd,
            }).eq("user_id", rows.user_id);
          }
        }

        if (event.type === "invoice.payment_failed") {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          if (subscriptionId) {
            const { data: rows } = await supabaseAdmin
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_subscription_id", subscriptionId)
              .maybeSingle();

            if (rows?.user_id) {
              await supabaseAdmin.from("subscriptions").update({
                status: "past_due",
              }).eq("user_id", rows.user_id);
            }
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
};

export const Route = createFileRoute("/api/stripe/webhook")(routeOptions);
