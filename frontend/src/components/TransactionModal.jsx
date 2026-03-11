import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiX, FiUser, FiTool, FiCalendar, FiSave, FiAlertCircle, FiSearch, FiChevronDown, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

// ─── Mini Calendar Component ──────────────────────────────────────────────────
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarPicker = ({ value, onChange, minDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState((selected || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selected || today).getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72">
      {/* Month / Year nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <FiChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isDisabled = minDate && cellDate < minDate;
          const isSelected = selected &&
            selected.getFullYear() === viewYear &&
            selected.getMonth() === viewMonth &&
            selected.getDate() === day;
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                const mm = String(viewMonth + 1).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                onChange(`${viewYear}-${mm}-${dd}`);
              }}
              className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors
                ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected ? 'bg-primary-600 text-white shadow-sm' : ''}
                ${!isSelected && isToday ? 'border border-primary-400 text-primary-600' : ''}
                ${!isSelected && !isToday && !isDisabled ? 'hover:bg-primary-50 hover:text-primary-700 text-gray-700' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const TransactionModal = ({ onClose, onTransactionComplete }) => {
  const [users, setUsers] = useState([]);
  const [tools, setTools] = useState([]);
  const [toolSearch, setToolSearch] = useState('');
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(false);

  // Toggle mode
  const [dueMode, setDueMode] = useState('date');

  // Hours stepper
  const [dueHours, setDueHours] = useState(1);
  const [dueMinutes, setDueMinutes] = useState(0);

  // Custom calendar
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef(null);

  const [formData, setFormData] = useState({
    userId: '',
    toolId: '',
    expectedReturnDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const computedDueTime = new Date(Date.now() + dueHours * 3600000 + dueMinutes * 60000);
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const stepHours = (delta) => setDueHours(prev => Math.min(720, Math.max(0, prev + delta)));
  const stepMinutes = (delta) => {
    setDueMinutes(prev => {
      let next = prev + delta;
      if (next < 0) { setDueHours(h => Math.max(0, h - 1)); return 45; }
      if (next >= 60) { setDueHours(h => h + 1); return 0; }
      return next;
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setToolDropdownOpen(false);
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (toolDropdownOpen && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50);
  }, [toolDropdownOpen]);

  const filteredTools = tools.filter(t =>
    t.toolName?.toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.toolId?.toLowerCase().includes(toolSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, toolsRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/tools?limit=1000')
        ]);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        const allTools = Array.isArray(toolsRes.data) ? toolsRes.data
          : Array.isArray(toolsRes.data?.tools) ? toolsRes.data.tools : [];
        setTools(allTools.filter(t => t.status === 'Available'));
      } catch {
        toast.error('Failed to load data for transaction');
        setUsers([]); setTools([]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setFormData(prev => ({ ...prev, toolId: tool._id }));
    setErrors(prev => ({ ...prev, toolId: '' }));
    setToolDropdownOpen(false);
    setToolSearch('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = 'Please select a user';
    if (!formData.toolId) newErrors.toolId = 'Please select a tool';
    if (dueMode === 'hours') {
      if (dueHours === 0 && dueMinutes === 0) newErrors.expectedReturnDate = 'Please set at least 1 minute';
    } else {
      if (!formData.expectedReturnDate) newErrors.expectedReturnDate = 'Please pick a due date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const expectedReturnDate = dueMode === 'hours'
      ? computedDueTime.toISOString()
      : formData.expectedReturnDate;
    try {
      setLoading(true);
      const response = await axios.post('/api/transactions/checkout', { ...formData, expectedReturnDate });
      toast.success('Tool checked out successfully!');
      onTransactionComplete(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to checkout tool');
    } finally { setLoading(false); }
  };

  // Format selected date nicely for the trigger button
  const formatSelectedDate = (str) => {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <FiTool className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">New Transaction — Check Out Tool</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* User + Tool */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* User */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiUser className="mr-2 h-4 w-4" /> Select User *
                </label>
                <select id="userId" name="userId" value={formData.userId} onChange={handleChange}
                  className={`input-field ${errors.userId ? 'border-red-500' : ''}`} disabled={loading}>
                  <option value="">Select a user</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
                {errors.userId && <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{errors.userId}</p>}
              </div>

              {/* Tool */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiTool className="mr-2 h-4 w-4" /> Select Tool *
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button type="button" onClick={() => !loading && setToolDropdownOpen(p => !p)} disabled={loading}
                    className={`input-field w-full flex items-center justify-between text-left ${errors.toolId ? 'border-red-500' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span className={selectedTool ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedTool ? `${selectedTool.toolName} (${selectedTool.toolId})` : 'Select a tool'}
                    </span>
                    <FiChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${toolDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {toolDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input ref={searchRef} type="text" placeholder="Search by name or ID..."
                            value={toolSearch} onChange={e => setToolSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                      </div>
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {filteredTools.length === 0
                          ? <li className="px-4 py-3 text-sm text-gray-500 text-center">{toolSearch ? `No tools match "${toolSearch}"` : 'No available tools'}</li>
                          : filteredTools.map(tool => (
                            <li key={tool._id} onClick={() => handleSelectTool(tool)}
                              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 ${formData.toolId === tool._id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-800'}`}>
                              <FiTool className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                              <span>{tool.toolName}</span>
                              <span className="ml-auto text-xs text-gray-400 font-mono">{tool.toolId}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  )}
                </div>
                {errors.toolId && <p className="mt-1 text-sm text-red-600 flex items-center"><FiAlertCircle className="mr-1" />{errors.toolId}</p>}
              </div>
            </div>

            {/* Due section */}
            <div>
              {/* Label + pill toggle */}
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  {dueMode === 'hours' ? <><FiClock className="mr-2 h-4 w-4" />Return in</> : <><FiCalendar className="mr-2 h-4 w-4" />Due Date</>}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
                  <button type="button"
                    onClick={() => { setDueMode('date'); setErrors(p => ({ ...p, expectedReturnDate: '' })); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${dueMode === 'date' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <FiCalendar className="inline mr-1 h-3 w-3" />Date
                  </button>
                  <button type="button"
                    onClick={() => { setDueMode('hours'); setErrors(p => ({ ...p, expectedReturnDate: '' })); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${dueMode === 'hours' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <FiClock className="inline mr-1 h-3 w-3" />Hours
                  </button>
                </div>
              </div>

              {/* ── Date mode: custom calendar ── */}
              {dueMode === 'date' ? (
                <div ref={calRef}>
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => setCalOpen(p => !p)}
                    className={`input-field w-full flex items-center justify-between text-left cursor-pointer ${errors.expectedReturnDate ? 'border-red-500' : ''}`}
                  >
                    <span className={formData.expectedReturnDate ? 'text-gray-900' : 'text-gray-400'}>
                      {formData.expectedReturnDate ? formatSelectedDate(formData.expectedReturnDate) : 'Pick a due date'}
                    </span>
                    <FiCalendar className={`h-4 w-4 flex-shrink-0 ml-2 transition-colors ${calOpen ? 'text-primary-500' : 'text-gray-400'}`} />
                  </button>

                  {/* Calendar — inline so the modal scrolls to show it on mobile */}
                  {calOpen && (
                    <div className="mt-2">
                      <CalendarPicker
                        value={formData.expectedReturnDate}
                        minDate={today}
                        onChange={(dateStr) => {
                          setFormData(prev => ({ ...prev, expectedReturnDate: dateStr }));
                          setErrors(prev => ({ ...prev, expectedReturnDate: '' }));
                          setCalOpen(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* ── Hours mode: stepper ── */
                <div className={`border rounded-xl p-4 ${errors.expectedReturnDate ? 'border-red-400' : 'border-gray-200'} bg-gray-50`}>
                  <div className="flex items-center justify-center gap-6">
                    {/* Hours col */}
                    <div className="flex flex-col items-center gap-1">
                      <button type="button" onClick={() => stepHours(1)}
                        className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-lg font-bold">+</button>
                      <div className="w-20 h-14 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm">
                        <span className="text-3xl font-bold text-gray-800 tabular-nums">{String(dueHours).padStart(2, '0')}</span>
                      </div>
                      <button type="button" onClick={() => stepHours(-1)}
                        className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-lg font-bold">−</button>
                      <span className="text-xs text-gray-500 font-medium mt-0.5">Hours</span>
                    </div>
                    <span className="text-3xl font-bold text-gray-400 mb-5">:</span>
                    {/* Minutes col */}
                    <div className="flex flex-col items-center gap-1">
                      <button type="button" onClick={() => stepMinutes(15)}
                        className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-lg font-bold">+</button>
                      <div className="w-20 h-14 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm">
                        <span className="text-3xl font-bold text-gray-800 tabular-nums">{String(dueMinutes).padStart(2, '0')}</span>
                      </div>
                      <button type="button" onClick={() => stepMinutes(-15)}
                        className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-lg font-bold">−</button>
                      <span className="text-xs text-gray-500 font-medium mt-0.5">Minutes</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-xs text-gray-500">
                    Due at: <span className="font-semibold text-gray-700">
                      {computedDueTime.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              )}

              {errors.expectedReturnDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.expectedReturnDate}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}
                rows={3} placeholder="Any additional notes about this transaction..."
                className="input-field" disabled={loading} />
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 gap-3">
              <button type="button" onClick={onClose} className="btn-outline" disabled={loading}>Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex items-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <><FiSave className="mr-2" />Check Out Tool</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;