import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Briefcase, IndianRupee, Clock, Send } from "lucide-react";

export default function CustomWorks() {
    const { user, login } = useAuth();
    const [works, setWorks] = useState([]);
    const [applying, setApplying] = useState(null);
    const [apply, setApply] = useState({ message: "", quoted_price_inr: 0 });

    const fetch = async () => {
        const r = await http.get("/custom-works");
        setWorks(r.data);
    };
    useEffect(() => { fetch(); }, []);

    const submit = async () => {
        if (!user) { login(); return; }
        try {
            await http.post(`/custom-works/${applying}/apply`, { ...apply, quoted_price_inr: parseInt(apply.quoted_price_inr) });
            toast.success("Application sent!"); setApplying(null); setApply({ message: "", quoted_price_inr: 0 });
            fetch();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">Custom Work</div>
            <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Prompt engineers wanted.</h1>
            <p className="mt-4 text-[#66635D] max-w-2xl">Live jobs posted by users. Apply, negotiate, get paid. Or post your own request from your dashboard.</p>

            <div className="mt-10 space-y-4">
                {works.length === 0 ? <p className="text-[#66635D]">No open requests right now.</p> : works.map((w) => (
                    <div key={w.id} className="bg-white border-2 border-[#1A1A1A] hard-shadow p-6" data-testid={`work-${w.id}`}>
                        <div className="flex flex-wrap gap-4 justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#66635D]">
                                    <Briefcase className="w-3 h-3" /> {w.category}
                                </div>
                                <h3 className="font-heading text-2xl font-bold mt-1">{w.title}</h3>
                                <p className="mt-2 text-[#66635D] text-sm">{w.description}</p>
                                <div className="mt-3 flex items-center gap-4 text-xs text-[#66635D]">
                                    {w.posted_by?.picture && <img src={w.posted_by.picture} className="w-6 h-6 rounded-full border border-[#1A1A1A]" alt="" />}
                                    <span>{w.posted_by?.name}</span>
                                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{w.deadline_days}d</span>
                                    <span>{w.applicants?.length || 0} applied</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="font-heading font-black text-3xl inline-flex items-center"><IndianRupee className="w-6 h-6" />{w.budget_inr}</div>
                                <button onClick={() => setApplying(w.id)} className="btn-vermilion !py-2 !px-4 text-sm" data-testid={`apply-btn-${w.id}`}>
                                    <Send className="w-3 h-3" /> Apply
                                </button>
                            </div>
                        </div>
                        {applying === w.id && (
                            <div className="mt-4 pt-4 border-t-2 border-[#1A1A1A] space-y-3">
                                <textarea placeholder="Pitch yourself (why you?)" value={apply.message} onChange={(e) => setApply({ ...apply, message: e.target.value })} rows={3} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="apply-msg" />
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Your quote ₹" value={apply.quoted_price_inr} onChange={(e) => setApply({ ...apply, quoted_price_inr: e.target.value })} className="px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0] flex-1" data-testid="apply-quote" />
                                    <button onClick={submit} className="btn-ink" data-testid="apply-send">Send</button>
                                    <button onClick={() => setApplying(null)} className="btn-outline">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
