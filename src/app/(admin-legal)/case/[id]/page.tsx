import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ChatRoom from "@/components/ChatRoom";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  return <ChatRoom consultationId={Number(id)} myUserId={session!.id} isAdmin={true} />;
}
