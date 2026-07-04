import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle,
  Workflow,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { getMe } from "@/features/auth/api/auth.api";
import { useEffect, useState } from "react";
import { User } from "@/types/auth";
import { useNotificationStream } from "@/features/notification/hooks/useNotificationStream";
import { NotificationBell } from "../NotificationBell/NotificationBell";

export function AppLayout() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const logout = useLogout();

  useNotificationStream();

  const navigate = useNavigate();

  const [me, setMe] = useState<User | null>(null);
  const [isMeLoading, setIsMeLoading] = useState(true);
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = await getMe();
        setMe(user);
      } catch (error) {
        console.error("Failed to fetch user", error);

        navigate("/", { replace: true });
      } finally {
        setIsMeLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside
        className={[
          "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur transition-all duration-300",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Workflow className="h-5 w-5" />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white">
                  FlowBoard
                </h1>
                <p className="truncate text-xs text-slate-500">
                  Diagram Builder
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="space-y-1 p-3">
          <SidebarLink
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={sidebarCollapsed}
          />

          <SidebarLink
            to="/projects"
            icon={FolderKanban}
            label="Projects"
            collapsed={sidebarCollapsed}
          />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          <Button
            variant="ghost"
            className={[
              "mb-2 w-full text-slate-300 hover:bg-slate-900 hover:text-white",
              sidebarCollapsed ? "justify-center px-0" : "justify-start",
            ].join(" ")}
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="mr-2 h-5 w-5" />
                Collapse
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className={[
              "w-full text-red-300 hover:bg-red-500/10 hover:text-red-200",
              sidebarCollapsed ? "justify-center px-0" : "justify-start",
            ].join(" ")}
            onClick={() => logout.mutate()}
          >
            <LogOut className={sidebarCollapsed ? "h-5 w-5" : "mr-2 h-5 w-5"} />
            {!sidebarCollapsed && "Logout"}
          </Button>
        </div>
      </aside>

      <div
        className={[
          "transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-[260px]",
        ].join(" ")}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="text-slate-300 hover:bg-slate-900 hover:text-white"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div>
              <p className="text-sm font-medium text-white">Workspace</p>
              <p className="text-xs text-slate-500">Build diagrams faster</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
              <NotificationBell className="h-5 w-5" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
              <UserCircle className="h-5 w-5" />
            </div>

            <div className="hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-sm font-medium text-white">
                {me?.full_name || "User"}
              </p>
              <p className="max-w-[220px] truncate text-xs text-slate-500">
                {me?.email || "Loading..."}
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}

function SidebarLink({ to, icon: Icon, label, collapsed }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex h-11 items-center rounded-xl px-3 text-sm transition",
          collapsed ? "justify-center" : "justify-start gap-3",
          isActive
            ? "bg-cyan-500/15 text-cyan-300"
            : "text-slate-400 hover:bg-slate-900 hover:text-white",
        ].join(" ")
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
