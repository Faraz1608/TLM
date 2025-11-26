import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Calendar } from 'lucide-react';

const Reports = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/reports/daily');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <FileText size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
                    <p className="text-gray-500 text-sm">Historical breakdown of break activities.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-gray-400" />
                    Breaks Activity (Last 5 Days)
                </h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="created" name="Breaks Created" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="resolved" name="Breaks Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">+{row.created}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">-{row.resolved}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row.created - row.resolved > 0 ? `+${row.created - row.resolved}` : row.created - row.resolved}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
