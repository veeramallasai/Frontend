import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Navigation,
  UserCheck,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const initialDeliveries = [
  {
    id: 'DEL-801',
    partnerName: 'Suresh Reddy',
    phone: '+91 98765 11223',
    rating: 4.9,
    assignedOrders: ['#ORD-1234', '#ORD-1233'],
    currentLocation: 'Hitech City Phase 2, Hyderabad',
    status: 'In Transit',
    vehicle: 'Hero Electric Scooter (TS 09 EQ 4412)'
  },
  {
    id: 'DEL-802',
    partnerName: 'Mahesh Babu',
    phone: '+91 98123 44556',
    rating: 4.8,
    assignedOrders: ['#ORD-1232'],
    currentLocation: 'Jubilee Hills Checkpost, Hyderabad',
    status: 'In Transit',
    vehicle: 'Honda Activa 6G (TS 07 ET 9821)'
  },
  {
    id: 'DEL-803',
    partnerName: 'Kiran Kumar',
    phone: '+91 97654 22334',
    rating: 4.7,
    assignedOrders: ['#ORD-1231'],
    currentLocation: 'Banjara Hills Road No 12, Hyderabad',
    status: 'Delivered',
    vehicle: 'TVS iQube (TS 08 EX 1092)'
  },
  {
    id: 'DEL-804',
    partnerName: 'Ravi Teja',
    phone: '+91 99887 11223',
    rating: 5.0,
    assignedOrders: [],
    currentLocation: 'Madhapur Hub, Hyderabad',
    status: 'Available',
    vehicle: 'Ather 450X (TS 09 FA 7711)'
  },
  {
    id: 'DEL-805',
    partnerName: 'Venkatesh Rao',
    phone: '+91 91234 88776',
    rating: 4.6,
    assignedOrders: ['#ORD-1230'],
    currentLocation: 'Gachibowli DLF Street, Hyderabad',
    status: 'In Transit',
    vehicle: 'TVS King EV (TS 10 EA 3301)'
  }
];

