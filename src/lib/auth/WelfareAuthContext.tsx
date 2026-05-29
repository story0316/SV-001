"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface WelfareUser {
  id: string;
  name: string;
  orgId: string;
}

const WelfareAuthContext = createContext<WelfareUser | null>(null);

export function useWelfareUser(): WelfareUser {
  const ctx = useContext(WelfareAuthContext);
  // 레이아웃이 인증 완료 후에만 children을 렌더링하므로 null이 될 수 없음
  return ctx!;
}

export function WelfareAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<WelfareUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }

      const { data } = await supabase
        .from("users")
        .select("id, name, organization_id, role")
        .eq("id", authUser.id)
        .single();

      if (!data || data.role !== "welfare_worker") {
        router.push("/login");
        return;
      }

      setUser({ id: data.id, name: data.name, orgId: data.organization_id });
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">인증 확인 중...</p>
      </div>
    );
  }

  return (
    <WelfareAuthContext.Provider value={user}>
      {children}
    </WelfareAuthContext.Provider>
  );
}
