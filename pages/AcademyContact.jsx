import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import Footer from '../components/Footer';
import '../styles/academy.css';
import { useShopData } from '../context/AcademyContext';
import { getPrimaryDisplayContact } from '../utils/academyUtils';
import API_ENDPOINTS from '../config/endpoints';
import FAQAccordion from '../components/FAQAccordion';
import { Link, useSearchParams } from 'react-router-dom';

const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+65', country: 'Singapore' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+27', country: 'South Africa' },
  { code: '+55', country: 'Brazil' },
  { code: '+7', country: 'Russia' },
  { code: '+34', country: 'Spain' },
  { code: '+39', country: 'Italy' },
  { code: '+52', country: 'Mexico' },
  { code: '+62', country: 'Indonesia' },
  { code: '+60', country: 'Malaysia' },
  { code: '+63', country: 'Philippines' },
  { code: '+66', country: 'Thailand' },
  { code: '+84', country: 'Vietnam' },
  { code: '+82', country: 'South Korea' },
  { code: '+90', country: 'Turkey' },
  { code: '+20', country: 'Egypt' },
  { code: '+234', country: 'Nigeria' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
];

export default function AcademyContact() {
  const { allData, storeId } = useShopData();
  const [searchParams] = useSearchParams();
  const isReviewType = searchParams.get('type') === 'review';

  // Get home_media for hero background
  const homeMedia = useMemo(() => {
    if (!allData?.home_media || allData.home_media.length === 0) return null;
    const academyShopType = allData?.shop_details?.shop_type?.find((t) =>
      t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
    );
    const matched = allData.home_media.find(m =>
      m.shop_type_id === academyShopType?.shop_type_id
    );
    return matched || allData.home_media[0];
  }, [allData]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country_code: '+1',
    phone_number: '',
    submission_type: isReviewType ? 'review' : 'contact',
    subject: '',
    description: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get shop contact details from display_contact_numbers / display_contact_emails (first value, no fallback)
  const { phone: shopContactNumber, email: shopEmail } = getPrimaryDisplayContact(allData);
  const address = allData?.shop_details?.address || 'Khadeeja BuildingNilambur Road,Wandoor';
  const openTime = allData?.shop_details?.opentime || '09:00 AM';
  const closeTime = allData?.shop_details?.closetime || '06:00 PM';
  const shopName = allData?.shop_details?.shopname || 'Academy';

  // Get FAQs from API (filter active ones) - try multiple keys
  const faqs = useMemo(() => {
    const rawFaqs = allData?.faqs || allData?.faq || [];
    if (!Array.isArray(rawFaqs)) return [];
    return rawFaqs.filter(faq => faq.status !== 'inactive');
  }, [allData]);

  // Auto-detect country code
  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_calling_code) {
          setFormData(prev => ({
            ...prev,
            country_code: data.country_calling_code
          }));
        }
      } catch (error) {
        console.error('Error fetching country code:', error);
      }
    };
    fetchCountryCode();
  }, []);

  // Click-outside listener for custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.description.length < 10) {
      alert('Message must be at least 10 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      // Only use full number when user actually entered digits; don't treat country code alone as phone
      const userDigits = (formData.phone_number || '').replace(/\D/g, '');
      const minPhoneDigits = 5;
      const fullTelephone = userDigits.length >= minPhoneDigits
        ? `${formData.country_code}${formData.phone_number}`.replace(/[^\d+]/g, '').slice(0, 15)
        : '';

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        telephone: fullTelephone,
        submission_type: formData.submission_type,
        subject: formData.subject,
        description: formData.description,
      };

      // Only include rating if the submission type is 'review' or 'rating'
      if (formData.submission_type === 'review' || formData.submission_type === 'rating') {
        payload.rating = Number(formData.rating) || 1;
        // If the backend specifically only likes "review" type with rating:
        if (formData.submission_type === 'rating') {
          payload.submission_type = 'review';
        }
      }

      const response = await fetch(API_ENDPOINTS.CONTACT.SUBMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Form submitted:', formData);
      setSubmitted(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          country_code: formData.country_code, // Keep the country code
          phone_number: '',
          submission_type: 'contact',
          subject: '',
          description: '',
          rating: 5,
        });
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | {shopName}</title>
        <meta name="description" content="Get in touch with us. Send a message, ask about courses, or leave a review. We're here to help." />
      </Helmet>
      <div className="academy-page">
        <AcademyHeader />

        {/* Hero Section */}
        <AcademyHero
          title="Get in Touch"
          subtitle="Have questions about our courses? We'd love to hear from you. Contact our team and we'll respond as soon as possible."
          media={homeMedia}
          showCTA={false}
        />

        {/* Main Content */}
        <div className="academy-container">
          <section className="academy-contact-section">
            <div className="academy-contact-grid">
              {/* Contact Form */}
              <div className="academy-contact-form-col">
                <div className="academy-contact-form-wrapper">
                  <h2 className="academy-contact-form__title">Send us a Message</h2>

                  {submitted && (
                    <div className="academy-contact-success">
                      <div className="academy-contact-success__icon">✓</div>
                      <h3>Message Sent!</h3>
                      <p>Thank you for reaching out. We'll get back to you shortly.</p>
                    </div>
                  )}

                  {!submitted && (
                    <form onSubmit={handleSubmit} className="academy-contact-form">
                      <div className="academy-form-row">
                        <div className="academy-form-group">
                          <label htmlFor="first_name" className="academy-form-label">First Name <span className="academy-form-required">*</span></label>
                          
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            className="academy-form-input"
                            placeholder="First name"
                          />
                        </div>
                        <div className="academy-form-group">
                          <label htmlFor="last_name" className="academy-form-label">Last Name <span className="academy-form-required">*</span></label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            className="academy-form-input"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div className="academy-form-group">
                        <label htmlFor="email" className="academy-form-label">Email Address <span className="academy-form-required">*</span></label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="academy-form-input"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="academy-form-group">
                        <label htmlFor="phone_number" className="academy-form-label">Phone Number</label>
                        <div className="academy-phone-input-group">
                          <div className="academy-custom-select-wrapper" ref={dropdownRef}>
                            <div
                              className={`academy-custom-select-trigger ${isDropdownOpen ? 'is-open' : ''}`}
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                              <span>{formData.country_code}</span>
                              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                                <path d="M1 1L5 5L9 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                            {isDropdownOpen && (
                              <div className="academy-custom-select-options">
                                {!COUNTRY_CODES.some(c => c.code === formData.country_code) && (
                                  <div
                                    className="academy-custom-option is-selected"
                                    onClick={() => setIsDropdownOpen(false)}
                                  >
                                    <span className="academy-option-code">{formData.country_code}</span>
                                    <span className="academy-option-country">(Detected)</span>
                                  </div>
                                )}
                                {COUNTRY_CODES.map(c => (
                                  <div
                                    key={c.code}
                                    className={`academy-custom-option ${formData.country_code === c.code ? 'is-selected' : ''}`}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, country_code: c.code }));
                                      setIsDropdownOpen(false);
                                    }}
                                  >
                                    <span className="academy-option-code">{c.code}</span>
                                    <span className="academy-option-country">{c.country}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            className="academy-form-input"
                            placeholder="555-0000"
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>

                      <div className="academy-form-group">
                        <label htmlFor="submission_type" className="academy-form-label">Message Type <span className="academy-form-required">*</span></label>
                        <select
                          id="submission_type"
                          name="submission_type"
                          value={formData.submission_type}
                          onChange={handleInputChange}
                          required
                          className="academy-form-input"
                          style={{ appearance: 'auto' }}
                        >
                          <option value="contact">Contact</option>
                          <option value="suggestion">Suggestion</option>
                          <option value="review">Review</option>
                          <option value="complaint">Complaint</option>
                          <option value="rating">Rating</option>
                        </select>
                      </div>

                      {(formData.submission_type === 'review' || formData.submission_type === 'rating') && (
                        <div className="academy-form-group">
                          <label htmlFor="rating" className="academy-form-label">Rating (1-5) <span className="academy-form-required">*</span></label>
                          <select
                            id="rating"
                            name="rating"
                            value={formData.rating}
                            onChange={handleInputChange}
                            required
                            className="academy-form-input"
                            style={{ appearance: 'auto' }}
                          >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                          </select>
                        </div>
                      )}

                      <div className="academy-form-group">
                        <label htmlFor="subject" className="academy-form-label">Subject <span className="academy-form-required">*</span></label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="academy-form-input"
                          placeholder="How can we help?"
                        />
                      </div>

                      <div className="academy-form-group">
                        <label htmlFor="description" className="academy-form-label">Message <span className="academy-form-required">*</span></label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          className="academy-form-textarea"
                          placeholder="Tell us more about your inquiry..."
                          rows="6"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="academy-contact-submit-btn"
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="academy-contact-info-col">
                <div className="academy-contact-info-card">
                  <h3 className="academy-contact-info__title">Contact Information</h3>

                  {shopContactNumber && (
                    <div className="academy-contact-info-item">
                      <div className="academy-contact-info-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className="academy-contact-info-text">
                        <h4>Phone</h4>
                        <a href={`tel:${shopContactNumber.replace(/\s/g, '')}`}>
                          {shopContactNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {shopEmail && (
                    <div className="academy-contact-info-item">
                      <div className="academy-contact-info-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </div>
                      <div className="academy-contact-info-text">
                        <h4>Email</h4>
                        <a href={`mailto:${shopEmail}`}>
                          {shopEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="academy-contact-info-item">
                    <div className="academy-contact-info-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className="academy-contact-info-text">
                      <h4>Location</h4>
                      <p>{address}</p>
                    </div>
                  </div>

                  <div className="academy-contact-info-item">
                    <div className="academy-contact-info-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="academy-contact-info-text">
                      <h4>Hours</h4>
                      <p>{openTime} - {closeTime}</p>
                      <p style={{ fontSize: '0.9em', marginTop: '4px' }}>Monday - Friday</p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="academy-contact-quick-links">
                  <h3>Quick Links</h3>
                  <ul>
                    <li><Link to="/academy/courses">Explore Courses</Link></li>
                    <li><Link to="/academy/about">About Academy</Link></li>
                    <li><Link to="/academy/contact">Get Help</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* FAQ Section */}
        <section className="academy-contact-faq-section">
          <div className="academy-container">
            <h2 className="academy-section-title">Frequently Asked Questions</h2>

            {faqs && faqs.length > 0 ? (
              <FAQAccordion items={faqs} />
            ) : (
              <div className="academy-contact-no-faq">
                <p>FAQs will be available soon. Please feel free to contact us with your questions.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
