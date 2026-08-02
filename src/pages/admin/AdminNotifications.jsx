import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Send, 
  Search, 
  ChevronRight, 
  Smartphone, 
  CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const initialNotificationLogs = [
  {
    id: 'NOTIF-101',
    type: 'In-App Alert',
    notifCategory: 'New Offers',
    recipient: 'All Customers',
    title: '🌿 Fresh Harvest Flash Sale!',
    message: 'Get 20% OFF on all organic leafy vegetables today using code FARM20.',
    sentAt: '29 May 2026, 10:00 AM',
    status: 'Delivered',
    deliveredCount: '1,420 users'
  },
  {
    id: 'MAIL-201',
    type: 'Email',
    notifCategory: 'Order Updates',
    recipient: 'All Farmers',
    title: 'Weekly Farm Payout Statement Issued',
    message: 'Your weekly sales payout statement has been generated and credited to your account.',
    sentAt: '28 May 2026, 05:30 PM',
    status: 'Delivered',
    deliveredCount: '85 farmers'
  },
  {
    id: 'SMS-301',
    type: 'SMS',
    notifCategory: 'Delivery Updates',
    recipient: 'Customer (+91 98765 43210)',
    title: 'Order Dispatch Alert',
    message: 'Your Farm2Home Order #ORD-1234 is out for delivery with partner Suresh Reddy.',
    sentAt: '29 May 2026, 11:15 AM',
    status: 'Delivered',
    deliveredCount: '1 recipient'
  },
  {
    id: 'NOTIF-102',
    type: 'In-App Alert',
    notifCategory: 'Seasonal Promotions',
    recipient: 'All Customers',
    title: '🍎 Seasonal Fruits Arrived',
    message: 'Farm fresh mangoes and apples now available directly from hill farms.',
    sentAt: '27 May 2026, 09:00 AM',
    status: 'Delivered',
    deliveredCount: '1,280 users'
  }
];

