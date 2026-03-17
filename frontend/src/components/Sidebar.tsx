import { LayoutDashboard, PlusCircle, LogOut, ClipboardList, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: PlusCircle, label: "Submit Task", path: "/submit" },
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-card border-b px-4 h-14 md:hidden">
        <Link to="/dashboard" className="font-display font-bold text-lg gradient-text">InternHub</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md hover:bg-accent transition-colors">
            {mobileOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-card border-r flex flex-col transition-transform duration-300 md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-start justify-between gap-3">
          <div>
            <Link to="/dashboard" className="font-display font-bold text-xl gradient-text" onClick={() => setMobileOpen(false)}>
              InternHub
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Intern Task Portal</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex md:hidden">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </>
  );
}
