"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/kalender", label: "Kalender", icon: Calendar },
  { href: "/dashboard/settings", label: "Einstellungen", icon: Settings },
];

type Props = { userEmail: string; onNavigate?: () => void };

export function DashboardNav({ userEmail, onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <nav className="flex flex-col gap-1 px-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-rose/10 text-rose border border-rose/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        );
      })}

      <div className="mt-auto pt-6 pb-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-xs text-gray-500 truncate" title={userEmail}>
            {userEmail}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Abmelden
        </button>
      </div>
    </nav>
  );
}
