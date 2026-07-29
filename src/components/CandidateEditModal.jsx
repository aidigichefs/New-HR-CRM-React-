import React, { useEffect, useState } from 'react';
import { X, Clock, Loader2, Eye, Save } from 'lucide-react';
import { apiUrl } from '../lib/api';

const fieldClass = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-900';

function Field({ label, value, wide = false }) {
    return (
        <div className={`space-y-1.5 ${wide ? 'md:col-span-2' : ''}`}>
            <label className="text-xs font-semibold text-slate-600">{label}</label>
            <input className={fieldClass} readOnly value={value || ''} />
        </div>
    );
}

function TextAreaField({ label, value }) {
    return (
        <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">{label}</label>
            <textarea className={`${fieldClass} min-h-24 resize-y`} readOnly value={value || ''} />
        </div>
    );
}

export default function CandidateEditModal({ candidate, currentUser, onClose, onUpdated }) {
    const [activeTab, setActiveTab] = useState('details');
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [statusId, setStatusId] = useState(String(candidate.status_id || ''));
    const [statusComment, setStatusComment] = useState('');
    const [savingStatus, setSavingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'timeline') {
            fetchTimeline();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        setStatusId(String(candidate.status_id || ''));
        setStatusComment('');
        fetchOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate.id]);

    const fetchOptions = async () => {
        try {
            const response = await fetch(apiUrl('get_candidate_options.php'));
            const json = await response.json();
            if (json.success) {
                setStatuses(Array.isArray(json.data?.statuses) ? json.data.statuses : []);
            }
        } catch (error) {
            console.error('Failed to fetch candidate options:', error);
        }
    };

    const fetchTimeline = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl(`get_timeline.php?id=${candidate.id}`));
            const json = await response.json();
            if (json.success) {
                setTimeline(Array.isArray(json.data) ? json.data : []);
            }
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
        }
        setLoading(false);
    };

    const saveStatus = async () => {
        setSavingStatus(true);
        setStatusMessage('');

        try {
            const response = await fetch(apiUrl('update_candidate_status.php'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lead_id: candidate.id,
                    status_id: Number(statusId),
                    comment: statusComment,
                    staff_id: currentUser?.id || 0,
                }),
            });
            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Could not update status.');
            }

            setStatusMessage('Status updated.');
            setStatusComment('');
            if (typeof onUpdated === 'function') {
                onUpdated(json.data);
            }
            if (activeTab === 'timeline') {
                fetchTimeline();
            }
        } catch (error) {
            setStatusMessage(error.message || 'Could not update status.');
        }

        setSavingStatus(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Candidate: {candidate.name || 'Unnamed candidate'}</h2>
                        <p className="text-sm text-slate-500 mt-1">Lead #{candidate.id} · HR: {candidate.latest_hr_name || 'Not assigned'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 pt-4 border-b border-slate-100 flex gap-6">
                    <button
                        className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'timeline' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        Activity log
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {activeTab === 'details' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-8 shadow-sm">
                            <section>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Name" value={candidate.name} />
                                    <Field label="Email" value={candidate.email} />
                                    <Field label="Phone" value={candidate.phone} />
                                    <Field label="Added Date" value={candidate.date_added} />
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600">Status</label>
                                        <select
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-900"
                                            value={statusId}
                                            onChange={(event) => setStatusId(event.target.value)}
                                        >
                                            <option value="">Please select</option>
                                            {statuses.map((status) => (
                                                <option key={status.id} value={status.id}>
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Field label="Source" value={candidate.source} />
                                    <Field label="Portfolio" value={candidate.portfolio} />
                                    <Field label="Referral" value={candidate.referral} />
                                    <div className="space-y-1.5 md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                        <label className="text-xs font-semibold text-slate-600">Comment</label>
                                        <textarea
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-900 min-h-20 resize-y"
                                            maxLength={120}
                                            value={statusComment}
                                            onChange={(event) => setStatusComment(event.target.value)}
                                            placeholder="Add call note, connected update, interview note..."
                                        />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <span className={`text-xs font-semibold ${statusMessage === 'Status updated.' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {statusMessage}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={saveStatus}
                                                disabled={!statusId || savingStatus}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                                            >
                                                {savingStatus ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                Save status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 border-t border-dashed border-slate-200 pt-8">Address Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Street" value={candidate.street} wide />
                                    <Field label="City" value={candidate.city} />
                                    <Field label="State" value={candidate.state} />
                                    <Field label="Country" value={candidate.country} />
                                    <Field label="Pincode" value={candidate.pincode || candidate.zip} />
                                    <Field label="Willing to relocate" value={candidate.relocate} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 border-t border-dashed border-slate-200 pt-8">Professional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Roles" value={candidate.roles} wide />
                                    <Field label="Experience" value={candidate.experience ? `${candidate.experience} Years` : ''} />
                                    <Field label="Notice Period" value={candidate.notice_period} />
                                    <Field label="Qualification" value={candidate.qualification} />
                                    <Field label="Current Job Title" value={candidate.current_job_title} />
                                    <Field label="Current Employer" value={candidate.current_employer} />
                                    <Field label="Current CTC" value={candidate.current_ctc} />
                                    <Field label="Expected CTC" value={candidate.expected_ctc} />
                                    <TextAreaField label="Skill Set" value={candidate.skillset} />
                                    <TextAreaField label="Additional Information" value={candidate.additional_info || candidate.description} />
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 min-h-[400px] shadow-sm">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
                                    <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
                                    Loading activity log...
                                </div>
                            ) : timeline.length === 0 ? (
                                <div className="text-center text-slate-500 pt-20">No activity logged for this candidate.</div>
                            ) : (
                                <div className="space-y-2">
                                    {timeline.map((item, idx) => (
                                        <div key={`${item.date}-${idx}`} className="flex gap-6 relative">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${item.is_view_log ? 'bg-violet-50 text-violet-500 border-violet-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {item.is_view_log ? <Eye size={18} /> : <Clock size={18} />}
                                                </div>
                                                {idx !== timeline.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-2"></div>}
                                            </div>
                                            <div className="pb-8 pt-1 flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.date ? new Date(item.date).toLocaleString() : 'No date'}</span>
                                                </div>
                                                {item.is_view_log ? (
                                                    <div className="text-slate-800 font-medium bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 table">
                                                        Candidate viewed by <span className="font-bold text-violet-700">{item.actor_name || 'A team member'}</span>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                                                        <div className="text-slate-800 font-bold mb-1 p-0">
                                                            {item.status_name ? (
                                                                <>Status changed to <span className="text-blue-600">{item.status_name}</span></>
                                                            ) : (
                                                                <>Activity update</>
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-medium text-slate-500 mb-3 border-b border-slate-200 pb-3">
                                                            Updated by <span className="text-slate-700">{item.actor_name || 'Unknown user'}</span>
                                                        </div>
                                                        {item.additional_data && (
                                                            <div className="text-sm text-slate-700 font-medium whitespace-pre-wrap">
                                                                {item.additional_data}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
