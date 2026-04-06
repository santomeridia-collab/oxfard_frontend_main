import React, { useState, useEffect, useRef } from 'react';
import API_ENDPOINTS from '../config/endpoints';

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

export default function EnrollmentPopup({ courseId, courseTitle, onClose }) {
    const [formData, setFormData] = useState({
        student_name: '',
        student_email: '',
        student_phone: '',
        country_code: '+91' // Default to India, but will be overriden by auto-detection
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [enrolledData, setEnrolledData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    // Click-outside listener for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Combine country code and phone number for the payload
        const fullPhone = `${formData.country_code}${formData.student_phone}`.replace(/[^\d+]/g, '');

        const payload = {
            course_id: courseId,
            student_name: formData.student_name,
            student_email: formData.student_email,
            student_phone: fullPhone
        };

        try {
            const response = await fetch(API_ENDPOINTS.PUBLIC.ENROLL(courseId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    throw new Error(data.errors[0].message);
                }
                throw new Error(data.message || 'Something went wrong. Please try again.');
            }

            setEnrolledData(data);
            setSuccess(true);
        } catch (err) {
            console.error('Enrollment error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="academy-modal-overlay" onClick={onClose}>
                <div className="academy-modal academy-modal--success" onClick={e => e.stopPropagation()}>
                    <button className="academy-modal__close" onClick={onClose}>&times;</button>
                    <div className="academy-modal__content">
                        <div className="academy-modal__success-icon">✓</div>
                        <h2 className="academy-modal__title">Enrollment Successful!</h2>
                        <p className="academy-modal__subtitle">You have successfully applied for <strong>{courseTitle}</strong>.</p>

                        <div className="academy-enrolled-details">
                            <h3>Your Details:</h3>
                            <div className="academy-enrolled-details__grid">
                                <div className="academy-enrolled-details__item">
                                    <span className="label">Name:</span>
                                    <span className="value">{enrolledData?.student_name}</span>
                                </div>
                                <div className="academy-enrolled-details__item">
                                    <span className="label">Email:</span>
                                    <span className="value">{enrolledData?.student_email}</span>
                                </div>
                                <div className="academy-enrolled-details__item">
                                    <span className="label">Phone:</span>
                                    <span className="value">{enrolledData?.student_phone}</span>
                                </div>
                            </div>
                        </div>

                        <button className="academy-modal__btn academy-modal__btn--primary" style={{ marginTop: '24px' }} onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="academy-modal-overlay" onClick={onClose}>
            <div className="academy-modal" onClick={e => e.stopPropagation()}>
                <button className="academy-modal__close" onClick={onClose}>&times;</button>
                <div className="academy-modal__content">
                    <h2 className="academy-modal__title">Enroll in Course</h2>
                    <p className="academy-modal__subtitle">Fill in your details to apply for <strong>{courseTitle}</strong></p>

                    <form className="academy-modal__form" onSubmit={handleSubmit}>
                        {error && <div className="academy-modal__error">{error}</div>}

                        <div className="academy-modal__form-group">
                            <label htmlFor="student_name" className="academy-modal__label">Full Name <span className="required-asterisk">*</span></label>
                            <input
                                type="text"
                                id="student_name"
                                name="student_name"
                                className="academy-modal__input"
                                placeholder="Enter your full name"
                                value={formData.student_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="academy-modal__form-group">
                            <label htmlFor="student_email" className="academy-modal__label">Email Address <span className="required-asterisk">*</span></label>
                            <input
                                type="email"
                                id="student_email"
                                name="student_email"
                                className="academy-modal__input"
                                placeholder="Enter your email"
                                value={formData.student_email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="academy-modal__form-group">
                            <label htmlFor="student_phone" className="academy-modal__label">Phone Number <span className="required-asterisk">*</span></label>
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
                                    id="student_phone"
                                    name="student_phone"
                                    className="academy-modal__input"
                                    placeholder="Enter your phone number"
                                    value={formData.student_phone}
                                    onChange={handleChange}
                                    required
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`academy-modal__btn academy-modal__btn--primary ${loading ? 'is-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
