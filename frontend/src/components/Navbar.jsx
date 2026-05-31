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
      `text-sm font-bold transition-all duration-200 px-4 py-2 rounded-full ${
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const nav = useNavigate();
  
  const dashPath = user?.role === "business" || user?.role === "prompt_user" ? "/creator" : "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-40 transition-transform duration-300 transform ${
          hidden ? "-translate-y-[150%]" : "translate-y-0"
        } bg-white rounded-full shadow-lg border border-gray-100`}
      >
        <div className="px-3 py-2 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group pl-3" data-testid="logo-link">
            <Zap className="w-6 h-6 text-gray-900 fill-gray-900" />
            <span className="font-black text-xl tracking-tight text-gray-900">
              Promptlyi
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/marketplace">Explore</NavItem>
            <NavItem to="/pricing">Pricing</NavItem>
            <NavItem to="/blog">Blog</NavItem>
            {user && <NavItem to={dashPath}>Dashboard</NavItem>}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 pr-1">
            {user ? (
              <>
                <button
                  onClick={() => nav(dashPath)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-lt_lime flex items-center justify-center text-brand-lt_green text-xs font-black">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  {user.name?.split(" ")[0]}
                </button>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={login}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={login}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-black transition-all"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2.5 rounded-full text-gray-900 hover:bg-gray-100 transition-all mr-1"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Zap className="w-6 h-6 text-gray-900 fill-gray-900" />
            <span className="font-black text-xl tracking-tight text-gray-900">
              Promptlyi
            </span>
          </Link>
          <button 
            onClick={() => setOpen(false)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {[
            { to: "/marketplace", label: "Explore" },
            { to: "/pricing", label: "Pricing" },
            { to: "/blog", label: "Blog" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `text-lg font-bold px-4 py-3 rounded-2xl transition-all ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink 
              to={dashPath} 
              onClick={() => setOpen(false)} 
              className={({ isActive }) => `text-lg font-bold px-4 py-3 rounded-2xl transition-all ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
          {user ? (
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full py-4 rounded-full text-base font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Log out
            </button>
          ) : (
            <>
              <button
                onClick={() => { login(); setOpen(false); }}
                className="w-full py-4 rounded-full text-base font-bold text-white bg-gray-900 hover:bg-black transition-all"
              >
                Sign up free
              </button>
              <button
                onClick={() => { login(); setOpen(false); }}
                className="w-full py-4 rounded-full text-base font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
