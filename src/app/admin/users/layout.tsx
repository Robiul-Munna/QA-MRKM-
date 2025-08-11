import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/pages/api/auth/[...nextauth]";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions) as (null | { user?: { role?: string } });
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/auth/signin");
  }
  return <>{children}</>;
}
