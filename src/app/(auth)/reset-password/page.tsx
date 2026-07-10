import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { getUser } from "@/lib/auth/session";

export default async function ResetPasswordPage() {
  // The /auth/callback route must have already exchanged the recovery code for a
  // session before this page is reachable meaningfully.
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
