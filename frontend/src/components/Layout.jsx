import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, AlertCircle, Settings as SettingsIcon, HelpCircle, Menu, FileText } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/upload', label: 'Upload Data', icon: Upload },
        { path: '/breaks', label: 'Breaks', icon: AlertCircle },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex min-h-screen bg-transparent">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <span className="bg-blue-600 text-white p-1 rounded">TLM</span> Simulator
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                        <HelpCircle size={20} />
                        Help & Docs
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-10 p-4 flex justify-between items-center">
                <h1 className="text-lg font-bold text-blue-600">TLM Simulator</h1>
                <button className="p-2 text-gray-600"><Menu size={24} /></button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 mt-14 md:mt-0 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
