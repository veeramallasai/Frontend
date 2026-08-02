import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  MapPin,
  ChevronRight,
  Sprout,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const FarmerDashboard = () => {
  const { user } = useAuth();

  const statistics = [
    { label: 'Weekly Earnings', value: '₹14,520', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Orders Fulfilled', value: '38 Units', change: '+8.2%', icon: ShoppingBag, trend: 'up' },
    { label: 'Purity Rating', value: '98.6%', change: 'Excellent', icon: CheckCircle, trend: 'none' },
    { label: 'Active Crop Types', value: '4 Species', change: 'Stable', icon: Sprout, trend: 'none' },
  ];

  const recentActivity = [
    { id: 1, title: 'Harvest Audit Cleared', desc: 'Shimla apple batch passed pesticide residues check.', time: '2 hours ago', status: 'success' },
    { id: 2, title: 'Bank Settlement Processed', desc: '₹8,430 dispatched to State Bank account.', time: '1 day ago', status: 'info' },
    { id: 3, title: 'New Order Received', desc: 'Order #9021 for 15kg Organic Potatoes.', time: '2 days ago', status: 'alert' },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Hello, {user?.firstName || 'Farmer'}!
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Here is what's happening at your farm profile today.
          </p>
        </div>

        {user?.status === 'approved' && (
          <Button variant="gradient" size="sm" icon={Plus}>
            New Crop Listing
          </Button>
        )}
      </div>

      {/* Onboarding Callout for non-completed or pending farmers */}
      {!user?.farmCompleted && (
        <Card variant="gradient" className="flex flex-col sm:flex-row items-center gap-6 p-8">
          <div className="space-y-2 flex-1 text-left">
            <h3 className="text-lg font-bold text-slate-800">Complete Your Farm Portal Setup</h3>
            <p className="text-xs text-slate-600 leading-normal max-w-xl">
              To activate organic crop listings and start selling directly to consumers, you must upload documentation and configure your financial payout bank.
            </p>
          </div>
          <Link to="/farmer-registration" className="w-full sm:w-auto">
            <Button variant="primary" className="py-2.5 px-5 shadow-md">
              Start Onboarding
            </Button>
          </Link>
        </Card>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, i) => (
          <Card key={i} isHoverable className="bg-white relative p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <h4 className="text-2xl font-extrabold text-slate-800">{stat.value}</h4>
              </div>
              <div className="p-3 bg-slate-50 text-primary rounded-xl">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5 pt-4 text-xs font-semibold text-slate-500 border-t border-slate-50 mt-4">
              <span className={`inline-flex items-center gap-0.5 ${stat.trend === 'up' ? 'text-primary' : 'text-slate-400'}`}>
                {stat.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {stat.change}
              </span>
              <span>vs last week</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity Log */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-white border-0 shadow-premium p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider select-none">
              Recent Audits & Logs
            </h3>
            
            <div className="divide-y divide-slate-100">
              {recentActivity.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <div className={`p-2 rounded-xl mt-0.5
                    ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}
                  `}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-sm font-bold text-slate-700">{log.title}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Side Actions Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white p-6 shadow-premium">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider select-none">
              Helpful Tools
            </h3>
            <ul className="space-y-3.5">
              <li>
                <a href="#" className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-primary transition-colors py-2 px-3 hover:bg-slate-50 rounded-xl">
                  <span>Download Tax Receipts</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-primary transition-colors py-2 px-3 hover:bg-slate-50 rounded-xl">
                  <span>Quality Testing Guidelines</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-primary transition-colors py-2 px-3 hover:bg-slate-50 rounded-xl">
                  <span>Support / File Dispute</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
