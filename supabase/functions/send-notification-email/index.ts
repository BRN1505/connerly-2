import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, type, data } = await req.json()

    let subject = ''
    let htmlContent = ''

    // 通知タイプによってメール内容を変更
    switch (type) {
      case 'application':
        // クリエイターが応募 → ブランドに通知
        subject = `【Connerly】新しい応募がありました: ${data.jobTitle}`
        htmlContent = `
          <h1>${name}さん、こんにちは</h1>
          <p>あなたの案件「<strong>${data.jobTitle}</strong>」に新しい応募がありました。</p>
          <p><strong>応募者:</strong> ${data.creatorName}</p>
          <p>ダッシュボードから応募者のプロフィールを確認し、選考を進めてください。</p>
          <p><a href="https://connerlyapp.com" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">ダッシュボードを開く</a></p>
          <p style="margin-top: 24px; color: #666;">Connerly チーム</p>
        `
        break

      case 'selection':
        // ブランドがクリエイターを選択 → クリエイターに通知
        subject = `【Connerly】おめでとうございます！案件に採用されました`
        htmlContent = `
          <h1>${name}さん、おめでとうございます！</h1>
          <p>あなたが応募した案件「<strong>${data.jobTitle}</strong>」に採用されました！</p>
          <p><strong>ブランド:</strong> ${data.brandName}</p>
          <p><strong>報酬:</strong> ¥${data.payment?.toLocaleString()}</p>
          <p>ダッシュボードのチャット機能を使って、ブランドと詳細を打ち合わせましょう。</p>
          <p><a href="https://connerlyapp.com" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">ダッシュボードを開く</a></p>
          <p style="margin-top: 24px; color: #666;">Connerly チーム</p>
        `
        break

      case 'message':
        // 新しいチャットメッセージ → 相手に通知
        subject = `【Connerly】${data.senderName}さんからメッセージが届きました`
        htmlContent = `
          <h1>${name}さん、こんにちは</h1>
          <p><strong>${data.senderName}</strong>さんから新しいメッセージが届きました。</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #374151;">${data.messageText}</p>
          </div>
          <p><a href="https://connerlyapp.com" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">返信する</a></p>
          <p style="margin-top: 24px; color: #666;">Connerly チーム</p>
        `
        break

      case 'scout':
        // ブランドがスカウト → クリエイターに通知
        subject = `【Connerly】${data.brandName}さんからスカウトが届きました！`
        htmlContent = `
          <h1>${name}さん、こんにちは</h1>
          <p><strong>${data.brandName}</strong>さんからスカウトが届きました！</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #374151;"><strong>メッセージ:</strong></p>
            <p style="margin: 8px 0 0 0; color: #374151;">${data.message}</p>
          </div>
          <p>ダッシュボードからスカウトに返信しましょう。</p>
          <p><a href="https://connerlyapp.com" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">スカウトを確認</a></p>
          <p style="margin-top: 24px; color: #666;">Connerly チーム</p>
        `
        break

      default:
        throw new Error('Invalid notification type')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Connerly <noreply@connerlyapp.com>',
        to: [email],
        subject: subject,
        html: htmlContent,
      })
    })

    const responseData = await res.json()

    return new Response(
      JSON.stringify(responseData),
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