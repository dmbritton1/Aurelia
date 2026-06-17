"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MENU = [
  { label: "Product", href: "/" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Research", href: "/#research" },
  { label: "Company", href: "/#contact" },
];

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [announce, setAnnounce] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* ─── ANNOUNCEMENT BAR ─── */}
      {announce && (
        <div
          style={{
            background: "var(--midnight)",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "0 2.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              color: "rgba(255,255,255,0.82)",
              textAlign: "center",
              margin: 0,
            }}
          >
            Introducing Aurelia Command — agentic newsroom workflows.{" "}
            <a
              href="/#capabilities"
              style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: "2px" }}
            >
              Learn more
            </a>
          </p>
          <button
            onClick={() => setAnnounce(false)}
            aria-label="Dismiss announcement"
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0.25rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── NAV ─── */}
      <header
        style={{
          background: scrolled ? "rgba(250,251,252,0.85)" : "var(--canvas)",
          backdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--border-light)" : "transparent"}`,
          transition: "background 0.25s ease, border-color 0.25s ease",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: "1240px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            gap: "1.5rem",
          }}
        >
          {/* Logo (left) — always returns home */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", flexShrink: 0 }}
          >
            <Mark />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "1.0625rem",
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              Aurelia
            </span>
          </Link>

          {/* Menu (center) — marketing only */}
          {!user && (
            <nav
              className="aurelia-menu"
              style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1, justifyContent: "center" }}
            >
              {MENU.map((m) => (
                <NavLink key={m.label} href={m.href}>
                  {m.label}
                </NavLink>
              ))}
            </nav>
          )}

          {user && (
            <nav
              className="aurelia-menu"
              style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1, justifyContent: "center" }}
            >
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/automations/new">New Digest</NavLink>
            </nav>
          )}

          {/* Right zone */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            {user ? (
              <>
                <span
                  className="aurelia-menu"
                  style={{ fontSize: "0.875rem", color: "var(--slate)" }}
                >
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="aurelia-menu"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.9375rem" }}>
                  Request a demo
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @media (max-width: 860px) {
          .aurelia-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Mark() {
  return (
    <span
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "var(--r-sm)",
        background: "var(--deep-sapphire)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#93bbf5" strokeWidth="1.4" />
        <circle cx="8" cy="8" r="2" fill="#fff" />
      </svg>
    </span>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: "0.9375rem",
        color: "var(--slate)",
        textDecoration: "none",
        padding: "0.5rem 0.875rem",
        borderRadius: "var(--r-sm)",
        transition: "color 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--ink)";
        e.currentTarget.style.background = "var(--snow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--slate)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}
