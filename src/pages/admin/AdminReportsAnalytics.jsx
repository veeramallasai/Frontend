import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Download, 
  ChevronRight, 
  IndianRupee, 
  Users, 
  UserCheck, 
  Package, 
  PieChart,
  ArrowUpRight,
  Sparkles,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReportsAnalytics = () => {
  const [activeReportTab, setActiveReportTab] = useState('daily');
  const [timeRange, setTimeRange] = useState('This Month');

  const reportTabs = [
    { id: 'daily', name: 'Daily Sales', icon: Calendar },
    { id: 'weekly', name: 'Weekly Sales', icon: TrendingUp },
    { id: 'monthly', name: 'Monthly Sales', icon: BarChart2 },
    { id: 'farmer', name: 'Farmer Performance', icon: UserCheck },
    { id: 'customer', name: 'Customer Growth', icon: Users },
    { id: 'product', name: 'Product Sales', icon: Package },
    { id: 'revenue', name: 'Revenue Report', icon: IndianRupee },
  ];

  const handleExportReport = (reportTitle = 'Executive Analytics Report') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FarmToHome – Business Analytics Report (${timeRange})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 40px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2.5px solid #059669; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #059669 0%, #0284c7 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; font-weight: 800; }
    .brand-name { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 600; }
    .header-right { text-align: right; }
    .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; }
    .doc-meta { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500; }

    .period-badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #047857; border-radius: 20px; font-weight: 800; font-size: 11px; margin-top: 6px; border: 1px solid #a7f3d0; }

    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .summary-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .summary-value { font-size: 20px; font-weight: 800; color: #0f172a; }
    .summary-card.green .summary-value { color: #059669; }
    .summary-card.blue .summary-value { color: #2563eb; }
    .summary-card.purple .summary-value { color: #7c3aed; }
    .summary-card.amber .summary-value { color: #d97706; }

    .section { margin-bottom: 32px; }
    .section-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1.5px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    thead tr { background: #f1f5f9; }
    th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11.5px; font-weight: 500; color: #334155; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    td.amount { font-weight: 800; color: #0f172a; }
    td.positive { color: #059669 !important; font-weight: 800; }
    td.purple { color: #7c3aed !important; font-weight: 800; }

    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
    .badge-in-stock { background: #d1fae5; color: #065f46; }

    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; }

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
      <div class="brand-icon">🌱</div>
      <div>
        <div class="brand-name">FarmToHome</div>
        <div class="brand-sub">Direct Farm Produce Platform & Executive Intelligence</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">${reportTitle}</div>
      <div class="period-badge">Selected Filter: ${timeRange}</div>
      <div class="doc-meta">Generated: ${dateStr} at ${timeStr}</div>
      <div class="doc-meta" style="color:#059669;font-weight:700;margin-top:2px;">CONFIDENTIAL — OFFICIAL PDF REPORT</div>
    </div>
  </div>

  <!-- Key Metrics Summary Cards -->
  <div class="summary-grid">
    <div class="summary-card green">
      <div class="summary-label">Total Sales Revenue</div>
      <div class="summary-value">₹3,42,000</div>
    </div>
    <div class="summary-card blue">
      <div class="summary-label">Completed Orders</div>
      <div class="summary-value">460 Orders</div>
    </div>
    <div class="summary-card amber">
      <div class="summary-label">Farmer Disbursements (90%)</div>
      <div class="summary-value">₹3,07,800</div>
    </div>
    <div class="summary-card purple">
      <div class="summary-label">Platform Earnings (10%)</div>
      <div class="summary-value">₹34,200</div>
    </div>
  </div>

  <!-- Top Performing Farmers Table -->
  <div class="section">
    <div class="section-title">
      <span>Farmer Performance & Harvest Yield</span>
      <span style="font-size:11px;color:#64748b;font-weight:600;">Active Producers: 5</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Farmer Name</th>
          <th>Location</th>
          <th>Harvest Sold</th>
          <th>Gross Revenue</th>
          <th>Net Payout (90%)</th>
          <th>Customer Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Gurpreet Singh</strong></td>
          <td>Sangrur, Punjab</td>
          <td class="purple">850 kg</td>
          <td class="amount">₹42,500</td>
          <td class="positive">₹38,250</td>
          <td>⭐ 4.9</td>
        </tr>
        <tr>
          <td><strong>Srinivas Reddy</strong></td>
          <td>Ranga Reddy, TS</td>
          <td class="purple">620 kg</td>
          <td class="amount">₹34,100</td>
          <td class="positive">₹30,690</td>
          <td>⭐ 4.8</td>
        </tr>
        <tr>
          <td><strong>Rajesh Patil</strong></td>
          <td>Nashik, Maharashtra</td>
          <td class="purple">540 kg</td>
          <td class="amount">₹29,700</td>
          <td class="positive">₹26,730</td>
          <td>⭐ 4.7</td>
        </tr>
        <tr>
          <td><strong>Ramesh Verma</strong></td>
          <td>Meerut, Uttar Pradesh</td>
          <td class="purple">410 kg</td>
          <td class="amount">₹22,550</td>
          <td class="positive">₹20,295</td>
          <td>⭐ 4.6</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Best Selling Products Table -->
  <div class="section">
    <div class="section-title">
      <span>Top Selling Produce & Market Demand</span>
      <span style="font-size:11px;color:#64748b;font-weight:600;">Leading Category: Organic Greens</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Category</th>
          <th>Volume Sold</th>
          <th>Total Revenue</th>
          <th>Stock Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Organic Spinach (Palak)</strong></td>
          <td>Leafy Vegetables</td>
          <td class="purple">1,240 kg</td>
          <td class="positive">₹55,800</td>
          <td><span class="badge badge-in-stock">In Stock</span></td>
        </tr>
        <tr>
          <td><strong>Fresh Coriander (Kothmir)</strong></td>
          <td>Herbs & Spices</td>
          <td class="purple">980 kg</td>
          <td class="positive">₹39,200</td>
          <td><span class="badge badge-in-stock">In Stock</span></td>
        </tr>
        <tr>
          <td><strong>Farm Fresh Tomatoes</strong></td>
          <td>Vegetables</td>
          <td class="purple">860 kg</td>
          <td class="positive">₹34,400</td>
          <td><span class="badge badge-in-stock">In Stock</span></td>
        </tr>
        <tr>
          <td><strong>Organic Mint (Pudina)</strong></td>
          <td>Herbs & Spices</td>
          <td class="purple">720 kg</td>
          <td class="positive">₹28,800</td>
          <td><span class="badge badge-in-stock">In Stock</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>FarmToHome Admin Portal &bull; Generated via Business Intelligence Module</div>
    <div>Report Date: ${dateStr} &bull; Time Range: ${timeRange}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=950,height=750');
    if (!win) {
      toast.error('Popup blocked! Please allow pop-ups for this site to export PDF.');
      return;
    }
    win.document.write(html);
    win.document.close();
    toast.success(`Exporting "${reportTitle}" in PDF format (${timeRange})... Click Save as PDF!`);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Reports & Analytics</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Comprehensive business intelligence, sales reports, and performance analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-slate-200 rounded-xl text-xs font-bold py-2.5 px-3.5 outline-none focus:border-emerald-500 bg-white text-slate-700 shadow-xs cursor-pointer"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>

          <button 
            onClick={() => handleExportReport('Executive Business Analytics Report')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 7 Report Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {reportTabs.map(tab => {
          const IconComp = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Report 1: Daily Sales */}
      {activeReportTab === 'daily' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Today's Total Sales</span>
              <h3 className="text-3xl font-black text-slate-800">₹12,850</h3>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs yesterday
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Orders Completed Today</span>
              <h3 className="text-3xl font-black text-slate-800">18 Orders</h3>
              <p className="text-xs text-slate-500 font-semibold">100% On-time delivery rate</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Average Order Value</span>
              <h3 className="text-3xl font-black text-slate-800">₹713</h3>
              <p className="text-xs text-purple-600 font-bold">Top category: Leafy Greens</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Hourly Sales Breakdown (Today)</h3>
            <div className="h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                <path d="M0,100 Q60,40 120,70 T240,30 T360,60 T500,10 L500,120 L0,120 Z" fill="#ecfdf5" />
                <path d="M0,100 Q60,40 120,70 T240,30 T360,60 T500,10" fill="none" stroke="#10b981" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Weekly Sales */}
      {activeReportTab === 'weekly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Weekly Sales Revenue</span>
              <h3 className="text-3xl font-black text-slate-800">₹84,500</h3>
              <p className="text-xs text-emerald-600 font-bold">+18.5% weekly growth</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Weekly Orders Placed</span>
              <h3 className="text-3xl font-black text-slate-800">114 Orders</h3>
              <p className="text-xs text-slate-500 font-semibold">96% fulfillment accuracy</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Weekly Farmer Payouts</span>
              <h3 className="text-3xl font-black text-slate-800">₹67,600</h3>
              <p className="text-xs text-emerald-600 font-bold">100% Settled</p>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Monthly Sales */}
      {activeReportTab === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Monthly Sales Revenue</span>
              <h3 className="text-3xl font-black text-slate-800">₹3,42,000</h3>
              <p className="text-xs text-emerald-600 font-bold">+24.8% YoY Growth</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Monthly Orders</span>
              <h3 className="text-3xl font-black text-slate-800">460 Orders</h3>
              <p className="text-xs text-slate-500 font-semibold">High repeat order volume</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Platform Commission (10%)</span>
              <h3 className="text-3xl font-black text-slate-800">₹34,200</h3>
              <p className="text-xs text-purple-600 font-bold">Net platform income</p>
            </div>
          </div>
        </div>
      )}

      {/* Report 4: Farmer Performance */}
      {activeReportTab === 'farmer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-800">Top Performing Farmers & Yield</h2>
            <button onClick={() => handleExportReport('Farmer Performance')} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-3.5">Farmer Name</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Total Harvest Sold</th>
                <th className="px-5 py-3.5">Gross Revenue</th>
                <th className="px-5 py-3.5">Net Payout</th>
                <th className="px-5 py-3.5">Rating</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              <tr>
                <td className="px-5 py-3.5 font-bold text-slate-800">Gurpreet Singh</td>
                <td className="px-5 py-3.5">Sangrur, Punjab</td>
                <td className="px-5 py-3.5 text-purple-600 font-bold">850 kg</td>
                <td className="px-5 py-3.5 font-bold text-slate-800">₹42,500</td>
                <td className="px-5 py-3.5 font-bold text-emerald-600">₹38,250</td>
                <td className="px-5 py-3.5 font-bold text-amber-500">⭐ 4.9</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-bold text-slate-800">Srinivas Reddy</td>
                <td className="px-5 py-3.5">Ranga Reddy, TS</td>
                <td className="px-5 py-3.5 text-purple-600 font-bold">620 kg</td>
                <td className="px-5 py-3.5 font-bold text-slate-800">₹34,100</td>
                <td className="px-5 py-3.5 font-bold text-emerald-600">₹30,690</td>
                <td className="px-5 py-3.5 font-bold text-amber-500">⭐ 4.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Report 5: Customer Growth */}
      {activeReportTab === 'customer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">New Customer Signups</span>
              <h3 className="text-3xl font-black text-slate-800">+145 Users</h3>
              <p className="text-xs text-emerald-600 font-bold">+22% monthly growth</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Customer Retention</span>
              <h3 className="text-3xl font-black text-slate-800">85.4%</h3>
              <p className="text-xs text-purple-600 font-bold">Repeat buyers rate</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Active VIP Loyalty Members</span>
              <h3 className="text-3xl font-black text-slate-800">145 VIPs</h3>
              <p className="text-xs text-slate-500 font-semibold">High frequency buyers</p>
            </div>
          </div>
        </div>
      )}

      {/* Report 6: Product Sales */}
      {activeReportTab === 'product' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-800">Best Selling Products & Demand</h2>
            <button onClick={() => handleExportReport('Product Sales')} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Volume Sold (kg)</th>
                <th className="px-5 py-3.5">Total Sales Revenue</th>
                <th className="px-5 py-3.5">Stock Status</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              <tr>
                <td className="px-5 py-3.5 font-bold text-slate-800">Organic Spinach (Palak)</td>
                <td className="px-5 py-3.5">Leafy Vegetables</td>
                <td className="px-5 py-3.5 text-purple-600 font-bold">1,240 kg</td>
                <td className="px-5 py-3.5 font-bold text-emerald-600">₹55,800</td>
                <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded">In Stock</span></td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-bold text-slate-800">Fresh Coriander (Kothmir)</td>
                <td className="px-5 py-3.5">Herbs & Spices</td>
                <td className="px-5 py-3.5 text-purple-600 font-bold">980 kg</td>
                <td className="px-5 py-3.5 font-bold text-emerald-600">₹39,200</td>
                <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded">In Stock</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Report 7: Revenue Report */}
      {activeReportTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
              <h3 className="text-3xl font-black text-slate-800">₹3,42,000</h3>
              <p className="text-xs text-emerald-600 font-bold">+24.8% Monthly increase</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Farmer Disbursements</span>
              <h3 className="text-3xl font-black text-slate-800">₹3,07,800</h3>
              <p className="text-xs text-slate-500 font-semibold">90% paid to producers</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Net Platform Earnings</span>
              <h3 className="text-3xl font-black text-slate-800">₹34,200</h3>
              <p className="text-xs text-purple-600 font-bold">10% Platform fee</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReportsAnalytics;
