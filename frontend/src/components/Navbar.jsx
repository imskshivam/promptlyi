import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu, X, LogOut, LayoutDashboard, Trophy, PenSquare,
  Zap, ChevronDown, Sparkles
} from "lucide-react";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    data-testid={`nav-${to.replace(/\//g, "") || "home"}`}
    className={({ isActive }) =>
      `text-sm font-semibold transition-all duration-200 px-1 pb-0.5 relative ${
        isActive
          ? "text-orange-500"
          : "text-gray-600 hover:text-gray-900"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {children}
        {isActive && (
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
        )}
      </>
    )}
  </NavLink>
);

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useNavigate();
  
  const dashPath = user?.role === "business" || user?.role === "prompt_user" ? "/creator" : "/dashboard";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-[0_1px_30px_rgba(0,0,0,0.08)] border-b border-gray-100"
          : "bg-white/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="logo-link">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.35)] group-hover:shadow-[0_6px_20px_rgba(249,115,22,0.5)] transition-all duration-300">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900 group-hover:text-orange-500 transition-colors duration-200">
            Promptlyi
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <NavItem to="/marketplace">Explore</NavItem>
          <NavItem to="/pricing">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Pricing
            </span>
          </NavItem>
          <NavItem to="/custom-works">Custom Work</NavItem>
          {user && <NavItem to={dashPath}>Dashboard</NavItem>}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => nav(dashPath)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-all duration-200"
                data-testid="nav-dashboard-btn"
              >
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                {user.name?.split(" ")[0]}
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                data-testid="nav-logout-btn"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={login}
                className="btn btn-ghost !py-2 !px-4 !text-sm !rounded-xl"
                data-testid="nav-login-btn"
              >
                Log In
              </button>
              <button
                onClick={login}
                className="btn btn-primary !py-2 !px-4 !text-sm !rounded-xl"
                data-testid="nav-signup-btn"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get Started Free
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
          onClick={() => setOpen(!open)}
          data-testid="mobile-menu-btn"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-6 py-5 flex flex-col gap-4">
            {[
              { to: "/marketplace", label: "Explore" },
              { to: "/pricing", label: "✨ Pricing" },
              { to: "/custom-works", label: "Custom Work" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-orange-500 py-1"
              >
                {label}
              </NavLink>
            ))}
            {user && (
              <NavLink to={dashPath} onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-orange-500 py-1">
                Dashboard
              </NavLink>
            )}
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <button
                    onClick={logout}
                    className="btn btn-ghost !rounded-xl"
                    data-testid="mobile-logout-btn"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={login}
                    className="btn btn-primary !rounded-xl"
                    data-testid="mobile-signup-btn"
                  >
                    <Sparkles className="w-4 h-4" /> Get Started Free
                  </button>
                  <button
                    onClick={login}
                    className="btn btn-ghost !rounded-xl"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
