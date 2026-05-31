import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
    Wand2, Image, Tag, FileText, AlignLeft, Layers,
    ChevronDown, Plus, X, Send, Sparkles,
} from "lucide-react";

const CATS = [
    { id: "image", label: "Image", emoji: "🖼️" },
    { id: "video", label: "Video", emoji: "🎬" },
    { id: "code", label: "Code", emoji: "💻" },
    { id: "marketing", label: "Marketing", emoji: "📣" },
    { id: "design", label: "Design", emoji: "🎨" },
    { id: "writing", label: "Writing", emoji: "✍️" },
    { id: "business", label: "Business", emoji: "💼" },
    { id: "seo", label: "SEO", emoji: "🔍" },
    { id: "chatgpt", label: "ChatGPT", emoji: "🤖" },
    { id: "midjourney", label: "Midjourney", emoji: "🌌" },
    { id: "3d", label: "3D", emoji: "🧊" },
    { id: "music", label: "Music", emoji: "🎵" },
];

const CHAR_LIMIT = 10000;

function FieldLabel({ icon: Icon, label, required }) {
    return (
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
            <Icon className="w-3.5 h-3.5 text-orange-500" />
            {label}
            {required && <span className="text-orange-500">*</span>}
        </label>
    );
}

export default function CreatePrompt() {
    const { user, login } = useAuth();
    const nav = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        content: "",
        category: "",
        tags: [],
        preview_url: "",
        example_images: [],
        price_credits: 0, // always 0 = free
    });

    const [tagInput, setTagInput] = useState("");

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
        if (!t || form.tags.includes(t) || form.tags.length >= 10) return;
        set("tags", [...form.tags, t]);
        setTagInput("");
    };

    const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { login(); return; }
        if (!form.title || !form.description || !form.content || !form.category) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSubmitting(true);
        try {
            const r = await http.post("/prompts", { ...form, price_credits: 0 });
            toast.success("🎉 Prompt published!");
            nav(`/prompts/${r.data.id}`);
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to publish prompt");
        } finally {
            setSubmitting(false);
        }
    };

    const contentLen = form.content.length;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="badge badge-orange mb-4 w-fit">
                        <Sparkles className="w-3 h-3" /> Free to Publish
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                        Create a <span className="gradient-text-dark">Prompt.</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
                        Share your best AI prompts with the community. All prompts are free — earn likes and followers instead.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div>
                        <FieldLabel icon={Wand2} label="Title" required />
                        <input
                            id="prompt-title"
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="e.g. Ultra-Realistic Portrait Photography Prompt"
                            maxLength={120}
                            className="input-orange !py-4 font-black text-xl text-gray-900 placeholder:font-medium placeholder:text-base placeholder:text-gray-400"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <FieldLabel icon={AlignLeft} label="Short Description" required />
                        <textarea
                            id="prompt-description"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="A brief overview of what this prompt does and what results to expect…"
                            rows={3}
                            maxLength={500}
                            className="input-orange resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <FieldLabel icon={Layers} label="Category" required />
                        <div className="flex flex-wrap gap-2.5">
                            {CATS.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => set("category", c.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                        form.category === c.id
                                            ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                                    }`}
                                >
                                    <span className="mr-1.5">{c.emoji}</span>{c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* The Prompt Content */}
                    <div>
                        <FieldLabel icon={FileText} label="Prompt Content" required />
                        <div className="relative">
                            <textarea
                                id="prompt-content"
                                value={form.content}
                                onChange={(e) => set("content", e.target.value)}
                                placeholder="Paste your full prompt here. Be as detailed as possible — include variables, system instructions, or example outputs…"
                                rows={12}
                                maxLength={CHAR_LIMIT}
                                className="input-orange !bg-gray-50 resize-y font-mono text-sm leading-relaxed"
                            />
                            <div className={`absolute bottom-3 right-3 text-xs font-bold ${contentLen > CHAR_LIMIT * 0.9 ? "text-orange-500" : "text-gray-400"}`}>
                                {contentLen}/{CHAR_LIMIT}
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <FieldLabel icon={Tag} label="Tags (optional)" />
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {form.tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                                    #{t}
                                    <button type="button" onClick={() => removeTag(t)} className="ml-1 text-gray-400 hover:text-orange-500 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                placeholder="Add a tag…"
                                maxLength={30}
                                className="input-orange flex-1"
                            />
                            <button type="button" onClick={addTag} className="btn btn-primary !rounded-xl !px-5">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-medium">{form.tags.length}/10 tags</p>
                    </div>

                    {/* Preview Image URL */}
                    <div>
                        <FieldLabel icon={Image} label="Preview Image URL (optional)" />
                        <input
                            value={form.preview_url}
                            onChange={(e) => set("preview_url", e.target.value)}
                            placeholder="https://…"
                            type="url"
                            className="input-orange"
                        />
                        {form.preview_url && (
                            <div className="mt-4 w-48 h-32 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                                <img src={form.preview_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = "none"} />
                            </div>
                        )}
                    </div>

                    {/* Free badge */}
                    <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 flex items-center gap-5 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                            <Sparkles className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <div className="font-black text-lg text-gray-900 mb-1">This prompt will be 100% FREE</div>
                            <p className="text-sm text-gray-600 leading-relaxed">Anyone in the community can access it instantly. Earn ❤️ likes and followers instead of credits.</p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            id="publish-prompt-btn"
                            className="btn btn-primary w-full sm:w-auto !py-3.5 !px-10 text-base font-bold shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {submitting ? "Publishing…" : "Publish Prompt"}
                        </button>
                        <button type="button" onClick={() => nav(-1)} className="btn btn-ghost w-full sm:w-auto !py-3.5 !px-8 text-sm font-bold">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
