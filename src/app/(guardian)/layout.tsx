import { GuardianAuthProvider } from "@/lib/auth/GuardianAuthContext";

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return <GuardianAuthProvider>{children}</GuardianAuthProvider>;
}
