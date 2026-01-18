import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@15.0.0?target=deno";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { paymentMethodId, email, userId } = await req.json();

    if (!paymentMethodId || !email || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const customer = await stripe.customers.create({
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: Deno.env.get("STRIPE_PRICE_ID")!,
        },
      ],
      default_payment_method: paymentMethodId,
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseClient.from("subscriptions").insert({
      id: subscription.id,
      user_id: userId,
      status: subscription.status,
      price_id: Deno.env.get("STRIPE_PRICE_ID")!,
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

    return Response.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
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