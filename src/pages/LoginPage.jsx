import React, { useState } from 'react';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(apiUrl('login.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Login failed.');
            }

            onLogin(json.data);
        } catch (error) {
            setMessage(error.message || 'Login failed.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7_0,#f8fafc_34%,#eff6ff_100%)] flex items-center justify-center p-5">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-950 text-white flex items-center justify-center font-black text-xl shadow-2xl">
                        HR
                    </div>
                    <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">DigiChefs HR CRM</h1>
                    <p className="mt-2 text-sm text-slate-500">Sign in to manage candidates, AI search, and email campaigns.</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 shadow-xl border border-white/70 space-y-4">
                    {message && (
                        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {message}
                        </div>
                    )}

                    <label className="block text-sm font-bold text-slate-700">
                        Email
                        <div className="relative mt-2">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/40"
                                placeholder="you@digichefs.com"
                                required
                            />
                        </div>
                    </label>

                    <label className="block text-sm font-bold text-slate-700">
                        Password
                        <div className="relative mt-2">
                            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/40"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                        Login to CRM
                    </button>
                </form>
            </div>
        </div>
    );
}
