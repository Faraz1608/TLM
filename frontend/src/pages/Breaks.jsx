import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Filter, Eye, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';

const Breaks = () => {
    const [breaks, setBreaks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'OPEN', type: '', severity: '' });

    useEffect(() => {
        fetchBreaks();
    }, [filters]);

    const fetchBreaks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);
            if (filters.severity) params.append('severity', filters.severity);

            const res = await axios.get(`http://localhost:5001/api/breaks?${params.toString()}`);
            setBreaks(res.data.breaks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle size={16} className="text-green-500" />;
            case 'ASSIGNED': return <Clock size={16} className="text-blue-500" />;
            default: return <AlertTriangle size={16} className="text-red-500" />;
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('type', filters.type);
        if (filters.severity) params.append('severity', filters.severity);

        window.location.href = `http://localhost:5001/api/export/breaks?${params.toString()}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Breaks Management</h1>
                    <p className="text-gray-500 mt-1">Review and resolve reconciliation breaks.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500 mr-2">
                    <Filter size={20} />
                    <span className="font-medium">Filters:</span>
                </div>

                <select name="status" value={filters.status} onChange={handleFilterChange} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Types</option>
                    <option value="CASH">Cash</option>
                    <option value="STOCK">Stock</option>
                </select>
                <select name="severity" value={filters.severity} onChange={handleFilterChange} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Severities</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading breaks...</div>
                ) : breaks.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No breaks found matching your filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade Ref</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {breaks.map((brk) => (
                                    <tr key={brk._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {brk._id.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-800">
                                                {brk.breakType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {brk.expectedTradeId?.tradeId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {brk.difference?.$numberDecimal || brk.difference}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(brk.severity)}`}>
                                                {brk.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(brk.status)}
                                                <span className="text-sm text-gray-700">{brk.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/breaks/${brk._id}`}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                                            >
                                                <Eye size={16} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Breaks;
