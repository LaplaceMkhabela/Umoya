import dynamic from "next/dynamic";
import { AuthSetupNotice, isAuthConfigured } from "@/components/Auth";

const SignUp = dynamic(() => import("@clerk/nextjs").then((m) => m.SignUp), {
  ssr: false,
  loading: () => <p className="py-8 text-center text-sm text-gray-500">Loading…</p>,
});

export default function SignUpPage() {
  if (!isAuthConfigured) return <AuthSetupNotice feature="Create account" />;
  return (
    <main className="flex justify-center py-6">
      <SignUp />
    </main>
  );
}
