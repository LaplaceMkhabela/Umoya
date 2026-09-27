import { SignIn } from "@clerk/nextjs";
import { AuthSetupNotice, isAuthConfigured } from "@/components/Auth";

export default function SignInPage() {
  if (!isAuthConfigured) return <AuthSetupNotice feature="Sign in" />;
  return (
    <main className="flex justify-center py-6">
      <SignIn />
    </main>
  );
}
