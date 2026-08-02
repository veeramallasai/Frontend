import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Sprout, 
  CreditCard, 
  Check, 
  X, 
  Eye, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminPending = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState('Verification approved by compliance audit.');

  const fetchPendingFarmers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/farmers', {
        params: {
          approvalStatus: 'PENDING',
          page: 0,
          size: 100
        }
      });
      const content = response.data.data?.content || response.data.data || [];
      const mapped = content.map(f => ({
        id: f.id,
        name: f.ownerName || 'Unknown Farmer',
        email: f.email || 'N/A',
        phone: f.phone || 'N/A',
        location: `${f.village || ''}, ${f.state || ''}`,
        address: f.address || 'N/A',
        farmName: f.farmName || 'N/A',
        farmSize: `${f.farmSize || 0} Acres`,
        crops: f.farmingType || 'ORGANIC',
        organicStatus: f.farmingType || 'ORGANIC',
        bank: f.bankDetails ? `${f.bankDetails.bankName} (A/C: ${f.bankDetails.accountNumber}, IFSC: ${f.bankDetails.ifscCode})` : 'No bank configured',
        date: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'
      }));
      setPendingList(mapped);
    } catch (err) {
      console.error('Failed to fetch pending farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFarmers();
  }, []);

  const handleOpenReview = (farmer) => {
    setSelectedFarmer(farmer);
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      toast.loading('Processing approval...', { id: 'approve' });
      await api.post(`/farmers/${id}/approve`, {
        status: 'APPROVED',
        comments: comments
      });
      toast.success(`Farmer application approved successfully!`, { id: 'approve' });
      setIsModalOpen(false);
      await fetchPendingFarmers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve farmer', { id: 'approve' });
    }
  };

  const handleReject = async (id) => {
    try {
      toast.loading('Processing rejection...', { id: 'reject' });
      await api.post(`/farmers/${id}/reject`, {
        status: 'REJECTED',
        comments: 'Application details or certifications mismatch.'
      });
      toast.error(`Farmer application rejected.`, { id: 'reject' });
      setIsModalOpen(false);
      await fetchPendingFarmers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject farmer', { id: 'reject' });
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Pending Audits Review
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Review and audit pending farm submissions to verify credentials.
        </p>
      </div>

      {loading ? (
        <Card className="bg-white p-12 text-center border-0 shadow-premium text-slate-400 font-semibold select-none">
          Loading review queue...
        </Card>
      ) : pendingList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {pendingList.map((farmer) => (
              <motion.div
                key={farmer.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="bg-white border-0 shadow-premium p-6 flex flex-col justify-between h-80">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start select-none">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{farmer.id.substring(0, 8)}...</span>
                        <h3 className="text-sm font-bold text-slate-700 mt-0.5">{farmer.name}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    </div>

                    {/* Stats details */}
                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {farmer.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-slate-400" />
                        {farmer.farmName} ({farmer.farmSize})
                      </p>
                      <p className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {farmer.organicStatus}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <Button 
                      variant="outline" 
                      className="flex-1 py-2 text-xs font-semibold"
                      icon={Eye} 
                      onClick={() => handleOpenReview(farmer)}
                    >
                      Audit Details
                    </Button>
                    <Button 
                      variant="primary" 
                      className="p-2"
                      onClick={() => handleApprove(farmer.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="p-2 text-red-500 hover:bg-red-50"
                      onClick={() => handleReject(farmer.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="bg-white p-12 text-center border-0 shadow-premium">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Check className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Clear Review Queue</h4>
          <p className="text-xs text-slate-400 mt-1 font-medium select-none">All organic farmer submissions are verified.</p>
        </Card>
      )}

      {/* Audit review detailed Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Audit Certification Review"
        size="lg"
      >
        {selectedFarmer && (
          <div className="space-y-6 text-slate-600 text-sm font-semibold">
            {/* Farmer Header Info */}
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {selectedFarmer.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{selectedFarmer.name}</h4>
                <p className="text-xs text-slate-400">ID: {selectedFarmer.id} • Registered: {selectedFarmer.date}</p>
              </div>
            </div>

            {/* Profile parameters details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 leading-relaxed">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Contact Info</span>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedFarmer.email}</p>
                  <p className="text-xs font-semibold text-slate-700">{selectedFarmer.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Farm address</span>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-normal">{selectedFarmer.address}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Agricultural Profile</span>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedFarmer.farmName} ({selectedFarmer.farmSize})</p>
                  <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wide">Status: {selectedFarmer.organicStatus}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Settlement account</span>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-normal">{selectedFarmer.bank}</p>
                </div>
              </div>
            </div>

            {/* Simulated verification files */}
            <div className="pt-4 border-t border-slate-100 col-span-2">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2 block">Audit comments/feedback</span>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
              />
            </div>

            {/* Accept / Reject actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button 
                variant="ghost" 
                className="flex-1 py-3 border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleReject(selectedFarmer.id)}
              >
                Reject / Request Re-audit
              </Button>
              <Button 
                variant="gradient" 
                className="flex-1 py-3"
                onClick={() => handleApprove(selectedFarmer.id)}
              >
                Approve & Grant Compliance
              </Button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPending;
