import React, { useMemo, useState } from 'react';
import { Camera, Loader2, Save, UserRound } from 'lucide-react';
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

    const profileUrl = form.profile_image ? crmAssetUrl(form.profile_image) : '';
    const initials = `${form.firstname?.[0] || ''}${form.lastname?.[0] || ''}`.toUpperCase() || 'HR';

    const updateField = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

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
        </div>
    );
}