const AdminNotifications = () => {
  const [logs, setLogs] = useState(initialNotificationLogs);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal States
  const [modalType, setModalType] = useState(null); // 'notif' | 'email' | 'sms'
  
  const [notifForm, setNotifForm] = useState({
    target: 'All Customers',
    category: 'New Offers',
    title: '',
    message: ''
  });

  const [emailForm, setEmailForm] = useState({
    recipient: 'All Registered Users',
    category: 'Order Updates',
    subject: '',
    body: ''
  });

  const [smsForm, setSmsForm] = useState({
    phone: '',
    category: 'Delivery Updates',
    message: ''
  });

  const filteredLogs = logs.filter(item => {
    if (!item) return false;
    const title = String(item.title || '').toLowerCase();
    const recipient = String(item.recipient || item.user?.fullName || '').toLowerCase();
    const message = String(item.message || item.body || '').toLowerCase();
    const query = String(search || '').toLowerCase();

    const matchesSearch = title.includes(query) || recipient.includes(query) || message.includes(query);
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesCategory = filterCategory === 'All' || item.notifCategory === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;

    const newLog = {
      id: `NOTIF-${100 + logs.length + 1}`,
      type: 'In-App Alert',
      notifCategory: notifForm.category,
      recipient: notifForm.target,
      title: notifForm.title,
      message: notifForm.message,
      sentAt: 'Just now',
      status: 'Delivered',
      deliveredCount: notifForm.target === 'All Customers' ? '1,500+ users' : '1 recipient'
    };

    setLogs(prev => [newLog, ...prev]);
    toast.success(`In-App Notification broadcasted to ${notifForm.target}!`);
    handleCloseModal();
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!emailForm.subject || !emailForm.body) return;

    const newLog = {
      id: `MAIL-${200 + logs.length + 1}`,
      type: 'Email',
      notifCategory: emailForm.category,
      recipient: emailForm.recipient,
      title: emailForm.subject,
      message: emailForm.body,
      sentAt: 'Just now',
      status: 'Delivered',
      deliveredCount: 'Email Sent'
    };

    setLogs(prev => [newLog, ...prev]);
    toast.success(`Email campaign "${emailForm.subject}" sent successfully!`);
    handleCloseModal();
  };

  const handleSendSMS = (e) => {
    e.preventDefault();
    if (!smsForm.phone || !smsForm.message) return;

    const newLog = {
      id: `SMS-${300 + logs.length + 1}`,
      type: 'SMS',
      notifCategory: smsForm.category,
      recipient: `Customer (${smsForm.phone})`,
      title: 'SMS Alert',
      message: smsForm.message,
      sentAt: 'Just now',
      status: 'Delivered',
      deliveredCount: '1 recipient'
    };

    setLogs(prev => [newLog, ...prev]);
    toast.success(`SMS alert sent to ${smsForm.phone}!`);
    handleCloseModal();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Notifications Center</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Broadcast alerts, send emails, and SMS notifications to customers and farmers.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              setNotifForm({ target: 'All Customers', category: 'New Offers', title: '', message: '' });
              setModalType('notif');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span>Send Notification</span>
          </button>

          <button 
            onClick={() => {
              setEmailForm({ recipient: 'All Registered Users', category: 'Order Updates', subject: '', body: '' });
              setModalType('email');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </button>

          <button 
            onClick={() => {
              setSmsForm({ phone: '', category: 'Delivery Updates', message: '' });
              setModalType('sms');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">1,420</h3>
            <p className="text-xs font-semibold text-slate-500">In-App Broadcasts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">890</h3>
            <p className="text-xs font-semibold text-slate-500">Emails Sent</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">350</h3>
            <p className="text-xs font-semibold text-slate-500">SMS Sent</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">99.4%</h3>
            <p className="text-xs font-semibold text-slate-500">Avg Delivery Rate</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">Notification History & Logs</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notification title..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-64 font-medium"
              />
            </div>

            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Channels</option>
              <option value="In-App Alert">In-App Alert</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
            </select>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Types</option>
              <option value="New Offers">New Offers</option>
              <option value="Order Updates">Order Updates</option>
              <option value="Delivery Updates">Delivery Updates</option>
              <option value="Seasonal Promotions">Seasonal Promotions</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Log ID</th>
                <th className="px-5 py-4">Channel</th>
                <th className="px-5 py-4">Notification Type</th>
                <th className="px-5 py-4">Recipient Target</th>
                <th className="px-5 py-4">Title / Subject</th>
                <th className="px-5 py-4">Message Preview</th>
                <th className="px-5 py-4">Sent At</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredLogs.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-bold text-emerald-600 text-xs">
                    #{item.id}
                  </td>

                  <td className="px-5 py-4">
                    {item.type === 'In-App Alert' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">
                        🔔 In-App Alert
                      </span>
                    )}
                    {item.type === 'Email' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600">
                        ✉ Email
                      </span>
                    )}
                    {item.type === 'SMS' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-600">
                        📱 SMS
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 font-bold">
                    {item.notifCategory === 'New Offers' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700">🏷️ New Offers</span>
                    )}
                    {item.notifCategory === 'Order Updates' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700">🛒 Order Updates</span>
                    )}
                    {item.notifCategory === 'Delivery Updates' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700">🚚 Delivery Updates</span>
                    )}
                    {item.notifCategory === 'Seasonal Promotions' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700">🍉 Seasonal Promotions</span>
                    )}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-800">
                    {item.recipient}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-800">
                    {item.title}
                  </td>

                  <td className="px-5 py-4 text-xs font-medium text-slate-500 line-clamp-1 max-w-xs">
                    {item.message}
                  </td>

                  <td className="px-5 py-4 text-xs font-medium text-slate-400">
                    {item.sentAt}
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">
                      {item.status} ({item.deliveredCount})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Notification Modal */}
      {modalType === 'notif' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                Send In-App Notification
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience *</label>
                  <select 
                    value={notifForm.target}
                    onChange={(e) => setNotifForm(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="All Farmers">All Farmers</option>
                    <option value="All Users">All Platform Users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Type *</label>
                  <select 
                    value={notifForm.category}
                    onChange={(e) => setNotifForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="New Offers">New Offers</option>
                    <option value="Order Updates">Order Updates</option>
                    <option value="Delivery Updates">Delivery Updates</option>
                    <option value="Seasonal Promotions">Seasonal Promotions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Title *</label>
                <input 
                  type="text" 
                  value={notifForm.title}
                  onChange={(e) => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. 🌿 Weekend Special Harvest Sale!"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message Body *</label>
                <textarea 
                  value={notifForm.message}
                  onChange={(e) => setNotifForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter the alert message to display to users..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {modalType === 'email' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Compose Email Campaign
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient List *</label>
                  <select 
                    value={emailForm.recipient}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, recipient: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-blue-500"
                  >
                    <option value="All Registered Users">All Registered Users</option>
                    <option value="All Farmers">All Registered Farmers</option>
                    <option value="VIP Customers">VIP Customers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Type *</label>
                  <select 
                    value={emailForm.category}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-blue-500"
                  >
                    <option value="New Offers">New Offers</option>
                    <option value="Order Updates">Order Updates</option>
                    <option value="Delivery Updates">Delivery Updates</option>
                    <option value="Seasonal Promotions">Seasonal Promotions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Subject *</label>
                <input 
                  type="text" 
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Your Weekly Farm2Home Market Update"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Content / Message *</label>
                <textarea 
                  value={emailForm.body}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Compose your email newsletter or announcement..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send SMS Modal */}
      {modalType === 'sms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Send Instant SMS Alert
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSendSMS} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Mobile *</label>
                  <input 
                    type="text" 
                    value={smsForm.phone}
                    onChange={(e) => setSmsForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Type *</label>
                  <select 
                    value={smsForm.category}
                    onChange={(e) => setSmsForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-purple-500"
                  >
                    <option value="New Offers">New Offers</option>
                    <option value="Order Updates">Order Updates</option>
                    <option value="Delivery Updates">Delivery Updates</option>
                    <option value="Seasonal Promotions">Seasonal Promotions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">SMS Message Text *</label>
                <textarea 
                  value={smsForm.message}
                  onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter short SMS text (Max 160 characters)..."
                  rows={3}
                  maxLength={160}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-purple-500 resize-none"
                  required
                />
                <span className="text-[11px] text-slate-400 font-medium float-right mt-1">
                  {smsForm.message.length}/160 characters
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNotifications;
