import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loadError, setLoadError] = useState('');

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        rights: '0',  // 0: User, 1: Admin, 2: Superadmin
        status: '1'   // 1: Active, 0: Inactive
    });

    const fetchUsers = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await fetch(apiUrl('get_users.php'));
            const json = await response.json();
            if (response.ok && json.success) {
                setUsers(json.data);
            } else {
                setUsers([]);
                setLoadError(json.message || 'Could not load users.');
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setUsers([]);
            setLoadError(err.message || 'Failed to fetch users.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch(apiUrl('add_user.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setFormData({ firstname: '', lastname: '', email: '', phone: '', password: '', rights: '0', status: '1' });
                fetchUsers();
            } else {
                setErrorMsg(data.messages || 'An error occurred.');
            }
        } catch (err) {
            setErrorMsg('Failed to submit form.');
        }
        setSubmitting(false);
    };

    return (
        <div className="animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage platform access and active user roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchUsers} className="flex items-center justify-center p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm text-slate-700">
                        <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus size={16} />
                        Add User
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                {loadError && (
                    <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {loadError}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Access Type</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 size={32} className="animate-spin mx-auto mb-2 text-blue-500" />
                                        Fetching Users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => {
                                    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                                    return (
                                    <tr key={user.id} className="table-row-hover">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.profile_image_url ? (
                                                    <img
                                                        src={user.profile_image_url}
                                                        alt={user.name}
                                                        className="w-11 h-11 rounded-2xl object-cover border border-white shadow-sm ring-1 ring-slate-200 bg-slate-100"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = 'none';
                                                            event.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`${user.profile_image_url ? 'hidden' : ''} w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center text-emerald-800 font-bold text-sm ring-1 ring-slate-200`}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-slate-900">{user.name}</span>
                                                    {user.profile_image ? (
                                                        <span className="text-xs text-slate-400">Profile photo added</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Initial avatar</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-sm text-slate-600">
                                                <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {user.email}</div>
                                                {user.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {user.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                <ShieldCheck size={16} className={user.role === 'Superadmin' ? 'text-violet-500' : 'text-blue-500'} />
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.active ? (
                                                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Active</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Inactive</span>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">Add New User</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">First Name</label>
                                    <input required name="firstname" value={formData.firstname} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="John" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                                    <input required name="lastname" value={formData.lastname} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="john@example.com" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Phone</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="123-456-7890" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Access Level</label>
                                    <select name="rights" value={formData.rights} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                                        <option value="0">User</option>
                                        <option value="1">Admin</option>
                                        <option value="2">Superadmin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="flex items-center justify-center min-w-[100px] px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
