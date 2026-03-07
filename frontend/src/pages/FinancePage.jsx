import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiDollarSign, FiUsers, FiTrendingUp, FiZap,
    FiChevronLeft, FiChevronRight, FiRefreshCw, FiCalendar,
    FiFilter
} from 'react-icons/fi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FinancePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState('all'); // 'all' or 1-12

    const fetchData = async (y) => {
        try {
            setLoading(true);
            const { data: res } = await axios.get(`/api/superadmin/finance?year=${y}`);
            setData(res);
        } catch {
            toast.error('Failed to load finance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(year); }, [year]);

    const changeYear = (dir) => {
        const next = year + dir;
        setYear(next);
        setFilterMonth('all');
    };

    // Filtered months for the table
    const displayedMonths = data?.months
        ? (filterMonth === 'all' ? data.months : data.months.filter(m => m.month === filterMonth))
        : [];

    // Max revenue for bar chart scaling
    const maxRevenue = data?.months ? Math.max(...data.months.map(m => m.revenue), 1) : 1;

    const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
            </div>
        );
    }

    const { summary } = data;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
                    <p className="text-gray-500 text-sm mt-1">Revenue, subscriptions, and client growth</p>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-1 py-1 shadow-sm">
                    <button onClick={() => changeYear(-1)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <FiChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-gray-800 px-3 min-w-[56px] text-center text-lg">{year}</span>
                    <button onClick={() => changeYear(1)}
                        disabled={year >= new Date().getFullYear()}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <FiChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-white/20 p-2 rounded-xl"><FiDollarSign className="h-5 w-5" /></div>
                        <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">{year}</span>
                    </div>
                    <p className="text-3xl font-black">{fmt(summary.yearRevenue)}</p>
                    <p className="text-blue-200 text-xs font-medium mt-1">Revenue This Year</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-green-100 p-2 rounded-xl"><FiTrendingUp className="h-5 w-5 text-green-600" /></div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">All Time</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">{fmt(summary.allTimeRevenue)}</p>
                    <p className="text-gray-400 text-xs font-medium mt-1">Total Revenue</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-purple-100 p-2 rounded-xl"><FiUsers className="h-5 w-5 text-purple-600" /></div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{year}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">{summary.yearNewClients}</p>
                    <p className="text-gray-400 text-xs font-medium mt-1">New Clients</p>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-100 p-2 rounded-xl"><FiZap className="h-5 w-5 text-blue-600" /></div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active</span>
                    </div>
                    <p className="text-3xl font-black text-blue-700">{summary.allTimePremium}</p>
                    <p className="text-gray-400 text-xs font-medium mt-1">Premium Orgs</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg"><FiTrendingUp className="h-4 w-4 text-blue-600" /></div>
                    <h2 className="font-semibold text-gray-800">Monthly Revenue — {year}</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-end gap-2 h-40">
                        {data.months.map((m) => {
                            const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                            const isActive = filterMonth === m.month;
                            return (
                                <button key={m.month}
                                    onClick={() => setFilterMonth(filterMonth === m.month ? 'all' : m.month)}
                                    className="flex-1 flex flex-col items-center gap-1 group"
                                    title={`${m.label}: ${fmt(m.revenue)}`}>
                                    <span className={`text-xs font-bold transition-colors ${m.revenue > 0 ? 'text-gray-700' : 'text-gray-300'} ${isActive ? 'text-blue-600' : ''}`}>
                                        {m.revenue > 0 ? `₹${m.revenue}` : ''}
                                    </span>
                                    <div className="w-full flex items-end justify-center">
                                        <div
                                            className={`w-full rounded-t-md transition-all duration-300 ${isActive ? 'bg-blue-600' : m.revenue > 0 ? 'bg-blue-400 group-hover:bg-blue-500' : 'bg-gray-100'}`}
                                            style={{ height: `${Math.max(pct, m.revenue > 0 ? 8 : 4)}%`, minHeight: '4px', maxHeight: '100px' }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                        {MONTHS[m.month - 1]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {filterMonth !== 'all' && (
                        <div className="mt-3 flex justify-center">
                            <button onClick={() => setFilterMonth('all')}
                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                <FiFilter className="h-3 w-3" /> Clear filter (showing {MONTHS[filterMonth - 1]})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg"><FiCalendar className="h-4 w-4 text-indigo-600" /></div>
                        <h2 className="font-semibold text-gray-800">
                            Monthly Breakdown
                            {filterMonth !== 'all' && <span className="text-blue-500 ml-2">— {MONTHS[filterMonth - 1]}</span>}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Month filter dropdown */}
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Months</option>
                            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <button onClick={() => fetchData(year)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5">
                            <FiRefreshCw className="h-3.5 w-3.5" /> Refresh
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold">Month</th>
                                <th className="px-6 py-3 text-right font-semibold">New Clients</th>
                                <th className="px-6 py-3 text-right font-semibold">Payments Received</th>
                                <th className="px-6 py-3 text-right font-semibold">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {displayedMonths.map(m => (
                                <tr key={m.month}
                                    className={`hover:bg-gray-50 transition-colors ${filterMonth === m.month ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">{m.month}</span>
                                            <span className="font-semibold text-gray-700">{m.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {m.newClients > 0
                                            ? <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg text-xs">{m.newClients}</span>
                                            : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {m.paymentsCount > 0
                                            ? <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs">{m.paymentsCount}</span>
                                            : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {m.revenue > 0
                                            ? <span className="font-black text-green-600">{fmt(m.revenue)}</span>
                                            : <span className="text-gray-300">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Totals row */}
                        {filterMonth === 'all' && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-gray-700">Total ({year})</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-700">{summary.yearNewClients}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-700">{data.months.reduce((s, m) => s + m.premiumCount, 0)}</td>
                                    <td className="px-6 py-4 text-right font-black text-green-600 text-base">{fmt(summary.yearRevenue)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
