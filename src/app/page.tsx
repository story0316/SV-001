"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 루트 접근 시 역할에 따라 분기
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role === "welfare_worker") router.replace("/welfare");
      else if (data?.role === "guardian") router.replace("/guardian");
      else router.replace("/login");
    }

    redirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">이동 중...</p>
    </div>
  );
}
