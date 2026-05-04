import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, XCircle, ArrowRight, Coins } from "lucide-react";

export default function PaymentSuccess() {
    const [params] = useSearchParams();
    const { refresh } = useAuth();
    const nav = useNavigate();
    const [state, setState] = useState({ loading: true, ok: false, kind: null, msg: "" });

    useEffect(() => {
        const run = async () => {
            const payment_id = params.get("payment_id");
            const subscription_id = params.get("subscription_id");
            const status_q = (params.get("status") || "").toLowerCase();

            if (!payment_id && !subscription_id) {
                setState({ loading: false, ok: false, kind: null, msg: "Missing payment reference in URL." });
                return;
            }
            if (status_q && status_q !== "succeeded" && status_q !== "active") {
                setState({ loading: false, ok: false, kind: null, msg: `Payment status: ${status_q}` });
                return;
            }
            try {
                const r = await http.post("/payments/confirm", { payment_id, subscription_id });
                await refresh();
                setState({ loading: false, ok: true, kind: r.data.kind, msg: "Payment confirmed!" });
            } catch (e) {
                setState({ loading: false, ok: false, kind: null, msg: e.response?.data?.detail || "Could not confirm payment." });
            }
        };
        run();
    }, [params, refresh]);

    if (state.loading) {
        return (
            <div className="max-w-xl mx-auto px-6 py-24 text-center">
                <div className="font-heading text-3xl font-black animate-pulse">Verifying payment…</div>
                <p className="text-[#66635D] mt-2 text-sm">Hang tight, we're confirming with Dodo Payments.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
            {state.ok ? (
                <>
                    <CheckCircle2 className="w-16 h-16 mx-auto text-[#FF4F00]" />
                    <h1 className="mt-6 font-heading text-5xl font-black tracking-tighter">Payment confirmed.</h1>
                    <p className="mt-4 text-[#66635D]">
                        {state.kind === "subscription" && "Your creator plan is now active. Enjoy the perks!"}
                        {state.kind === "credit_pack" && (
                            <>Credits have been added to your wallet. <Coins className="w-4 h-4 inline -mt-1 text-[#FFD600]" /></>
                        )}
                        {state.kind === "prompt" && "The prompt is yours. Find it in your dashboard."}
                        {!state.kind && state.msg}
                    </p>
                    <div className="mt-10 flex justify-center gap-3 flex-wrap">
                        <button onClick={() => nav("/dashboard")} className="btn-vermilion hard-shadow" data-testid="ps-dash-btn">
                            Go to dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                        <Link to="/marketplace" className="btn-outline" data-testid="ps-browse-btn">Keep browsing</Link>
                    </div>
                </>
            ) : (
                <>
                    <XCircle className="w-16 h-16 mx-auto text-red-500" />
                    <h1 className="mt-6 font-heading text-5xl font-black tracking-tighter">Couldn't confirm.</h1>
                    <p className="mt-4 text-[#66635D]">{state.msg}</p>
                    <div className="mt-8 flex justify-center gap-3">
                        <Link to="/pricing" className="btn-outline">Try again</Link>
                        <Link to="/dashboard" className="btn-vermilion">Go to dashboard</Link>
                    </div>
                </>
            )}
        </div>
    );
}
