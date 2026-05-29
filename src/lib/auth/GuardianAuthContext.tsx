"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface GuardianUser {
  id: string;
  name: string;
  clientId: string;   // 담당 부모(대상자) ID
  clientName: string;
}

const GuardianAuthContext = createContext<GuardianUser | null>(null);

export function useGuardianUser(): GuardianUser {
  return useContext(GuardianAuthContext)!;
}

export function GuardianAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<GuardianUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, name, role")
        .eq("id", authUser.id)
        .single();

      if (!userRow || userRow.role !== "guardian") {
        router.push("/login");
        return;
      }

      // 보호자가 담당하는 대상자(부모) 조회
      const { data: guardianRow } = await supabase
        .from("guardians")
        .select("client_id, clients(name)")
        .eq("guardian_id", authUser.id)
        .eq("primary", true)
        .single();

      if (!guardianRow) {
        router.push("/login");
        return;
      }

      const clientName = (guardianRow.clients as unknown as { name?: string } | null)?.name ?? "";
      setUser({
        id: userRow.id,
        name: userRow.name,
        clientId: guardianRow.client_id,
        clientName,
      });
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
    <GuardianAuthContext.Provider value={user}>
      {children}
    </GuardianAuthContext.Provider>
  );
}
