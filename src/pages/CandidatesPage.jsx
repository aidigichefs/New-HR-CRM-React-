import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Eye, Edit, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import CandidateEditModal from '../components/CandidateEditModal';
import { apiUrl } from '../lib/api';

const initialFilters = {
    search: '',
    status: '',
    city: '',
    current_ctc: '',
    expected_ctc: '',
    date_from: '',
    date_to: '',
};

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });

    const fetchCandidates = async (page = pagination.page, nextFilters = appliedFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(pagination.limit),
            });

            Object.entries(nextFilters).forEach(([key, value]) => {
                if (String(value || '').trim() !== '') {
                    params.set(key, value);
                }
            });

            const response = await fetch(apiUrl(`get_candidates.php?${params.toString()}`));
            const json = await response.json();
            if (json.success) {
                setCandidates(Array.isArray(json.data) ? json.data : []);
                setPagination(json.pagination || { page, limit: 50, total: 0, pages: 1 });
            }
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCandidates(1, appliedFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedFilters]);

    const handleFilterChange = (event) => {
        setFilters({ ...filters, [event.target.name]: event.target.value });
    };

    const applyFilters = (event) => {
        event.preventDefault();
        setAppliedFilters(filters);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    const goToPage = (page) => {
        const safePage = Math.max(1, Math.min(page, pagination.pages || 1));
        fetchCandidates(safePage, appliedFilters);
    };

    const handleCandidateUpdated = (updates) => {
        setCandidates((currentCandidates) => (
            currentCandidates.map((item) => (
                item.id === editingCandidate?.id ? { ...item, ...updates } : item
            ))
        ));
        setEditingCandidate((currentCandidate) => (
            currentCandidate ? { ...currentCandidate, ...updates } : currentCandidate
        ));
    };

    const formatShortDate = (value) => {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
                    <p className="text-slate-500 text-sm mt-1">Review candidate applications with live CRM filters and activity context.</p>
                </div>

                <button onClick={() => fetchCandidates(pagination.page, appliedFilters)} className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm text-slate-700 text-sm font-medium">
                    <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
                    Refresh
                </button>
            </div>

            <form onSubmit={applyFilters} className="glass-panel rounded-2xl p-4 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
                    <div className="relative xl:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search name, email, phone, role..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white shadow-sm text-sm"
                        />
                    </div>
                    <input name="status" value={filters.status} onChange={handleFilterChange} placeholder="Status ID" className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                    <input name="city" value={filters.city} onChange={handleFilterChange} placeholder="City" className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                    <input name="current_ctc" value={filters.current_ctc} onChange={handleFilterChange} placeholder="Current CTC max" className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                    <input name="expected_ctc" value={filters.expected_ctc} onChange={handleFilterChange} placeholder="Expected CTC max" className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                    <div className="flex gap-2">
                        <button type="submit" className="flex flex-1 items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                            <Filter size={16} />
                            Apply
                        </button>
                        <button type="button" onClick={resetFilters} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700">
                            Reset
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 max-w-xl">
                    <label className="text-xs font-semibold text-slate-500">
                        Date from
                        <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-normal text-slate-700" />
                    </label>
                    <label className="text-xs font-semibold text-slate-500">
                        Date to
                        <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-normal text-slate-700" />
                    </label>
                </div>
            </form>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-5 py-4 w-12 text-center">PDF</th>
                                <th className="px-5 py-4 w-12 text-center">Edit</th>
                                <th className="px-6 py-4">HR</th>
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4">Exp & Salary</th>
                                <th className="px-6 py-4">Status & Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 size={32} className="animate-spin mx-auto mb-2 text-blue-500" />
                                        Fetching Candidates...
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No candidates found.
                                    </td>
                                </tr>
                            ) : (
                                candidates.map((candidate) => {
                                    const latestHrInitials = (candidate.latest_hr_name || 'HR')
                                        .split(' ')
                                        .map((part) => part[0])
                                        .join('')
                                        .substring(0, 2)
                                        .toUpperCase();

                                    return (
                                    <tr key={candidate.id} className="table-row-hover text-sm">
                                        <td className="px-5 py-4 text-center">
                                            {candidate.resume ? (
                                                <a href={apiUrl(`get_resume.php?file=${encodeURIComponent(candidate.resume)}`)} target="_blank" rel="noreferrer" className="inline-flex p-1.5 rounded transition-transform hover:scale-110" title="View resume">
                                                    <Eye size={20} className="text-green-500 drop-shadow-sm" />
                                                </a>
                                            ) : (
                                                <span className="inline-flex p-1.5 opacity-80" title="No resume available">
                                                    <Eye size={20} className="text-red-500 drop-shadow-sm" />
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <button onClick={() => setEditingCandidate(candidate)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded transition-colors shadow-sm border border-slate-200/50" title="Edit Candidate">
                                                <Edit size={16} />
                                            </button>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                {candidate.latest_hr_profile_image_url ? (
                                                    <img
                                                        src={candidate.latest_hr_profile_image_url}
                                                        alt={candidate.latest_hr_name || 'HR'}
                                                        className="h-10 w-10 rounded-2xl object-cover border border-white shadow-sm ring-1 ring-slate-200 bg-slate-100"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = 'none';
                                                            event.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`${candidate.latest_hr_profile_image_url ? 'hidden' : ''} h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 flex shrink-0 items-center justify-center text-xs font-bold text-emerald-800 ring-1 ring-slate-200`}>
                                                    {candidate.latest_hr_name ? latestHrInitials : '-'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-700">{candidate.latest_hr_name || 'No HR comment'}</div>
                                                    {candidate.latest_hr_comment ? (
                                                        <>
                                                            <div className="max-w-[220px] truncate text-xs text-slate-500 mt-1" title={candidate.latest_hr_comment}>
                                                                {candidate.latest_hr_comment}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 mt-1">
                                                                {formatShortDate(candidate.latest_hr_comment_date)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-xs text-slate-400 mt-1">No call/comment yet</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 text-[15px]">{candidate.name || 'Unnamed candidate'}</div>
                                            <div className="text-slate-500 mt-0.5">{candidate.email || '-'}</div>
                                            <div className="text-slate-500 mt-0.5">{candidate.phone || '-'}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="max-w-[240px] truncate text-slate-700 font-medium" title={candidate.roles || ''}>
                                                {candidate.roles || 'No roles'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{candidate.city || 'No city'}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-medium">{candidate.experience ? `${candidate.experience} Years` : '0 Years'}</div>
                                            <div className="text-emerald-600 font-semibold text-xs mt-1">Rs {candidate.current_ctc || '0'} to Rs {candidate.expected_ctc || '0'}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-1.5 border border-blue-100 tracking-wide">
                                                {candidate.status || 'Pending'}
                                            </span>
                                            <div className="text-xs font-medium text-slate-400 uppercase">{candidate.source || 'Unknown'}</div>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 text-sm text-slate-500">
                <div>
                    Showing page {pagination.page} of {pagination.pages} · {pagination.total} total candidates
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1 || loading} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50">
                        <ChevronLeft size={16} />
                        Prev
                    </button>
                    <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.pages || loading} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50">
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {editingCandidate && (
                <CandidateEditModal
                    candidate={editingCandidate}
                    onClose={() => setEditingCandidate(null)}
                    onUpdated={handleCandidateUpdated}
                />
            )}
        </div>
    );
}
