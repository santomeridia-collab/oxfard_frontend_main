import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShopData } from '../context/AcademyContext';
import API_ENDPOINTS from '../config/endpoints';
import '../styles/academy.css';

const DESKTOP_LIMIT = 6;
const MOBILE_LIMIT = 3;
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function StarRating({ rating }) {
  const full = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className="academy-reviews__stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`academy-reviews__star ${i <= full ? 'is-filled' : ''}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

/** For summary: shows average with optional half-star (e.g. 3.6 → 3 full + 1 half + 1 empty) */
function SummaryStarRating({ rating }) {
  const r = Math.min(5, Math.max(0, Number(rating) || 0));
  const full = Math.floor(r);
  const remainder = r - full;
  return (
    <span className="academy-reviews-summary__stars" aria-label={`Average: ${r.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full) return <span key={i} className="academy-reviews-summary__star is-filled" aria-hidden>★</span>;
        if (i === full + 1 && remainder > 0.01) {
          return (
            <span key={i} className="academy-reviews-summary__star is-partial" style={{ '--fill': `${remainder * 100}%` }} aria-hidden>
              ★
            </span>
          );
        }
        return <span key={i} className="academy-reviews-summary__star" aria-hidden>★</span>;
      })}
    </span>
  );
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/** Reviews from GET /contact-management/reviews are already meant for display; no status filter. */
function isReviewVisible(review) {
  return true;
}

function normalizeReviewsPayload(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.reviews)) return data.reviews;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function ReviewsSection() {
  const { storeId } = useShopData();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    if (!storeId) {
      setReviewsLoading(false);
      return;
    }
    let cancelled = false;
    setReviewsLoading(true);
    setReviewsError(null);
    fetch(API_ENDPOINTS.CONTACT.REVIEWS(storeId))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch reviews');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setReviewsList(normalizeReviewsPayload(data));
      })
      .catch((err) => {
        if (!cancelled) setReviewsError(err.message || 'Failed to load reviews');
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => { cancelled = true; };
  }, [storeId]);

  useEffect(() => {
    if (!storeId) {
      setSummaryLoading(false);
      return;
    }
    let cancelled = false;
    setSummaryLoading(true);
    setSummaryError(null);
    fetch(API_ENDPOINTS.CONTACT.REVIEWS_SUMMARY(storeId))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch review summary');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setSummaryError(err.message || 'Failed to load summary');
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => { cancelled = true; };
  }, [storeId]);

  const allReviews = reviewsList;
  const reviews = allReviews.filter(isReviewVisible);

  const limit = isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
  const showMoreCount = reviews.length - limit;
  const visibleReviews = expanded ? reviews : reviews.slice(0, limit);
  const hasMore = reviews.length > limit;
  const showViewLess = expanded && hasMore;

  return (
    <section className="academy-reviews-section" aria-labelledby="reviews-heading">
      <div className="academy-container academy-reviews-container">
        <div className="academy-reviews-hero">
          <header className="academy-reviews-header">
            <h2 id="reviews-heading" className="academy-reviews-title">What Our Students Say</h2>
            <p className="academy-reviews-subtitle">
              {reviews.length
                ? 'Real feedback from learners who have taken our courses.'
                : 'Share your experience and help others discover our courses.'}
            </p>
            <Link
              to="/academy/contact?type=review"
              className="academy-reviews__create-btn"
            >
              Write a review
            </Link>
          </header>
          {summaryLoading ? null : summaryError ? (
            <p className="academy-reviews-summary-error">{summaryError}</p>
          ) : summary && (summary.total_count > 0 || summary.average_rating > 0) ? (
            <div className="academy-reviews-summary">
              <p className="academy-reviews-summary__heading">Rating overview</p>
              <div className="academy-reviews-summary__main">
                <div className="academy-reviews-summary__rating">
                  <span className="academy-reviews-summary__average" aria-label={`Average rating: ${Number(summary.average_rating).toFixed(1)} out of 5`}>
                    {Number(summary.average_rating).toFixed(1)}
                  </span>
                  <SummaryStarRating rating={summary.average_rating} />
                </div>
                <p className="academy-reviews-summary__count">
                  Based on {summary.total_count} review{summary.total_count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="academy-reviews-summary__divider" aria-hidden />
              <div className="academy-reviews-summary__breakdown" role="list" aria-label="Rating breakdown">
                {[5, 4, 3, 2, 1].map((r) => {
                  const count = summary[`rating_${r}`] ?? 0;
                  const pct = summary.total_count > 0 ? (count / summary.total_count) * 100 : 0;
                  return (
                    <div key={r} className="academy-reviews-summary__row" role="listitem">
                      <span className="academy-reviews-summary__label">{r} star{r !== 1 ? 's' : ''}</span>
                      <div className="academy-reviews-summary__bar-wrap">
                        <div className="academy-reviews-summary__bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <span className="academy-reviews-summary__count-num">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        {reviewsLoading ? (
          <p className="academy-reviews-empty">Loading reviews…</p>
        ) : reviewsError ? (
          <p className="academy-reviews-empty">{reviewsError}</p>
        ) : reviews.length > 0 ? (
          <>
            <h3 className="academy-reviews-grid-title">Student testimonials</h3>
            <div className="academy-reviews-grid">
              {visibleReviews.map((review) => (
                <article key={review.contact_id || review.created_at} className="academy-reviews-card">
                  <div className="academy-reviews-card__top">
                    <StarRating rating={review.rating} />
                    <time className="academy-reviews-card__date" dateTime={review.created_at}>
                      {formatDate(review.created_at)}
                    </time>
                  </div>
                  {review.subject && (
                    <h4 className="academy-reviews-card__subject">{review.subject}</h4>
                  )}
                  <p className="academy-reviews-card__description">{review.description}</p>
                  <footer className="academy-reviews-card__author">
                    <span className="academy-reviews-card__name">
                      {[review.first_name, review.last_name].filter(Boolean).join(' ') || 'Anonymous'}
                    </span>
                  </footer>
                </article>
              ))}
            </div>
            {hasMore && !expanded && (
              <div className="academy-reviews__more-wrap">
                <button
                  type="button"
                  className="academy-reviews__more-btn"
                  onClick={() => setExpanded(true)}
                  aria-expanded="false"
                >
                  +{showMoreCount} more
                </button>
              </div>
            )}
            {showViewLess && (
              <div className="academy-reviews__more-wrap">
                <button
                  type="button"
                  className="academy-reviews__less-btn"
                  onClick={() => setExpanded(false)}
                  aria-expanded="true"
                >
                  View less
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="academy-reviews-empty">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </section>
  );
}
