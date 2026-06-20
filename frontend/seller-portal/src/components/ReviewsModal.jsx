import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Star } from 'lucide-react';

export default function ReviewsModal({ isOpen, onClose, userId, userName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/orders/users/${userId}/reviews`);
        if (res.success) {
          setReviews(res.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reviews for {userName}</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">What others are saying</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-gray-400">Loading Reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 text-gray-300">⭐</div>
              <p className="text-gray-900 font-medium">No reviews yet</p>
              <p className="text-gray-500 text-sm mt-1">This user hasn't received any reviews.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.reviewerName}</p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5">{review.roleContext}</p>
                    </div>
                    <div className="flex items-center bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-bold text-gray-700 text-xs">{review.score}.0</span>
                    </div>
                  </div>
                  {review.review && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2 italic">"{review.review}"</p>
                  )}
                  <p className="text-xs font-medium text-gray-400 mt-3">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
