import React, { useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApiService';
import { shouldExcludeFarmerFromList } from '../utils/adminListFilters';
import {
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Trash2,
  Sprout,
  ShoppingBag,
  CreditCard,
  FileText,
  Phone,
  MapPin,
  RefreshCw,
  Award,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FarmerManagement = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [accountStatusFilter, setAccountStatusFilter] = useState('All');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewFarmerModal, setViewFarmerModal] = useState(null);
  const [bankDetailsModalFarmer, setBankDetailsModalFarmer] = useState(null);
  const [documentsModalFarmer, setDocumentsModalFarmer] = useState(null);

  // 22-Field Farmer Form State
  const defaultFormState = {
    id: '',
    name: '',
    mobile: '',
    email: '',
    photo: '',
    aadhaar: '9876-5432-1098',
    pan: 'ABCDE1234F',
    farmAddress: 'Gat No. 42, Riverbank Road',
    village: 'Panchavati',
    district: 'Nashik',
    state: 'Maharashtra',
    pincode: '422003',
    farmSize: 5.5,
    farmingType: 'Organic Farming',
    categories: 'Vegetables, Leafy Greens',
    accountNumber: '918273645012',
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    accountHolder: '',
    gst: '27ABCDE1234F1Z5',
    farmerCertificate: 'Verified_Farmer_Cert.pdf',
    landDocument: '7-12_Land_Record_Nashik.pdf',
    identityDocument: 'Aadhaar_Card_Copy.pdf',
    verificationStatus: 'Approved',
    accountStatus: 'Active',
  };

  const [formData, setFormData] = useState(defaultFormState);

  // Initial 12-Column Farmer Dataset with 22 Registration Fields & 5 Statuses
  const initialFarmers = [
    {
      id: '#FRM-128',
      name: 'Suresh Patil',
      photo: '',
      mobile: '+91 98765 11111',
      email: 'suresh.patil@example.com',
      farmLocation: 'Panchavati, Nashik, MH',
      totalProducts: 14,
      totalOrders: 48,
      verificationStatus: 'Approved',
      accountStatus: 'Active',
      registeredDate: 'Jul 24, 2024',
      aadhaar: '9876-5432-1098',
      pan: 'ABCDE1234F',
      farmAddress: 'Gat No. 42, Riverbank Road',
      village: 'Panchavati',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422003',
      farmSize: '5.5 Acres',
      farmingType: 'Organic Farming',
      categories: 'Vegetables, Leafy Greens',
      accountNumber: '918273645012',
      ifsc: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountHolder: 'Suresh Ramrao Patil',
      gst: '27ABCDE1234F1Z5',
      farmerCertificate: 'Verified_Farmer_Cert.pdf',
      landDocument: '7-12_Land_Record_Nashik.pdf',
      identityDocument: 'Aadhaar_Card_Copy.pdf',
      avatar: 'SP'
    },
    {
      id: '#FRM-127',
      name: 'Rajesh Verma',
      photo: '',
      mobile: '+91 98765 22222',
      email: 'rajesh.verma@example.com',
      farmLocation: 'Kothrud, Pune, MH',
      totalProducts: 8,
      totalOrders: 32,
      verificationStatus: 'Verified',
      accountStatus: 'Active',
      registeredDate: 'Jul 23, 2024',
      aadhaar: '8765-4321-0987',
      pan: 'BCDEF2345G',
      farmAddress: 'Plot 18, Agri Zone',
      village: 'Kothrud',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      farmSize: '8.0 Acres',
      farmingType: 'Conventional',
      categories: 'Potatoes, Onions, Grains',
      accountNumber: '827364501928',
      ifsc: 'HDFC0000456',
      bankName: 'HDFC Bank',
      accountHolder: 'Rajesh Kumar Verma',
      gst: '27BCDEF2345G1Z6',
      farmerCertificate: 'Kisan_Credit_Cert.pdf',
      landDocument: 'Land_Ownership_Pune.pdf',
      identityDocument: 'PAN_Card_Copy.pdf',
      avatar: 'RV'
    },
    {
      id: '#FRM-126',
      name: 'Mohan Das',
      photo: '',
      mobile: '+91 98765 33333',
      email: 'mohan.das@example.com',
      farmLocation: 'Wai, Satara, MH',
      totalProducts: 6,
      totalOrders: 15,
      verificationStatus: 'Pending',
      accountStatus: 'Active',
      registeredDate: 'Jul 22, 2024',
      aadhaar: '7654-3210-9876',
      pan: 'CDEFG3456H',
      farmAddress: 'Survey 102, Krishna Valley',
      village: 'Wai',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '412803',
      farmSize: '4.2 Acres',
      farmingType: 'Organic',
      categories: 'Leafy Vegetables, Spices',
      accountNumber: '736450192837',
      ifsc: 'ICIC0000789',
      bankName: 'ICICI Bank',
      accountHolder: 'Mohan Lal Das',
      gst: 'N/A (Small Scale)',
      farmerCertificate: 'Pending_Verification_Doc.pdf',
      landDocument: '7-12_Satara_Record.pdf',
      identityDocument: 'Aadhaar_Card_Copy.pdf',
      avatar: 'MD'
    },
    {
      id: '#FRM-125',
      name: 'Baldev Singh',
      photo: '',
      mobile: '+91 98765 44444',
      email: 'baldev.singh@example.com',
      farmLocation: 'Ludhiana, Punjab',
      totalProducts: 10,
      totalOrders: 60,
      verificationStatus: 'Rejected',
      accountStatus: 'Blocked',
      registeredDate: 'Jul 21, 2024',
      aadhaar: '6543-2109-8765',
      pan: 'DEFGH4567I',
      farmAddress: 'GT Road Sector 4',
      village: 'Ludhiana',
      district: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      farmSize: '12.0 Acres',
      farmingType: 'Hydroponic & Grains',
      categories: 'Wheat, Mustard, Fruits',
      accountNumber: '645019283746',
      ifsc: 'PUNB0000321',
      bankName: 'Punjab National Bank',
      accountHolder: 'Baldev Singh Gill',
      gst: '03DEFGH4567I1Z4',
      farmerCertificate: 'Rejected_Doc.pdf',
      landDocument: 'Punjab_Land_Record.pdf',
      identityDocument: 'Aadhaar_Copy.pdf',
      avatar: 'BS'
    },
    {
      id: '#FRM-124',
      name: 'Kavita Reddy',
      photo: '',
      mobile: '+91 98765 55555',
      email: 'kavita.reddy@example.com',
      farmLocation: 'Guntur, Andhra Pradesh',
      totalProducts: 5,
      totalOrders: 20,
      verificationStatus: 'Suspended',
      accountStatus: 'Blocked',
      registeredDate: 'Jul 15, 2024',
      aadhaar: '5432-1098-7654',
      pan: 'EFGHI5678J',
      farmAddress: 'Chilli Farm Zone 2',
      village: 'Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pincode: '522002',
      farmSize: '6.0 Acres',
      farmingType: 'Spices & Chilli',
      categories: 'Red Chilli, Spices',
      accountNumber: '501928374655',
      ifsc: 'ANDB0000999',
      bankName: 'Union Bank of India',
      accountHolder: 'Kavita Reddy',
      gst: '37EFGHI5678J1Z2',
      farmerCertificate: 'AP_Agri_Cert.pdf',
      landDocument: 'Land_Pattadar_Passbook.pdf',
      identityDocument: 'Identity_Proof.pdf',
      avatar: 'KR'
    }
  ];

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const data = await adminApiService.getFarmers();
        if (data && data.length > 0) {
          setFarmers(initialFarmers);
        } else {
          setFarmers(initialFarmers);
        }
      } catch (err) {
        setFarmers(initialFarmers);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  // Action 1: Open Add Farmer Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData(defaultFormState);
    setShowAddEditModal(true);
  };

  // Action 3: Open Edit Farmer Modal
  const handleOpenEditModal = (farmer) => {
    setIsEditing(true);
    setFormData({
      ...farmer,
      accountHolder: farmer.accountHolder || farmer.name,
    });
    setShowAddEditModal(true);
  };

  // Save Farmer (Submit Form)
  const handleSaveFarmer = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      toast.error('Please enter Farmer Name and Mobile Number.');
      return;
    }

    if (isEditing) {
      setFarmers((prev) =>
        prev.map((f) =>
          f.id === formData.id
            ? {
                ...formData,
                farmLocation: `${formData.village}, ${formData.district}, ${formData.state}`,
              }
            : f
        )
      );
      toast.success(`Farmer profile "${formData.name}" updated.`);
    } else {
      const newFarmer = {
        ...formData,
        id: `#FRM-${Date.now().toString().slice(-3)}`,
        photo: formData.photo || '',
        farmLocation: `${formData.village}, ${formData.district}, ${formData.state}`,
        totalProducts: 0,
        totalOrders: 0,
        registeredDate: 'Today',
        avatar: formData.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
      };
      setFarmers([newFarmer, ...farmers]);
      toast.success(`Farmer "${newFarmer.name}" registered successfully.`);
    }

    setShowAddEditModal(false);
  };

  // Action 4: Approve Farmer
  const handleApproveFarmer = (id, name) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, verificationStatus: 'Approved' } : f))
    );
    toast.success(`Farmer "${name}" verification status set to "Approved".`);
  };

  // Action 5: Reject Farmer
  const handleRejectFarmer = (id, name) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, verificationStatus: 'Rejected' } : f))
    );
    toast.error(`Farmer "${name}" application rejected.`);
  };

  // Action 6 & 7: Block / Unblock Farmer
  const handleToggleBlock = (id, name, currentAccountStatus) => {
    const nextStatus = currentAccountStatus === 'Blocked' ? 'Active' : 'Blocked';
    setFarmers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, accountStatus: nextStatus } : f))
    );
    if (nextStatus === 'Blocked') {
      toast.error(`Farmer "${name}" account blocked.`);
    } else {
      toast.success(`Farmer "${name}" account unblocked and active.`);
    }
  };

  // Action 8: Delete Farmer
  const handleDeleteFarmer = (id, name) => {
    setFarmers((prev) => prev.filter((f) => f.id !== id));
    toast.error(`Farmer "${name}" record deleted.`);
  };

  // Filter Logic: Exclude Blocked Farmers (they are managed in dedicated 'Blocked Users' section)
  const filteredFarmers = farmers
    .filter((f) => !shouldExcludeFarmerFromList(f))
    .filter((f) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        f.id.toLowerCase().includes(query) ||
        f.name.toLowerCase().includes(query) ||
        f.mobile.includes(query) ||
        f.farmLocation.toLowerCase().includes(query);

      const matchesVerification = verificationFilter === 'All' || f.verificationStatus === verificationFilter;
      const matchesAccount = accountStatusFilter === 'All' || f.accountStatus === accountStatusFilter;

      return matchesSearch && matchesVerification && matchesAccount;
    });

  // Badge Style for 5 Verification Statuses
  const getVerificationStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#DCFCE7', color: '#15803D' };
      case 'Verified': return { bg: '#CCFBF1', color: '#0D9488' };
      case 'Pending': return { bg: '#FEF3C7', color: '#D97706' };
      case 'Rejected': return { bg: '#FFE4E6', color: '#E11D48' };
      case 'Suspended': return { bg: '#FFEDD5', color: '#C2410C' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Farmers Directory & Verification</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Onboard, verify land records & bank details, approve farmer suppliers, and manage farm accounts.
          </p>
        </div>

        {/* Action 1: Add Farmer Button */}
        <button
          onClick={handleOpenAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            backgroundColor: '#22C55E',
            color: '#FFFFFF',
            borderRadius: '10px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
          }}
        >
          <Plus size={18} /> Register New Farmer
        </button>
      </div>

      {/* FILTERS BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search farmer name, ID, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Verification Status Filter */}
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Verification Statuses (5)</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Suspended">Suspended</option>
        </select>

        {/* Account Status Filter */}
        <select
          value={accountStatusFilter}
          onChange={(e) => setAccountStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Account Statuses</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>

        <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto', fontWeight: 600 }}>
          Total Farmers: {filteredFarmers.length}
        </span>
      </div>

      {/* 12-COLUMN FARMER TABLE */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#16A34A' }}>
            <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 8px auto' }} />
            Loading farmers directory...
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No farmer records match the search criteria.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Farmer ID</th>
                  <th>Photo</th>
                  <th>Farmer Name</th>
                  <th>Mobile Number</th>
                  <th>Email Address</th>
                  <th>Farm Location</th>
                  <th>Total Products</th>
                  <th>Total Orders</th>
                  <th>Verification Status</th>
                  <th>Account Status</th>
                  <th>Registered Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((f) => {
                  const verBadge = getVerificationStatusBadge(f.verificationStatus);
                  return (
                    <tr key={f.id}>
                      {/* 1. Farmer ID */}
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>{f.id}</td>

                      {/* 2. Photo / Avatar */}
                      <td>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#22C55E',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(34, 197, 94, 0.25)',
                          }}
                        >
                          {f.avatar}
                        </div>
                      </td>

                      {/* 3. Farmer Name */}
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{f.name}</td>

                      {/* 4. Mobile Number */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{f.mobile}</td>

                      {/* 5. Email Address */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{f.email}</td>

                      {/* 6. Farm Location */}
                      <td style={{ fontSize: '12px', color: '#64748B' }}>📍 {f.farmLocation}</td>

                      {/* 7. Total Products */}
                      <td style={{ fontWeight: 700, color: '#0284C7', textAlign: 'center' }}>{f.totalProducts}</td>

                      {/* 8. Total Orders */}
                      <td style={{ fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>{f.totalOrders}</td>

                      {/* 9. Verification Status */}
                      <td>
                        <span style={{ backgroundColor: verBadge.bg, color: verBadge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                          {f.verificationStatus}
                        </span>
                      </td>

                      {/* 10. Account Status */}
                      <td>
                        <span style={{ backgroundColor: f.accountStatus === 'Active' ? '#DCFCE7' : '#FEE2E2', color: f.accountStatus === 'Active' ? '#15803D' : '#DC2626', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                          {f.accountStatus}
                        </span>
                      </td>

                      {/* 11. Registered Date */}
                      <td style={{ fontSize: '11.5px', color: '#94A3B8' }}>{f.registeredDate}</td>

                      {/* 12. Actions (12 Required Actions) */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          {/* Action 2: View Farmer Profile */}
                          <button
                            onClick={() => setViewFarmerModal(f)}
                            title="View Full Registration Details"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Action 3: Edit Farmer */}
                          <button
                            onClick={() => handleOpenEditModal(f)}
                            title="Edit Farmer Details"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F0FDF4', color: '#16A34A', cursor: 'pointer' }}
                          >
                            <Edit size={13} />
                          </button>

                          {/* Action 4 & 5: Approve / Reject Farmer */}
                          {f.verificationStatus !== 'Approved' && (
                            <button
                              onClick={() => handleApproveFarmer(f.id, f.name)}
                              title="Approve Farmer"
                              style={{ padding: '5px 7px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#15803D', cursor: 'pointer' }}
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          {f.verificationStatus !== 'Rejected' && (
                            <button
                              onClick={() => handleRejectFarmer(f.id, f.name)}
                              title="Reject Farmer"
                              style={{ padding: '5px 7px', borderRadius: '6px', border: 'none', backgroundColor: '#FFE4E6', color: '#E11D48', cursor: 'pointer' }}
                            >
                              <XCircle size={13} />
                            </button>
                          )}

                          {/* Action 11: View Bank Details Modal */}
                          <button
                            onClick={() => setBankDetailsModalFarmer(f)}
                            title="View Bank Account Details"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F3E8FF', color: '#9333EA', cursor: 'pointer' }}
                          >
                            <CreditCard size={13} />
                          </button>

                          {/* Action 12: View KYC & Land Documents */}
                          <button
                            onClick={() => setDocumentsModalFarmer(f)}
                            title="View Land & KYC Documents"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E0F2FE', color: '#0284C7', cursor: 'pointer' }}
                          >
                            <FileText size={13} />
                          </button>

                          {/* Action 9: View Products */}
                          <button
                            onClick={() => navigate('/admin/products')}
                            title="View Products Supplied by Farmer"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#DCFCE7', color: '#15803D', cursor: 'pointer' }}
                          >
                            <Sprout size={13} />
                          </button>

                          {/* Action 6 & 7: Block / Unblock Farmer */}
                          <button
                            onClick={() => handleToggleBlock(f.id, f.name, f.accountStatus)}
                            title={f.accountStatus === 'Blocked' ? 'Unblock Account' : 'Block Account'}
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: f.accountStatus === 'Blocked' ? '#DCFCE7' : '#FEF2F2', color: f.accountStatus === 'Blocked' ? '#15803D' : '#DC2626', cursor: 'pointer' }}
                          >
                            {f.accountStatus === 'Blocked' ? <Unlock size={13} /> : <Lock size={13} />}
                          </button>

                          {/* Action 8: Delete Farmer */}
                          <button
                            onClick={() => handleDeleteFarmer(f.id, f.name)}
                            title="Delete Farmer Profile"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: 22-FIELD FARMER REGISTRATION FORM (Add & Edit) */}
      {showAddEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
              {isEditing ? `Edit Farmer Registration (${formData.id})` : 'Register New Farmer (22 Registration Fields)'}
            </h3>

            <form onSubmit={handleSaveFarmer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Name, Mobile, Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>1. Farmer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Suresh Patil"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>2. Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98765 11111"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>3. Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="farmer@example.com"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 2: Photo, Aadhaar, PAN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>4. Profile Photo URL</label>
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>5. Aadhaar Number</label>
                  <input
                    type="text"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    placeholder="XXXX-XXXX-XXXX"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>6. PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    placeholder="ABCDE1234F"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 3: Farm Address, Village, District */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>7. Farm Address</label>
                  <input
                    type="text"
                    value={formData.farmAddress}
                    onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                    placeholder="Gat No. 42, Riverbank Road"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>8. Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Panchavati"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>9. District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Nashik"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 4: State, PIN Code, Farm Size */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>10. State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>11. PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="422003"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>12. Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    placeholder="5.5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 5: Farming Type, Product Categories, GST Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>13. Farming Type</label>
                  <select
                    value={formData.farmingType}
                    onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Organic Farming">Organic Farming</option>
                    <option value="Conventional">Conventional</option>
                    <option value="Hydroponic">Hydroponic</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>14. Product Categories</label>
                  <input
                    type="text"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    placeholder="Vegetables, Leafy Greens"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>19. GST Number</label>
                  <input
                    type="text"
                    value={formData.gst}
                    onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                    placeholder="27ABCDE1234F1Z5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 6: Banking (Fields 15, 16, 17, 18) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>15. Bank Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="918273645012"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>16. IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc}
                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                    placeholder="SBIN0001234"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>17. Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="State Bank of India"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>18. Account Holder</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="Farmer Account Name"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 7: Documents (Fields 20, 21, 22) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>20. Farmer Certificate</label>
                  <input
                    type="text"
                    value={formData.farmerCertificate}
                    onChange={(e) => setFormData({ ...formData, farmerCertificate: e.target.value })}
                    placeholder="Verified_Cert.pdf"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>21. Land Document</label>
                  <input
                    type="text"
                    value={formData.landDocument}
                    onChange={(e) => setFormData({ ...formData, landDocument: e.target.value })}
                    placeholder="7-12_Land_Record.pdf"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>22. Identity Document</label>
                  <input
                    type="text"
                    value={formData.identityDocument}
                    onChange={(e) => setFormData({ ...formData, identityDocument: e.target.value })}
                    placeholder="Aadhaar_PAN_Proof.pdf"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#22C55E', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isEditing ? 'Save Farmer Record' : 'Register Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW FULL FARMER PROFILE (All 22 Registration Fields) */}
      {viewFarmerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setViewFarmerModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#22C55E', color: '#FFFFFF', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {viewFarmerModal.avatar}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>{viewFarmerModal.name}</h3>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>{viewFarmerModal.id} • Registered {viewFarmerModal.registeredDate}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div><strong>Mobile:</strong> {viewFarmerModal.mobile} | <strong>Email:</strong> {viewFarmerModal.email}</div>
              <div><strong>Farm Address:</strong> {viewFarmerModal.farmAddress}, {viewFarmerModal.village}, {viewFarmerModal.district}, {viewFarmerModal.state} - {viewFarmerModal.pincode}</div>
              <div><strong>Aadhaar No:</strong> {viewFarmerModal.aadhaar} | <strong>PAN No:</strong> {viewFarmerModal.pan}</div>
              <div><strong>Farm Specs:</strong> {viewFarmerModal.farmSize} • {viewFarmerModal.farmingType}</div>
              <div><strong>Categories Supplied:</strong> {viewFarmerModal.categories}</div>
              <div><strong>Bank Account:</strong> {viewFarmerModal.bankName} ({viewFarmerModal.accountNumber}) | IFSC: {viewFarmerModal.ifsc}</div>
              <div><strong>GST No:</strong> {viewFarmerModal.gst}</div>
              <div><strong>Verification Status:</strong> <span style={{ fontWeight: 700, color: viewFarmerModal.verificationStatus === 'Approved' ? '#16A34A' : '#DC2626' }}>{viewFarmerModal.verificationStatus}</span></div>
              <div><strong>Account Status:</strong> <span style={{ fontWeight: 700, color: viewFarmerModal.accountStatus === 'Active' ? '#16A34A' : '#DC2626' }}>{viewFarmerModal.accountStatus}</span></div>
            </div>

            <button
              onClick={() => setViewFarmerModal(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW BANK DETAILS */}
      {bankDetailsModalFarmer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setBankDetailsModalFarmer(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9333EA', marginBottom: '16px' }}>
              <CreditCard size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Farmer Bank Payout Specs</h3>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <div><strong>Account Holder:</strong> {bankDetailsModalFarmer.accountHolder}</div>
              <div><strong>Bank Name:</strong> {bankDetailsModalFarmer.bankName}</div>
              <div><strong>Account Number:</strong> {bankDetailsModalFarmer.accountNumber}</div>
              <div><strong>IFSC Code:</strong> {bankDetailsModalFarmer.ifsc}</div>
              <div><strong>GST Number:</strong> {bankDetailsModalFarmer.gst}</div>
            </div>

            <button
              onClick={() => setBankDetailsModalFarmer(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#9333EA', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW KYC & LAND DOCUMENTS */}
      {documentsModalFarmer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setDocumentsModalFarmer(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', marginBottom: '16px' }}>
              <FileText size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>KYC & Land Verification Documents</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Farmer Certificate</strong>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{documentsModalFarmer.farmerCertificate}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '10px' }}>Verified</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Land Ownership Document (7-12)</strong>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{documentsModalFarmer.landDocument}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '10px' }}>Verified</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Identity Document (Aadhaar / PAN)</strong>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{documentsModalFarmer.identityDocument}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '10px' }}>Verified</span>
              </div>
            </div>

            <button
              onClick={() => setDocumentsModalFarmer(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerManagement;
