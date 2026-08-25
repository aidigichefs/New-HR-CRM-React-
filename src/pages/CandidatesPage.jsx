import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Eye, Edit, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import CandidateEditModal from '../components/CandidateEditModal';
import { apiUrl } from '../lib/api';

const initialFilters = {
    role: '',
    status: '',
    city: '',
    current_ctc: '',
    expected_ctc: '',
    date_from: '',
    date_to: '',
};

function formatExperienceForDisplay(value) {
    const rawValue = String(value || '').trim();
    if (rawValue === '') {
        return '0 Years';
    }

    const numericMatch = rawValue.match(/\d+(?:\.\d+)?/);
    if (!numericMatch) {
        return rawValue;
    }

    const amount = Number(numericMatch[0]);
    if (!Number.isFinite(amount)) {
        return rawValue;
    }

    const years = Number.isInteger(amount) && amount > 7 ? amount / 12 : amount;
    const formattedYears = years.toLocaleString('en-IN', {
        maximumFractionDigits: 1,
        minimumFractionDigits: Number.isInteger(years) ? 0 : 1,
    });

    return `${formattedYears} Years`;
}

function formatSalaryForDisplay(value) {
    const rawValue = String(value || '').trim();
    if (rawValue === '') {
        return '0 LPA';
    }

    const normalized = rawValue.toLowerCase().replace(/[,₹\s]/g, '').replace(/rs\.?/g, '');
    const salaryMatch = normalized.match(/^(\d+(?:\.\d+)?)(l|lac|lacs|lakh|lakhs|lpa|lps)?$/);
    if (!salaryMatch) {
        return rawValue;
    }

    const amount = Number(salaryMatch[1]);
    if (!Number.isFinite(amount)) {
        return rawValue;
    }

    let annualAmount = amount;
    if (salaryMatch[2] || amount < 100) {
        annualAmount = amount * 100000;
    } else if (amount < 100000) {
        annualAmount = amount * 12;
    }

    const lpa = annualAmount / 100000;
    const formattedLpa = lpa.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: Number.isInteger(lpa) ? 0 : 1,
    });

    return `${formattedLpa} LPA`;
}

export default function CandidatesPage({ currentUser }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
    const [roles, setRoles] = useState([]);

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

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch(apiUrl('get_candidate_options.php'));
                const json = await response.json();
                if (json.success) {
                    setRoles(Array.isArray(json.data?.roles) ? json.data.roles : []);
                }
            } catch (error) {
                console.error('Failed to load candidate roles:', error);
            }
        };

        fetchOptions();
    }, []);

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

    const formatNoticePeriod = (value) => {
        const rawValue = String(value ?? '').trim();
        if (rawValue === '') {
            return 'Not provided';
        }

        const numericValue = Number(rawValue);
        if (Number.isFinite(numericValue)) {
            return numericValue === 0 ? 'Immediate' : `${numericValue} days`;
        }

        return rawValue;
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
                    <div className="xl:col-span-2">
                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white shadow-sm text-sm"
                        >
                            <option value="">All roles</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
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
                                <th className="px-6 py-4 w-[180px] max-w-[180px]">Exp & Salary</th>
                                <th className="px-6 py-4">Notice Period</th>
                                <th className="px-6 py-4">Date Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 size={32} className="animate-spin mx-auto mb-2 text-blue-500" />
                                        Fetching Candidates...
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
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
                                            {candidate.is_careers_import ? (
                                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
                                                        Careers Import
                                                    </span>
                                                    <span className="text-xs text-slate-400">resume-only email</span>
                                                </div>
                                            ) : null}
                                            <div className="text-slate-500 mt-0.5">{candidate.email || '-'}</div>
                                            <div className="text-slate-500 mt-0.5">{candidate.phone || '-'}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="max-w-[240px] truncate text-slate-700 font-medium" title={candidate.roles || ''}>
                                                {candidate.roles || 'No roles'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{candidate.city || 'No city'}</div>
                                        </td>

                                        <td className="px-6 py-4 w-[180px] max-w-[180px] whitespace-normal">
                                            <div className="text-slate-700 font-medium">{formatExperienceForDisplay(candidate.experience)}</div>
                                            <div
                                                className="max-w-[150px] break-words text-emerald-600 font-semibold text-xs leading-relaxed mt-1"
                                                title={`${formatSalaryForDisplay(candidate.current_ctc)} to ${formatSalaryForDisplay(candidate.expected_ctc)}`}
                                            >
                                                {formatSalaryForDisplay(candidate.current_ctc)} to {formatSalaryForDisplay(candidate.expected_ctc)}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-semibold">{formatNoticePeriod(candidate.notice_period)}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-medium">{formatShortDate(candidate.date_added) || 'Not provided'}</div>
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
                    currentUser={currentUser}
                    onClose={() => setEditingCandidate(null)}
                    onUpdated={handleCandidateUpdated}
                />
            )}
        </div>
    );
}