const statusOptions = [
  'In Transit',
  'Available',
  'Delivered',
  'Offline'
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'In Transit':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'Available':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Delivered':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Offline':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const AdminDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal States
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackingPartner, setTrackingPartner] = useState(null);

  const [newPartner, setNewPartner] = useState({
    name: '',
    phone: '',
    vehicle: '',
    location: 'Central Depot, Hyderabad'
  });

  const [assignForm, setAssignForm] = useState({
    partnerId: '',
    orderCode: '#ORD-1235'
  });

  const filteredDeliveries = deliveries.filter(item => {
    if (!item) return false;
    const did = String(item.id || '').toLowerCase();
    const partner = String(item.partnerName || item.partner?.name || '').toLowerCase();
    const location = String(item.currentLocation || item.location || '').toLowerCase();
    const query = String(search || '').toLowerCase();
    const assigned = Array.isArray(item.assignedOrders) ? item.assignedOrders : [];
    const matchesAssigned = assigned.some(o => String(o || '').toLowerCase().includes(query));

    const matchesSearch = did.includes(query) || partner.includes(query) || location.includes(query) || matchesAssigned;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    toast.success(`Delivery Partner #${id} status updated to "${newStatus}"`);
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.phone) return;

    const created = {
      id: `DEL-${800 + deliveries.length + 1}`,
      partnerName: newPartner.name,
      phone: newPartner.phone,
      rating: 5.0,
      assignedOrders: [],
      currentLocation: newPartner.location || 'Central Hub, Hyderabad',
      status: 'Available',
      vehicle: newPartner.vehicle || 'Standard EV Bike'
    };

    setDeliveries(prev => [...prev, created]);
    toast.success(`Delivery Partner "${newPartner.name}" added successfully!`);
    setIsAddPartnerOpen(false);
    setNewPartner({ name: '', phone: '', vehicle: '', location: 'Central Depot, Hyderabad' });
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!assignForm.partnerId || !assignForm.orderCode) return;
    const targetCode = assignForm.orderCode.startsWith('#') ? assignForm.orderCode : `#${assignForm.orderCode}`;

    setDeliveries(prev => prev.map(d => {
      if (d.id === assignForm.partnerId) {
        return {
          ...d,
          assignedOrders: Array.from(new Set([...d.assignedOrders, targetCode])),
          status: 'In Transit'
        };
      }
      return d;
    }));

    const partner = deliveries.find(d => d.id === assignForm.partnerId);
    toast.success(`Order ${targetCode} assigned to ${partner?.partnerName || 'partner'}!`);
    setIsAssignOpen(false);
  };

  // Metrics
  const inTransitCount = deliveries.filter(d => d.status === 'In Transit').length;
  const availableCount = deliveries.filter(d => d.status === 'Available').length;
  const deliveredCount = deliveries.filter(d => d.status === 'Delivered').length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Delivery Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Delivery Management</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Track live delivery partners, assigned routes, and delivery statuses.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              setAssignForm({ partnerId: deliveries[0]?.id || '', orderCode: '#ORD-1235' });
              setIsAssignOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Package className="w-4 h-4" />
            <span>Assign Delivery</span>
          </button>

          <button 
            onClick={() => {
              setTrackingPartner(deliveries[0] || null);
              setIsTrackOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>Track Delivery</span>
          </button>

          <button 
            onClick={() => setIsAddPartnerOpen(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Partner</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{inTransitCount}</h3>
            <p className="text-xs font-semibold text-slate-500">In-Transit Deliveries</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{availableCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Available Partners</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{deliveredCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Completed Orders</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">28 mins</h3>
            <p className="text-xs font-semibold text-slate-500">Avg Delivery Time</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">Live Delivery Fleet</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partner, location, order..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-64 font-medium"
              />
            </div>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="In Transit">In Transit</option>
              <option value="Available">Available</option>
              <option value="Delivered">Delivered</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Delivery ID</th>
                <th className="px-5 py-4">Delivery Partner</th>
                <th className="px-5 py-4">Assigned Orders</th>
                <th className="px-5 py-4">Current Location</th>
                <th className="px-5 py-4">Delivery Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredDeliveries.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Delivery ID */}
                  <td className="px-5 py-4 font-bold text-emerald-600 text-xs">
                    #{item.id}
                  </td>

                  {/* Delivery Partner */}
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {item.partnerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{item.partnerName}</span>
                          <span className="text-[11px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">⭐ {item.rating}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{item.phone} &bull; {item.vehicle}</span>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Orders */}
                  <td className="px-5 py-4">
                    {item.assignedOrders.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.assignedOrders.map((ord, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100">
                            {ord}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">No Orders Assigned</span>
                    )}
                  </td>

                  {/* Current Location */}
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-xs font-semibold">{item.currentLocation}</span>
                    </div>
                  </td>

                  {/* Delivery Status Dropdown */}
                  <td className="px-5 py-4">
                    <select 
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`border rounded-lg text-xs font-bold px-2.5 py-1 outline-none cursor-pointer ${getStatusBadge(item.status)}`}
                    >
                      {statusOptions.map(st => (
                        <option key={st} value={st} className="bg-white text-slate-800 font-semibold">
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => {
                          setAssignForm({ partnerId: item.id, orderCode: '#ORD-1236' });
                          setIsAssignOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                        title="Assign Order"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>

                      <button 
                        onClick={() => {
                          setTrackingPartner(item);
                          setIsTrackOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                        title="Track GPS"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Add New Delivery Partner</h3>
              <button 
                onClick={() => setIsAddPartnerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Partner Full Name *</label>
                <input 
                  type="text" 
                  value={newPartner.name}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                <input 
                  type="text" 
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Details</label>
                <input 
                  type="text" 
                  value={newPartner.vehicle}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, vehicle: e.target.value }))}
                  placeholder="e.g. Hero Electric EV (TS 09 AB 1234)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Depot Location</label>
                <input 
                  type="text" 
                  value={newPartner.location}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Delivery Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Assign Delivery Order</h3>
              <button onClick={() => setIsAssignOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Delivery Partner *</label>
                <select 
                  value={assignForm.partnerId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, partnerId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  required
                >
                  {deliveries.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.partnerName} ({d.id}) - {d.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Code / ID *</label>
                <input 
                  type="text" 
                  value={assignForm.orderCode}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, orderCode: e.target.value }))}
                  placeholder="e.g. #ORD-1235"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Confirm Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Delivery GPS Modal */}
      {isTrackOpen && trackingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Live Delivery Route GPS</h3>
                <p className="text-xs font-bold text-purple-600">Partner: {trackingPartner.partnerName} ({trackingPartner.id})</p>
              </div>
              <button onClick={() => setIsTrackOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            {/* Simulated Live GPS Map Screen */}
            <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">GPS Live Tracking</span>
                </div>
                <span className="text-xs font-semibold text-slate-300">24 km/h &bull; Battery 85%</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase">Current Location</p>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  {trackingPartner.currentLocation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Orders</span>
                  <span className="font-bold text-white">
                    {trackingPartner.assignedOrders.length > 0 ? trackingPartner.assignedOrders.join(', ') : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Est. Arrival Time</span>
                  <span className="font-bold text-emerald-400">18 minutes</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button 
                onClick={() => setIsTrackOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDeliveryManagement;
