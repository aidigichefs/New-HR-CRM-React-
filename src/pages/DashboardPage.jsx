import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Camera, Loader2, RefreshCw, Save, UserRound } from 'lucide-react';
import { apiUrl, crmAssetUrl } from '../lib/api';

function splitName(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return {
        firstname: parts.shift() || '',
        lastname: parts.join(' '),
    };
}

export default function DashboardPage({ currentUser, onUserUpdated }) {
    const nameParts = useMemo(() => splitName(currentUser?.name), [currentUser?.name]);
    const [form, setForm] = useState({
        firstname: currentUser?.firstname || nameParts.firstname,
        lastname: currentUser?.lastname || nameParts.lastname,
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        profile_image: currentUser?.profile_image || '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [usage, setUsage] = useState(null);
    const [usageLoading, setUsageLoading] = useState(false);

    const profileUrl = form.profile_image ? crmAssetUrl(form.profile_image) : '';
    const initials = `${form.firstname?.[0] || ''}${form.lastname?.[0] || ''}`.toUpperCase() || 'HR';

    const updateField = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
    const formatCost = (value, currency = 'USD') => {
        const amount = Number(value || 0);
        return `${currency || 'USD'} ${amount.toLocaleString('en-IN', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 8,
        })}`;
    };

    const fetchUsage = async () => {
        setUsageLoading(true);
        try {
            const response = await fetch(apiUrl(`get_ai_usage_summary.php?staff_id=${encodeURIComponent(currentUser?.id || 0)}`));
            const json = await response.json();
            if (json.success) {
                setUsage(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch AI usage summary:', error);
        }
        setUsageLoading(false);
    };

    useEffect(() => {
        fetchUsage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const response = await fetch(apiUrl('update_user_profile.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentUser.id, ...form }),
            });
            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Could not update profile.');
            }

            onUserUpdated({ ...currentUser, ...json.data, role: currentUser.role });
            setMessage('Profile updated successfully.');
        } catch (error) {
            setMessage(error.message || 'Could not update profile.');
        }

        setSaving(false);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-slate-950">My Profile</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your CRM profile information and display photo.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
                <section className="glass-panel rounded-3xl p-6 border border-white/70">
                    <div className="relative mx-auto h-36 w-36">
                        {profileUrl ? (
                            <img
                                src={profileUrl}
                                alt={form.firstname || 'Profile'}
                                className="h-36 w-36 rounded-[2rem] object-cover border-4 border-white shadow-xl bg-slate-100"
                            />
                        ) : (
                            <div className="h-36 w-36 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center text-4xl font-black text-emerald-800 shadow-xl">
                                {initials}
                            </div>
                        )}
                        <div className="absolute -bottom-3 -right-3 h-12 w-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg">
                            <Camera size={20} />
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-black text-slate-950">{`${form.firstname} ${form.lastname}`.trim() || 'HR User'}</h2>
                        <p className="mt-1 text-sm text-slate-500">{form.email}</p>
                        <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-100">
                            {currentUser?.role || 'User'}
                        </span>
                    </div>
                </section>

                <form onSubmit={saveProfile} className="glass-panel rounded-3xl p-6 border border-white/70">
                    <div className="flex items-center gap-2 mb-5">
                        <UserRound className="text-emerald-700" size={20} />
                        <h2 className="text-xl font-black text-slate-950">Update Information</h2>
                    </div>

                    {message ? (
                        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                            {message}
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="text-sm font-bold text-slate-700">
                            First name
                            <input name="firstname" value={form.firstname} onChange={updateField} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </label>
                        <label className="text-sm font-bold text-slate-700">
                            Last name
                            <input name="lastname" value={form.lastname} onChange={updateField} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </label>
                        <label className="text-sm font-bold text-slate-700">
                            Email
                            <input type="email" name="email" value={form.email} onChange={updateField} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </label>
                        <label className="text-sm font-bold text-slate-700">
                            Phone
                            <input name="phone" value={form.phone} onChange={updateField} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </label>
                        <label className="text-sm font-bold text-slate-700 md:col-span-2">
                            Profile image path
                            <input name="profile_image" value={form.profile_image} onChange={updateField} placeholder="profile/deep.png" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            <span className="mt-2 block text-xs font-medium text-slate-400">Use paths from the CRM root, for example: profile/deep.png</span>
                        </label>
                    </div>

                    <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700 disabled:opacity-60">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Profile
                    </button>
                </form>
            </div>

            <section className="glass-panel rounded-3xl p-6 border border-white/70 mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        <Bot className="text-blue-700" size={22} />
                        <div>
                            <h2 className="text-xl font-black text-slate-950">AI API Usage</h2>
                            <p className="text-sm text-slate-500">Token usage logged from HR CRM AI Search batches.</p>
                        </div>
                    </div>
                    <button type="button" onClick={fetchUsage} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <RefreshCw size={16} className={usageLoading ? 'animate-spin text-blue-600' : ''} />
                        Refresh usage
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">My Tokens</div>
                        <div className="mt-2 text-3xl font-black text-slate-950">{formatNumber(usage?.current_user?.total_tokens)}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{formatNumber(usage?.current_user?.runs)} AI runs</div>
                        <div className="mt-3 text-sm font-black text-emerald-700">{formatCost(usage?.current_user?.total_cost, usage?.current_user?.currency)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">Today</div>
                        <div className="mt-2 text-3xl font-black text-emerald-700">{formatNumber(usage?.today?.total_tokens)}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{formatNumber(usage?.today?.runs)} AI runs today</div>
                        <div className="mt-3 text-sm font-black text-emerald-700">{formatCost(usage?.today?.total_cost, usage?.today?.currency)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">All Users</div>
                        <div className="mt-2 text-3xl font-black text-blue-700">{formatNumber(usage?.total?.total_tokens)}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{formatNumber(usage?.total?.runs)} total AI runs</div>
                        <div className="mt-3 text-sm font-black text-blue-700">{formatCost(usage?.total?.total_cost, usage?.total?.currency)}</div>
                    </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                            <tr>
                                <th className="px-4 py-3">HR User</th>
                                <th className="px-4 py-3">Input</th>
                                <th className="px-4 py-3">Output</th>
                                <th className="px-4 py-3">Total Tokens</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Runs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(usage?.users || []).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No AI usage logged yet.</td>
                                </tr>
                            ) : (
                                usage.users.map((item) => (
                                    <tr key={item.staff_id}>
                                        <td className="px-4 py-3 font-bold text-slate-800">{item.staff_name}</td>
                                        <td className="px-4 py-3 text-slate-600">{formatNumber(item.input_tokens)}</td>
                                        <td className="px-4 py-3 text-slate-600">{formatNumber(item.output_tokens)}</td>
                                        <td className="px-4 py-3 font-black text-slate-950">{formatNumber(item.total_tokens)}</td>
                                        <td className="px-4 py-3 font-black text-emerald-700">{formatCost(item.total_cost, item.currency)}</td>
                                        <td className="px-4 py-3 text-slate-600">{formatNumber(item.runs)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
