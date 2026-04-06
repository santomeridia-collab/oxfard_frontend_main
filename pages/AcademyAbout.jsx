import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import Footer from '../components/Footer';
import '../styles/academy.css';
import { useShopData } from '../context/AcademyContext';
import { useCurrentShopType } from '../hooks/useCurrentShopType';
import { filterByShopTypeId, getPrimaryDisplayContact, normalizeImageEntries } from '../utils/academyUtils';
// Using local normalizeImageEntries instead of aboutSec version
// import { getAboutGridImageUrls, normalizeImageEntries } from '../../../components/about/aboutSec';

const GalleryGrid = ({ items, initialCount = 3 }) => {
  const [showAll, setShowAll] = useState(false);
  const hasMore = items.length > initialCount;
  const visibleItems = showAll ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;

  return (
    <>
      <div className="academy-gallery-grid">
        {visibleItems.map((entry, idx) => {
          const isPlain = !entry.title && !entry.description;
          const isLastVisible = !showAll && idx === initialCount - 1 && hasMore;
          return (
            <div key={idx} className={`academy-gallery-card${isPlain ? ' academy-gallery-card--plain' : ''}`}>
              <div className="academy-gallery-image-wrapper">
                <img
                  src={entry.url}
                  alt={entry.title || `Gallery image ${idx + 1}`}
                  className="academy-gallery-image"
                />
                {isLastVisible && (
                  <button
                    className="academy-gallery-more-overlay"
                    onClick={() => setShowAll(true)}
                    aria-label={`Show ${hiddenCount} more images`}
                  >
                    +{hiddenCount} More
                  </button>
                )}
              </div>
              {(entry.title || entry.description) && (
                <div className="academy-gallery-info">
                  {entry.title && <h4 className="academy-gallery-title">{entry.title}</h4>}
                  {entry.description && <p className="academy-gallery-desc">{entry.description}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showAll && hasMore && (
        <div className="academy-gallery-show-less-wrap">
          <button
            className="academy-gallery-show-less-btn"
            onClick={() => setShowAll(false)}
          >
            Show Less
          </button>
        </div>
      )}
    </>
  );
};

function GallerySection({ imageEntries }) {
  const withMetadata = imageEntries.filter(e => e.title || e.description);
  const plain = imageEntries.filter(e => !e.title && !e.description);

  return (
    <section className="academy-about-gallery-section">
      <h2 className="academy-section-title">Gallery &amp; Highlights</h2>

      {withMetadata.length > 0 && (
        <div className="academy-gallery-group">
          <GalleryGrid items={withMetadata} />
        </div>
      )}

      {plain.length > 0 && (
        <div className="academy-gallery-group">
          {withMetadata.length > 0 && <h3 className="academy-gallery-subtitle">Additional Highlights</h3>}
          <GalleryGrid items={plain} />
        </div>
      )}
    </section>
  );
}

export default function AcademyAbout() {
  const { allData, loading, error } = useShopData();
  const currentShopType = useCurrentShopType();

  // Get about data from shop details and about_us
  const shopDescription = allData?.shop_details?.description || '';
  const shopName = allData?.shop_details?.name || 'Our Academy';
  const { phone: shopContactNumber, email: shopEmail } = getPrimaryDisplayContact(allData);
  const address = allData?.shop_details?.address || 'Learning Center Address';

  // Get about_us data from API - handle both array and single object formats
  const rawAbout = allData?.about_us || allData?.about || allData?.sections || [];
  const aboutData = Array.isArray(rawAbout) ? (rawAbout.length > 0 ? rawAbout : []) : [rawAbout];
  const shopTypeId = currentShopType?.shop_type_id ?? null;
  const filteredAbout = filterByShopTypeId(aboutData, shopTypeId);

  console.log('DEBUG: AcademyAbout allData:', allData);
  console.log('DEBUG: AcademyAbout currentShopType:', currentShopType);
  console.log('DEBUG: AcademyAbout filteredAbout:', filteredAbout);
  console.log('DEBUG: AcademyAbout raw aboutData:', aboutData);

  let mainAbout = null;
  if (filteredAbout.length > 0) {
    // 1. Try exact match for shopTypeId
    mainAbout = filteredAbout.find(item => item.shop_type_id == shopTypeId);

    // 2. Fallback to null shop_type_id
    if (!mainAbout) {
      mainAbout = filteredAbout.find(item => item.shop_type_id == null);
    }

    // 3. Fallback to first in filtered
    if (!mainAbout) {
      mainAbout = filteredAbout[0];
    }
  }

  // CRITICAL FALLBACK: If no match found via filtering, but we HAVE data, just use the first one
  if (!mainAbout && aboutData.length > 0 && aboutData[0]) {
    console.log('DEBUG: AcademyAbout falling back to first available item in aboutData');
    mainAbout = aboutData[0];
  }

  console.log('DEBUG: AcademyAbout selected mainAbout:', mainAbout);

  // Get home_media for hero background
  const getHomeMedia = () => {
    if (!allData?.home_media || allData.home_media.length === 0) return null;
    const academyShopType = allData?.shop_details?.shop_type?.find((t) =>
      t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
    );
    const matched = allData.home_media.find(m =>
      m.shop_type_id === academyShopType?.shop_type_id
    );
    return matched || allData.home_media[0];
  };
  const homeMedia = getHomeMedia();

  // helper for images - include all entries with potential caption
  const imageEntries = mainAbout ? normalizeImageEntries(mainAbout.image_url) : [];

  // Get instructors info
  const instructors = allData?.instructors || [];
  const stats = {
    totalCourses: allData?.courses?.length || 0,
    // some shops may provide student count or years_experience under shop_details
    totalStudents: allData?.shop_details?.studentcount || 0,
    totalInstructors: instructors.length || 0,
    yearsExperience: allData?.shop_details?.years_experience || 0,
  };

  if (loading) {
    return (
      <div className="academy-page">
        <AcademyHeader />
        <div className="academy-loading-container">
          <p className="academy-loading">Loading about information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>About | {allData?.shop_details?.shopname || shopName || 'Academy'}</title>
        <meta name="description" content={`Learn about ${shopName}. Our mission, instructors, and commitment to educational excellence.`} />
      </Helmet>
      <div className="academy-page">
        <AcademyHeader />

        {/* Hero Section */}
        <AcademyHero
          title={mainAbout?.title || `About ${shopName}`}
          subtitle={mainAbout?.subtitle || `Discover our mission and commitment to educational excellence at ${shopName}`}
          media={homeMedia}
          showCTA={false}
        />

        {/* Main Content */}
        <div className="academy-container">

          {/* About Section */}
          <section className="academy-about-section">
            <div className="academy-about-top-grid">
              {/* Left Column - Main About Content */}
              <div className="academy-about-text-content">
                <h2 className="academy-about-title">
                  {mainAbout?.heading || "Who We Are"}
                </h2>

                {mainAbout ? (
                  <div className="academy-about-main">
                    <p className="academy-about-description">{mainAbout.description}</p>
                  </div>
                ) : shopDescription ? (
                  <p className="academy-about-description">{shopDescription}</p>
                ) : null}

                {/* Optional mission & features are only rendered if provided by API */}
                {mainAbout?.mission && (
                  <>
                    <h3 className="academy-about-subtitle">Our Mission</h3>
                    <p className="academy-about-text">{mainAbout.mission}</p>
                  </>
                )}

                {mainAbout?.features && Array.isArray(mainAbout.features) && mainAbout.features.length > 0 && (
                  <>
                    <h3 className="academy-about-subtitle">Why Choose Us?</h3>
                    <ul className="academy-about-features">
                      {mainAbout.features.map((feat, idx) => (
                        <li key={idx} className="academy-feature-item">{feat}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Right Column - Stats */}
              {(stats.totalCourses || stats.totalStudents || stats.totalInstructors || stats.yearsExperience) && (
                <div className="academy-about-stats">
                  <h3 className="academy-stats-title">By The Numbers</h3>
                  <div className="academy-stats-grid">
                    {stats.totalCourses > 0 && (
                      <div className="academy-stat-item">
                        <div className="academy-stat-number">{stats.totalCourses}+</div>
                        <div className="academy-stat-label">Courses</div>
                      </div>
                    )}
                    {stats.totalStudents > 0 && (
                      <div className="academy-stat-item">
                        <div className="academy-stat-number">{stats.totalStudents.toLocaleString()}+</div>
                        <div className="academy-stat-label">Students</div>
                      </div>
                    )}
                    {stats.totalInstructors > 0 && (
                      <div className="academy-stat-item">
                        <div className="academy-stat-number">{stats.totalInstructors}+</div>
                        <div className="academy-stat-label">Instructors</div>
                      </div>
                    )}
                    {stats.yearsExperience > 0 && (
                      <div className="academy-stat-item">
                        <div className="academy-stat-number">{stats.yearsExperience}+</div>
                        <div className="academy-stat-label">Years Experience</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* New Image Gallery Section */}
          {imageEntries.length > 0 && (
            <GallerySection imageEntries={imageEntries} />
          )}

          {/* Instructors Section */}
          {instructors.length > 0 && (() => {
            const useSlider = instructors.length >= 5;

            const renderCard = (instructor, idx) => (
              <div key={idx} className="academy-instructor-card">
                {instructor.image_url ? (
                  <div className="academy-instructor-image-wrapper">
                    <img
                      src={instructor.image_url}
                      alt={instructor.name}
                      className="academy-instructor-image"
                    />
                  </div>
                ) : (
                  <div className="academy-instructor-avatar-fallback">
                    {instructor.name ? instructor.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div className="academy-instructor-info">
                  <h4 className="academy-instructor-name">{instructor.name}</h4>
                  {instructor.specialization && (
                    <p className="academy-instructor-specialization">
                      {instructor.specialization}
                    </p>
                  )}
                  {instructor.bio && (
                    <p className="academy-instructor-bio">{instructor.bio}</p>
                  )}
                </div>
              </div>
            );

            return (
              <section className="academy-instructors-section">
                <div className="academy-container">
                  <h2 className="academy-section-title">Our Instructors</h2>
                  <p className="academy-instructors-subtitle">Meet the experts behind our courses</p>
                </div>

                {useSlider ? (
                  /* Auto-sliding marquee for 5+ instructors */
                  <div className="academy-instructors-slider-viewport">
                    <div className="academy-instructors-track">
                      {/* duplicate once for seamless loop */}
                      {[...instructors, ...instructors].map((instructor, idx) => renderCard(instructor, idx))}
                    </div>
                  </div>
                ) : (
                  /* Centered grid for ≤4 instructors */
                  <div className="academy-container">
                    <div className="academy-instructors-centered-grid">
                      {instructors.map((instructor, idx) => renderCard(instructor, idx))}
                    </div>
                  </div>
                )}
              </section>
            );
          })()}

          {/* Contact Information Section */}
          <section className="academy-about-contact-section">
            <h2 className="academy-section-title">Get in Touch</h2>
            <div className="academy-about-contact-info-grid">
              {shopEmail && (
                <div className="academy-about-contact-info-item">
                  <h4 className="academy-about-contact-info-title">📧 Email</h4>
                  <a href={`mailto:${shopEmail}`} className="academy-about-contact-info-link">
                    {shopEmail}
                  </a>
                </div>
              )}
              {shopContactNumber && (
                <div className="academy-about-contact-info-item">
                  <h4 className="academy-about-contact-info-title">📞 Phone</h4>
                  <a href={`tel:${shopContactNumber.replace(/\s/g, '')}`} className="academy-about-contact-info-link">
                    {shopContactNumber}
                  </a>
                </div>
              )}
              {address && (
                <div className="academy-about-contact-info-item">
                  <h4 className="academy-about-contact-info-title">📍 Address</h4>
                  <p className="academy-about-contact-info-text">{address}</p>
                </div>
              )}
            </div>
          </section>

          {
            error && (
              <div className="academy-error-message">
                <p>Note: Some data could not be loaded. {error}</p>
              </div>
            )
          }
        </div >
      </div >
      <Footer />
    </>
  );
}
