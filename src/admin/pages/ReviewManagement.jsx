import React, { useState } from 'react';
import {
  Star,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  MessageSquare,
  Flag,
  User,
  Package,
  Sprout,
  Filter,
  RefreshCw,
  Calendar,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewManagement = () => {
  // Search & Filter State (8 Filters)
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [starFilter, setStarFilter] = useState('All'); // All, 5, 4, 3, 2, 1
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Approved, Rejected, Hidden, Reported
  const [typeFilter, setTypeFilter] = useState('All'); // All, Product Review, Farmer Review, Delivery Review, Application Review
  const [dateFilter, setDateFilter] = useState('All'); // All, Today, This Week, This Month

  // Modals state
  const [viewReviewModal, setViewReviewModal] = useState(null);
  const [replyReviewModal, setReplyReviewModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Initial Comprehensive Dataset with 9 Columns, 4 Types & 5 Statuses
  const initialReviews = [
    {
      id: '#REV-501',
      customerName: 'Ramesh Kumar',
      productName: 'Fresh Tomatoes',
      farmerName: 'Suresh Patil',
      rating: 5,
      reviewMessage: 'Extremely fresh and juicy red tomatoes delivered within 2 hours! Very satisfied with Farm to Home service.',
      reviewDate: 'Jul 24, 2024',
      status: 'Approved',
      type: 'Product Review',
      reply: 'Thank you Ramesh! Glad you loved our farm-fresh tomatoes.',
      avatar: 'RK'
    },
    {
      id: '#REV-502',
      customerName: 'Ananya Sharma',
      productName: 'Organic Potatoes',
      farmerName: 'Rajesh Verma',
      rating: 4,
      reviewMessage: 'Potatoes are clean, organic, and good quality. Packaging was neat.',
      reviewDate: 'Jul 23, 2024',
      status: 'Pending',
      type: 'Farmer Review',
      reply: null,
      avatar: 'AS'
    },
    {
      id: '#REV-503',
      customerName: 'Vikram Singh',
      productName: 'Green Apples',
      farmerName: 'Baldev Singh',
      rating: 1,
      reviewMessage: 'Delivery was late by 3 hours and 2 apples had bruises.',
      reviewDate: 'Jul 22, 2024',
      status: 'Reported',
      type: 'Delivery Review',
      reply: null,
      avatar: 'VS'
    },
    {
      id: '#REV-504',
      customerName: 'Priya Patel',
      productName: 'Farm to Home Mobile App',
      farmerName: 'N/A (App Store)',
      rating: 5,
      reviewMessage: 'The app navigation is super smooth and intuitive. Ordering organic vegetables takes only 10 seconds!',
      reviewDate: 'Jul 20, 2024',
      status: 'Approved',
      type: 'Application Review',
      reply: 'Thanks Priya for the stellar 5-star rating!',
      avatar: 'PP'
    },
    {
      id: '#REV-505',
      customerName: 'Siddharth Roy',
      productName: 'Red Onions',
      farmerName: 'Mohan Das',
      rating: 3,
      reviewMessage: 'Average size onions, expected slightly bigger sizes for the price.',
      reviewDate: 'Jul 18, 2024',
      status: 'Hidden',
      type: 'Product Review',
      reply: null,
      avatar: 'SR'
    },
    {
      id: '#REV-506',
      customerName: 'Kavita Reddy',
      productName: 'Fresh Spinach',
      farmerName: 'Suresh Patil',
      rating: 2,
      reviewMessage: 'Spinach leaves were slightly wilted upon arrival.',
      reviewDate: 'Jul 15, 2024',
      status: 'Rejected',
      type: 'Product Review',
      reply: null,
      avatar: 'KR'
    }
  ];

  const [reviews, setReviews] = useState(initialReviews);

  // Action 2: Approve Review
  const handleApproveReview = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    toast.success(`Review ${id} approved & published.`);
  };

  // Action 3: Reject Review
  const handleRejectReview = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    toast.error(`Review ${id} rejected.`);
  };

  // Action 4: Hide Review
  const handleHideReview = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Hidden' } : r))
    );
    toast.info(`Review ${id} hidden from public store.`);
  };

  // Action 7: Report Review
  const handleReportReview = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Reported' } : r))
    );
    toast.error(`Review ${id} flagged for moderation review.`);
  };

  // Action 5: Delete Review
  const handleDeleteReview = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.error(`Review ${id} deleted.`);
  };

  // Action 6: Submit Reply to Review
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyReviewModal) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyReviewModal.id ? { ...r, reply: replyText.trim() } : r
      )
    );

    toast.success(`Official reply added to Review ${replyReviewModal.id}`);
    setReplyText('');
    setReplyReviewModal(null);
  };

  // Filter Logic (8 Requested Filters: 5 Stars -> 1 Star, Product Name, Customer Name, Review Date)
  const filteredReviews = reviews.filter((r) => {
    const matchCustomer = !searchCustomer || r.customerName.toLowerCase().includes(searchCustomer.toLowerCase().trim());
    const matchProduct = !searchProduct || r.productName.toLowerCase().includes(searchProduct.toLowerCase().trim());
    const matchStar = starFilter === 'All' || r.rating.toString() === starFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchType = typeFilter === 'All' || r.type === typeFilter;

    return matchCustomer && matchProduct && matchStar && matchStatus && matchType;
  });

  // Render Star Rating Icons
  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E0B' }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < rating ? '#F59E0B' : 'transparent'}
            color={i < rating ? '#F59E0B' : '#CBD5E1'}
          />
        ))}
      </div>
    );
  };

  // Badge Colors for 5 Review Statuses
  const getReviewStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#DCFCE7', color: '#15803D' };
      case 'Pending': return { bg: '#FEF3C7', color: '#D97706' };
      case 'Rejected': return { bg: '#FEE2E2', color: '#DC2626' };
      case 'Hidden': return { bg: '#F1F5F9', color: '#64748B' };
      case 'Reported': return { bg: '#FFE4E6', color: '#E11D48' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Customer Reviews & Moderation</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Moderate product feedback, farmer ratings, delivery reviews, and app experience ratings.
          </p>
        </div>

        <button
          onClick={() => {
            setSearchCustomer('');
            setSearchProduct('');
            setStarFilter('All');
            setStatusFilter('All');
            setTypeFilter('All');
            toast.success('Review filters reset');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} /> Reset Filters
        </button>
      </div>

      {/* 8 REVIEWS FILTERS BAR */}
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
        {/* Customer Name Search */}
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search Customer..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
          />
        </div>

        {/* Product Name Search */}
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search Product..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
          />
        </div>

        {/* Star Rating Filters (5 Stars to 1 Star) */}
        <select
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Star Ratings ⭐</option>
          <option value="5">Five-Star Reviews (5 ⭐)</option>
          <option value="4">Four-Star Reviews (4 ⭐)</option>
          <option value="3">Three-Star Reviews (3 ⭐)</option>
          <option value="2">Two-Star Reviews (2 ⭐)</option>
          <option value="1">One-Star Reviews (1 ⭐)</option>
        </select>

        {/* Review Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Statuses (5)</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
          <option value="Hidden">Hidden</option>
          <option value="Reported">Reported</option>
        </select>

        {/* 4 Review Types Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Review Types (4)</option>
          <option value="Product Review">Product Review</option>
          <option value="Farmer Review">Farmer Review</option>
          <option value="Delivery Review">Delivery Review</option>
          <option value="Application Review">Application Review</option>
        </select>

        <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto', fontWeight: 600 }}>
          Filtered Reviews: {filteredReviews.length}
        </span>
      </div>

      {/* 9-COLUMN REVIEWS TABLE */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredReviews.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No reviews match the selected filter criteria.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Customer Name</th>
                  <th>Product Name</th>
                  <th>Farmer Name</th>
                  <th>Rating</th>
                  <th>Review Message</th>
                  <th>Review Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => {
                  const badge = getReviewStatusBadge(r.status);
                  return (
                    <tr key={r.id}>
                      {/* 1. Review ID */}
                      <td style={{ fontWeight: 700, color: '#0284C7' }}>{r.id}</td>

                      {/* 2. Customer Name */}
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{r.customerName}</td>

                      {/* 3. Product Name */}
                      <td style={{ fontWeight: 600, color: '#1E293B' }}>
                        <div>{r.productName}</div>
                        <span style={{ fontSize: '10px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                          {r.type}
                        </span>
                      </td>

                      {/* 4. Farmer Name */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{r.farmerName}</td>

                      {/* 5. Rating */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {renderStars(r.rating)}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706' }}>{r.rating}.0 / 5.0</span>
                        </div>
                      </td>

                      {/* 6. Review Message */}
                      <td style={{ color: '#334155', fontSize: '12.5px', maxWidth: '260px' }}>
                        "{r.reviewMessage}"
                        {r.reply && (
                          <div style={{ fontSize: '11px', color: '#15803D', backgroundColor: '#DCFCE7', padding: '4px 8px', borderRadius: '6px', marginTop: '4px' }}>
                            💬 <strong>Admin Reply:</strong> {r.reply}
                          </div>
                        )}
                      </td>

                      {/* 7. Review Date */}
                      <td style={{ fontSize: '11.5px', color: '#94A3B8' }}>{r.reviewDate}</td>

                      {/* 8. Status */}
                      <td>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                          {r.status}
                        </span>
                      </td>

                      {/* 9. Actions (7 Required Actions) */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          {/* Action 1: View Review */}
                          <button
                            onClick={() => setViewReviewModal(r)}
                            title="View Full Review & Details"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Action 2: Approve Review */}
                          {r.status !== 'Approved' && (
                            <button
                              onClick={() => handleApproveReview(r.id)}
                              title="Approve Review"
                              style={{ padding: '5px 7px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#15803D', cursor: 'pointer' }}
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}

                          {/* Action 3: Reject Review */}
                          {r.status !== 'Rejected' && (
                            <button
                              onClick={() => handleRejectReview(r.id)}
                              title="Reject Review"
                              style={{ padding: '5px 7px', borderRadius: '6px', border: 'none', backgroundColor: '#FFE4E6', color: '#E11D48', cursor: 'pointer' }}
                            >
                              <XCircle size={13} />
                            </button>
                          )}

                          {/* Action 4: Hide Review */}
                          {r.status !== 'Hidden' && (
                            <button
                              onClick={() => handleHideReview(r.id)}
                              title="Hide Review"
                              style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'pointer' }}
                            >
                              <EyeOff size={13} />
                            </button>
                          )}

                          {/* Action 6: Reply to Review */}
                          <button
                            onClick={() => {
                              setReplyReviewModal(r);
                              setReplyText(r.reply || '');
                            }}
                            title="Reply to Customer Review"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E0F2FE', color: '#0284C7', cursor: 'pointer' }}
                          >
                            <MessageSquare size={13} />
                          </button>

                          {/* Action 7: Report Review */}
                          <button
                            onClick={() => handleReportReview(r.id)}
                            title="Report / Flag Review"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FEF3C7', color: '#D97706', cursor: 'pointer' }}
                          >
                            <Flag size={13} />
                          </button>

                          {/* Action 5: Delete Review */}
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            title="Delete Review"
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

      {/* MODAL 1: VIEW FULL REVIEW DETAILS */}
      {viewReviewModal && (
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
          onClick={() => setViewReviewModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {viewReviewModal.avatar}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>{viewReviewModal.customerName}</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>{viewReviewModal.id} • {viewReviewModal.type}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div><strong>Product:</strong> {viewReviewModal.productName}</div>
              <div><strong>Farmer Supplier:</strong> {viewReviewModal.farmerName}</div>
              <div><strong>Rating:</strong> {renderStars(viewReviewModal.rating)} ({viewReviewModal.rating}/5)</div>
              <div><strong>Review Date:</strong> {viewReviewModal.reviewDate}</div>
              <div><strong>Review Message:</strong> "{viewReviewModal.reviewMessage}"</div>
              <div><strong>Moderation Status:</strong> <span style={{ fontWeight: 700, color: viewReviewModal.status === 'Approved' ? '#16A34A' : '#DC2626' }}>{viewReviewModal.status}</span></div>
              {viewReviewModal.reply && (
                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', marginTop: '4px', color: '#15803D' }}>
                  <strong>Admin Reply:</strong> "{viewReviewModal.reply}"
                </div>
              )}
            </div>

            <button
              onClick={() => setViewReviewModal(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#F59E0B', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: REPLY TO REVIEW */}
      {replyReviewModal && (
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
          onClick={() => setReplyReviewModal(null)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', marginBottom: '14px' }}>
              <MessageSquare size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Reply to Customer Review</h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 14px 0' }}>
              Replying to <strong>{replyReviewModal.customerName}</strong> for product <strong>{replyReviewModal.productName}</strong>:
            </p>

            <form onSubmit={handleSendReply}>
              <textarea
                rows="3"
                required
                placeholder="Type official store response (e.g. Thank you for your feedback! We are glad you enjoyed the fresh produce)..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', marginBottom: '16px', outline: 'none' }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReplyReviewModal(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#0284C7', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Post Official Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
