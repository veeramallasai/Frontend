import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Users, 
  Search, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Building2,
  Package,
  FileText,
  CreditCard,
  Download,
  AlertCircle,
  RotateCcw,
  FileCheck,
  FileX,
  Send,
  ExternalLink,
  Lock,
  Check,
  X,
  Filter,
  Sparkles,
  History,
  User,
  Mail,
  Globe,
  TrendingUp,
  BarChart3,
  Map,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  RefreshCw,
  Ban,
  UserX,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

// 7 Approval Workflow Stages
export const WORKFLOW_STAGES = [
  { id: 'REGISTRATION_SUBMITTED', label: '1. Registration Submitted', color: 'bg-blue-100 text-blue-800 border-blue-300', badgeColor: 'bg-blue-500' },
  { id: 'DOCUMENTS_UPLOADED', label: '2. Documents Uploaded', color: 'bg-purple-100 text-purple-800 border-purple-300', badgeColor: 'bg-purple-500' },
  { id: 'VERIFICATION_IN_PROGRESS', label: '3. Verification in Progress', color: 'bg-amber-100 text-amber-800 border-amber-300', badgeColor: 'bg-amber-500' },
  { id: 'PENDING_ADMIN_APPROVAL', label: '4. Pending Admin Approval', color: 'bg-orange-100 text-orange-800 border-orange-300', badgeColor: 'bg-orange-500' },
  { id: 'APPROVED', label: '5. Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', badgeColor: 'bg-emerald-500' },
  { id: 'REJECTED', label: '6. Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300', badgeColor: 'bg-rose-500' },
  { id: 'SUSPENDED', label: '7. Suspended', color: 'bg-gray-100 text-gray-800 border-gray-400', badgeColor: 'bg-gray-600' }
];

