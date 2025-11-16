import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, role } = await req.json()

    const subject = role === 'creator' 
      ? 'Connerly へようこそ！クリエイターとしてのご登録ありがとうございます'
      : 'Connerly へようこそ！ブランドとしてのご登録ありがとうございます';

    const htmlContent = role === 'creator'
      ? `
        <h1>ようこそ、${name}さん！</h1>
        <p>Connerly へのご登録、誠にありがとうございます。</p>
        <p>クリエイターとしてのアカウントが正常に作成されました。</p>
        <h2>次のステップ：</h2>
        <ul>
          <li>プロフィールを充実させましょう</li>
          <li>興味のある案件を探してみましょう</li>
          <li>ブランドからのスカウトを待ちましょう</li>
        </ul>
        <p>今後ともよろしくお願いいたします。</p>
        <p>Connerly チーム</p>
      `
      : `
        <h1>ようこそ、${name}さん！</h1>
        <p>Connerly へのご登録、誠にありがとうございます。</p>
        <p>ブランドとしてのアカウントが正常に作成され、月額プランの決済が完了いたしました。</p>
        <h2>次のステップ：</h2>
        <ul>
          <li>案件を投稿してクリエイターを募集しましょう</li>
          <li>クリエイターを検索してスカウトしましょう</li>
          <li>理想のクリエイターとマッチングしましょう</li>
        </ul>
        <p>今後ともよろしくお願いいたします。</p>
        <p>Connerly チーム</p>
      `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Connerly <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: htmlContent,
      })
    })

    const data = await res.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      },
    )
  }
})