import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  MessageSquare,
  UserCheck,
  Lock,
  Eye,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const initialTickets = [
  {
    id: 'TCK-901',
    customer: 'Ramesh Kumar',
    phone: '+91 98765 11223',
    email: 'ramesh.k@gmail.com',
    issue: 'Delayed delivery for Order #ORD-1234',
    category: 'Delivery Delay',
    priority: 'High',
    status: 'Open',
    createdAt: '29 May 2026, 11:30 AM',
    description: 'Driver reached nearby depot but order has not been delivered after 2 hours.'
  },
  {
    id: 'TCK-902',
    customer: 'Sneha Patel',
    phone: '+91 98123 44556',
    email: 'sneha.p@yahoo.com',
    issue: 'Missing item in Order #ORD-1233 (Mint leaves 250g)',
    category: 'Missing Item',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '29 May 2026, 10:15 AM',
    description: 'Customer received package but mint leaves bundle was not inside the box.'
  },
  {
    id: 'TCK-903',
    customer: 'Amit Singh',
    phone: '+91 97654 22334',
    email: 'amit.s@outlook.com',
    issue: 'Payment debited twice during UPI checkout',
    category: 'Billing & Payment',
    priority: 'High',
    status: 'Resolved',
    createdAt: '28 May 2026, 04:20 PM',
    description: 'Double payment charged via Google Pay. Refund processed back to source bank.'
  },
  {
    id: 'TCK-904',
    customer: 'Priya Sharma',
    phone: '+91 99887 11223',
    email: 'priya.s@gmail.com',
    issue: 'Inquiry regarding organic certification of leafy greens',
    category: 'Product Quality',
    priority: 'Low',
    status: 'Closed',
    createdAt: '27 May 2026, 02:00 PM',
    description: 'Customer requested NPOP organic farm certification copy. Sent via email.'
  },
  {
    id: 'TCK-905',
    customer: 'Vikram Joshi',
    phone: '+91 91234 88776',
    email: 'vikram.j@gmail.com',
    issue: 'Unable to apply coupon code FARM20 at checkout',
    category: 'Promotional Offer',
    priority: 'Medium',
    status: 'Open',
    createdAt: '29 May 2026, 12:05 PM',
    description: 'Cart value was ₹220, minimum threshold required was ₹250.'
  }
];

