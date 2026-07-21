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
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <span className="font-heading text-xl">I-Slam</span>
      </div>
      <div className="mx-auto max-w-sm px-4 pt-8">
        <h1 className="mb-8 text-4xl">Log In</h1>
        <LoginForm next={safeNext} />
      </div>
    </div>
  );
}
