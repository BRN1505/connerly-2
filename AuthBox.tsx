import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthBox() {
  const [email, setEmail] = useState("");

  const signInWithEmail = async () => {
    if (!email) return alert("メールを入力してね");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("ログイン用リンクを送ったよ（メールを確認してね）");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    alert("ログアウトしました");
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8 }}
      />
      <button onClick={signInWithEmail}>メールでログイン</button>
      <button onClick={signOut}>ログアウト</button>
    </div>
  );
}
