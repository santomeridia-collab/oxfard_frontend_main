import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAcademyData, useShopData } from '../context/AcademyContext';
import { getPrimaryDisplayContact } from '../utils/academyUtils';
import ThemeToggle from './ThemeToggle';
import Breadcrumb from './Breadcrumb';
import API_ENDPOINTS from '../config/endpoints';
import headerLogo from '../assets/OWEOC pdf LOGO-1.png';
import '../styles/academy.css';


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
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
];

const initialEnquiryForm = {
  first_name: '',
  last_name: '',
  email: '',
  country_code: '+91',
  phone_number: '',
  submission_type: 'contact',
  subject: '',
  description: '',
  rating: 5,
};

export default function AcademyHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCoursesDropdownOpen, setMobileCoursesDropdownOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState(initialEnquiryForm);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryDropdownOpen, setEnquiryDropdownOpen] = useState(false);
  const coursesDropdownRef = useRef(null);
  const enquiryDropdownRef = useRef(null);
  const { allData, storeId } = useShopData();
  const navigate = useNavigate();
  const location = useLocation();

  const {
     categories,
     courses,
     loading,
     error,
   } = useAcademyData();
 
   // =========================
   // NORMALIZE CATEGORY DATA
   // =========================
 
   const allCategories = categories?.data || [];
  const { phone: shopNumber, email: shopEmail } = getPrimaryDisplayContact(allData);
  console.log('categories in header:', allCategories);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close enquiry dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (enquiryDropdownRef.current && !enquiryDropdownRef.current.contains(event.target)) {
        setEnquiryDropdownOpen(false);
      }
    };
    if (enquiryModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [enquiryModalOpen]);

  // Lock body scroll when enquiry modal is open (mobile-friendly)
  useEffect(() => {
    if (enquiryModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [enquiryModalOpen]);

  // Close enquiry modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && enquiryModalOpen) closeEnquiryModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [enquiryModalOpen]);

  const openEnquiryModal = () => setEnquiryModalOpen(true);
  const closeEnquiryModal = () => {
    setEnquiryModalOpen(false);
    if (enquirySubmitted) {
      setEnquiryForm(initialEnquiryForm);
      setEnquirySubmitted(false);
    }
  };

  const handleEnquiryInputChange = (e) => {
    const { name, value } = e.target;
    setEnquiryForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEnquiryForm = () => {
    if (enquiryForm.description.length < 10) {
      alert('Message must be at least 10 characters long.');
      return false;
    }
    return true;
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!validateEnquiryForm()) return;
    setEnquirySubmitting(true);
    try {
      // Only use full number when user actually entered digits; don't treat country code alone as phone
      const userDigits = (enquiryForm.phone_number || '').replace(/\D/g, '');
      const minPhoneDigits = 5;
      const fullTelephone = userDigits.length >= minPhoneDigits
        ? `${enquiryForm.country_code}${enquiryForm.phone_number}`.replace(/[^\d+]/g, '').slice(0, 15)
        : '';
      const payload = {
        store_id: storeId,
        ...enquiryForm,
        telephone: fullTelephone,
      };
      delete payload.country_code;
      delete payload.phone_number;
      if (enquiryForm.submission_type !== 'review' && enquiryForm.submission_type !== 'rating') {
        delete payload.rating;
      } else {
        payload.rating = Number(payload.rating) || 1;
        if (enquiryForm.submission_type === 'rating') payload.submission_type = 'review';
      }

      const response = await fetch(API_ENDPOINTS.CONTACT.SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to submit form');
      setEnquirySubmitted(true);
      setEnquiryForm({ ...initialEnquiryForm, country_code: enquiryForm.country_code });
      setTimeout(() => {
        setEnquirySubmitted(false);
        closeEnquiryModal();
      }, 2000);
    } catch (err) {
      console.error('Enquiry submit error:', err);
      alert('Failed to send message. Please try again later.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Helper to check if a nav link is active
  const isActive = (path) => {
    if (path === '/academy') {
      return location.pathname === '/academy' || location.pathname === '/academy/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileCoursesDropdown = () => {
    setMobileCoursesDropdownOpen(!mobileCoursesDropdownOpen);
  };

  return (
    <div className="academy-header-wrapper">
      {/* Top bar: shop contact + theme */}
      <div className="academy-topbar">
        <div className="academy-container academy-topbar-inner">
          <div className="academy-topbar-contact">
            {shopNumber && (
              <a href={`tel:${shopNumber.replace(/\s/g, '')}`} className="academy-topbar-link" aria-label={`Call ${shopNumber}`}>
                <span className="academy-topbar-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                {shopNumber}
              </a>
            )}
            {shopNumber && shopEmail && <span className="academy-topbar-sep" aria-hidden="true" />}
            {shopEmail && (
              <a href={`mailto:${shopEmail}`} className="academy-topbar-link" aria-label={`Email ${shopEmail}`}>
                <span className="academy-topbar-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                {shopEmail}
              </a>
            )}
          </div>
          <div className="academy-topbar-actions">
            <button
              type="button"
              className="academy-topbar-enquiry-btn"
              onClick={() => navigate('/academy/contact')}
              aria-label="Enquiry Now"
            >
              Enquiry Now
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Enquiry modal */}
      {enquiryModalOpen && (
        <div className="academy-modal-overlay" onClick={closeEnquiryModal} role="dialog" aria-modal="true" aria-labelledby="enquiry-modal-title">
          <div className="academy-modal academy-modal--enquiry" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="academy-modal__close" onClick={closeEnquiryModal} aria-label="Close">×</button>
            <div className="academy-modal__content">
              <h2 id="enquiry-modal-title" className="academy-contact-form__title">Send us a Message</h2>
              {enquirySubmitted ? (
                <div className="academy-contact-success">
                  <div className="academy-contact-success__icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="academy-contact-form">
                  <div className="academy-form-row">
                    <div className="academy-form-group">
                      <label htmlFor="enquiry_first_name" className="academy-form-label">First Name <span className="academy-form-required">*</span></label>
                      <input type="text" id="enquiry_first_name" name="first_name" value={enquiryForm.first_name} onChange={handleEnquiryInputChange} required className="academy-form-input" placeholder="First name" />
                    </div>
                    <div className="academy-form-group">
                      <label htmlFor="enquiry_last_name" className="academy-form-label">Last Name <span className="academy-form-required">*</span></label>
                      <input type="text" id="enquiry_last_name" name="last_name" value={enquiryForm.last_name} onChange={handleEnquiryInputChange} required className="academy-form-input" placeholder="Last name" />
                    </div>
                  </div>
                  <div className="academy-form-group">
                    <label htmlFor="enquiry_email" className="academy-form-label">Email Address <span className="academy-form-required">*</span></label>
                    <input type="email" id="enquiry_email" name="email" value={enquiryForm.email} onChange={handleEnquiryInputChange} required className="academy-form-input" placeholder="your@email.com" />
                  </div>
                  <div className="academy-form-group">
                    <label htmlFor="enquiry_phone" className="academy-form-label">Phone Number</label>
                    <div className="academy-phone-input-group">
                      <div className="academy-custom-select-wrapper" ref={enquiryDropdownRef}>
                        <div className={`academy-custom-select-trigger ${enquiryDropdownOpen ? 'is-open' : ''}`} onClick={() => setEnquiryDropdownOpen(!enquiryDropdownOpen)}>
                          <span>{enquiryForm.country_code}</span>
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        {enquiryDropdownOpen && (
                          <div className="academy-custom-select-options">
                            {COUNTRY_CODES.map((c) => (
                              <div key={c.code} className={`academy-custom-option ${enquiryForm.country_code === c.code ? 'is-selected' : ''}`} onClick={() => { setEnquiryForm((prev) => ({ ...prev, country_code: c.code })); setEnquiryDropdownOpen(false); }}>
                                <span className="academy-option-code">{c.code}</span>
                                <span className="academy-option-country">{c.country}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input type="tel" id="enquiry_phone" name="phone_number" value={enquiryForm.phone_number} onChange={handleEnquiryInputChange} className="academy-form-input" placeholder="555-0000" style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div className="academy-form-group">
                    <label htmlFor="enquiry_subject" className="academy-form-label">Subject <span className="academy-form-required">*</span></label>
                    <input type="text" id="enquiry_subject" name="subject" value={enquiryForm.subject} onChange={handleEnquiryInputChange} required className="academy-form-input" placeholder="How can we help?" />
                  </div>
                  <div className="academy-form-group">
                    <label htmlFor="enquiry_description" className="academy-form-label">Message <span className="academy-form-required">*</span></label>
                    <textarea id="enquiry_description" name="description" value={enquiryForm.description} onChange={handleEnquiryInputChange} required className="academy-form-textarea" placeholder="Tell us more about your inquiry..." rows="3" />
                  </div>
                  <button type="submit" disabled={enquirySubmitting} className="academy-contact-submit-btn">
                    {enquirySubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="academy-global-header">
      <div className="academy-container academy-header-inner">
        <Link to="/academy" className="academy-header-logo">
          <div className="academy-header-logo-wrapper">
            <img
              src={headerLogo}
              alt={allData?.shop_details?.shopname || 'Academy'}
              className="academy-header-logo-img"
            />
            <span className="academy-header-shop-name">
              {allData?.shop_details?.shopname || 'Academy'}
            </span>
          </div>
        </Link>

        {/* Mobile: theme (left of hamburger) + hamburger on right */}
        <div className="academy-header-right">
          <div className="academy-header-theme-mobile">
            <ThemeToggle />
          </div>
          <button
            className={`academy-header-toggle ${mobileMenuOpen ? 'is-open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="academy-header-toggle__line"></span>
            <span className="academy-header-toggle__line"></span>
            <span className="academy-header-toggle__line"></span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="academy-header-nav">
          <Link to="/academy" className={`academy-header-link ${isActive('/academy') ? 'active' : ''}`}>Home</Link>
          <Link to="/academy/about" className={`academy-header-link ${isActive('/academy/about') ? 'active' : ''}`}>About</Link>
          <Link to="/academy/verification" className={`academy-header-link ${isActive('/academy/verification') ? 'active' : ''}`}>Verification</Link>

          {/* Courses label with dropdown (click to open, outside click to close) */}
        {/* Courses label with dropdown */}
<div className="academy-header-link-dropdown" ref={coursesDropdownRef}>
  <button
    type="button"
    className={`academy-header-link academy-header-link--with-arrow ${
      dropdownOpen ? 'is-open' : ''
    } ${isActive('/academy/courses') ? 'active' : ''}`}
    onClick={() => setDropdownOpen(!dropdownOpen)}
    aria-expanded={dropdownOpen}
    aria-haspopup="true"
  >
    <span>Courses</span>
    <span className="academy-header-link__arrow">▾</span>
  </button>

{dropdownOpen && allCategories.length > 0 && (
  <div className="academy-header-dropdown">
    <Link
      to="/academy/courses"
      className="academy-dropdown-item"
      onClick={() => setDropdownOpen(false)}
    >
      All Courses
    </Link>

    {allCategories.map((cat, index) => (
      <Link
        key={index}
        to={`/academy/courses?category=${encodeURIComponent(cat)}`}
        className="academy-dropdown-item"
        onClick={() => setDropdownOpen(false)}
      >
        {cat}
      </Link>
    ))}
  </div>
)}
</div>

          <Link to="/academy/events-gallery" className={`academy-header-link ${isActive('/academy/events-gallery') ? 'active' : ''}`}>Gallery / Events</Link>
          <Link to="/academy/news" className={`academy-header-link ${isActive('/academy/news') ? 'active' : ''}`}>News / Blog</Link>
          <Link to="/academy/contact" className={`academy-header-link ${isActive('/academy/contact') ? 'active' : ''}`}>Contact</Link>
        </nav>
      </div>

      {(location.pathname !== '/academy' && location.pathname !== '/academy/') && (
        <div className="academy-breadcrumb-wrap">
          <div className="academy-container">
            <Breadcrumb />
          </div>
        </div>
      )}

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <div className="academy-mobile-menu-overlay" onClick={closeMobileMenu}>
          <nav
            className="academy-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="academy-mobile-menu__header">
              <h2 className="academy-mobile-menu__title">Menu</h2>
            </div>

            <div className="academy-mobile-menu__content">
              <Link
                to="/academy"
                className={`academy-mobile-menu__link ${isActive('/academy') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>

              <Link
                to="/academy/about"
                className={`academy-mobile-menu__link ${isActive('/academy/about') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                About
              </Link>

              <Link
                to="/academy/verification"
                className={`academy-mobile-menu__link ${isActive('/academy/verification') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Verification
              </Link>

              <div className="academy-mobile-menu__section">
                <button
                  className={`academy-mobile-menu__dropdown-toggle ${mobileCoursesDropdownOpen ? 'is-open' : ''} ${location.pathname.startsWith('/academy/courses') ? 'active' : ''}`}
                  onClick={toggleMobileCoursesDropdown}
                >
                  All Courses
                  <span className="academy-mobile-menu__dropdown-arrow">›</span>
                </button>
{mobileCoursesDropdownOpen && allCategories.length > 0 && (
  <div className="academy-mobile-menu__submenu">
    {allCategories.map((cat, index) => (
      <Link
        key={index}
        to={`/academy/courses?category=${encodeURIComponent(cat)}`}
        className="academy-mobile-menu__sublink"
        onClick={closeMobileMenu}
      >
        {cat}
      </Link>
    ))}
  </div>
)}
              </div>

              <Link
                to="/academy/events-gallery"
                className={`academy-mobile-menu__link ${isActive('/academy/events-gallery') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Gallery / Events
              </Link>

              <Link
                to="/academy/news"
                className={`academy-mobile-menu__link ${isActive('/academy/news') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                News / Blog
              </Link>

              <Link
                to="/academy/contact"
                className={`academy-mobile-menu__link ${isActive('/academy/contact') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
    </div>
  );
}
