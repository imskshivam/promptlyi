const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'CreatorDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add missing imports
content = content.replace(
    'import { Coins, IndianRupee, TrendingUp, Package, Sparkles, Trash2, Lock, Unlock, ImageIcon, Video, BarChart3, Banknote, Wallet, PenSquare, Plus } from "lucide-react";',
    'import { Coins, IndianRupee, TrendingUp, Package, Sparkles, Trash2, Lock, Unlock, ImageIcon, Video, BarChart3, Banknote, Wallet, PenSquare, Plus, BookOpen, ShoppingBag, ArrowRight, ChevronRight, Clock } from "lucide-react";\nimport { Link } from "react-router-dom";'
);

// 2. Add purchases state
content = content.replace(
    'const [sales, setSales] = useState([]);',
    'const [sales, setSales] = useState([]);\n    const [purchases, setPurchases] = useState([]);'
);

// 3. Update fetchAll
content = content.replace(
    'http.get("/payouts/history").catch(() => ({ data: [] })),',
    'http.get("/payouts/history").catch(() => ({ data: [] })),\n            http.get("/purchases").catch(() => ({ data: [] })),'
);
content = content.replace(
    'setStats(s.data); setPrompts(m.data); setSales(sl.data); setPayouts(p.data);',
    'const pu = arguments[0]?.[4] || {data:[]};\n        setStats(s.data); setPrompts(m.data); setSales(sl.data); setPayouts(p.data);'
);
// Fix the fetchAll properly:
content = content.replace(
    /const \[s, m, sl, p\] = await Promise\.all\(\[/,
    'const [s, m, sl, p, pu] = await Promise.all(['
);
content = content.replace(
    /setStats\(s\.data\); setPrompts\(m\.data\); setSales\(sl\.data\); setPayouts\(p\.data\);/,
    'setStats(s.data); setPrompts(m.data); setSales(sl.data); setPayouts(p.data); setPurchases(pu.data);'
);

// 4. Add Tabs
content = content.replace(
    '["payouts", "Payouts"],',
    '["payouts", "Payouts"],\n                        ["library", "My Library"],\n                        ["history", "Purchases History"],'
);

// 5. Add rendering for library and history tabs
// Insert before "return (" of CreatorDashboard... wait, insert before the end of the return statement.
// We can just append it right after the {tab === "create" && ( ... )} block.
const libraryAndHistoryBlocks = `

                {/* ============ LIBRARY ============ */}
                {tab === "library" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-orange-500" />
                                Unlocked Prompts
                            </h2>
                            <Link to="/marketplace" className="btn btn-ghost !rounded-xl !text-sm">
                                Browse Marketplace <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        {purchases.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-black text-xl text-gray-900 mb-2">No prompts unlocked yet</h3>
                                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Discover premium AI prompts crafted by experts and unlock them to see them here.</p>
                                <Link to="/marketplace" className="btn btn-primary !rounded-xl inline-flex">Explore Prompts</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {purchases.map((pu) => pu.prompt && (
                                    <Link key={pu.id} to={\`/prompts/\${pu.prompt_id}\`} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all flex flex-col">
                                        <div className="aspect-video bg-gray-50 overflow-hidden relative">
                                            {pu.prompt.preview_url ? (
                                                <img src={pu.prompt.preview_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen className="w-10 h-10" /></div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg text-gray-900 shadow-sm">
                                                {pu.prompt.category}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">{pu.prompt.title}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{pu.prompt.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <span className="text-xs font-semibold text-gray-400">Purchased on {new Date(pu.created_at).toLocaleDateString()}</span>
                                                <span className="text-orange-500 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    View <ChevronRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ============ HISTORY ============ */}
                {tab === "history" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-orange-500" />
                                Purchases History
                            </h2>
                        </div>

                        {purchases.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-gray-400 font-medium">No transactions found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400">Date</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400">Prompt</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {purchases.map((pu) => (
                                            <tr key={pu.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium text-gray-900">{new Date(pu.created_at).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {pu.prompt ? <Link to={\`/prompts/\${pu.prompt_id}\`} className="hover:text-orange-500 font-medium">{pu.prompt.title}</Link> : "Unknown Prompt"}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-900 font-bold text-right">
                                                    {pu.credits_used > 0 ? \`\${pu.credits_used} credits\` : "Free"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
`;

content = content.replace('{/* ============ MY PROMPTS ============ */}', libraryAndHistoryBlocks + '\n                {/* ============ MY PROMPTS ============ */}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('CreatorDashboard.jsx updated successfully.');