const AdminSupport = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTickets = async () => {
      const liveData = await adminService.getSupportTickets();
      if (isMounted && liveData && Array.isArray(liveData) && liveData.length > 0) {
        setTickets(liveData);
      }
    };
    fetchTickets();
    return () => { isMounted = false; };
  }, []);

  const [newTicket, setNewTicket] = useState({
    customer: '',
    phone: '',
    issue: '',
    priority: 'Medium',
    description: ''
  });

  const filteredTickets = tickets.filter(t => {
    if (!t) return false;
    const tid = String(t.id || '').toLowerCase();
    const customer = String(t.customer || t.customerName || t.user?.fullName || '').toLowerCase();
    const issue = String(t.issue || t.subject || t.message || '').toLowerCase();
    const query = String(search || '').toLowerCase();

    const matchesSearch = tid.includes(query) || customer.includes(query) || issue.includes(query);
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleResolve = async (id) => {
    await adminService.updateTicketStatus(id, 'Resolved');
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    toast.success(`Support Ticket #${id} marked as "Resolved"!`);
  };

  const handleCloseTicket = async (id) => {
    await adminService.updateTicketStatus(id, 'Closed');
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Closed' } : t));
    toast.success(`Support Ticket #${id} marked as "Closed"!`);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTicket.customer || !newTicket.issue) return;

    const created = {
      id: `TCK-${900 + tickets.length + 1}`,
      customer: newTicket.customer,
      phone: newTicket.phone || '+91 98000 11223',
      email: `${newTicket.customer.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      issue: newTicket.issue,
      category: 'General Support',
      priority: newTicket.priority,
      status: 'Open',
      createdAt: 'Just now',
      description: newTicket.description || 'Customer inquiry recorded by support admin.'
    };

    setTickets(prev => [created, ...prev]);
    toast.success(`Support Ticket #${created.id} created successfully!`);
    setIsCreateOpen(false);
    setNewTicket({ customer: '', phone: '', issue: '', priority: 'Medium', description: '' });
  };

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Support Center</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Support Tickets</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage customer inquiry tickets, order issues, and resolution status.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Button */}
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Total Support Tickets</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{openCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Open Tickets</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{inProgressCount}</h3>
            <p className="text-xs font-semibold text-slate-500">In Progress</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{resolvedCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Resolved / Closed</p>
          </div>
        </div>
      </div>

      {/* Main Support Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">Support Ticket Queue</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID, customer, issue..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-64 font-medium"
              />
            </div>

            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table: Ticket ID, Customer, Issue, Priority, Status, Actions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Ticket ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Issue</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Ticket ID */}
                  <td className="px-5 py-4 font-bold text-emerald-600 text-xs">
                    #{t.id}
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {t.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{t.customer}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{t.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Issue */}
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800 block text-xs max-w-xs">{t.issue}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{typeof t.category === 'object' ? t.category?.name || 'General' : (t.category || 'General')} &bull; {t.createdAt}</span>
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-4">
                    {t.priority === 'High' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        🔴 High
                      </span>
                    )}
                    {t.priority === 'Medium' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        🟡 Medium
                      </span>
                    )}
                    {t.priority === 'Low' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        🟢 Low
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {t.status === 'Open' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        Open
                      </span>
                    )}
                    {t.status === 'In Progress' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        In Progress
                      </span>
                    )}
                    {t.status === 'Resolved' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Resolved
                      </span>
                    )}
                    {t.status === 'Closed' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        Closed
                      </span>
                    )}
                  </td>

                  {/* Actions: Resolve & Close Ticket */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      
                      {/* Resolve Button */}
                      {t.status !== 'Resolved' && t.status !== 'Closed' && (
                        <button 
                          onClick={() => handleResolve(t.id)}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                          title="Resolve Ticket"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {/* Close Ticket Button */}
                      {t.status !== 'Closed' && (
                        <button 
                          onClick={() => handleCloseTicket(t.id)}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                          title="Close Ticket"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Close Ticket</span>
                        </button>
                      )}

                      {/* View Details */}
                      <button 
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsDetailsOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Support Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Create Support Ticket</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer Name *</label>
                <input 
                  type="text" 
                  value={newTicket.customer}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, customer: e.target.value }))}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                  <input 
                    type="text" 
                    value={newTicket.phone}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 11223"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority Level</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Summary *</label>
                <input 
                  type="text" 
                  value={newTicket.issue}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, issue: e.target.value }))}
                  placeholder="e.g. Delayed delivery for Order #ORD-1234"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Details / Description</label>
                <textarea 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter full details of customer complaint or query..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {isDetailsOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Support Ticket #{selectedTicket.id}</h3>
                <p className="text-xs font-bold text-emerald-600">Status: {selectedTicket.status}</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{selectedTicket.customer}</span>
                  <span className="text-slate-400 font-medium">{selectedTicket.createdAt}</span>
                </div>
                <p className="text-slate-500 font-semibold">{selectedTicket.phone} &bull; {selectedTicket.email}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Issue Summary</span>
                <p className="font-extrabold text-slate-800 text-sm">{selectedTicket.issue}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Detailed Description</span>
                <p className="text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              {selectedTicket.status !== 'Resolved' && (
                <button 
                  onClick={() => {
                    handleResolve(selectedTicket.id);
                    setIsDetailsOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Resolve Ticket
                </button>
              )}

              {selectedTicket.status !== 'Closed' && (
                <button 
                  onClick={() => {
                    handleCloseTicket(selectedTicket.id);
                    setIsDetailsOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSupport;
