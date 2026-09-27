import { SignUp } from "@clerk/nextjs";
import { AuthSetupNotice, isAuthConfigured } from "@/components/Auth";

export default function SignUpPage() {
  if (!isAuthConfigured) return <AuthSetupNotice feature="Create account" />;
  return (
    <main className="flex justify-center py-6">
      <SignUp />
    </main>
  );
}
