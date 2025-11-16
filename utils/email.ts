const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function sendWelcomeEmail(email: string, name: string, role: 'creator' | 'brand') {
  try {
    console.log('📧 ウェルカムメール送信中...');
    console.log(`📬 宛先: ${email}`);
    console.log(`👤 名前: ${name}`);
    console.log(`🎭 役割: ${role === 'creator' ? 'クリエイター' : 'ブランド'}`);

    // Supabase Edge Function を呼び出し
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-welcome-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, name, role }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'メール送信に失敗しました');
    }

    const data = await response.json();
    console.log('✅ ウェルカムメール送信成功:', data);
    
    return true;
  } catch (error) {
    console.error('❌ メール送信エラー:', error);
    return false;
  }
}