const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Supabase クライアント
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// サブスクリプション作成エンドポイント
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { paymentMethodId, email, userId } = req.body;

    if (!paymentMethodId || !email || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Stripe Customer を作成
    const customer = await stripe.customers.create({
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // サブスクリプションを作成
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID,
        },
      ],
      default_payment_method: paymentMethodId,
    });

    /// Supabase に保存
    console.log('📤 Supabaseに保存中...', {
  id: subscription.id,
  user_id: userId,
  status: subscription.status,
});
    const { error } = await supabase.from('subscriptions').insert({
  id: subscription.id,
  user_id: userId,
  status: subscription.status,
  price_id: process.env.STRIPE_PRICE_ID,
  current_period_end: subscription.current_period_end,
});

if (error) {
  console.error('❌ Supabaseエラー:', error);
}
    console.log('✅ Supabaseに保存成功!');
    res.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// サブスクリプション解約エンドポイント
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Stripe でサブスクをキャンセル
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Supabase を更新
    const { error } = await supabase.from('subscriptions').update({
      status: 'canceled',
    }).eq('id', subscriptionId);

    if (error) {
      console.error('❌ Supabaseエラー:', error);
    }

    res.json({
      success: true,
      subscriptionId: canceledSubscription.id,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
