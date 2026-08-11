import React, { useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApiService';
import {
  Ban,
  Users,
  UserCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldOff,
  UserX,
  FileText,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlockedUsers = () => {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'farmers'
  const [blockedCustomers, setBlockedCustomers] = useState([]);
  const [blockedFarmers, setBlockedFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal states
  const [viewUserModal, setViewUserModal] = useState(null);
  const [unblockModalUser, setUnblockModalUser] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const [customersData, farmersData] = await Promise.all([
        adminApiService.getBlockedCustomers(),
        adminApiService.getBlockedFarmers()
      ]);
      setBlockedCustomers(customersData || []);
      setBlockedFarmers(farmersData || []);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
      toast.error('Failed to load blocked users data');
    } finally {
      setLoading(false);
    }
  };

  // Switch tabs & reset pagination
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setReasonFilter('All');
  };

  // Selected dataset based on active tab
  const currentList = activeTab === 'customers' ? blockedCustomers : blockedFarmers;

  // Unique block reasons for filtering
  const uniqueReasons = [
    'All',
    ...new Set(currentList.map((item) => item.blockReason).filter(Boolean))
  ];

  // Filtering & Searching Logic
  const filteredList = currentList.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query)) ||
      (user.location && user.location.toLowerCase().includes(query)) ||
      (user.blockReason && user.blockReason.toLowerCase().includes(query)) ||
      (user.id && user.id.toLowerCase().includes(query));

    const matchesReason =
      reasonFilter === 'All' || user.blockReason === reasonFilter;

    return matchesSearch && matchesReason;
  });

  // Sorting
  const sortedList = [...filteredList].sort((a, b) => {
    const dateA = new Date(a.blockedDate || 0);
    const dateB = new Date(b.blockedDate || 0);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedList.length / itemsPerPage) || 1;
  const paginatedList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleUnblockConfirm = () => {
    if (!unblockModalUser) return;
    const isCustomer = activeTab === 'customers';
    const targetId = unblockModalUser.id;

    if (isCustomer) {
      setBlockedCustomers((prev) => prev.filter((c) => c.id !== targetId));
    } else {
      setBlockedFarmers((prev) => prev.filter((f) => f.id !== targetId));
    }

    toast.success(
      `${isCustomer ? 'Customer' : 'Farmer'} "${unblockModalUser.name}" has been unblocked successfully!`
    );
    setUnblockModalUser(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalUser) return;
    const isCustomer = activeTab === 'customers';
    const targetId = deleteModalUser.id;

    if (isCustomer) {
      setBlockedCustomers((prev) => prev.filter((c) => c.id !== targetId));
    } else {
      setBlockedFarmers((prev) => prev.filter((f) => f.id !== targetId));
    }

    toast.success(
      `${isCustomer ? 'Customer' : 'Farmer'} account "${deleteModalUser.name}" deleted permanently.`
    );
    setDeleteModalUser(null);
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px' }}>
      {/* Header Section */}
      <div className="admin-page-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FCA5A5'
              }}
            >
              <Ban size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Blocked Users Section
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '2px 0 0 0' }}>
                Dedicated security panel for managing blocked customers and farmers
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchBlockedUsers}
          className="admin-btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh List
        </button>
      </div>

      {/* Top Stat Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Blocked Accounts</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {blockedCustomers.length + blockedFarmers.length}
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UserX size={24} />
          </div>
        </div>

        <div
          onClick={() => handleTabChange('customers')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: activeTab === 'customers' ? '2px solid #DC2626' : '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Blocked Customers</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              {blockedCustomers.length}
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={24} />
          </div>
        </div>

        <div
          onClick={() => handleTabChange('farmers')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: activeTab === 'farmers' ? '2px solid #DC2626' : '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Blocked Farmers</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#EA580C', marginTop: '4px' }}>
              {blockedFarmers.length}
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px' }}>
        <button
          onClick={() => handleTabChange('customers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '15px',
            color: activeTab === 'customers' ? '#DC2626' : '#64748B',
            borderBottom: activeTab === 'customers' ? '3px solid #DC2626' : '3px solid transparent',
            background: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <Users size={18} />
          <span>Blocked Customers</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: activeTab === 'customers' ? '#FEE2E2' : '#F1F5F9',
              color: activeTab === 'customers' ? '#991B1B' : '#64748B',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            {blockedCustomers.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('farmers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '15px',
            color: activeTab === 'farmers' ? '#DC2626' : '#64748B',
            borderBottom: activeTab === 'farmers' ? '3px solid #DC2626' : '3px solid transparent',
            background: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <UserCheck size={18} />
          <span>Blocked Farmers</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: activeTab === 'farmers' ? '#FEE2E2' : '#F1F5F9',
              color: activeTab === 'farmers' ? '#991B1B' : '#64748B',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            {blockedFarmers.length}
          </span>
        </button>
      </div>

      {/* Control Bar: Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
          />
          <input
            type="text"
            placeholder={`Search blocked ${activeTab} by name, email, phone, reason...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="#64748B" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Reason:</span>
            <select
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {uniqueReasons.map((reason, idx) => (
                <option key={idx} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              <option value="newest">Newest Blocked</option>
              <option value="oldest">Oldest Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px' }}>User Details</th>
                <th style={{ padding: '14px 18px' }}>Email</th>
                <th style={{ padding: '14px 18px' }}>Phone</th>
                <th style={{ padding: '14px 18px' }}>Location</th>
                <th style={{ padding: '14px 18px' }}>Block Reason</th>
                <th style={{ padding: '14px 18px' }}>Blocked Date</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    Loading blocked accounts...
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <ShieldOff size={40} color="#CBD5E1" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>No blocked accounts found</div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                      {searchQuery || reasonFilter !== 'All'
                        ? 'Try resetting your search query or filter options'
                        : `No ${activeTab} are currently blocked in the system.`}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* User Column */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: activeTab === 'customers' ? '#EFF6FF' : '#FFF7ED',
                            color: activeTab === 'customers' ? '#2563EB' : '#EA580C',
                            fontWeight: 700,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(0,0,0,0.08)'
                          }}
                        >
                          {user.avatar || (user.name ? user.name.substring(0, 2).toUpperCase() : 'U')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>
                            {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#94A3B8" />
                        <span>{user.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Phone Column */}
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#94A3B8" />
                        <span>{user.phone || user.mobile || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Location Column */}
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="#94A3B8" />
                        <span>{user.location || user.farmLocation || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Block Reason Column */}
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#FEF2F2',
                          color: '#B91C1C',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: '1px solid #FCA5A5'
                        }}
                      >
                        <AlertTriangle size={12} />
                        {user.blockReason || 'Terms & Security Violation'}
                      </span>
                    </td>

                    {/* Blocked Date Column */}
                    <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#94A3B8" />
                        <span>{user.blockedDate || 'Recent'}</span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {/* View Action Button */}
                        <button
                          onClick={() => setViewUserModal(user)}
                          title="View Details"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#2563EB',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <Eye size={14} /> View
                        </button>

                        {/* Unblock Action Button */}
                        <button
                          onClick={() => setUnblockModalUser(user)}
                          title="Unblock User"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #BBF7D0',
                            backgroundColor: '#F0FDF4',
                            color: '#15803D',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <CheckCircle2 size={14} /> Unblock
                        </button>

                        {/* Delete Action Button */}
                        <button
                          onClick={() => setDeleteModalUser(user)}
                          title="Delete User"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing{' '}
            <strong>
              {sortedList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong>
              {Math.min(currentPage * itemsPerPage, sortedList.length)}
            </strong>{' '}
            of <strong>{sortedList.length}</strong> blocked {activeTab}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                  color: currentPage === 1 ? '#94A3B8' : '#334155',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: currentPage >= totalPages ? '#F1F5F9' : '#FFFFFF',
                  color: currentPage >= totalPages ? '#94A3B8' : '#334155',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW DETAILS MODAL */}
      {viewUserModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '540px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setViewUserModal(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: activeTab === 'customers' ? '#EFF6FF' : '#FFF7ED',
                  color: activeTab === 'customers' ? '#2563EB' : '#EA580C',
                  fontWeight: 800,
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(0,0,0,0.08)'
                }}
              >
                {viewUserModal.avatar || viewUserModal.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {viewUserModal.name}
                </h3>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#DC2626',
                    backgroundColor: '#FEF2F2',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    marginTop: '4px',
                    display: 'inline-block'
                  }}
                >
                  BLOCKED {activeTab === 'customers' ? 'CUSTOMER' : 'FARMER'} ({viewUserModal.id})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
                  BLOCK REASON
                </div>
                <div style={{ color: '#B91C1C', fontWeight: 600 }}>{viewUserModal.blockReason || 'Terms & Security Violation'}</div>
                <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '4px' }}>
                  Blocked on: {viewUserModal.blockedDate || 'N/A'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Email Address</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewUserModal.email || 'N/A'}</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Phone Number</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewUserModal.phone || viewUserModal.mobile || 'N/A'}</div>
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Location / Address</div>
                <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                  {viewUserModal.location || viewUserModal.farmLocation || 'N/A'}
                </div>
              </div>

              {activeTab === 'customers' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Total Orders</div>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewUserModal.totalOrders || 0}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Total Spent</div>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewUserModal.totalSpent || '$0.00'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Farm Size</div>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewUserModal.farmSize || 'N/A'}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Farming Type</div>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewUserModal.farmingType || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setUnblockModalUser(viewUserModal);
                  setViewUserModal(null);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Unblock User
              </button>
              <button
                onClick={() => setViewUserModal(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UNBLOCK CONFIRMATION MODAL */}
      {unblockModalUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid #BBF7D0'
              }}
            >
              <CheckCircle2 size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Unblock {activeTab === 'customers' ? 'Customer' : 'Farmer'}?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to unblock <strong>{unblockModalUser.name}</strong>? This will restore their access to the platform.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setUnblockModalUser(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleUnblockConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Unblock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid #FCA5A5'
              }}
            >
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Delete Blocked Account?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to permanently delete <strong>{deleteModalUser.name}</strong> ({deleteModalUser.id})? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModalUser(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
