import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? "";
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      setIsAdmin(!!email && email === adminEmail);
      setLoading(false);
    };
    check();

    // ログイン/ログアウトで再判定
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (!isAdmin) return null; // 管理者以外は非表示
  return <>{children}</>;
}
