import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Shield, UserCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";

/**
 * Chip người dùng đã đăng nhập trên header. Hover (desktop) hoặc click để mở
 * dropdown Hồ sơ / Bảng điều khiển / (Quản trị) / Đăng xuất.
 * Bản AIMA: dùng token gradient/tím của AIMA, lucide icons, animation bằng CSS
 * (thay cho framer-motion ở bản UML).
 */
export default function UserMenu() {
  const { user } = useAuth();
  const { t, go, logout, brandGradient } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = user?.fullName || user?.email.split("@")[0] || "User";
  const initial = (user?.fullName || user?.email || "?").charAt(0).toUpperCase();
  const role = user?.role ?? null;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const avatar = (size: number, font: number): CSSProperties => ({
    width: size, height: size, borderRadius: "50%", background: brandGradient,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 800, fontSize: font, overflow: "hidden", flex: "none",
  });

  return (
    <div ref={wrapRef} style={{ position: "relative" }} onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      {/* Trigger chip */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "5px 9px 5px 6px",
          background: "#f4f2fb", border: "1px solid #ece8f6", borderRadius: 999, cursor: "pointer",
          transition: "border-color .2s, background .2s",
        }}
      >
        <span style={avatar(32, 13)}>
          {user?.avatarUrl ? <img src={user.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
        </span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15, maxWidth: 140 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#241f3a", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</span>
          <span style={{ fontSize: 10.5, color: "#8a85a0", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</span>
        </span>
        <ChevronDown size={15} style={{ color: "#a39bbf", transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div
          role="menu"
          className="menu-pop"
          style={{
            position: "absolute", right: 0, top: "100%", marginTop: 8, width: 256,
            background: "#fff", borderRadius: 16, border: "1px solid #ece8f6",
            boxShadow: "0 30px 60px -28px rgba(80,40,140,.5)", overflow: "hidden", zIndex: 120,
          }}
        >
          <div style={{ padding: "14px 16px", background: "linear-gradient(135deg,#edf9ff,#f6effc)", borderBottom: "1px solid #f0ecf8", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={avatar(44, 17)}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#241f3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#8a85a0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
              {role && (
                <span style={{ display: "inline-block", marginTop: 4, padding: "1px 6px", borderRadius: 5, fontSize: 9, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "#7c3aed", background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.22)" }}>{role}</span>
              )}
            </div>
          </div>

          <div style={{ padding: "6px 0" }}>
            <MenuItem icon={<UserCircle size={17} />} label={t.navProfile} onClick={() => { setOpen(false); go("profile"); }} />
            <MenuItem icon={<LayoutDashboard size={17} />} label={t.navDashboard} onClick={() => { setOpen(false); go("dashboard"); }} />
            {role === "ADMIN" && <MenuItem icon={<Shield size={17} />} label={t.navAdmin} onClick={() => { setOpen(false); go("admin"); }} />}
          </div>
          <div style={{ borderTop: "1px solid #f0ecf8", padding: "6px 0" }}>
            <MenuItem icon={<LogOut size={17} />} label={t.signOut} danger onClick={() => { setOpen(false); logout(); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger = false }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
        border: "none", background: hover ? (danger ? "#fdecf1" : "#f7f6fd") : "transparent",
        fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .15s, color .15s",
        color: danger ? "#e23d6e" : hover ? "#7c3aed" : "#574f6e",
      }}
    >
      <span style={{ color: danger ? "#e23d6e" : "#a39bbf", display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}
