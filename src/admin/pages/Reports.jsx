import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
  FileText,
  Printer,
  ShoppingBag,
  Users,
  UserCheck,
  Package,
  Truck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  DollarSign,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Eye,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [activeCategory, setActiveCategory] = useState('sales');
  const [activeSubReport, setActiveSubReport] = useState('Daily Sales');
  const [dateRange, setDateRange] = useState('This Month');

  // Sub-Reports Mapping per Category (All 39 Sub-Reports)
  const subReportMap = {
    sales: ['Daily Sales', 'Weekly Sales', 'Monthly Sales', 'Yearly Sales', 'Product-Wise Sales', 'Category-Wise Sales', 'Farmer-Wise Sales'],
    orders: ['Total Orders', 'Pending Orders', 'Delivered Orders', 'Cancelled Orders', 'Returned Orders', 'Refunded Orders'],
    customers: ['New Customers', 'Active Customers', 'Inactive Customers', 'Top Customers', 'Customer Order History'],
    farmers: ['Registered Farmers', 'Approved Farmers', 'Rejected Farmers', 'Farmer Sales', 'Farmer Revenue', 'Farmer Product Report'],
    products: ['Top-Selling Products', 'Low-Stock Products', 'Out-of-Stock Products', 'Most Viewed Products', 'Product Return Report'],
    delivery: ['Completed Deliveries', 'Pending Deliveries', 'Cancelled Deliveries', 'Delivery Partner Performance', 'Delivery Earnings'],
    payments: ['Online Payments', 'Cash-on-Delivery Payments', 'Successful Payments', 'Failed Payments', 'Refund Reports'],
  };

  // Explicit Complete Dataset for All 39 Sub-Reports
  const sampleReportData = {
    // 1. Sales Reports
    'Daily Sales': [
      { date: 'Jul 24, 2024', orders: 142, revenue: '$4,280.00', avgValue: '$30.14' },
      { date: 'Jul 23, 2024', orders: 128, revenue: '$3,850.00', avgValue: '$30.07' },
      { date: 'Jul 22, 2024', orders: 110, revenue: '$3,420.00', avgValue: '$31.09' },
      { date: 'Jul 21, 2024', orders: 155, revenue: '$4,920.00', avgValue: '$31.74' },
    ],
    'Weekly Sales': [
      { date: 'Week 4 (Jul 22 - Jul 28)', orders: 850, revenue: '$25,600.00', avgValue: '$30.11' },
      { date: 'Week 3 (Jul 15 - Jul 21)', orders: 790, revenue: '$23,400.00', avgValue: '$29.62' },
      { date: 'Week 2 (Jul 08 - Jul 14)', orders: 710, revenue: '$21,800.00', avgValue: '$30.70' },
    ],
    'Monthly Sales': [
      { date: 'July 2024', orders: '3,450', revenue: '$104,200.00', avgValue: '$30.20' },
      { date: 'June 2024', orders: '3,100', revenue: '$93,500.00', avgValue: '$30.16' },
      { date: 'May 2024', orders: '2,900', revenue: '$87,000.00', avgValue: '$30.00' },
    ],
    'Yearly Sales': [
      { date: 'Year 2024 (YTD)', orders: '22,400', revenue: '$682,000.00', avgValue: '$30.44' },
      { date: 'Year 2023', orders: '18,900', revenue: '$548,000.00', avgValue: '$28.99' },
    ],
    'Product-Wise Sales': [
      { product: 'Fresh Tomatoes', category: 'Vegetables', units: '1,250 kg', revenue: '$4,375.00' },
      { product: 'Organic Potatoes', category: 'Vegetables', units: '980 kg', revenue: '$2,646.00' },
      { product: 'Red Onions', category: 'Vegetables', units: '850 kg', revenue: '$1,700.00' },
      { product: 'Fresh Spinach', category: 'Leafy Vegetables', units: '620 bunch', revenue: '$948.60' },
    ],
    'Category-Wise Sales': [
      { category: 'Vegetables', orders: '1,850', revenue: '$45,200.00', share: '43.3%' },
      { category: 'Fruits', orders: 820, revenue: '$28,400.00', share: '27.2%' },
      { category: 'Dairy Products', orders: 450, revenue: '$18,900.00', share: '18.1%' },
      { category: 'Leafy Vegetables', orders: 330, revenue: '$11,700.00', share: '11.4%' },
    ],
    'Farmer-Wise Sales': [
      { farmer: 'Suresh Patil (Nashik)', productsCount: 14, orders: 850, grossRevenue: '$28,500.00' },
      { farmer: 'Rajesh Verma (Pune)', productsCount: 8, orders: 620, grossRevenue: '$19,800.00' },
      { farmer: 'Mohan Das (Satara)', productsCount: 6, orders: 410, grossRevenue: '$12,400.00' },
    ],

    // 2. Order Reports
    'Total Orders': [
      { id: '#ORD12345', customer: 'Ramesh Kumar', amount: '$45.00', status: 'Delivered', date: 'Jul 24, 2024' },
      { id: '#ORD12346', customer: 'Ananya Sharma', amount: '$67.50', status: 'Processing', date: 'Jul 24, 2024' },
      { id: '#ORD12347', customer: 'Vikram Singh', amount: '$32.00', status: 'Shipped', date: 'Jul 23, 2024' },
    ],
    'Pending Orders': [
      { id: '#ORD12348', customer: 'Siddharth Roy', amount: '$42.50', status: 'Pending', date: 'Jul 24, 2024' },
    ],
    'Delivered Orders': [
      { id: '#ORD12345', customer: 'Ramesh Kumar', amount: '$45.00', status: 'Delivered', date: 'Jul 24, 2024' },
      { id: '#ORD12200', customer: 'Ramesh Kumar', amount: '$85.00', status: 'Delivered', date: 'Jul 10, 2024' },
    ],
    'Cancelled Orders': [
      { id: '#ORD12111', customer: 'Deepak Thorat', amount: '$28.00', status: 'Cancelled', date: 'Jul 19, 2024' },
    ],
    'Returned Orders': [
      { id: '#ORD12090', customer: 'Kavita Reddy', amount: '$35.00', status: 'Returned', date: 'Jul 18, 2024' },
    ],
    'Refunded Orders': [
      { id: '#ORD12090', customer: 'Kavita Reddy', amount: '$35.00', status: 'Refunded', date: 'Jul 19, 2024' },
    ],

    // 3. Customer Reports
    'New Customers': [
      { name: 'Ramesh Kumar', email: 'ramesh@example.com', registered: 'Jul 24, 2024', status: 'Active' },
      { name: 'Ananya Sharma', email: 'ananya@example.com', registered: 'Jul 23, 2024', status: 'Active' },
    ],
    'Active Customers': [
      { name: 'Ramesh Kumar', ordersCount: 12, totalSpent: '$450.00', status: 'Active' },
      { name: 'Ananya Sharma', ordersCount: 5, totalSpent: '$185.00', status: 'Active' },
    ],
    'Inactive Customers': [
      { name: 'Vikram Singh', ordersCount: 8, totalSpent: '$320.00', status: 'Inactive' },
    ],
    'Top Customers': [
      { name: 'Priya Patel', ordersCount: 15, totalSpent: '$620.00', status: 'Blocked' },
      { name: 'Ramesh Kumar', ordersCount: 12, totalSpent: '$450.00', status: 'Active' },
    ],
    'Customer Order History': [
      { customer: 'Ramesh Kumar', orderId: '#ORD12345', amount: '$45.00', date: 'Jul 24, 2024' },
      { customer: 'Ramesh Kumar', orderId: '#ORD12200', amount: '$85.00', date: 'Jul 10, 2024' },
    ],

    // 4. Farmer Reports
    'Registered Farmers': [
      { farmer: 'Suresh Patil', location: 'Nashik, MH', crops: 'Vegetables', registered: 'Jul 24, 2024' },
      { farmer: 'Rajesh Verma', location: 'Pune, MH', crops: 'Tubers & Grains', registered: 'Jul 23, 2024' },
    ],
    'Approved Farmers': [
      { farmer: 'Suresh Patil', location: 'Nashik, MH', status: 'Approved', products: 14 },
    ],
    'Rejected Farmers': [
      { farmer: 'Baldev Singh', location: 'Ludhiana, PB', status: 'Rejected', reason: 'Invalid Land Document' },
    ],
    'Farmer Sales': [
      { farmer: 'Suresh Patil', unitsSold: '2,400 kg', revenue: '$28,500.00', orders: 850 },
    ],
    'Farmer Revenue': [
      { farmer: 'Suresh Patil', netPayout: '$27,075.00', commission: '$1,425.00', totalSales: '$28,500.00' },
    ],
    'Farmer Product Report': [
      { farmer: 'Suresh Patil', product: 'Fresh Tomatoes', stock: '250 kg', status: 'Active' },
      { farmer: 'Suresh Patil', product: 'Fresh Spinach', stock: '0 bunch', status: 'Out of Stock' },
    ],

    // 5. Product Reports
    'Top-Selling Products': [
      { name: 'Fresh Tomatoes', category: 'Vegetables', unitsSold: '1,250 kg', revenue: '$4,375.00' },
      { name: 'Organic Potatoes', category: 'Vegetables', unitsSold: '980 kg', revenue: '$2,646.00' },
    ],
    'Low-Stock Products': [
      { name: 'Red Onions', category: 'Vegetables', stock: '8 kg', status: 'Low Stock' },
    ],
    'Out-of-Stock Products': [
      { name: 'Fresh Spinach', category: 'Leafy Vegetables', stock: '0 bunch', status: 'Out of Stock' },
    ],
    'Most Viewed Products': [
      { name: 'Fresh Organic Tomatoes', views: '5,420 Views', conversion: '23.0%' },
      { name: 'A2 Cow Ghee', views: '3,890 Views', conversion: '18.5%' },
    ],
    'Product Return Report': [
      { name: 'Green Apples', returnCount: 3, reason: 'Bruised in Transit', refundAmount: '$32.00' },
    ],

    // 6. Delivery Reports
    'Completed Deliveries': [
      { id: '#ORD12345', driver: 'Raju Sharma', time: '28 Mins', status: 'Completed' },
    ],
    'Pending Deliveries': [
      { id: '#ORD12346', driver: 'Vikram Joshi', time: 'En Route', status: 'Pending' },
    ],
    'Cancelled Deliveries': [
      { id: '#ORD12111', driver: 'Deepak Thorat', reason: 'Customer Cancelled', status: 'Cancelled' },
    ],
    'Delivery Partner Performance': [
      { driver: 'Raju Sharma', vehicle: 'Electric Van', completed: 142, rating: '4.9 ⭐', status: 'Available' },
      { driver: 'Anil Deshmukh', vehicle: 'Auto Rickshaw', completed: 210, rating: '4.8 ⭐', status: 'Busy' },
    ],
    'Delivery Earnings': [
      { driver: 'Raju Sharma', deliveries: 142, basePay: '$710.00', tips: '$142.00', totalPayout: '$852.00' },
    ],

    // 7. Payment Reports
    'Online Payments': [
      { gateway: 'Razorpay UPI', count: '2,150', volume: '$68,400.00', successRate: '99.2%' },
      { gateway: 'Razorpay Cards', count: 980, volume: '$31,200.00', successRate: '98.5%' },
    ],
    'Cash-on-Delivery Payments': [
      { method: 'Cash on Delivery (COD)', count: 320, volume: '$4,600.00', collected: '100%' },
    ],
    'Successful Payments': [
      { id: '#PAY-901', customer: 'Ramesh Kumar', method: 'Razorpay UPI', amount: '$45.00', status: 'Paid' },
    ],
    'Failed Payments': [
      { id: '#PAY-880', customer: 'Deepak Thorat', method: 'Card Failed', amount: '$28.00', status: 'Failed' },
    ],
    'Refund Reports': [
      { id: '#REF-301', customer: 'Kavita Reddy', orderId: '#ORD12090', refundAmount: '$35.00', status: 'Processed' },
    ]
  };

  // Switch Category Tab
  const handleCategorySwitch = (catKey) => {
    setActiveCategory(catKey);
    setActiveSubReport(subReportMap[catKey][0]);
  };

  // 4 Export Actions
  const handleExportCSV = () => {
    try {
      const data = sampleReportData[activeSubReport] || [];
      if (!data || data.length === 0) {
        toast.error('No data available to export.');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [];
      
      // Header line
      csvRows.push(headers.map(h => `"${h.replace(/([A-Z])/g, ' $1')}"`).join(','));

      // Data rows
      data.forEach(row => {
        const values = headers.map(header => {
          const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvString = csvRows.join('\r\n');
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${activeSubReport.replace(/[^a-zA-Z0-9]/g, '_')}_${dateRange.replace(/\s+/g, '_')}.csv`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error('CSV Export Error:', err);
      toast.error('Failed to export CSV file.');
    }
  };

  const handleExportExcel = () => {
    try {
      const data = sampleReportData[activeSubReport] || [];
      if (!data || data.length === 0) {
        toast.error('No data available to export.');
        return;
      }

      const headers = Object.keys(data[0]);
      
      let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <!--[if gte mso 9]>
          <xml>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </xml>
          <![endif]-->
          <style>
            th { background-color: #0C3E26; color: #FFFFFF; font-weight: bold; text-align: left; }
            td, th { padding: 8px 12px; border: 1px solid #CBD5E1; }
          </style>
        </head>
        <body>
          <h2>Farm2Home Analytics - ${activeSubReport} (${dateRange})</h2>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1')}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(h => `<td>${row[h] !== undefined ? row[h] : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${activeSubReport.replace(/[^a-zA-Z0-9]/g, '_')}_${dateRange.replace(/\s+/g, '_')}.xls`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      toast.error('Failed to export Excel spreadsheet.');
    }
  };

  const handleExportPDF = () => {
    try {
      const data = sampleReportData[activeSubReport] || [];
      const headers = data.length > 0 ? Object.keys(data[0]) : [];

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked! Please allow pop-ups to export PDF.');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${activeSubReport} Report - Farm2Home</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0F172A; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #16A34A; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 800; color: #0C3E26; }
            .meta { font-size: 13px; color: #64748B; text-align: right; }
            .title { font-size: 18px; font-weight: 800; margin-bottom: 16px; color: #1E293B; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background-color: #0C3E26; color: #FFFFFF; font-weight: 700; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; }
            td { padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #334155; }
            tr:nth-child(even) { background-color: #F8FAFC; }
            .footer { margin-top: 30px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">🌾 FARM TO HOME</div>
            <div class="meta">
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Filter:</strong> ${dateRange}</div>
            </div>
          </div>

          <div class="title">📊 ${activeSubReport} Report Summary</div>

          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1')}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(h => `<td>${row[h] !== undefined ? row[h] : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Farm2Home Platform Report • Confidential Internal Document
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success(`Opening PDF preview for ${activeSubReport}...`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error('Failed to generate PDF document.');
    }
  };

  const handlePrintReport = () => {
    handleExportPDF();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar & 4 Export Option Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Analytics & Platform Reports</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Comprehensive sales performance, order metrics, customer analytics, farmer revenues, and delivery logs.
          </p>
        </div>

        {/* 4 EXPORT OPTIONS BUTTONS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
            }}
          >
            <FileText size={15} /> Download PDF
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
            }}
          >
            <FileSpreadsheet size={15} /> Download Excel
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Download size={15} /> Download CSV
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrintReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* 7 MAIN REPORT CATEGORIES TABS */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '14px', border: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
        {[
          { id: 'sales', name: 'Sales Reports', icon: TrendingUp },
          { id: 'orders', name: 'Order Reports', icon: ShoppingBag },
          { id: 'customers', name: 'Customer Reports', icon: Users },
          { id: 'farmers', name: 'Farmer Reports', icon: UserCheck },
          { id: 'products', name: 'Product Reports', icon: Package },
          { id: 'delivery', name: 'Delivery Reports', icon: Truck },
          { id: 'payments', name: 'Payment Reports', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategorySwitch(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#0C3E26' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#22C55E' : '#64748B'} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* SUB-REPORTS SELECTOR PILLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={14} /> Sub-Reports ({subReportMap[activeCategory].length}):
        </span>
        {subReportMap[activeCategory].map((sub) => {
          const isSelected = activeSubReport === sub;
          return (
            <button
              key={sub}
              onClick={() => setActiveSubReport(sub)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: isSelected ? '1px solid #16A34A' : '1px solid #CBD5E1',
                backgroundColor: isSelected ? '#DCFCE7' : '#FFFFFF',
                color: isSelected ? '#15803D' : '#475569',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* ACTIVE REPORT METRICS CARD */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="admin-card-title" style={{ fontSize: '17px', color: '#0F172A' }}>
              📊 {activeSubReport} Summary
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Category: {activeCategory.toUpperCase()} • Filter: {dateRange}</span>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', backgroundColor: '#FFFFFF' }}
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Year 2024">Year 2024</option>
          </select>
        </div>

        {/* Dynamic Table for Active Sub-Report */}
        <div className="admin-table-container" style={{ marginTop: '16px' }}>
          <table className="admin-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                {/* Dynamic Columns Based on Active Sub-Report */}
                {sampleReportData[activeSubReport] && sampleReportData[activeSubReport].length > 0 ? (
                  Object.keys(sampleReportData[activeSubReport][0]).map((key) => (
                    <th key={key} style={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))
                ) : (
                  <>
                    <th>Metric Name</th>
                    <th>Value</th>
                    <th>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sampleReportData[activeSubReport] && sampleReportData[activeSubReport].length > 0 ? (
                sampleReportData[activeSubReport].map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([key, val], cellIdx) => {
                      const isMoney = typeof val === 'string' && val.startsWith('$');
                      const isStatus = key === 'status';
                      return (
                        <td key={cellIdx}>
                          {isStatus ? (
                            <span style={{ backgroundColor: val === 'Active' || val === 'Delivered' || val === 'Approved' || val === 'Paid' || val === 'Completed' ? '#DCFCE7' : val === 'Pending' || val === 'Low Stock' ? '#FEF3C7' : '#FEE2E2', color: val === 'Active' || val === 'Delivered' || val === 'Approved' || val === 'Paid' || val === 'Completed' ? '#15803D' : val === 'Pending' || val === 'Low Stock' ? '#D97706' : '#DC2626', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                              {val}
                            </span>
                          ) : isMoney ? (
                            <span style={{ fontWeight: 800, color: '#15803D' }}>{val}</span>
                          ) : (
                            <span style={{ fontWeight: cellIdx === 0 ? 700 : 500, color: cellIdx === 0 ? '#0F172A' : '#475569' }}>
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    Metrics breakdown data for <strong>"{activeSubReport}"</strong> in {dateRange}. Total entries: 142.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
