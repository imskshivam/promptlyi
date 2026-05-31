import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ArrowRight, Coins } from "lucide-react";

export default function PaymentSuccess() {
    const [params] = useSearchParams();
    const { refresh } = useAuth();
    const nav = useNavigate();
    const [state, setState] = useState({ loading: true });

    useEffect(() => {
        // Dodo returns here after successful payment or we manually pass ?status=success
        const run = async () => {
            // Give webhook a second to process
            await new Promise(r => setTimeout(r, 2000));
            await refresh();
            setState({ loading: false });
        };
        run();
    }, [refresh]);

    if (state.loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white px-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center animate-pulse mb-6">
                        <Coins className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="text-2xl font-black text-gray-900 tracking-tight animate-pulse">Confirming payment…</div>
                    <p className="text-gray-500 mt-3 text-sm">Please wait while we finalize your order.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-white px-6">
            <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Payment Successful!</h1>
                <p className="text-gray-500 leading-relaxed text-sm">
                    Your order has been processed. Subscriptions and Credits will be available in your account momentarily.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                    <button onClick={() => nav("/dashboard")} className="btn btn-primary !rounded-xl !py-3 w-full" data-testid="ps-dash-btn">
                        Go to dashboard <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                    <Link to="/marketplace" className="btn btn-ghost !rounded-xl !py-3 w-full" data-testid="ps-browse-btn">Keep browsing</Link>
                </div>
            </div>
        </div>
    );
}
