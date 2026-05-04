import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../lib/api";
import PromptCard from "../components/PromptCard";
import { Users, Download, Package } from "lucide-react";

export default function CreatorProfile() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        http.get(`/creators/${id}`).then((r) => setData(r.data)).catch(() => {});
    }, [id]);

    if (!data) return <div className="p-16 text-center">Loading…</div>;
    const { creator, prompts, stats } = data;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-end gap-6 border-b-2 border-[#1A1A1A] pb-8 mb-10">
                {creator.picture && (
                    <img src={creator.picture} alt={creator.name} className="w-32 h-32 object-cover border-2 border-[#1A1A1A] hard-shadow" />
                )}
                <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#FF4F00] font-bold">Creator Profile</div>
                    <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter mt-2">{creator.name}</h1>
                    <p className="mt-2 text-[#66635D] max-w-2xl">{creator.bio}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FFD600] border-2 border-[#1A1A1A] p-4 hard-shadow">
                        <Package className="w-5 h-5 mb-1" />
                        <div className="font-heading font-black text-2xl">{stats.prompts_count}</div>
                        <div className="text-xs uppercase font-bold tracking-wider">Prompts</div>
                    </div>
                    <div className="bg-[#0047FF] text-white border-2 border-[#1A1A1A] p-4 hard-shadow">
                        <Download className="w-5 h-5 mb-1" />
                        <div className="font-heading font-black text-2xl">{stats.total_downloads}</div>
                        <div className="text-xs uppercase font-bold tracking-wider">Downloads</div>
                    </div>
                </div>
            </div>

            <h2 className="font-heading text-3xl font-black tracking-tight mb-6">Prompts by {creator.name}</h2>
            {prompts.length === 0 ? (
                <p className="text-[#66635D]">No prompts yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {prompts.map((p) => <PromptCard key={p.id} prompt={{ ...p, creator }} />)}
                </div>
            )}
        </div>
    );
}
