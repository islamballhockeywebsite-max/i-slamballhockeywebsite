import { cn } from "@/lib/utils";

/** Bold black-outlined, heavily-rounded card used for every list row/section in the admin panel design. */
export function AdminCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="admin-card"
      className={cn("rounded-2xl border-2 border-foreground bg-card p-5", className)}
      {...props}
    />
  );
}
