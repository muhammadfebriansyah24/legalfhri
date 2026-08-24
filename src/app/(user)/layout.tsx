import { getSession } from "@/lib/session";
import AppShell from "@/components/AppShell";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <AppShell
      eyebrow="PORTAL KLIEN"
      userName={session?.nama ?? ""}
      navItems={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/consultations/new", label: "Buat Konsultasi" },
        { href: "/consultations/history", label: "Riwayat Kasus" },
      ]}
    >
      {children}
    </AppShell>
  );
}
