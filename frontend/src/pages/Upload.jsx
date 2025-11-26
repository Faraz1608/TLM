import React, { useState } from 'react';
import axios from 'axios';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [type, setType] = useState('EXPECTED');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setStatus('idle');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            setStatus('error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(`Upload successful! ${res.data.rowsProcessed} rows processed.`);
            setStatus('success');
            setFile(null);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Upload failed');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
                <p className="text-gray-500 mt-2">Upload your trade or settlement files to reconcile.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleUpload} className="space-y-6">
                        {/* File Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType('EXPECTED')}
                                    className={`p-4 rounded-lg border-2 text-center transition-all ${type === 'EXPECTED'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <div className="font-semibold">Expected Trades</div>
                                    <div className="text-xs mt-1 opacity-75">Internal System</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('ACTUAL')}
                                    className={`p-4 rounded-lg border-2 text-center transition-all ${type === 'ACTUAL'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <div className="font-semibold">Actual Settlements</div>
                                    <div className="text-xs mt-1 opacity-75">External/Bank</div>
                                </button>
                            </div>
                        </div>

                        {/* File Drop Zone (Visual) */}
                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".csv,.xlsx"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                                    {file ? <FileText size={32} /> : <UploadIcon size={32} />}
                                </div>
                                {file ? (
                                    <>
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-gray-900">Click or drag file to upload</p>
                                        <p className="text-sm text-gray-500 mt-1">Supports CSV or Excel files</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${loading || !file
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Upload File
                                </>
                            )}
                        </button>
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

export default Upload;
