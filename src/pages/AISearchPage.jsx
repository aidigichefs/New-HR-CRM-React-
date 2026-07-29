import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Search, Sparkles, AlertCircle, Square, Activity, Eye, X } from 'lucide-react';
import CandidateEditModal from '../components/CandidateEditModal';
import { apiUrl } from '../lib/api';

const initialFilters = {
    role: '',
    experience_min: '',
    experience_max: '',
    lead_status: '',
    source: '',
    city: '',
    relocate: '',
    current_ctc: '',
    expected_ctc: '',
    notice_period: '',
    interval: '',
    total_limit: '50',
    instructions: '',
};

function Detail({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-800 whitespace-pre-wrap">{value || 'Not provided'}</div>
        </div>
    );
}

function AISearchCard({ card, onOpenActivity, onOpenResume }) {
    return (
        <article className="glass-panel rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-lg">
                        {card.card_number}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{card.name || 'Unnamed candidate'}</h3>
                        <div className="text-sm text-slate-500 mt-1">{card.email || '-'} - {card.phone || '-'}</div>
                        <div className="text-xs text-slate-400 mt-1">Lead #{card.lead_id} - Applied {card.applied_date || 'Not available'}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {card.resume ? (
                        <button
                            type="button"
                            onClick={() => onOpenResume(card)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100"
                            title="View resume"
                        >
                            <Eye size={16} />
                            PDF
                        </button>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 text-sm font-bold" title="Resume not available">
                            <Eye size={16} />
                            PDF
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onOpenActivity(card)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100"
                    >
                        <Activity size={16} />
                        Activity
                    </button>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Score</div>
                        <div className="text-3xl font-black text-emerald-600">{card.ai_score || 0}</div>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                        /100
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
                <Detail label="Role" value={card.role} />
                <Detail label="Status" value={card.status} />
                <Detail label="Source" value={card.source} />
                <Detail label="City" value={card.city} />
                <Detail label="Relocate" value={card.relocate} />
                <Detail label="Experience" value={card.experience} />
                <Detail label="Current CTC" value={card.current_ctc} />
                <Detail label="Expected CTC" value={card.expected_ctc} />
                <Detail label="Notice" value={card.notice_period} />
                <Detail label="Qualification" value={card.qualification} />
                <Detail label="Current Title" value={card.current_title} />
                <Detail label="Employer" value={card.employer} />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl bg-slate-900 text-white p-5">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
                        <Sparkles size={16} />
                        AI Summary
                    </div>
                    <p className="text-sm leading-6 text-slate-100">{card.ai_summary || card.why || 'AI did not return a summary for this candidate.'}</p>
                    {card.interview_focus && (
                        <p className="mt-3 text-sm text-slate-300">
                            <span className="font-bold text-white">Interview focus:</span> {card.interview_focus}
                        </p>
                    )}
                </div>
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                    <div className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2">Skills</div>
                    <p className="text-sm text-slate-700 leading-6">{card.skills || 'Not provided'}</p>
                </div>
            </div>
        </article>
    );
}

export default function AISearchPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [options, setOptions] = useState({ roles: [], statuses: [], sources: [], date_intervals: [] });
    const [cards, setCards] = useState([]);
    const [filtersUsed, setFiltersUsed] = useState({});
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState({ processed: 0, total: 50, batch: 0 });
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [resumePreview, setResumePreview] = useState(null);
    const [scoreSort, setScoreSort] = useState('desc');
    const abortControllerRef = useRef(null);
    const stopRequestedRef = useRef(false);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const response = await fetch(apiUrl('get_ai_search_options.php'));
            const json = await response.json();
            if (json.success) {
                setOptions(json.data || {});
            }
        } catch (error) {
            console.error('Failed to load AI search options:', error);
        }
    };

    const updateFilter = (event) => {
        setFilters({ ...filters, [event.target.name]: event.target.value });
    };

    const runBatch = async (offset, totalLimit, signal) => {
        const formData = new FormData();
        Object.entries(filters).forEach(([key, value]) => formData.append(key, value));
        formData.append('offset', String(offset));
        formData.append('batch_size', '10');
        formData.set('total_limit', String(totalLimit));

        const response = await fetch(apiUrl('ai_resume_search.php'), {
            method: 'POST',
            body: formData,
            signal,
        });
        const json = await response.json();
        if (!json.success) {
            throw new Error(json.message || 'AI batch failed.');
        }

        return json;
    };

    const runSearch = async (event) => {
        event.preventDefault();
        setCards([]);
        setSummary('');
        setFiltersUsed({});
        setMessage('');
        setLoading(true);
        stopRequestedRef.current = false;

        const totalLimit = Math.max(10, Math.min(50, Number(filters.total_limit || 50)));
        setProgress({ processed: 0, total: totalLimit, batch: 0 });

        try {
            let offset = 0;
            let batchNumber = 1;
            let isFinal = false;

            while (!isFinal && offset < totalLimit && !stopRequestedRef.current) {
                setProgress({ processed: offset, total: totalLimit, batch: batchNumber });
                abortControllerRef.current = new AbortController();
                const result = await runBatch(offset, totalLimit, abortControllerRef.current.signal);
                if (stopRequestedRef.current) {
                    break;
                }
                setCards((currentCards) => [...currentCards, ...(result.cards || [])]);
                setFiltersUsed(result.filters_used || {});
                if (result.summary) {
                    setSummary(result.summary);
                }

                const batch = result.batch || {};
                offset = Number(batch.processed_to || offset + 10);
                isFinal = Boolean(batch.is_final);
                setProgress({
                    processed: offset,
                    total: Math.min(Number(batch.total_available || totalLimit), totalLimit),
                    batch: batchNumber,
                });
                batchNumber += 1;
            }

            setMessage(stopRequestedRef.current ? 'AI Search stopped.' : 'AI Search completed.');
        } catch (error) {
            setMessage(error.name === 'AbortError' ? 'AI Search stopped.' : (error.message || 'AI Search failed.'));
        }

        abortControllerRef.current = null;
        setLoading(false);
    };

    const stopSearch = () => {
        stopRequestedRef.current = true;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setLoading(false);
        setMessage('AI Search stopped.');
    };

    const reset = () => {
        stopSearch();
        setFilters(initialFilters);
        setCards([]);
        setSummary('');
        setFiltersUsed({});
        setMessage('');
        setProgress({ processed: 0, total: 50, batch: 0 });
    };

    const cardToCandidate = (card) => ({
        id: card.lead_id,
        name: card.name,
        email: card.email,
        phone: card.phone,
        roles: card.role,
        role_ids: card.role_ids,
        status: card.status,
        status_id: card.status_id,
        source: card.source,
        source_id: card.source_id,
        city: card.city,
        country: card.country,
        state: card.state,
        street: card.street,
        pincode: card.pincode,
        relocate: card.relocate,
        experience: card.raw_experience,
        current_ctc: card.current_ctc,
        expected_ctc: card.expected_ctc,
        notice_period: card.notice_period,
        qualification: card.qualification,
        current_job_title: card.current_title,
        current_employer: card.employer,
        skillset: card.skills,
        additional_info: card.additional_info,
        resume: card.resume,
        date_added: card.date_added,
    });

    const handleCandidateUpdated = (updates) => {
        setCards((currentCards) => currentCards.map((card) => {
            if (card.lead_id !== editingCandidate?.id) {
                return card;
            }

            return {
                ...card,
                status: updates.status || card.status,
                status_id: updates.status_id || card.status_id,
                latest_hr_name: updates.latest_hr_name || card.latest_hr_name,
                latest_hr_comment: updates.latest_hr_comment || card.latest_hr_comment,
                latest_hr_comment_date: updates.latest_hr_comment_date || card.latest_hr_comment_date,
            };
        }));
        setEditingCandidate((candidate) => candidate ? { ...candidate, ...updates } : candidate);
    };

    const visibleCards = [...cards].sort((a, b) => {
        const firstScore = Number(a.ai_score || 0);
        const secondScore = Number(b.ai_score || 0);
        return scoreSort === 'asc' ? firstScore - secondScore : secondScore - firstScore;
    });

    const resumeUrl = resumePreview?.resume
        ? apiUrl(`get_resume.php?file=${encodeURIComponent(resumePreview.resume)}`)
        : '';

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bot className="text-blue-600" />
                        AI Search
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Filter candidates first, then let AI score up to 50 resumes in batches of 10.</p>
                </div>
            </div>

            <form onSubmit={runSearch} className="glass-panel rounded-2xl p-5 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                    <label className="text-sm font-bold text-slate-700">
                        Role
                        <select name="role" value={filters.role} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            <option value="">All roles</option>
                            {(options.roles || []).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Min Experience
                        <input name="experience_min" value={filters.experience_min} onChange={updateFilter} placeholder="2" className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Max Experience
                        <input name="experience_max" value={filters.experience_max} onChange={updateFilter} placeholder="4" className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Status
                        <select name="lead_status" value={filters.lead_status} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            <option value="">Please select</option>
                            {(options.statuses || []).map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Source
                        <select name="source" value={filters.source} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            <option value="">Please select</option>
                            {(options.sources || []).map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Date Added
                        <select name="interval" value={filters.interval} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            {(options.date_intervals || [{ id: '', name: 'Please select' }]).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Location
                        <input name="city" value={filters.city} onChange={updateFilter} placeholder="Mumbai, Pune" className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Willing to Relocate
                        <select name="relocate" value={filters.relocate} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            <option value="">Please select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Current CTC
                        <input name="current_ctc" value={filters.current_ctc} onChange={updateFilter} placeholder="250000 or 2.5L" className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Max CTC
                        <input name="expected_ctc" value={filters.expected_ctc} onChange={updateFilter} placeholder="300000 or 3L" className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Notice Period
                        <input name="notice_period" value={filters.notice_period} onChange={updateFilter} placeholder="0, 15, 30" className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                        Candidates to Process
                        <select name="total_limit" value={filters.total_limit} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            {[10, 20, 30, 40, 50].map((count) => <option key={count} value={count}>{count} candidates</option>)}
                        </select>
                    </label>
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <label className="text-sm font-black text-slate-900">AI scoring instructions (optional)</label>
                    <textarea
                        name="instructions"
                        value={filters.instructions}
                        onChange={updateFilter}
                        className="mt-3 w-full min-h-28 px-3 py-3 rounded-lg border border-slate-200 text-sm bg-white"
                        placeholder="Example: prioritize immediate joiners with strong on-page/off-page SEO and client communication."
                    />
                    <p className="text-xs text-slate-500 mt-2">Filters decide which candidates are selected. AI instructions only affect score and summary ranking.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5">
                    <div className="w-full sm:max-w-xl">
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                            <span>{loading ? `Processing batch ${progress.batch}` : (message || 'Ready to search')}</span>
                            <span>{progress.processed}/{progress.total}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.round((progress.processed / Math.max(progress.total, 1)) * 100))}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={reset} disabled={loading} className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50">
                            Reset
                        </button>
                        {loading && (
                            <button type="button" onClick={stopSearch} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 text-white font-bold text-sm hover:bg-rose-700">
                                <Square size={14} />
                                Stop
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            AI Search {filters.total_limit} PDFs
                        </button>
                    </div>
                </div>
            </form>

            {message && !loading && message !== 'AI Search completed.' && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 flex items-center gap-2 text-sm font-semibold">
                    <AlertCircle size={18} />
                    {message}
                </div>
            )}

            {Object.keys(filtersUsed).length > 0 && (
                <div className="glass-panel rounded-2xl p-5 mb-5">
                    <h2 className="font-black text-slate-900 mb-3">Filters Used</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                        {Object.entries(filtersUsed).map(([key, value]) => <Detail key={key} label={key} value={value} />)}
                    </div>
                </div>
            )}

            {summary && (
                <div className="mb-5 rounded-2xl bg-slate-900 text-white p-5">
                    <div className="text-sm font-bold text-emerald-300 mb-2">Batch Summary</div>
                    <p className="text-sm leading-6 text-slate-100">{summary}</p>
                </div>
            )}

            {cards.length > 0 && (
                <div className="glass-panel rounded-2xl p-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="font-black text-slate-900">AI Results</h2>
                        <p className="text-sm text-slate-500">Showing {cards.length} candidate cards. Sort after or during batch loading.</p>
                    </div>
                    <label className="text-sm font-bold text-slate-700">
                        Sort by AI score
                        <select value={scoreSort} onChange={(event) => setScoreSort(event.target.value)} className="ml-0 md:ml-3 mt-2 md:mt-0 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium">
                            <option value="desc">Highest first</option>
                            <option value="asc">Lowest first</option>
                        </select>
                    </label>
                </div>
            )}

            <div className="space-y-4">
                {visibleCards.map((card) => (
                    <AISearchCard
                        key={`${card.lead_id}-${card.card_number}`}
                        card={card}
                        onOpenActivity={(selectedCard) => setEditingCandidate(cardToCandidate(selectedCard))}
                        onOpenResume={(selectedCard) => setResumePreview(selectedCard)}
                    />
                ))}
            </div>

            {editingCandidate && (
                <CandidateEditModal
                    candidate={editingCandidate}
                    onClose={() => setEditingCandidate(null)}
                    onUpdated={handleCandidateUpdated}
                />
            )}

            {resumePreview && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                            <div>
                                <h2 className="font-black text-slate-900">{resumePreview.name || 'Candidate'} Resume</h2>
                                <p className="text-xs text-slate-500 mt-1">{resumePreview.resume}</p>
                            </div>
                            <button type="button" onClick={() => setResumePreview(null)} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                                <X size={22} />
                            </button>
                        </div>
                        <iframe
                            src={resumeUrl}
                            title={`${resumePreview.name || 'Candidate'} resume`}
                            className="w-full flex-1 bg-slate-100"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
