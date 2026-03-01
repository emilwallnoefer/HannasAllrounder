import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="w-64 shrink-0 border-r border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose/20 border border-rose/30 flex items-center justify-center text-rose font-bold text-sm">
              H
            </span>
            Hannas Allrounder
          </h1>
        </div>
        <DashboardNav userEmail={user.email ?? ""} />
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
