import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShopData } from '../context/AcademyContext';

/** Parse social_media_links from get-all-data API: array of { links: { facebook, instagram, ... }, status } */
const getSocialLinks = (social_media_links) => {
    if (!social_media_links || !Array.isArray(social_media_links) || social_media_links.length === 0) return [];
    const item = social_media_links.find((s) => s.status === 'active') || social_media_links[0];
    const links = item?.links;
    if (!links || typeof links !== 'object') return [];
    return Object.entries(links)
        .filter(([, url]) => url && typeof url === 'string' && url.trim() !== '')
        .map(([platform, url]) => ({ platform: platform.toLowerCase().trim(), url: url.trim() }));
};

/** Display label for social platform (matches Legal / Quick Links style) */
const getPlatformLabel = (platform) => {
    const labels = { facebook: 'Facebook', instagram: 'Instagram', twitter: 'X', x: 'X', linkedin: 'LinkedIn', youtube: 'YouTube' };
    return labels[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
};

const SocialIcon = ({ platform, size = 20 }) => {
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' };
    switch (platform) {
        case 'facebook':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" {...common}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            );
        case 'instagram':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" {...common}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            );
        case 'twitter':
        case 'x':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" {...common}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            );
        case 'linkedin':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" {...common}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            );
        case 'youtube':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" {...common}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" {...common}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            );
    }
};

const Footer = () => {
    const { allData } = useShopData();
    const location = useLocation();
    const pathname = location.pathname.replace(/\/$/, '') || '/';
    const shopName = allData?.shop_details?.shopname || 'Academy';
    const logoUrl = allData?.logos?.[0]?.file_url;
    const socialLinks = getSocialLinks(allData?.social_media_links);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isActive = (to) => {
        const base = to.replace(/\/$/, '') || '/academy';
        if (base === '/academy') {
            return pathname === '/academy';
        }
        return pathname === base || pathname.startsWith(base + '/');
    };

    return (
        <footer className="academy-footer">
            <div className="academy-container">
                <div className="academy-footer__grid">
                    <div className="academy-footer__section">
                        <Link to="/academy" className={`academy-footer__logo${isActive('/academy') ? ' is-active' : ''}`} onClick={scrollToTop}>
                            {logoUrl ? (
                                <div className="academy-footer__logo-inner">
                                    <img
                                        src={logoUrl}
                                        alt={shopName}
                                        style={{ maxHeight: '90px', width: 'auto', objectFit: 'contain' }}
                                    />
                                    <span className="academy-footer__shop-name">{shopName}</span>
                                </div>
                            ) : shopName}
                        </Link>
                        <p className="academy-footer__description">
                            Empowering learners through professional, industry-led courses and expert mentorship.
                        </p>
                    </div>

                    <div className="academy-footer__section">
                        <h3 className="academy-footer__title">Quick Links</h3>
                        <ul className="academy-footer__links">
                            <li><Link to="/academy" onClick={scrollToTop} className={isActive('/academy') ? 'is-active' : ''}>Home</Link></li>
                            <li><Link to="/academy/courses" onClick={scrollToTop} className={isActive('/academy/courses') ? 'is-active' : ''}>Explore Courses</Link></li>
                            <li><Link to="/academy/about" onClick={scrollToTop} className={isActive('/academy/about') ? 'is-active' : ''}>About {shopName}</Link></li>
                            <li><Link to="/academy/contact" onClick={scrollToTop} className={isActive('/academy/contact') ? 'is-active' : ''}>Contact & Support</Link></li>
                        </ul>
                    </div>

                    <div className="academy-footer__section">
                        <h3 className="academy-footer__title">Legal</h3>
                        <ul className="academy-footer__links">
                            <li><Link to="/academy/terms-service" onClick={scrollToTop} className={isActive('/academy/terms-service') ? 'is-active' : ''}>Terms of Service</Link></li>
                            <li><Link to="/academy/privacy-and-policy" onClick={scrollToTop} className={isActive('/academy/privacy-and-policy') ? 'is-active' : ''}>Privacy Policy</Link></li>
                            <li><Link to="/academy/trust-safety" onClick={scrollToTop} className={isActive('/academy/trust-safety') ? 'is-active' : ''}>Trust & Safety</Link></li>
                        </ul>
                    </div>

                    {socialLinks.length > 0 && (
                        <div className="academy-footer__section academy-footer__social">
                            <h3 className="academy-footer__title">Follow us</h3>
                            <div className="academy-footer__social-links">
                                {socialLinks.map(({ platform, url }, idx) => (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="academy-footer__social-link"
                                        aria-label={getPlatformLabel(platform)}
                                    >
                                        <SocialIcon platform={platform} size={22} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="academy-footer__bottom">
                    <p className="academy-footer__copyright">
                        © {new Date().getFullYear()} <span>SantoMeridia Research Labs Pvt Ltd</span>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