// Rich Default Sample Data for offline / initial state
const defaultFarmerDataset = [
  {
    id: 'FARM-101',
    name: 'Gurpreet Singh',
    phone: '+91 98123 45678',
    email: 'gurpreet.singh@farm2home.org',
    address: 'VPO Sangrur, Main Road',
    village: 'Sangrur',
    mandal: 'Sangrur Mandal',
    district: 'Sangrur',
    state: 'Punjab',
    pincode: '148001',
    landSize: '12 Acres',
    farmingType: 'ORGANIC',
    approvalStatus: 'APPROVED',
    status: 'Approved',
    listingsCount: 8,
    aadhaarNumber: '981234567890',
    bankName: 'State Bank of India',
    accountNo: 'XXXX-XXXX-4412',
    createdAt: '2026-07-25T10:00:00',
    documents: {
      aadhaar: { number: '9812-3456-7890', status: 'Verified', remarks: 'Aadhaar matched' },
      pan: { number: 'BSPSG1234K', status: 'Verified', remarks: 'PAN verified' },
      bank: { accountHolder: 'Gurpreet Singh', bankName: 'SBI', accountNumber: 'XXXX4412', ifscCode: 'SBIN0001480', status: 'Verified' }
    },
    history: [
      { date: '2026-07-25 10:00 AM', action: 'Registration Submitted', by: 'Farmer' },
      { date: '2026-07-25 11:30 AM', action: 'Documents Uploaded', by: 'Farmer' },
      { date: '2026-07-26 09:15 AM', action: 'Verification Started', by: 'System' },
      { date: '2026-07-26 02:00 PM', action: 'Approved by Admin', by: 'Admin Team' }
    ]
  },
  {
    id: 'FARM-102',
    name: 'Rajesh Patil',
    phone: '+91 97654 32109',
    email: 'rajesh.patil@farm2home.org',
    address: 'Plot 45, Dindori Taluka',
    village: 'Dindori',
    mandal: 'Dindori Mandal',
    district: 'Nashik',
    state: 'Maharashtra',
    pincode: '422004',
    landSize: '8 Acres',
    farmingType: 'HYDROPONIC',
    approvalStatus: 'VERIFICATION_IN_PROGRESS',
    status: 'Verification in Progress',
    listingsCount: 2,
    aadhaarNumber: '976543210988',
    bankName: 'HDFC Bank',
    accountNo: 'XXXX-XXXX-8921',
    createdAt: '2026-07-29T14:30:00',
    documents: {
      aadhaar: { number: '9765-4321-0988', status: 'Under Review', remarks: 'Image clear' },
      pan: { number: 'APZPP8812M', status: 'Verified', remarks: 'PAN match ok' },
      bank: { accountHolder: 'Rajesh Patil', bankName: 'HDFC', accountNumber: 'XXXX8921', ifscCode: 'HDFC0004220', status: 'Under Review' }
    },
    history: [
      { date: '2026-07-29 02:30 PM', action: 'Registration Submitted', by: 'Farmer' },
      { date: '2026-07-29 03:00 PM', action: 'Documents Uploaded', by: 'Farmer' },
      { date: '2026-07-30 10:00 AM', action: 'Verification in Progress', by: 'Admin' }
    ]
  },
  {
    id: 'FARM-103',
    name: 'Srinivas Reddy',
    phone: '+91 99887 65432',
    email: 'srinivas.reddy@farm2home.org',
    address: 'Survey 112, Ibrahimpatnam',
    village: 'Ibrahimpatnam',
    mandal: 'Ibrahimpatnam Mandal',
    district: 'Ranga Reddy',
    state: 'Telangana',
    pincode: '501506',
    landSize: '15 Acres',
    farmingType: 'NATURAL',
    approvalStatus: 'PENDING_ADMIN_APPROVAL',
    status: 'Pending Admin Approval',
    listingsCount: 0,
    aadhaarNumber: '998876543211',
    bankName: 'ICICI Bank',
    accountNo: 'XXXX-XXXX-1102',
    createdAt: '2026-07-30T09:10:00',
    documents: {
      aadhaar: { number: '9988-7654-3211', status: 'Verified', remarks: 'Aadhaar verified' },
      pan: { number: 'CPSPR4419P', status: 'Verified', remarks: 'PAN verified' },
      bank: { accountHolder: 'Srinivas Reddy', bankName: 'ICICI', accountNumber: 'XXXX1102', ifscCode: 'ICIC0005015', status: 'Verified' }
    },
    history: [
      { date: '2026-07-30 09:10 AM', action: 'Registration Submitted', by: 'Farmer' },
      { date: '2026-07-30 09:30 AM', action: 'Documents Uploaded', by: 'Farmer' },
      { date: '2026-07-30 11:00 AM', action: 'Verification Completed', by: 'System' },
      { date: '2026-07-30 11:05 AM', action: 'Submitted for Admin Approval', by: 'System' }
    ]
  },
  {
    id: 'FARM-104',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43211',
    email: 'ramesh.farmer@farmtohome.com',
    address: 'Plot 42, Kisan Nagar',
    village: 'Kisan Village',
    mandal: 'Guntur Mandal',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522001',
    landSize: '5.0 Acres',
    farmingType: 'ORGANIC',
    approvalStatus: 'APPROVED',
    status: 'Approved',
    listingsCount: 15,
    aadhaarNumber: '123456789012',
    bankName: 'State Bank of India',
    accountNo: 'XXXX-XXXX-9012',
    createdAt: '2026-07-20T08:00:00',
    documents: {
      aadhaar: { number: '1234-5678-9012', status: 'Verified', remarks: 'Aadhaar OK' },
      pan: { number: 'BKPRK9910L', status: 'Verified', remarks: 'PAN OK' },
      bank: { accountHolder: 'Ramesh Kumar', bankName: 'SBI', accountNumber: 'XXXX9012', ifscCode: 'SBIN0005220', status: 'Verified' }
    },
    history: [
      { date: '2026-07-20 08:00 AM', action: 'Approved', by: 'Admin' }
    ]
  },
  {
    id: 'FARM-105',
    name: 'Anjali Sharma',
    phone: '+91 94567 89012',
    email: 'anjali.sharma@farm2home.org',
    address: 'Khasra 402, Karnal Rd',
    village: 'Karnal',
    mandal: 'Karnal Central',
    district: 'Karnal',
    state: 'Haryana',
    pincode: '132001',
    landSize: '6 Acres',
    farmingType: 'CONVENTIONAL',
    approvalStatus: 'DOCUMENTS_UPLOADED',
    status: 'Documents Uploaded',
    listingsCount: 0,
    aadhaarNumber: '945678901234',
    bankName: 'Punjab National Bank',
    accountNo: 'XXXX-XXXX-3341',
    createdAt: '2026-07-31T08:15:00',
    documents: {
      aadhaar: { number: '9456-7890-1234', status: 'Pending', remarks: 'Doc uploaded' },
      pan: { number: 'AHPSA7781N', status: 'Pending', remarks: 'Doc uploaded' },
      bank: { accountHolder: 'Anjali Sharma', bankName: 'PNB', accountNumber: 'XXXX3341', ifscCode: 'PUNB0132000', status: 'Pending' }
    },
    history: [
      { date: '2026-07-31 08:15 AM', action: 'Registration Submitted', by: 'Farmer' },
      { date: '2026-07-31 08:45 AM', action: 'Documents Uploaded', by: 'Farmer' }
    ]
  },
  {
    id: 'FARM-106',
    name: 'Venkatesh Naidu',
    phone: '+91 93456 78901',
    email: 'venkatesh.naidu@farm2home.org',
    address: 'Door 5-12, Vijayawada Rural',
    village: 'Kankipadu',
    mandal: 'Kankipadu Mandal',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    pincode: '521151',
    landSize: '10 Acres',
    farmingType: 'ORGANIC',
    approvalStatus: 'SUSPENDED',
    status: 'Suspended',
    listingsCount: 4,
    aadhaarNumber: '934567890123',
    bankName: 'Canara Bank',
    accountNo: 'XXXX-XXXX-7789',
    createdAt: '2026-06-15T11:00:00',
    documents: {
      aadhaar: { number: '9345-6789-0123', status: 'Verified', remarks: 'Verified' },
      pan: { number: 'BVPNV1234J', status: 'Verified', remarks: 'Verified' },
      bank: { accountHolder: 'Venkatesh Naidu', bankName: 'Canara Bank', accountNumber: 'XXXX7789', ifscCode: 'CNRB0005211', status: 'Verified' }
    },
    history: [
      { date: '2026-06-15 11:00 AM', action: 'Approved', by: 'Admin' },
      { date: '2026-07-10 04:30 PM', action: 'Account Suspended', by: 'Admin', details: 'Quality check failure on recent organic produce dispatch.' }
    ]
  }
];

