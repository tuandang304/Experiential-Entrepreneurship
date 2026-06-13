import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useBrand } from "../brand/BrandContext";

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/brand-profiles", label: "Brand Profiles" },
  { to: "/strategies", label: "Content Strategy" },
  { to: "/social-accounts", label: "Social Accounts" },
  { to: "/trends", label: "Trend Research" },
  { to: "/content", label: "Content Library" },
  { to: "/calendar", label: "Calendar" },
  { to: "/analytics", label: "Analytics" },
  { to: "/notifications", label: "Notifications" },
  { to: "/admin", label: "Admin", adminOnly: true },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { profiles, selectedId, setSelectedId } = useBrand();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const items = NAV.filter((item) => !item.adminOnly || user?.role === "ADMIN");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="px-5 py-4 text-xl font-bold text-blue-600">AIMA</div>
        <nav className="flex-1 px-2 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <NavLink
            to="/profile"
            className="block truncate text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            {user?.fullName}
          </NavLink>
          <button onClick={handleLogout} className="mt-1 text-xs text-gray-400 hover:text-gray-600">
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Brand</label>
            {profiles.length > 0 ? (
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brandName}
                  </option>
                ))}
              </select>
            ) : (
              <NavLink to="/brand-profiles" className="text-sm text-blue-600 hover:underline">
                Create a brand profile
              </NavLink>
            )}
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <NavLink to="/profile" className="text-sm text-gray-600">
              {user?.fullName}
            </NavLink>
            <button onClick={handleLogout} className="text-sm text-gray-400">
              Log out
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded px-3 py-1 text-xs font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

// Standard page header used inside Layout content.
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
