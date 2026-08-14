import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Download, 
  Filter,
  Building,
  User,
  Plus,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

// ─── PDF Generator ────────────────────────────────────────────────────────────
const generateStatementPDF = ({ customerPayments, farmerSettlements, totalRevenue, pendingCustomerAmount, totalSettledAmount, pendingPayoutAmount }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const customerRows = customerPayments.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.orderId}</td>
      <td>${p.customer}</td>
      <td class="amount">₹${p.amount.toLocaleString()}</td>
      <td><span class="badge badge-${p.method.toLowerCase()}">${p.method}</span></td>
      <td><span class="badge ${p.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">${p.status}</span></td>
      <td class="date-col">${p.date}</td>
    </tr>
  `).join('');

  const farmerRows = farmerSettlements.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.farmerName}</td>
      <td class="mono">${s.account}</td>
      <td class="amount">₹${s.gross.toLocaleString()}</td>
      <td class="negative">-₹${s.commission.toLocaleString()}</td>
      <td class="amount positive">₹${s.netPayout.toLocaleString()}</td>
      <td><span class="badge ${s.status === 'Settled' ? 'badge-completed' : s.status === 'Processing' ? 'badge-processing' : 'badge-pending'}">${s.status}</span></td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FarmToHome – Payment Statement</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 40px; }

    /* ── Header ── */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #059669 0%, #0284c7 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; font-weight: 800; }
    .brand-name { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 500; }
    .header-right { text-align: right; }
    .doc-title { font-size: 18px; font-weight: 800; color: #0f172a; }
    .doc-meta { font-size: 11px; color: #64748b; margin-top: 4px; }

    /* ── Summary Cards ── */
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .summary-label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .summary-value { font-size: 20px; font-weight: 800; color: #0f172a; }
    .summary-card.green .summary-value { color: #059669; }
    .summary-card.amber .summary-value { color: #d97706; }
    .summary-card.blue .summary-value { color: #2563eb; }
    .summary-card.purple .summary-value { color: #7c3aed; }

    /* ── Section ── */
    .section { margin-bottom: 32px; }
    .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1.5px solid #e2e8f0; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f1f5f9; }
    th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11.5px; font-weight: 500; color: #334155; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    td.amount { font-weight: 700; color: #0f172a; }
    td.positive { color: #059669 !important; }
    td.negative { color: #dc2626; font-weight: 600; }
    td.mono { font-family: monospace; font-size: 11px; color: #64748b; }
    td.date-col { font-size: 10.5px; color: #94a3b8; }

    /* ── Badges ── */
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; white-space: nowrap; }
    .badge-completed { background: #d1fae5; color: #065f46; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-processing { background: #dbeafe; color: #1e40af; }
    .badge-cod { background: #f1f5f9; color: #475569; }
    .badge-upi { background: #ede9fe; color: #5b21b6; }
    .badge-card { background: #dbeafe; color: #1e40af; }

    /* ── Footer ── */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 10px; color: #94a3b8; }
    .footer-right { font-size: 10px; color: #94a3b8; text-align: right; }
    .page-num::after { content: counter(page); }

    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">F</div>
      <div>
        <div class="brand-name">FarmToHome</div>
        <div class="brand-sub">Farm-Fresh Grocery Delivery</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">Payment Statement</div>
      <div class="doc-meta">Generated: ${dateStr} at ${timeStr}</div>
      <div class="doc-meta" style="color:#059669;font-weight:700;">CONFIDENTIAL — INTERNAL USE ONLY</div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary-grid">
    <div class="summary-card green">
      <div class="summary-label">Collected Revenue</div>
      <div class="summary-value">₹${totalRevenue.toLocaleString()}</div>
    </div>
    <div class="summary-card amber">
      <div class="summary-label">Pending Receivables</div>
      <div class="summary-value">₹${pendingCustomerAmount.toLocaleString()}</div>
    </div>
    <div class="summary-card blue">
      <div class="summary-label">Farmer Settlements Paid</div>
      <div class="summary-value">₹${totalSettledAmount.toLocaleString()}</div>
    </div>
    <div class="summary-card purple">
      <div class="summary-label">Pending Farmer Payouts</div>
      <div class="summary-value">₹${pendingPayoutAmount.toLocaleString()}</div>
    </div>
  </div>

  <!-- Customer Payments -->
  <div class="section">
    <div class="section-title">Customer Payments</div>
    <table>
      <thead>
        <tr>
          <th>Payment ID</th>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Status</th>
          <th>Date &amp; Time</th>
        </tr>
      </thead>
      <tbody>${customerRows}</tbody>
    </table>
  </div>

  <!-- Farmer Settlements -->
  <div class="section">
    <div class="section-title">Farmer Settlements</div>
    <table>
      <thead>
        <tr>
          <th>Settlement ID</th>
          <th>Farmer Name</th>
          <th>Bank Account</th>
          <th>Gross Sales</th>
          <th>Commission (10%)</th>
          <th>Net Payout</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${farmerRows}</tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      FarmToHome Admin Portal &nbsp;|&nbsp; This document is system-generated.
    </div>
    <div class="footer-right">
      Statement Date: ${dateStr}
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    toast.error('Popup blocked! Please allow pop-ups for this site.');
    return;
  }
  win.document.write(html);
  win.document.close();
};

const initialCustomerPayments = [
  {
    id: 'PAY-98234',
    orderId: 'ORD-1234',
    customer: 'Ramesh Kumar',
    amount: 1250,
    method: 'COD',
    status: 'Completed',
    date: '29 May 2026, 10:20 AM'
  },
  {
    id: 'PAY-98233',
    orderId: 'ORD-1233',
    customer: 'Sneha Patel',
    amount: 860,
    method: 'UPI',
    status: 'Completed',
    date: '29 May 2026, 11:32 AM'
  },
  {
    id: 'PAY-98232',
    orderId: 'ORD-1232',
    customer: 'Amit Singh',
    amount: 420,
    method: 'COD',
    status: 'Pending',
    date: '29 May 2026, 12:15 PM'
  },
  {
    id: 'PAY-98231',
    orderId: 'ORD-1231',
    customer: 'Priya Sharma',
    amount: 1560,
    method: 'CARD',
    status: 'Completed',
    date: '29 May 2026, 01:50 PM'
  },
  {
    id: 'PAY-98230',
    orderId: 'ORD-1230',
    customer: 'Vikram Joshi',
    amount: 780,
    method: 'COD',
    status: 'Pending',
    date: '29 May 2026, 02:25 PM'
  }
];

const initialFarmerSettlements = [
  {
    id: 'SETTLE-401',
    farmerName: 'Ramesh Organic Farms',
    account: 'SBIN0001234 - xxxx 8890',
    gross: 15400,
    commission: 1540,
    netPayout: 13860,
    status: 'Settled',
    date: '28 May 2026'
  },
  {
    id: 'SETTLE-402',
    farmerName: 'Sri Venkateswara Farms',
    account: 'HDFC0005678 - xxxx 4120',
    gross: 12800,
    commission: 1280,
    netPayout: 11520,
    status: 'Processing',
    date: '29 May 2026'
  },
  {
    id: 'SETTLE-403',
    farmerName: 'Green Valley Produce',
    account: 'ICIC0009101 - xxxx 6732',
    gross: 9600,
    commission: 960,
    netPayout: 8640,
    status: 'Pending Payout',
    date: '29 May 2026'
  }
];

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'farmer'
  const [search, setSearch] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL'); // 'ALL' | 'UPI' | 'COD' | 'CARD'

  const [customerPayments, setCustomerPayments] = useState(initialCustomerPayments);
  const [farmerSettlements, setFarmerSettlements] = useState(initialFarmerSettlements);

  useEffect(() => {
    let isMounted = true;
    const fetchPaymentsData = async () => {
      const liveData = await adminService.getPayments();
      if (isMounted && liveData) {
        if (liveData.customerPayments && Array.isArray(liveData.customerPayments)) {
          setCustomerPayments(liveData.customerPayments);
        }
        if (liveData.farmerSettlements && Array.isArray(liveData.farmerSettlements)) {
          setFarmerSettlements(liveData.farmerSettlements);
        }
      }
    };
    fetchPaymentsData();
    return () => { isMounted = false; };
  }, []);

  // Settlement Action
  const handleProcessSettlement = async (id) => {
    await adminService.processPayout(id);
    setFarmerSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'Settled' } : s));
    toast.success(`Settlement #${id} processed successfully!`);
  };

  // Metrics
  const totalRevenue = customerPayments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingCustomerAmount = customerPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const totalSettledAmount = farmerSettlements.filter(s => s.status === 'Settled').reduce((sum, s) => sum + s.netPayout, 0);
  const pendingPayoutAmount = farmerSettlements.filter(s => s.status !== 'Settled').reduce((sum, s) => sum + s.netPayout, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Payment & Settlements</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Monitor customer payments and farmer settlements.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              generateStatementPDF({
                customerPayments,
                farmerSettlements,
                totalRevenue,
                pendingCustomerAmount,
                totalSettledAmount,
                pendingPayoutAmount,
              });
              toast.success('Opening PDF statement — use Save as PDF in the print dialog!');
            }}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-500">Collected Revenue</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">₹{pendingCustomerAmount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-500">Pending Receivables</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">₹{totalSettledAmount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-500">Farmer Settlements Paid</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">₹{pendingPayoutAmount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-500">Pending Farmer Payouts</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toggle Tabs & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
              <button 
                onClick={() => setActiveTab('customer')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'customer' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Customer Payments
              </button>

              <button 
                onClick={() => setActiveTab('farmer')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'farmer' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Farmer Settlements
              </button>
            </div>

            {/* Separate Payment Type Filter Options (UPI, COD, CARD) */}
            {activeTab === 'customer' && (
              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setPaymentTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    paymentTypeFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('UPI')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentTypeFilter === 'UPI'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <span>⚡</span> UPI
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('COD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentTypeFilter === 'COD'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <span>💵</span> COD
                </button>
                <button
                  onClick={() => setPaymentTypeFilter('CARD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentTypeFilter === 'CARD'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <span>💳</span> CARD
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'customer' ? "Search by Order or Customer..." : "Search by Farmer or Settlement ID..."}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-72 font-medium"
            />
          </div>
        </div>

        {/* Tab 1: Customer Payments Table */}
        {activeTab === 'customer' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                  <th className="px-5 py-4">Payment ID</th>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment Type</th>
                  <th className="px-5 py-4">Payment Status</th>
                  <th className="px-5 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
                {customerPayments
                  .filter(p => {
                    if (!p) return false;
                    const pid = String(p.id || '').toLowerCase();
                    const cust = String(p.customer || p.customerName || p.user?.fullName || '').toLowerCase();
                    const oid = String(p.orderId || p.orderNumber || '').toLowerCase();
                    const query = String(search || '').toLowerCase();
                    const matchesSearch = pid.includes(query) || cust.includes(query) || oid.includes(query);

                    const methodUpper = String(p.method || p.paymentMethod || '').toUpperCase();
                    const matchesMethod = paymentTypeFilter === 'ALL' || 
                      (paymentTypeFilter === 'CARD' ? (methodUpper === 'CARD' || methodUpper === 'CARDS') : methodUpper === paymentTypeFilter);

                    return matchesSearch && matchesMethod;
                  })
                  .map(payment => {
                    const method = String(payment.method || payment.paymentMethod || 'COD').toUpperCase();

                    return (
                      <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-800 text-xs">
                          {payment.id}
                        </td>

                        <td className="px-5 py-4 font-bold text-emerald-600 text-xs">
                          #{payment.orderId}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800">
                          {payment.customer}
                        </td>

                        <td className="px-5 py-4 font-extrabold text-slate-800 text-sm">
                          ₹{payment.amount.toLocaleString()}
                        </td>

                        {/* Separate styled option badges for UPI, COD, and CARD */}
                        <td className="px-5 py-4">
                          {method === 'UPI' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs">
                              <span>⚡</span> UPI
                            </span>
                          )}
                          {method === 'COD' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                              <span>💵</span> COD
                            </span>
                          )}
                          {(method === 'CARD' || method === 'CARDS') && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
                              <span>💳</span> CARD
                            </span>
                          )}
                          {!['UPI', 'COD', 'CARD', 'CARDS'].includes(method) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                              {method}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {payment.status === 'Completed' ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">Completed</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">Pending</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs font-medium text-slate-400">
                          {payment.date}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Farmer Settlements Table */}
        {activeTab === 'farmer' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                  <th className="px-5 py-4">Settlement ID</th>
                  <th className="px-5 py-4">Farmer Name</th>
                  <th className="px-5 py-4">Bank Account</th>
                  <th className="px-5 py-4">Gross Sales</th>
                  <th className="px-5 py-4">Commission (10%)</th>
                  <th className="px-5 py-4">Net Payout</th>
                  <th className="px-5 py-4">Settlement Status</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
                {farmerSettlements
                  .filter(s => {
                    if (!s) return false;
                    const sid = String(s.id || '').toLowerCase();
                    const farmer = String(s.farmerName || s.farmer?.ownerName || '').toLowerCase();
                    const query = String(search || '').toLowerCase();
                    return sid.includes(query) || farmer.includes(query);
                  })
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-800 text-xs">
                        {s.id}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {s.farmerName}
                      </td>

                      <td className="px-5 py-4 text-xs font-mono text-slate-500">
                        {s.account}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">
                        ₹{s.gross.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-rose-600 font-semibold">
                        -₹{s.commission.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 font-extrabold text-emerald-600 text-sm">
                        ₹{s.netPayout.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        {s.status === 'Settled' ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">Settled</span>
                        ) : s.status === 'Processing' ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600">Processing</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">Pending Payout</span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {s.status !== 'Settled' ? (
                          <button 
                            onClick={() => handleProcessSettlement(s.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            Pay Out
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminPayments;
