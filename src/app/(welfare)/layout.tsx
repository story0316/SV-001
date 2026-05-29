import { WelfareAuthProvider } from "@/lib/auth/WelfareAuthContext";

export default function WelfareLayout({ children }: { children: React.ReactNode }) {
  return <WelfareAuthProvider>{children}</WelfareAuthProvider>;
}
