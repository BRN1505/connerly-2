export async function sendWelcomeEmail(email: string, name: string, role: 'creator' | 'brand') {
  // 開発中はコンソールにログを出力（実際のメールは送信しない）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 ウェルカムメール送信（シミュレート）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📬 宛先: ${email}`);
  console.log(`👤 名前: ${name}`);
  console.log(`🎭 役割: ${role === 'creator' ? 'クリエイター' : 'ブランド'}`);
  console.log(`📝 件名: Connerly へようこそ！${role === 'creator' ? 'クリエイター' : 'ブランド'}としてのご登録ありがとうございます`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const content = role === 'creator'
    ? `
    ようこそ、${name}さん！
    Connerly へのご登録、誠にありがとうございます。
    クリエイターとしてのアカウントが正常に作成されました。
    
    次のステップ：
    - プロフィールを充実させましょう
    - 興味のある案件を探してみましょう
    - ブランドからのスカウトを待ちましょう
    `
    : `
    ようこそ、${name}さん！
    Connerly へのご登録、誠にありがとうございます。
    ブランドとしてのアカウントが正常に作成され、月額プランの決済が完了いたしました。
    
    次のステップ：
    - 案件を投稿してクリエイターを募集しましょう
    - クリエイターを検索してスカウトしましょう
    - 理想のクリエイターとマッチングしましょう
    `;
  
  console.log('📄 メール内容:');
  console.log(content);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ メール送信シミュレート完了');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 本番環境では、バックエンドAPIを呼び出してメールを送信
  // const response = await fetch('YOUR_BACKEND_API/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, name, role })
  // });
  
  return true;
}