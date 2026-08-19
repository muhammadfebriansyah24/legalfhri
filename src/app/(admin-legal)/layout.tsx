import { getSession } from "@/lib/session";
import AppShell from "@/components/AppShell";

export default async function AdminLegalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <AppShell
      eyebrow="ADMIN LEGAL"
      userName={session?.nama ?? ""}
      navItems={[{ href: "/inbox", label: "Queue Inbox" }]}
    >
      {children}
    </AppShell>
  );
}
