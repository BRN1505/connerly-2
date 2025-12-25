const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface NotificationData {
  email: string;
  name: string;
  type: 'application' | 'selection' | 'message' | 'scout';
  data: any;
}

export async function sendNotificationEmail(params: NotificationData) {
  try {
    console.log(`📧 通知メール送信中: ${params.type}`);
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-notification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '通知メール送信に失敗しました');
    }

    const data = await response.json();
    console.log('✅ 通知メール送信成功:', data);
    
    return true;
  } catch (error) {
    console.error('❌ 通知メール送信エラー:', error);
    return false;
  }
}