export default function AdminFarmers() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'directory' | 'areawise' | 'reports'
  const [farmers, setFarmers] = useState(defaultFarmerDataset);
  const [analytics, setAnalytics] = useState(null);
  const [areaWiseData, setAreaWiseData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [mandalFilter, setMandalFilter] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [farmingTypeFilter, setFarmingTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Selected Farmer Drawer / Modal
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [actionReason, setActionReason] = useState('');

  // Area Accordion Open State
  const [expandedStates, setExpandedStates] = useState({});
  const [expandedDistricts, setExpandedDistricts] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [farmersData, analyticsData, areaData] = await Promise.all([
        adminService.getFarmers(),
        adminService.getFarmerAnalytics(),
        adminService.getAreaWiseFarmers()
      ]);

      if (Array.isArray(farmersData) && farmersData.length > 0) {
        setFarmers(farmersData);
      }
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      if (Array.isArray(areaData) && areaData.length > 0) {
        setAreaWiseData(areaData);
      }
    } catch (err) {
      console.warn('Error loading farmer management backend data, using rich demo fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Summary Metrics Computation
  const summaryCards = useMemo(() => {
    const total = analytics?.totalFarmers ?? farmers.length;
    const approved = analytics?.approvedFarmers ?? farmers.filter(f => f.approvalStatus === 'APPROVED' || f.status === 'Approved').length;
    
    const pendingList = ['REGISTRATION_SUBMITTED', 'DOCUMENTS_UPLOADED', 'VERIFICATION_IN_PROGRESS', 'PENDING_ADMIN_APPROVAL', 'Pending', 'Verification in Progress'];
    const pending = analytics?.pendingFarmers ?? farmers.filter(f => pendingList.includes(f.approvalStatus) || pendingList.includes(f.status)).length;
    
    const rejectedOrSuspended = analytics?.rejectedFarmers != null && analytics?.suspendedFarmers != null
      ? (analytics.rejectedFarmers + analytics.suspendedFarmers)
      : farmers.filter(f => f.approvalStatus === 'REJECTED' || f.approvalStatus === 'SUSPENDED' || f.status === 'Rejected' || f.status === 'Suspended').length;

    const newWeek = analytics?.newFarmersThisWeek ?? farmers.filter(f => {
      const created = new Date(f.createdAt || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length;

    const newMonth = analytics?.newFarmersThisMonth ?? farmers.filter(f => {
      const created = new Date(f.createdAt || Date.now());
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return created >= monthAgo;
    }).length;

    return { total, newWeek, newMonth, approved, pending, rejectedOrSuspended };
  }, [farmers, analytics]);

  // Distinct Area Lists for Dropdowns
  const uniqueStates = useMemo(() => [...new Set(farmers.map(f => f.state).filter(Boolean))], [farmers]);
  const uniqueDistricts = useMemo(() => [...new Set(farmers.map(f => f.district).filter(Boolean))], [farmers]);
  const uniqueMandals = useMemo(() => [...new Set(farmers.map(f => f.mandal).filter(Boolean))], [farmers]);

  // Filtered Farmers List
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      // Search Term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = (f.name || f.ownerName || '').toLowerCase().includes(term);
        const matchesPhone = (f.phone || '').toLowerCase().includes(term);
        const matchesFarm = (f.farmName || '').toLowerCase().includes(term);
        const matchesAadhaar = (f.aadhaarNumber || '').toLowerCase().includes(term);
        const matchesVillage = (f.village || '').toLowerCase().includes(term);
        if (!matchesName && !matchesPhone && !matchesFarm && !matchesAadhaar && !matchesVillage) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        const st = f.approvalStatus || f.status;
        if (st !== statusFilter) return false;
      }

      // Area Filters
      if (stateFilter && (f.state || '').toLowerCase() !== stateFilter.toLowerCase()) return false;
      if (districtFilter && (f.district || '').toLowerCase() !== districtFilter.toLowerCase()) return false;
      if (mandalFilter && (f.mandal || '').toLowerCase() !== mandalFilter.toLowerCase()) return false;
      if (pincodeFilter && (f.pincode || '').trim() !== pincodeFilter.trim()) return false;

      // Farming Type Filter
      if (farmingTypeFilter && (f.farmingType || '').toLowerCase() !== farmingTypeFilter.toLowerCase()) return false;

      // Date Range Filter
      if (startDateFilter) {
        const created = new Date(f.createdAt || Date.now());
        const start = new Date(startDateFilter);
        if (created < start) return false;
      }
      if (endDateFilter) {
        const created = new Date(f.createdAt || Date.now());
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59);
        if (created > end) return false;
      }

      return true;
    });
  }, [farmers, searchTerm, statusFilter, stateFilter, districtFilter, mandalFilter, pincodeFilter, farmingTypeFilter, startDateFilter, endDateFilter]);

  // Grouped Area Data computation (fallback if backend area-wise is empty)
  const computedAreaWise = useMemo(() => {
    if (areaWiseData && areaWiseData.length > 0) return areaWiseData;

    const groupedMap = {};
    farmers.forEach(f => {
      const st = f.state || 'Telangana';
      const dist = f.district || 'General District';
      const man = f.mandal || 'General Mandal';
      const vil = f.village || 'General Village';

      if (!groupedMap[st]) groupedMap[st] = { state: st, stateFarmerCount: 0, districtsMap: {} };
      groupedMap[st].stateFarmerCount += 1;

      if (!groupedMap[st].districtsMap[dist]) groupedMap[st].districtsMap[dist] = { district: dist, districtFarmerCount: 0, mandalsMap: {} };
      groupedMap[st].districtsMap[dist].districtFarmerCount += 1;

      if (!groupedMap[st].districtsMap[dist].mandalsMap[man]) groupedMap[st].districtsMap[dist].mandalsMap[man] = { mandal: man, mandalFarmerCount: 0, villagesMap: {} };
      groupedMap[st].districtsMap[dist].mandalsMap[man].mandalFarmerCount += 1;

      if (!groupedMap[st].districtsMap[dist].mandalsMap[man].villagesMap[vil]) {
        groupedMap[st].districtsMap[dist].mandalsMap[man].villagesMap[vil] = { village: vil, pincode: f.pincode || 'N/A', villageFarmerCount: 0, farmers: [] };
      }
      groupedMap[st].districtsMap[dist].mandalsMap[man].villagesMap[vil].villageFarmerCount += 1;
      groupedMap[st].districtsMap[dist].mandalsMap[man].villagesMap[vil].farmers.push(f);
    });

    return Object.values(groupedMap).map(stObj => ({
      state: stObj.state,
      stateFarmerCount: stObj.stateFarmerCount,
      districts: Object.values(stObj.districtsMap).map(dObj => ({
        district: dObj.district,
        districtFarmerCount: dObj.districtFarmerCount,
        mandals: Object.values(dObj.mandalsMap).map(mObj => ({
          mandal: mObj.mandal,
          mandalFarmerCount: mObj.mandalFarmerCount,
          villages: Object.values(mObj.villagesMap)
        }))
      }))
    }));
  }, [farmers, areaWiseData]);

  // Handle Workflow Status Updates
  const handleUpdateStatus = async (farmerId, newStageStatus, commentsReason = '') => {
    try {
      await adminService.updateFarmerStatus(farmerId, {
        status: newStageStatus,
        comments: commentsReason,
        reason: commentsReason
      });

      setFarmers(prev => prev.map(f => {
        if (f.id === farmerId) {
          const updatedHistory = f.history || [];
          updatedHistory.unshift({
            date: new Date().toLocaleString(),
            action: `Status changed to ${newStageStatus.replace('_', ' ')}`,
            by: 'Admin',
            details: commentsReason
          });
          return {
            ...f,
            approvalStatus: newStageStatus,
            status: newStageStatus.replace('_', ' '),
            history: updatedHistory
          };
        }
        return f;
      }));

      toast.success(`Farmer status updated to ${newStageStatus.replace('_', ' ')}!`);
      setShowDetailModal(false);
      setShowRejectModal(false);
      setShowSuspendModal(false);
      setActionReason('');
    } catch (err) {
      toast.error('Failed to update farmer status');
    }
  };

  const getWorkflowBadge = (statusKey) => {
    const stage = WORKFLOW_STAGES.find(s => s.id === statusKey) || WORKFLOW_STAGES[4];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${stage.color} inline-flex items-center gap-1.5`}>
        <span className={`w-2 h-2 rounded-full ${stage.badgeColor}`}></span>
        {stage.label.split('. ')[1] || stage.label}
      </span>
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setStateFilter('');
    setDistrictFilter('');
    setMandalFilter('');
    setPincodeFilter('');
    setFarmingTypeFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const toggleStateAccordion = (stName) => {
    setExpandedStates(prev => ({ ...prev, [stName]: !prev[stName] }));
  };

  const toggleDistrictAccordion = (distName) => {
    setExpandedDistricts(prev => ({ ...prev, [distName]: !prev[distName] }));
  };

  const exportFarmersCSV = () => {
    const headers = ['Farmer ID,Name,Phone,Email,Village,Mandal,District,State,Pincode,Land Size,Farming Type,Status'];
    const rows = filteredFarmers.map(f => 
      `"${f.id}","${f.name || f.ownerName}","${f.phone}","${f.email}","${f.village}","${f.mandal || ''}","${f.district}","${f.state}","${f.pincode}","${f.landSize}","${f.farmingType}","${f.approvalStatus || f.status}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farmer_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Farmer data report exported as CSV!');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <button
        type="button"
        className="regional-back-button"
        onClick={handleBack}
      >
        <span className="back-arrow">←</span>
        Back
      </button>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 font-medium text-sm mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Operational Console</span>
            <ChevronRight className="w-4 h-4" />
            <span>Farmer Management Module</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Farmer Management & Approval Center</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Monitor real-time farmer registrations, review verification documents, track 7-stage approval workflows, and analyze regional area distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-emerald-700/60 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl backdrop-blur transition border border-emerald-500/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={exportFarmersCSV} 
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard & Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === 'directory'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Farmer Directory & Workflow</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {filteredFarmers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('areawise')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === 'areawise'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Area-wise Farmer List</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Reports & Analytics</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & SUMMARY CARDS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Farmers</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{summaryCards.total}</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">Platform registered</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New This Week</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{summaryCards.newWeek}</h3>
                <p className="text-xs text-blue-600 font-medium mt-1">Last 7 days growth</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New This Month</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{summaryCards.newMonth}</h3>
                <p className="text-xs text-purple-600 font-medium mt-1">Last 30 days growth</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Farmers</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{summaryCards.approved}</h3>
                <p className="text-xs text-teal-600 font-medium mt-1">Verified & Active</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Workflow</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{summaryCards.pending}</h3>
                <p className="text-xs text-amber-600 font-medium mt-1">Stages 1 to 4</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected / Suspended</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{summaryCards.rejectedOrSuspended}</h3>
                <p className="text-xs text-rose-600 font-medium mt-1">Action required/blocked</p>
              </div>
            </div>
          </div>

          {/* 7-Stage Workflow Pipeline Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">7-Stage Farmer Approval Pipeline</h3>
                <p className="text-xs text-slate-500">Live breakdown of farmers currently at each operational verification stage</p>
              </div>
              <button 
                onClick={() => setActiveTab('directory')}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All In Directory</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {WORKFLOW_STAGES.map(stage => {
                const count = farmers.filter(f => (f.approvalStatus || f.status) === stage.id).length;
                return (
                  <div 
                    key={stage.id} 
                    onClick={() => {
                      setStatusFilter(stage.id);
                      setActiveTab('directory');
                    }}
                    className={`p-4 rounded-xl border ${stage.color} cursor-pointer hover:shadow-md transition flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.badgeColor}`}></span>
                      <span className="text-lg font-extrabold">{count}</span>
                    </div>
                    <p className="text-xs font-bold leading-tight">{stage.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Registrations & Regional Summary Quick Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Action Pending Approval List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Farmers Awaiting Admin Review</h3>
              <p className="text-xs text-slate-500 mb-4">Farmers at Stage 4 (Pending Admin Approval) requiring final sign-off</p>

              <div className="space-y-3">
                {farmers.filter(f => (f.approvalStatus || f.status) === 'PENDING_ADMIN_APPROVAL' || f.status === 'Pending Admin Approval').length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    No pending farmers awaiting admin review right now!
                  </div>
                ) : (
                  farmers
                    .filter(f => (f.approvalStatus || f.status) === 'PENDING_ADMIN_APPROVAL' || f.status === 'Pending Admin Approval')
                    .slice(0, 5)
                    .map(f => (
                      <div key={f.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{f.name || f.ownerName}</h4>
                          <p className="text-xs text-slate-500">{f.farmName} • {f.village}, {f.district}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFarmer(f);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Review & Action
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Top Regional Distribution Summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Top Regional Clusters</h3>
              <p className="text-xs text-slate-500 mb-4">High-density farmer registration locations</p>

              <div className="space-y-3">
                {computedAreaWise.slice(0, 5).map(st => (
                  <div key={st.state} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{st.state}</h4>
                        <p className="text-xs text-slate-500">{st.districts?.length || 0} Districts • {st.stateFarmerCount} Farmers</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setStateFilter(st.state);
                        setActiveTab('areawise');
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Explore Area
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FARMER DIRECTORY & WORKFLOW MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Advanced Multi-Field Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile Number, Aadhaar, Farm Name, or Village..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-64">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Workflow Stages ({farmers.length})</option>
                  {WORKFLOW_STAGES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({farmers.filter(f => (f.approvalStatus || f.status) === s.id).length})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Regional & Secondary Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">State</label>
                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">District</label>
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mandal</label>
                <select
                  value={mandalFilter}
                  onChange={e => setMandalFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">All Mandals</option>
                  {uniqueMandals.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 500001"
                  value={pincodeFilter}
                  onChange={e => setPincodeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Farming Type</label>
                <select
                  value={farmingTypeFilter}
                  onChange={e => setFarmingTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">All Types</option>
                  <option value="ORGANIC">Organic</option>
                  <option value="HYDROPONIC">Hydroponic</option>
                  <option value="NATURAL">Natural</option>
                  <option value="CONVENTIONAL">Conventional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Farmer Details</th>
                    <th className="px-6 py-4">Regional Location</th>
                    <th className="px-6 py-4">Land & Practice</th>
                    <th className="px-6 py-4">Workflow Status</th>
                    <th className="px-6 py-4">Reg. Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">No farmers matched your search or filters.</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or location dropdowns.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFarmers.map(farmer => (
                      <tr key={farmer.id} className="hover:bg-slate-50/80 transition">
                        {/* Farmer Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                              {(farmer.name || farmer.ownerName || 'F')[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{farmer.name || farmer.ownerName}</h4>
                              <p className="text-xs text-slate-500 font-mono">{farmer.phone}</p>
                              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                {farmer.farmName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Regional Location */}
                        <td className="px-6 py-4 text-xs">
                          <p className="font-bold text-slate-800">{farmer.village}, {farmer.mandal || 'General Mandal'}</p>
                          <p className="text-slate-500">{farmer.district}, {farmer.state}</p>
                          <p className="text-slate-400 text-[11px]">PIN: {farmer.pincode}</p>
                        </td>

                        {/* Land & Practice */}
                        <td className="px-6 py-4 text-xs">
                          <p className="font-bold text-slate-800">{farmer.landSize}</p>
                          <p className="text-slate-500">{farmer.farmingType}</p>
                          <p className="text-emerald-600 font-medium">{farmer.listingsCount || 0} Products Listed</p>
                        </td>

                        {/* Workflow Status Badge */}
                        <td className="px-6 py-4">
                          {getWorkflowBadge(farmer.approvalStatus || farmer.status)}
                        </td>

                        {/* Reg Date */}
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {farmer.createdAt ? String(farmer.createdAt).split('T')[0] : 'Recent'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setShowDetailModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-lg transition"
                          >
                            Manage Workflow
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AREA-WISE FARMER LIST */}
      {/* ========================================================= */}
      {activeTab === 'areawise' && (
        <div className="space-y-6">
          <button
            type="button"
            className="regional-back-button"
            onClick={handleBack}
          >
            <span className="back-arrow">←</span>
            Back
          </button>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hierarchical Regional Farmer Management</h3>
              <p className="text-xs text-slate-500">Farmers grouped by State → District → Mandal → Village → Pincode</p>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl">
              {computedAreaWise.length} States Active
            </span>
          </div>

          {/* Area Accordion Trees */}
          <div className="space-y-4">
            {computedAreaWise.map(st => (
              <div key={st.state} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* State Bar */}
                <div 
                  onClick={() => toggleStateAccordion(st.state)}
                  className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-base font-bold">{st.state} State</h4>
                      <p className="text-xs text-slate-300">{st.districts?.length || 0} Districts • {st.stateFarmerCount} Farmers</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedStates[st.state] ? 'rotate-180' : ''}`} />
                </div>

                {/* Districts List */}
                {expandedStates[st.state] && (
                  <div className="p-4 space-y-3 bg-slate-50/50">
                    {st.districts?.map(dist => (
                      <div key={dist.district} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div 
                          onClick={() => toggleDistrictAccordion(dist.district)}
                          className="p-4 bg-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-200/70 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <h5 className="font-bold text-slate-800 text-sm">{dist.district} District</h5>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              {dist.districtFarmerCount} Farmers
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedDistricts[dist.district] ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Mandals & Villages */}
                        {expandedDistricts[dist.district] && (
                          <div className="p-4 space-y-4">
                            {dist.mandals?.map(man => (
                              <div key={man.mandal} className="border-l-2 border-emerald-500 pl-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-amber-600" />
                                  <h6 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{man.mandal} ({man.mandalFarmerCount} Farmers)</h6>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                                  {man.villages?.map(vil => (
                                    <div key={vil.village} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-xs text-slate-900">{vil.village}</span>
                                        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">PIN: {vil.pincode}</span>
                                      </div>
                                      <div className="space-y-1">
                                        {vil.farmers?.map(f => (
                                          <div key={f.id} className="text-xs flex items-center justify-between text-slate-600 py-0.5">
                                            <span className="font-medium text-slate-800">{f.name || f.ownerName} ({f.farmName})</span>
                                            <span className="text-[10px] text-emerald-700 font-semibold">{f.landSize}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REPORTS & ANALYTICS */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Growth Chart Simulation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Weekly Registration Velocity</h3>
              <p className="text-xs text-slate-500 mb-4">Farmer onboarding counts per day</p>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-200">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const heights = [40, 65, 30, 85, 50, 95, 70];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        style={{ height: `${heights[idx]}%` }} 
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all hover:brightness-110"
                      ></div>
                      <span className="text-xs font-semibold text-slate-600">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approval Conversion Funnel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Approval Stage Conversion Funnel</h3>
              <p className="text-xs text-slate-500 mb-4">Proportion of farmers completing verification</p>

              <div className="space-y-3 pt-2">
                {[
                  { stage: 'Stage 1: Submitted', pct: 100, color: 'bg-blue-500' },
                  { stage: 'Stage 2: Docs Uploaded', pct: 88, color: 'bg-purple-500' },
                  { stage: 'Stage 3: Verification', pct: 75, color: 'bg-amber-500' },
                  { stage: 'Stage 4: Admin Review', pct: 60, color: 'bg-orange-500' },
                  { stage: 'Stage 5: Fully Approved', pct: 52, color: 'bg-emerald-500' }
                ].map(item => (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.stage}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Export Complete Platform Farmer Report</h3>
              <p className="text-xs text-slate-500">Download formatted CSV spreadsheet with full contact details, land sizes, and verification audit history.</p>
            </div>
            <button 
              onClick={exportFarmersCSV}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FARMER WORKFLOW & DETAILS MODAL */}
      {/* ========================================================= */}
      {showDetailModal && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Farmer ID: {selectedFarmer.id}</span>
                <h2 className="text-xl font-bold">{selectedFarmer.name || selectedFarmer.ownerName}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">{selectedFarmer.farmName} • {selectedFarmer.phone}</p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 7-Stage Workflow Progress Stepper */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Approval Workflow Stage</h4>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {WORKFLOW_STAGES.map((st, idx) => {
                    const isCurrent = (selectedFarmer.approvalStatus || selectedFarmer.status) === st.id;
                    return (
                      <div 
                        key={st.id} 
                        className={`p-2 rounded-xl text-center text-xs font-bold border ${
                          isCurrent 
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400' 
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Step {idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personal & Farm Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Personal Profile</span>
                  </h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-semibold">Phone:</span> {selectedFarmer.phone}</p>
                    <p><span className="font-semibold">Email:</span> {selectedFarmer.email}</p>
                    <p><span className="font-semibold">Aadhaar:</span> {selectedFarmer.aadhaarNumber || 'Attached'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Regional Address</span>
                  </h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-semibold">Village:</span> {selectedFarmer.village}</p>
                    <p><span className="font-semibold">Mandal:</span> {selectedFarmer.mandal || 'General Mandal'}</p>
                    <p><span className="font-semibold">District / State:</span> {selectedFarmer.district}, {selectedFarmer.state}</p>
                    <p><span className="font-semibold">Pincode:</span> {selectedFarmer.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Document Verification Actions */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                  <span>Verification Documents</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">Aadhaar Card</p>
                    <p className="text-emerald-700 font-semibold">Status: Verified</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">PAN Card</p>
                    <p className="text-emerald-700 font-semibold">Status: Verified</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">Bank Passbook / Cheque</p>
                    <p className="text-emerald-700 font-semibold">Status: Verified</p>
                  </div>
                </div>
              </div>

              {/* Action Stage Buttons */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-emerald-900 text-sm">Advance Workflow Status</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedFarmer.id, 'VERIFICATION_IN_PROGRESS', 'Admin initiated document verification.')}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Start Verification
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedFarmer.id, 'PENDING_ADMIN_APPROVAL', 'Docs verified, waiting for final admin approval.')}
                    className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition"
                  >
                    Send to Admin Approval
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedFarmer.id, 'APPROVED', 'Farmer account approved and activated.')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Approve Farmer (Stage 5)
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Reject (With Reason)
                  </button>
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    Suspend Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {showRejectModal && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-rose-600">Reject Farmer Registration</h3>
            <p className="text-xs text-slate-500">Provide the official reason for rejection. This will be sent to the farmer.</p>
            <textarea
              rows={3}
              placeholder="e.g. Document discrepancy in Aadhaar number / blurry bank passbook"
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button 
                onClick={() => handleUpdateStatus(selectedFarmer.id, 'REJECTED', actionReason)} 
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND REASON MODAL */}
      {showSuspendModal && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Suspend Farmer Account</h3>
            <p className="text-xs text-slate-500">Provide reason for suspending active selling privileges.</p>
            <textarea
              rows={3}
              placeholder="e.g. Quality audit failure or shipping delay reports"
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSuspendModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button 
                onClick={() => handleUpdateStatus(selectedFarmer.id, 'SUSPENDED', actionReason)} 
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
