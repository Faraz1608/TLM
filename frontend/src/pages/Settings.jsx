import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        cashTolerance: 0.01,
        dateToleranceDays: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/settings');
            if (res.data) {
                setSettings(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setStatus('idle');

        try {
            await axios.post('http://localhost:5001/api/settings', settings);
            setMessage('Settings saved successfully');
            setStatus('success');
        } catch (err) {
            setMessage('Failed to save settings');
            setStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-500 text-sm">Configure matching logic and system parameters.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-900">Matching Tolerances</h2>
                    <p className="text-sm text-gray-500">Define acceptable differences for fuzzy matching.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cash Tolerance */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cash Tolerance ($)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="cashTolerance"
                                        value={settings.cashTolerance}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Max difference allowed for auto-match.
                                    </p>
                                </div>
                            </div>

                            {/* Date Tolerance */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Tolerance (Days)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        name="dateToleranceDays"
                                        value={settings.dateToleranceDays}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Max days difference allowed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all ${saving
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                    }`}
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 border-t ${status === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                        }`}>
                        <div className="flex items-center gap-3">
                            {status === 'success' ? (
                                <CheckCircle className="text-green-600" size={20} />
                            ) : (
                                <AlertCircle className="text-red-600" size={20} />
                            )}
                            <p className={`text-sm font-medium ${status === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {message}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
