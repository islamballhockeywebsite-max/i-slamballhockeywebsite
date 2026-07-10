import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only ever redirect to a same-origin relative path — never let ?next= drive an
  // open redirect to an attacker-controlled URL.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>I-Slam Ball Hockey</CardTitle>
          <p className="text-sm text-muted-foreground">Admin &amp; scorekeeper sign in</p>
        </CardHeader>
        <CardContent>
          <LoginForm next={safeNext} />
        </CardContent>
      </Card>
    </div>
  );
}
