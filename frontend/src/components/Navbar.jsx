import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Coins, LogOut, LayoutDashboard, UserCircle2 } from "lucide-react";

const NavItem = ({ to, children }) => (
    <NavLink
        to={to}
        data-testid={`nav-${to.replace(/\//g, "") || "home"}`}
        className={({ isActive }) =>
            `text-sm font-medium tracking-tight uppercase border-b-2 ${
                isActive ? "border-[#FF4F00] text-[#1A1A1A]" : "border-transparent text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
            } pb-0.5 transition-colors`
        }
    >
        {children}
    </NavLink>
);

export default function Navbar() {
    const { user, login, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const nav = useNavigate();

    const dashPath = user?.role === "business" ? "/creator" : "/dashboard";

    return (
        <header className="sticky top-0 z-40 bg-[#F7F5F0]/90 backdrop-blur border-b-2 border-[#1A1A1A]">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
                    <div className="w-8 h-8 bg-[#FF4F00] border-2 border-[#1A1A1A] flex items-center justify-center text-white font-black">P</div>
                    <span className="font-heading font-black text-xl tracking-tight">Promptly</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <NavItem to="/marketplace">Marketplace</NavItem>
                    <NavItem to="/custom-works">Custom Work</NavItem>
                    <NavItem to="/pricing">Pricing</NavItem>
                    {user && <NavItem to={dashPath}>Dashboard</NavItem>}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD600] border-2 border-[#1A1A1A] text-xs font-bold" data-testid="nav-credits">
                                <Coins className="w-3.5 h-3.5" /> {user.credits} credits
                            </div>
                            <button onClick={() => nav(dashPath)} className="btn-outline !py-2 !px-3" data-testid="nav-dashboard-btn">
                                <LayoutDashboard className="w-4 h-4" /> {user.name?.split(" ")[0]}
                            </button>
                            <button onClick={logout} className="p-2 border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white" data-testid="nav-logout-btn" title="Log out">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={login} className="btn-outline !py-2 !px-4 text-sm" data-testid="nav-login-btn">Log In</button>
                            <button onClick={login} className="btn-vermilion !py-2 !px-4 text-sm" data-testid="nav-signup-btn">Start Earning</button>
                        </>
                    )}
                </div>

                <button className="md:hidden p-2" onClick={() => setOpen(!open)} data-testid="mobile-menu-btn">
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t-2 border-[#1A1A1A] bg-[#F7F5F0]">
                    <div className="px-6 py-4 flex flex-col gap-4">
                        <NavItem to="/marketplace">Marketplace</NavItem>
                        <NavItem to="/custom-works">Custom Work</NavItem>
                        <NavItem to="/pricing">Pricing</NavItem>
                        {user ? (
                            <>
                                <NavItem to={dashPath}>Dashboard</NavItem>
                                <button onClick={logout} className="btn-outline justify-start" data-testid="mobile-logout-btn">Log out</button>
                            </>
                        ) : (
                            <button onClick={login} className="btn-vermilion" data-testid="mobile-signup-btn">Start Earning</button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
