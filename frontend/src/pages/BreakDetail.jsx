import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MessageSquare, CheckCircle, AlertOctagon, FileText } from 'lucide-react';

const BreakDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [assignee, setAssignee] = useState('');

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/api/breaks/${id}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!assignee) return;
        try {
            await axios.post(`http://localhost:5001/api/breaks/${id}/assign`, { assignee });
            fetchDetail();
            setAssignee('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleResolve = async () => {
        const code = prompt('Enter resolution code (e.g., MANUAL_MATCH, WRITE_OFF):');
        if (!code) return;
        try {
            await axios.post(`http://localhost:5001/api/breaks/${id}/resolve`, {
                resolutionCode: code,
                comment: comment || 'Resolved manually'
            });
            fetchDetail();
            setComment('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleComment = async () => {
        if (!comment) return;
        try {
            await axios.post(`http://localhost:5001/api/breaks/${id}/comment`, { comment });
            fetchDetail();
            setComment('');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Break not found</div>;

    const { break: brk, history } = data;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Link to="/breaks" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} className="mr-1" /> Back to Breaks
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">Break #{brk._id.substring(0, 8)}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${brk.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-100' :
                            brk.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-green-50 text-green-700 border-green-100'
                            }`}>
                            {brk.status}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">Created on {new Date(brk.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Difference</div>
                    <div className="text-2xl font-mono font-bold text-gray-900">{brk.difference?.$numberDecimal || brk.difference}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Break Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertOctagon size={20} className="text-gray-400" />
                            Break Details
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Type</label>
                                <div className="mt-1 font-medium">{brk.breakType}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Severity</label>
                                <div className={`mt-1 font-bold ${brk.severity === 'HIGH' ? 'text-red-600' :
                                    brk.severity === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>{brk.severity}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Reason</label>
                                <div className="mt-1 text-gray-700">{brk.reason}</div>
                            </div>
                        </div>
                    </div>

                    {/* Trade Data */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-gray-400" />
                            Transaction Data
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected Trade (Internal)</h4>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs overflow-x-auto">
                                    {JSON.stringify(brk.expectedTradeId, null, 2)}
                                </div>
                            </div>

                            {brk.actualSettlementId && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Actual Settlement (External)</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs overflow-x-auto">
                                        {JSON.stringify(brk.actualSettlementId, null, 2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Actions & History */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Actions</h3>

                        <div className="space-y-4">
                            {/* Assignment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                                {brk.assignedTo ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-900 bg-blue-50 p-2 rounded border border-blue-100">
                                        <User size={16} className="text-blue-500" />
                                        {brk.assignedTo}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={assignee}
                                            onChange={(e) => setAssignee(e.target.value)}
                                            className="flex-1 border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleAssign}
                                            disabled={!assignee}
                                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Comment & Resolve */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment / Resolution</label>
                                <textarea
                                    rows="3"
                                    placeholder="Add a note..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 mb-2"
                                ></textarea>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleComment}
                                        disabled={!comment}
                                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        Comment
                                    </button>
                                    {brk.status !== 'RESOLVED' && (
                                        <button
                                            onClick={handleResolve}
                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">History</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {history.map((h, i) => (
                                <div key={i} className="relative pl-4 border-l-2 border-gray-100 pb-4 last:pb-0">
                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-gray-300"></div>
                                    <div className="text-xs text-gray-500 mb-1">{new Date(h.timestamp).toLocaleString()}</div>
                                    <div className="text-sm">
                                        <span className="font-semibold text-gray-900">{h.action}</span>
                                        <span className="text-gray-600"> by {h.user}</span>
                                    </div>
                                    {h.comment && (
                                        <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                            "{h.comment}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreakDetail;
