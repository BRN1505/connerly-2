import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Stripeの公開可能キーを読み込み
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  email: string;
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ email, userId, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // カード情報から決済方法を作成
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: email,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('決済方法が作成されました:', paymentMethod);
      
      // TODO: ここでバックエンドにpaymentMethod.idを送信して、
      // サブスクリプションを作成する処理を追加します
      
      // 今はテストとして成功扱い
      // Edge Function に paymentMethodId を送信
      const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      paymentMethodId: paymentMethod.id,
      email: email,
      userId: userId,
    }),
  }
);

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || 'サブスクリプション作成に失敗しました');
}

      onSuccess();
    } catch (err: any) {
      console.error('決済エラー:', err);
      onError(err.message || '決済に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          クレジットカード情報
        </label>
        <div className="p-4 border border-gray-300 rounded-md">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">月額料金</span>
          <span className="text-lg font-bold">¥20,000</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          毎月自動で請求されます。いつでも解約可能です。
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          processing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {processing ? '処理中...' : '支払いを確定する'}
      </button>
       {/* 特定商取引法リンク */}
    <div className="text-center pt-2">
      <a 
        href="https://connerlyapp.com/legal.html" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
      >
        特定商取引法に基づく表記
      </a>
    </div>

      <p className="text-xs text-center text-gray-500">
        テストモード: カード番号 4242 4242 4242 4242 を使用できます
      </p>
    </form>
  );
}

interface StripeCheckoutProps {
  email: string;
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripeCheckout({ email, userId, onSuccess, onError }: StripeCheckoutProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">月額プランに登録</h2>
        <p className="mt-2 text-sm text-gray-600">
          ブランドアカウントの作成には月額20,000円のサブスクリプションが必要です。
        </p>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutForm email={email} userId={userId} onSuccess={onSuccess} onError={onError} />
      </Elements>
    </div>
  );
}
