import { getSession } from "@/lib/session";
import AppShell from "@/components/AppShell";
import type { NavItem } from "@/components/AppShell";

export default async function InternalAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const navItems: NavItem[] = [
    { href: "/grant-token", label: "Grant Token" },
    { href: "/audit-log", label: "Audit Log" },
  ];
  if (session?.role === "superadmin") {
    navItems.push({ href: "/users", label: "Kelola Pengguna" });
    navItems.push({ href: "/packages", label: "Paket Token" });
    navItems.push({ href: "/settings", label: "Pengaturan" });
  }

  return (
    <AppShell
      eyebrow={session?.role === "superadmin" ? "SUPERADMIN" : "DIGITAL MARKETING"}
      userName={session?.nama ?? ""}
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
