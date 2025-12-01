'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Star, ThumbsUp, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Trans } from '@/app/context/Translator';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { getToken, isSignedIn, userId } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.getProductReviews(productId);
      if (response.success && response.data) {
        setReviews(response.data as Review[]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please sign in to write a review');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.createReview({
        productId,
        rating,
        title: title || undefined,
        comment,
      }, token);

      if (response.success) {
        setShowReviewForm(false);
        setRating(5);
        setTitle('');
        setComment('');
        await fetchReviews();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. You may have already reviewed this product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.markReviewHelpful(reviewId);
      await fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditTitle(review.title || '');
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editComment) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.updateReview(reviewId, {
        rating: editRating,
        title: editTitle || undefined,
        comment: editComment,
      }, token);

      if (response.success) {
        setEditingReview(null);
        await fetchReviews();
      } else {
        toast.error(response.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    toast('Are you sure?', {
      description: 'This will permanently delete your review.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const token = await getToken();
            if (!token) return;

            const response = await api.deleteReview(reviewId, token);

            if (response.success) {
              toast.success('Review deleted successfully');
              await fetchReviews();
            } else {
              toast.error(response.message || 'Failed to delete review');
            }
          } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => 
    reviews.filter(r => r.rating === star).length
  );

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold mb-8"><Trans>Customer Reviews</Trans></h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl border-2 border-border bg-card">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <Trans>Based on</Trans> {reviews.length} <Trans>reviews</Trans>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2 mb-6">
                {[5, 4, 3, 2, 1].map((star, idx) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-accent overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${reviews.length > 0 ? (ratingCounts[idx] / reviews.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {ratingCounts[idx]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Write Review Button */}
              {isSignedIn && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  {showReviewForm ? <Trans>Cancel</Trans> : <Trans>Write a Review</Trans>}
                </button>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-8 p-6 rounded-2xl border-2 border-border bg-card">
                <h3 className="text-xl font-bold mb-4"><Trans>Write Your Review</Trans></h3>
                
                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2"><Trans>Rating *</Trans></label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2"><Trans>Title (optional)</Trans></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sum up your experience"
                    className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2"><Trans>Review *</Trans></label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Share your thoughts about this product"
                    className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !comment}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? <Trans>Submitting...</Trans> : <Trans>Submit Review</Trans>}
                </button>
              </form>
            )}

            {/* Reviews */}
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p><Trans>No reviews yet. Be the first to review this product!</Trans></p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-2xl border-2 border-border bg-card">
                    {editingReview === review.id ? (
                      // Edit Form
                      <div>
                        <h4 className="font-bold mb-4"><Trans>Edit Your Review</Trans></h4>
                        
                        {/* Star Rating */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2"><Trans>Rating *</Trans></label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= editRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2"><Trans>Title (optional)</Trans></label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Sum up your experience"
                            className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none"
                          />
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2"><Trans>Review *</Trans></label>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            required
                            rows={4}
                            placeholder="Share your thoughts"
                            className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none resize-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateReview(review.id)}
                            disabled={!editComment}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                          >
                            <Trans>Save Changes</Trans>
                          </button>
                          <button
                            onClick={() => setEditingReview(null)}
                            className="px-4 py-2 rounded-lg border-2 border-border hover:bg-accent transition-all font-semibold"
                          >
                            <Trans>Cancel</Trans>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Review
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">{review.userName}</span>
                              {review.verified && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                                  <BadgeCheck className="h-3 w-3" />
                                  <Trans>Verified Purchase</Trans>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {review.title && (
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                        )}
                        
                        <p className="text-muted-foreground mb-4">{review.comment}</p>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMarkHelpful(review.id)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <Trans>Helpful</Trans> ({review.helpful})
                          </button>

                          {/* Edit/Delete buttons for own reviews */}
                          {userId && review.userId === userId && (
                            <>
                              <button
                                onClick={() => startEditingReview(review)}
                                className="text-sm text-primary hover:underline font-semibold"
                              >
                                <Trans>Edit</Trans>
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-sm text-destructive hover:underline font-semibold"
                              >
                                <Trans>Delete</Trans>
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
