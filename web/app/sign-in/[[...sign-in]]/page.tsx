import dynamic from "next/dynamic";
import { AuthSetupNotice, isAuthConfigured } from "@/components/Auth";

const SignIn = dynamic(() => import("@clerk/nextjs").then((m) => m.SignIn), {
  ssr: false,
  loading: () => <p className="py-8 text-center text-sm text-gray-500">Loading…</p>,
});

export default function SignInPage() {
  if (!isAuthConfigured) return <AuthSetupNotice feature="Sign in" />;
  return (
    <main className="flex justify-center py-6">
      <SignIn />
    </main>
  );
}
