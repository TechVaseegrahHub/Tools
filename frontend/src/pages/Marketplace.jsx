import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiFilter, FiShoppingCart, FiInfo, FiUser, FiZap, FiTrendingUp, FiTrendingDown, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ToolRentalCard = ({ tool, onRent }) => {
  const isAvailable = tool.status === 'Available';

  return (
    <div className="bg-white border-2 border-black p-6 shadow-brutal hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all relative overflow-hidden group">
      <div className="grid-bg opacity-[0.05]" />
      
      {/* Price Badge */}
      <div className="absolute top-0 right-0 bg-accent text-white px-4 py-2 font-black italic border-b-2 border-l-2 border-black">
        ₹{tool.price_per_hour}/hr
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-black uppercase tracking-tighter italic text-black truncate pr-20">{tool.toolName}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 italic">
          {tool.category?.name || 'General'} // ID: {tool.toolId}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
          <FiUser className="text-accent" />
          <span className="truncate">Owner: {tool.ownerId?.name || 'System'}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {tool.description || 'No description provided for this technical asset.'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t-2 border-black pt-6">
        <div className={`flex items-center gap-2 px-3 py-1 border-2 border-black font-black uppercase text-[10px] tracking-widest ${isAvailable ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>
        
        <button
          onClick={() => onRent(tool)}
          disabled={!isAvailable}
          className={`flex items-center gap-2 px-6 py-2 font-black uppercase text-xs tracking-widest transition-all ${
            isAvailable 
            ? 'bg-accent text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]' 
            : 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
          }`}
        >
          <FiZap /> Rent Tool
        </button>
      </div>
    </div>
  );
};

const Marketplace = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('newest');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTools();
  }, [category, sort, availableOnly]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchTools = async (search = '') => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/tools/marketplace', {
        params: {
          search: search || searchTerm,
          category,
          sort,
          availableOnly
        }
      });
      setTools(data.data);
    } catch (err) {
      toast.error('Failed to load marketplace tools');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTools();
  };

  const handleRent = async (tool) => {
    try {
      // Simulate checkout for the user renting it
      // In a real marketplace, this might involve a rental request or payment
      const res = await axios.post('/api/transactions/checkout', {
        toolId: tool._id,
        userId: user._id, // Renting for self
        expectedReturnDate: new Date(Date.now() + 24 * 3600000).toISOString(), // Default 24h
        notes: `Rented via Marketplace. Owner: ${tool.ownerId?.name}`
      });
      
      toast.success(`Successfully rented ${tool.toolName}!`);
      fetchTools(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rental failed');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="bg-black border-l-[16px] border-accent rounded-xl p-10 text-white relative overflow-hidden group">
        <div className="grid-bg opacity-[0.1]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">Marketplace</h1>
            <p className="text-white/40 text-[12px] font-black uppercase tracking-[0.4em] italic mb-2">// PEER_TO_PEER_ASSET_EXCHANGE //</p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent">
              <FiSearch className="h-5 w-5" strokeWidth={4} />
            </div>
            <input
              type="text"
              placeholder="Search for tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/20 py-4 pl-12 pr-4 text-white placeholder:text-white/20 font-black uppercase text-xs tracking-widest focus:outline-none focus:border-accent focus:bg-white/20 transition-all rounded-lg"
            />
          </form>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-4 border-black p-6 shadow-brutal flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <FiFilter className="text-accent" />
          <span className="text-xs font-black uppercase tracking-widest">FILTERS:</span>
        </div>

        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-50 border-2 border-black px-4 py-2 font-black uppercase text-[10px] tracking-widest focus:outline-none"
        >
          <option value="ALL">ALL_CATEGORIES</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name?.toUpperCase() || 'UNKNOWN_CATEGORY'}</option>)}
        </select>

        <select 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-50 border-2 border-black px-4 py-2 font-black uppercase text-[10px] tracking-widest focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="w-5 h-5 border-2 border-black rounded-none checked:bg-accent transition-all appearance-none cursor-pointer" 
          />
          <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-accent transition-colors">AVAILABLE_ONLY</span>
        </label>
      </div>

      {/* Tool Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse border-2 border-black shadow-brutal" />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="bg-white border-4 border-black p-20 text-center shadow-brutal">
          <FiInfo className="mx-auto h-12 w-12 text-gray-300 mb-6" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">MANIFEST_NOT_FOUND</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">NO_NODES_MATCHING_CRITERIA_STREAMING...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map(tool => (
            <ToolRentalCard key={tool._id} tool={tool} onRent={handleRent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
