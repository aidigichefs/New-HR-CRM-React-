import React, { useEffect, useState } from 'react';
import { Mail, Search, Send, Loader2, Eye, X, RefreshCw } from 'lucide-react';
import { apiUrl } from '../lib/api';

const initialFilters = {
    role: '',
    experience: '',
    notice_period: '',
    status: '',
    source: '',
    city: '',
    relocate: '',
    current_ctc: '',
    expected_ctc: '',
    start_date: '',
    end_date: '',
    interval: '',
};

function Field({ label, children }) {
    return (
        <label className="text-sm font-bold text-slate-700">
            {label}
            {children}
        </label>
    );
}

export default function SendEmailPage() {
    const [options, setOptions] = useState({ roles: [], statuses: [], sources: [], templates: [], logs: [], daily_sent: 0, daily_limit: 250 });
    const [filters, setFilters] = useState(initialFilters);
    const [candidates, setCandidates] = useState([]);
    const [candidateCount, setCandidateCount] = useState(0);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchPageData();
    }, []);

    const fetchPageData = async () => {
        try {
            const response = await fetch(apiUrl('get_email_page_data.php'));
            const json = await response.json();
            if (json.success) {
                setOptions(json.data || {});
            }
        } catch (error) {
            console.error('Failed to load email page data:', error);
        }
    };

    const updateFilter = (event) => {
        setFilters({ ...filters, [event.target.name]: event.target.value });
    };

    const appendFilters = (formData) => {
        Object.entries(filters).forEach(([key, value]) => formData.append(key, value));
    };

    const previewCandidates = async () => {
        setLoading(true);
        setMessage('');
        try {
            const formData = new FormData();
            appendFilters(formData);
            const response = await fetch(apiUrl('preview_email_candidates.php'), { method: 'POST', body: formData });
            const json = await response.json();
            if (json.success) {
                setCandidateCount(json.data?.count || 0);
                setCandidates(json.data?.candidates || []);
                setMessage(`${json.data?.count || 0} matching candidates selected.`);
            } else {
                setMessage(json.message || 'Could not preview candidates.');
            }
        } catch (error) {
            setMessage(error.message || 'Could not preview candidates.');
        }
        setLoading(false);
    };

    const sendEmail = async (event) => {
        event.preventDefault();
        setSending(true);
        setMessage('');
        try {
            const formData = new FormData();
            appendFilters(formData);
            formData.append('subject', subject);
            formData.append('body', body);
            const response = await fetch(apiUrl('send_bulk_email.php'), { method: 'POST', body: formData });
            const json = await response.json();
            setMessage(json.message || 'Send completed.');
            if (json.success) {
                await fetchPageData();
            }
        } catch (error) {
            setMessage(error.message || 'Could not send email.');
        }
        setSending(false);
    };

    const loadTemplate = (event) => {
        const template = (options.templates || []).find((item) => item.id === event.target.value);
        if (!template) {
            return;
        }
        setSubject(template.subject || '');
        setBody(template.body || '');
    };

    const reset = () => {
        setFilters(initialFilters);
        setCandidates([]);
        setCandidateCount(0);
        setMessage('');
    };

    const openLog = async (id) => {
        try {
            const response = await fetch(apiUrl(`get_email_log_detail.php?id=${encodeURIComponent(id)}`));
            const json = await response.json();
            if (json.success) {
                setSelectedLog(json.data);
            }
        } catch (error) {
            console.error('Failed to load email log:', error);
        }
    };

    const limitUsedPercent = Math.min(100, Math.round(((options.daily_sent || 0) / Math.max(options.daily_limit || 250, 1)) * 100));

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Mail className="text-blue-600" />
                        Send Email
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Filter candidates, preview the recipient list, send bulk email, and review sent logs.</p>
                </div>
                <div className="glass-panel rounded-2xl px-5 py-4 min-w-[260px]">
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                        <span>Daily limit</span>
                        <span>{options.daily_sent || 0}/{options.daily_limit || 250}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-600" style={{ width: `${limitUsedPercent}%` }} />
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                    <Field label="Role">
                        <select name="role" value={filters.role} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm">
                            <option value="">Please select</option>
                            {(options.roles || []).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Experience">
                        <input name="experience" value={filters.experience} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="Notice Period">
                        <input name="notice_period" value={filters.notice_period} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="Status">
                        <select name="status" value={filters.status} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm">
                            <option value="">Please select</option>
                            {(options.statuses || []).map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Source">
                        <select name="source" value={filters.source} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm">
                            <option value="">Please select</option>
                            {(options.sources || []).map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
                        </select>
                    </Field>
                    <Field label="City">
                        <input name="city" value={filters.city} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="Relocate">
                        <select name="relocate" value={filters.relocate} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm">
                            <option value="">Please select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </Field>
                    <Field label="Current CTC">
                        <input name="current_ctc" value={filters.current_ctc} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="Expected CTC">
                        <input name="expected_ctc" value={filters.expected_ctc} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="Start Date">
                        <input type="date" name="start_date" value={filters.start_date} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="End Date">
                        <input type="date" name="end_date" value={filters.end_date} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" />
                    </Field>
                    <Field label="Sort By">
                        <select name="interval" value={filters.interval} onChange={updateFilter} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm">
                            <option value="">Please select</option>
                            <option value="last-seven">Last 7 days</option>
                            <option value="last-thirty">Last 30 days</option>
                            <option value="last-month">Last 3 months</option>
                        </select>
                    </Field>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-5">
                    <button type="button" onClick={previewCandidates} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Show Datasource
                    </button>
                    <button type="button" onClick={reset} className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50">
                        Reset
                    </button>
                    <span className="text-sm font-semibold text-slate-500">{message || 'No data selected'}</span>
                </div>
            </div>

            <form onSubmit={sendEmail} className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
                <div className="xl:col-span-2 glass-panel rounded-2xl p-5">
                    <h2 className="text-lg font-black text-slate-900 mb-4">Compose Email</h2>
                    <div className="space-y-4">
                        <Field label="From">
                            <div className="mt-2 px-3 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">DigiChefs HR</div>
                        </Field>
                        <Field label="Template">
                            <select onChange={loadTemplate} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm">
                                <option value="">Choose Email Template</option>
                                {(options.templates || []).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                            </select>
                        </Field>
                        <Field label="To">
                            <div className="mt-2 px-3 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">{candidateCount || 0} records selected</div>
                        </Field>
                        <Field label="Subject">
                            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 w-full px-3 py-3 rounded-lg border border-slate-200 text-sm" required />
                        </Field>
                        <Field label="Message">
                            <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 w-full min-h-56 px-3 py-3 rounded-lg border border-slate-200 text-sm" required />
                        </Field>
                        <button type="submit" disabled={sending || candidateCount < 1} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 disabled:opacity-50">
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Send Bulk Email
                        </button>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl p-5">
                    <h2 className="text-lg font-black text-slate-900 mb-4">Preview Candidates</h2>
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                        {candidates.length === 0 ? (
                            <div className="text-sm text-slate-500">Run datasource preview to see candidates.</div>
                        ) : candidates.map((candidate) => (
                            <div key={candidate.id} className="rounded-xl border border-slate-200 bg-white p-3">
                                <div className="font-bold text-slate-900">{candidate.name || 'Unnamed'}</div>
                                <div className="text-xs text-slate-500 mt-1">{candidate.email}</div>
                                <div className="text-xs text-slate-400 mt-1">{candidate.roles || 'No role'} - {candidate.date_added}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h2 className="text-lg font-black text-slate-900">Email Logs</h2>
                    <button type="button" onClick={fetchPageData} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-5 py-4">Action</th>
                                <th className="px-5 py-4">Subject</th>
                                <th className="px-5 py-4">Sent On</th>
                                <th className="px-5 py-4">Sent By</th>
                                <th className="px-5 py-4">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {(options.logs || []).map((log) => (
                                <tr key={log.id}>
                                    <td className="px-5 py-4">
                                        <button type="button" onClick={() => openLog(log.id)} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-slate-800">{log.subject}</td>
                                    <td className="px-5 py-4 text-slate-500">{log.sent_date}</td>
                                    <td className="px-5 py-4 text-slate-500">{log.sent_by || 'Unknown'}</td>
                                    <td className="px-5 py-4 text-slate-500">{log.total_sent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedLog && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{selectedLog.subject}</h2>
                                <p className="text-sm text-slate-500 mt-1">Sent by {selectedLog.sent_by || 'Unknown'} - {selectedLog.total_sent} candidates</p>
                            </div>
                            <button type="button" onClick={() => setSelectedLog(null)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
                                <X size={22} />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto">
                            <h3 className="font-black text-slate-900 mb-2">Mail Content</h3>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 mb-5 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedLog.mailcontent || '' }} />
                            <h3 className="font-black text-slate-900 mb-3">Candidates</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(selectedLog.candidates || []).map((candidate, index) => (
                                    <div key={candidate.id} className="rounded-xl border border-slate-200 p-3">
                                        <div className="text-xs font-black text-slate-400">#{index + 1}</div>
                                        <div className="font-bold text-slate-900">{candidate.name}</div>
                                        <div className="text-xs text-slate-500">{candidate.email}</div>
                                        <div className="text-xs text-slate-400 mt-1">{candidate.roles} - {candidate.date_added}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
