import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import PromptCard from "../components/PromptCard";
import { Users, Download, Package, Heart, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreatorProfile() {
    const { id } = useParams();
    const { user, login } = useAuth();
    const [data, setData] = useState(null);
    const [followState, setFollowState] = useState({ following: false, followers_count: 0, following_count: 0 });
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        http.get(`/creators/${id}`).then((r) => setData(r.data)).catch(() => {});
        http.get(`/social/follow-status/${id}`).then((r) => setFollowState(r.data)).catch(() => {});
    }, [id]);

    const toggleFollow = async () => {
        if (!user) { login(); return; }
        setFollowLoading(true);
        try {
            const r = await http.post(`/social/follow/${id}`);
            setFollowState((prev) => ({ ...prev, following: r.data.following, followers_count: r.data.followers_count }));
            toast.success(r.data.following ? "✅ Following!" : "Unfollowed.");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Could not update follow");
        } finally { setFollowLoading(false); }
    };

    if (!data) return (
        <div className="max-w-7xl mx-auto px-6 py-16 animate-pulse">
            <div className="flex gap-6 mb-8">
                <div className="w-28 h-28 bg-gray-100 rounded-3xl" />
                <div className="flex-1 space-y-4 py-2">
                    <div className="h-8 bg-gray-100 rounded-xl w-1/2" />
                    <div className="h-4 bg-gray-50 rounded-xl w-3/4" />
                </div>
            </div>
        </div>
    );

    const { creator, prompts, stats } = data;
    const isOwnProfile = user?.id === creator.id;

    return (
        <div className="min-h-screen bg-white">
            {/* Profile Header */}
            <div className="bg-white border-b border-gray-100 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end gap-8">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {creator.picture ? (
                                <img
                                    src={creator.picture}
                                    alt={creator.name}
                                    className="w-28 h-28 object-cover rounded-3xl border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                                />
                            ) : (
                                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-[0_8px_30px_rgba(249,115,22,0.3)]">
                                    {(creator.name || "C")[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="badge badge-orange mb-2 w-fit">Creator Profile</div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{creator.name}</h1>
                            {creator.bio && <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">{creator.bio}</p>}

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                <span><span className="font-bold text-gray-900">{followState.followers_count}</span> followers</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span><span className="font-bold text-gray-900">{followState.following_count}</span> following</span>
                            </div>

                            {!isOwnProfile && (
                                <button
                                    onClick={toggleFollow}
                                    disabled={followLoading}
                                    id="follow-btn"
                                    className={`mt-4 btn !rounded-xl !py-2.5 !px-6 !text-sm ${
                                        followState.following ? "btn-dark" : "btn-primary"
                                    }`}
                                >
                                    {followLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : followState.following ? (
                                        <UserCheck className="w-4 h-4" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                    {followState.following ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: Package,  value: stats.prompts_count,    label: "Prompts",   color: "bg-orange-50 text-orange-600",  iconColor: "text-orange-500" },
                                { icon: Download, value: stats.total_downloads,  label: "Uses",      color: "bg-blue-50 text-blue-600",     iconColor: "text-blue-500" },
                                { icon: Heart,    value: stats.total_likes || 0, label: "Likes",     color: "bg-red-50 text-red-600",       iconColor: "text-red-500" },
                                { icon: Users,    value: followState.followers_count, label: "Followers", color: "bg-violet-50 text-violet-600", iconColor: "text-violet-500" },
                            ].map(({ icon: Icon, value, label, color, iconColor }) => (
                                <div key={label} className={`${color} rounded-2xl p-4 text-center border border-white`}>
                                    <Icon className={`w-5 h-5 mb-1.5 mx-auto ${iconColor}`} />
                                    <div className="font-black text-2xl">{value}</div>
                                    <div className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Prompts */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Prompts by {creator.name}</h2>
                {prompts.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="text-4xl mb-3">✍️</div>
                        <p className="text-gray-500 font-medium">No prompts published yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {prompts.map((p) => <PromptCard key={p.id} prompt={{ ...p, creator }} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
