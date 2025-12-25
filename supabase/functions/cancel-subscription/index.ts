import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { subscriptionId, userId, cancellationReason } = await req.json();

    if (!subscriptionId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Stripe でサブスクをキャンセル
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Supabase を更新
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseClient.from("subscriptions").update({
      status: "canceled",
    }).eq("id", subscriptionId);

    return Response.json({
      success: true,
      subscriptionId: canceledSubscription.id,
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: String(e?.message ?? e) }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
