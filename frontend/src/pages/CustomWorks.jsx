import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Briefcase, IndianRupee, Clock, Send, Sparkles } from "lucide-react";

export default function CustomWorks() {
    const { user, login } = useAuth();
    const [works, setWorks]     = useState([]);
    const [applying, setApplying] = useState(null);
    const [apply, setApply]     = useState({ message: "", quoted_price_usd: 0 });

    const fetchWorks = async () => {
        const r = await http.get("/custom-works");
        setWorks(r.data);
    };
    useEffect(() => { fetchWorks(); }, []);

    const submit = async () => {
        if (!user) { login(); return; }
        try {
            await http.post(`/custom-works/${applying}/apply`, { ...apply, quoted_price_usd: parseInt(apply.quoted_price_usd) });
            toast.success("Application sent!");
            setApplying(null);
            setApply({ message: "", quoted_price_usd: 0 });
            fetchWorks();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-14 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="badge badge-orange mb-4 w-fit">
                        <Sparkles className="w-3.5 h-3.5" /> Custom Work
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-3">
                        Prompt engineers <span className="gradient-text-dark">wanted.</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl text-base">
                        Live jobs posted by users. Apply, negotiate, get paid.
                        Or post your own request from your dashboard.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="space-y-4">
                    {works.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">📭</div>
                            <p className="text-gray-500 text-lg">No open requests right now.</p>
                            <p className="text-gray-400 text-sm mt-2">Check back soon — new jobs are posted daily.</p>
                        </div>
                    ) : works.map((w) => (
                        <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:border-orange-200 hover:shadow-[0_4px_24px_rgba(249,115,22,0.08)] transition-all duration-200" data-testid={`work-${w.id}`}>
                            <div className="flex flex-wrap gap-4 justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
                                        <Briefcase className="w-3.5 h-3.5" /> {w.category}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mt-1">{w.title}</h3>
                                    <p className="mt-2 text-gray-500 text-sm leading-relaxed">{w.description}</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                        {w.posted_by?.picture && (
                                            <img src={w.posted_by.picture} className="w-6 h-6 rounded-full border border-gray-200" alt="" />
                                        )}
                                        <span className="font-medium text-gray-600">{w.posted_by?.name}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{w.deadline_days}d deadline
                                        </span>
                                        <span>{w.applicants?.length || 0} applied</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="font-black text-3xl text-gray-900 inline-flex items-center">
                                        <IndianRupee className="w-6 h-6" />{w.budget_usd}
                                    </div>
                                    <button
                                        onClick={() => setApplying(w.id)}
                                        className="btn btn-primary !rounded-xl !py-2 !px-5 !text-sm"
                                        data-testid={`apply-btn-${w.id}`}
                                    >
                                        <Send className="w-3.5 h-3.5" /> Apply
                                    </button>
                                </div>
                            </div>

                            {applying === w.id && (
                                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                                    <textarea
                                        placeholder="Pitch yourself — why are you the right fit?"
                                        value={apply.message}
                                        onChange={(e) => setApply({ ...apply, message: e.target.value })}
                                        rows={3}
                                        className="input-orange resize-none"
                                        data-testid="apply-msg"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            placeholder="Your quote ($)"
                                            value={apply.quoted_price_usd}
                                            onChange={(e) => setApply({ ...apply, quoted_price_usd: e.target.value })}
                                            className="input-orange flex-1"
                                            data-testid="apply-quote"
                                        />
                                        <button onClick={submit} className="btn btn-primary !rounded-xl !px-6" data-testid="apply-send">Send</button>
                                        <button onClick={() => setApplying(null)} className="btn btn-ghost !rounded-xl !px-5">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
