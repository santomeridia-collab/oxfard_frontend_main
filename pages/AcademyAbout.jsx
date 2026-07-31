import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import Footer from '../components/Footer';
import { useAcademyData } from '../context/AcademyContext';
import '../styles/academy.css';

const galleryImages = [
  '/images/about1.jpg',
  '/images/about2.jpg',
  '/images/about3.jpg',
  '/images/about4.jpg',
  '/images/about5.jpg',
];

const defaultInstructors = [
  {
    name: 'Expert Faculty',
    specialization: 'Professional Training',
    bio: 'Experienced and certified trainers committed to student success.',
    image_url: '/images/instructor1.jpg',
  },
  {
    name: 'Industry Mentors',
    specialization: 'Career Guidance',
    bio: 'Helping students build practical industry-ready skills.',
    image_url: '/images/instructor2.jpg',
  },
];

const stats = {
  totalCourses: 4,
  totalCenters: 2,
  // totalInstructors: 25,
  yearsExperience: 21,
};

const GalleryGrid = ({ items, initialCount = 3 }) => {
  const [showAll, setShowAll] = useState(false);

  const hasMore = items.length > initialCount;
  const visibleItems = showAll ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;

  return (
    <>
      <div className="academy-gallery-grid">
        {visibleItems.map((image, idx) => {
          const isLastVisible =
            !showAll && idx === initialCount - 1 && hasMore;

          return (
            <div key={idx} className="academy-gallery-card">
              <div className="academy-gallery-image-wrapper">
                <img
                  src={image}
                  alt={`Gallery ${idx + 1}`}
                  className="academy-gallery-image"
                />

                {isLastVisible && (
                  <button
                    className="academy-gallery-more-overlay"
                    onClick={() => setShowAll(true)}
                  >
                    +{hiddenCount} More
                  </button>
                )}
              </div>
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

export default function AcademyAbout() {
  const { allData } = useAcademyData();
  const instructors = allData?.instructors?.length
    ? allData.instructors
    : defaultInstructors;

  return (
    <>
      <Helmet>
        <title>About | Oxford Community College</title>
        <meta
          name="description"
          content="Learn about Oxford Community College, our mission, achievements, and commitment to quality education."
        />
      </Helmet>

      <div className="academy-page">
        <AcademyHeader />

        <AcademyHero
          title="About Oxford Community College"
          subtitle="Empowering students through quality education and career-focused training since 1998."
          media={{
            image_url: '/images/about-banner.jpg',
          }}
          showCTA={false}
        />

        <div className="academy-container">

          {/* About Section */}
          <section className="academy-about-section">
            <div className="academy-about-top-grid">

              {/* Left Content */}
              <div className="academy-about-text-content">
                <h2 className="academy-about-title">
                  Who We Are?
                </h2>

                <p className="academy-about-description">
                  The Oxford Community College was founded in 1998 at Wandoor,
                  Malappuram, to give career-minded and ambitious students the
                  necessary supervision. Oxford Community College has been
                  obsessed with quality from its beginning, and it is the
                  institution's defining feature.
                </p>

                <p className="academy-about-description">
                  Oxford Community College has always gone above and beyond to
                  guarantee that students have competent and K-TET certified
                  instructors to educate them and the ideal environment to set
                  the stage for the finest learning experience.
                </p>

                <p className="academy-about-description">
                  Our campuses set the standard for quality and standards with
                  clean classrooms and innovative, up-to-date teaching
                  techniques.
                </p>

                <p className="academy-about-description">
                  We have graduated over 5000 students, and 80 percent of them
                  have found employment. We presently have two locations:
                  Wandoor and Kalikavu.
                </p>

                <p className="academy-about-description">
                  We have received accreditation from the APJ Abdul Kalam
                  Technological University. We are the only KGTE fashion
                  designing and garment manufacturing technology school in
                  Eranad taluk.
                </p>

                <p className="academy-about-description">
                  We've completed four batches of KGTE courses and have a
                  perfect placement record. We are also a KGCE-accredited
                  college that offers fine arts animation courses.
                </p>

                <p className="academy-about-description">
                  C-DIT, a government branch specialising in technical
                  education, has also certified Oxford Community College.
                </p>

                <p className="academy-about-description">
                  Our college also offers a pre-primary teacher training course
                  accredited by Jain University.
                </p>

                <p className="academy-about-description">
                  We provide a variety of paramedical courses. Our college also
                  offers DMLT, MLT, and pharmacy assistant courses, with around
                  200 to 300 students graduating each year.
                </p>

                <p className="academy-about-description">
                  We've been giving online fashion design courses to 6000+
                  students worldwide for the past year through our Oxford School
                  of Fashion Design wing.
                </p>

                <p className="academy-about-description">
                  We've also created a learning app for this online fashion
                  design course that can give high-quality live sessions,
                  recorded lessons, and more.
                </p>

                <h3 className="academy-about-subtitle">
                  Our Mission
                </h3>

                <p className="academy-about-text">
                  Oxford Community College is dedicated to and involved in
                  several social service projects. We take all socially relevant
                  and charitable initiatives extremely seriously since they are
                  important to our institution's philosophy.
                </p>

                <p className="academy-about-text">
                  To empower women in our community by helping them attain
                  financial stability, we have created a two-year free course on
                  fashion designing for those women who want to work and earn
                  money to support their livelihood.
                </p>
              </div>

              {/* Stats */}
              <div className="academy-about-stats">
                <h3 className="academy-stats-title">
                  By The Numbers
                </h3>

                <div className="academy-stats-grid">

                  <div className="academy-stat-item">
                    <div className="academy-stat-number">
                      {stats.totalCourses}+
                    </div>
                    <div className="academy-stat-label">
                      Courses
                    </div>
                  </div>

                  <div className="academy-stat-item">
                    <div className="academy-stat-number">
                      {stats.totalCenters.toLocaleString()}+
                    </div>
                    <div className="academy-stat-label">
                      Centers
                    </div>
                  </div>

                  {/* <div className="academy-stat-item">
                    <div className="academy-stat-number">
                      {stats.totalInstructors}+
                    </div>
                    <div className="academy-stat-label">
                      Instructors
                    </div>
                  </div> */}

                  <div className="academy-stat-item">
                    <div className="academy-stat-number">
                      {stats.yearsExperience}+
                    </div>
                    <div className="academy-stat-label">
                      Years Experience
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* Gallery */}
          {/* <section className="academy-about-gallery-section">
            <h2 className="academy-section-title">
              Gallery & Highlights
            </h2>

            <GalleryGrid items={galleryImages} />
          </section> */}

          {/* Instructors */}
          <section className="academy-instructors-section">
            <div className="academy-container">
              <h2 className="academy-section-title">
                Our Instructors
              </h2>

              <p className="academy-instructors-subtitle">
                Meet the experts behind our courses
              </p>

              <div className="academy-instructors-centered-grid">
                {instructors.map((instructor, idx) => (
                  <div key={idx} className="academy-instructor-card">

                    <div className="academy-instructor-image-wrapper">
                      <img
                        src={encodeURI(
                          instructor.photo ||
                          instructor.image_url ||
                          instructor.image ||
                          instructor.imageUrl ||
                          instructor.url ||
                          '/images/instructor1.jpg'
                        )}
                        alt={instructor.name || instructor.title || 'Instructor'}
                        className="academy-instructor-image"
                      />
                    </div>

                    <div className="academy-instructor-info">
                      <h4 className="academy-instructor-name">
                        {instructor.name}
                      </h4>

                      <p className="academy-instructor-specialization">
                        {instructor.specialization}
                      </p>

                      <p className="academy-instructor-bio">
                        {instructor.bio}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="academy-about-contact-section">
            <h2 className="academy-section-title">
              Get in Touch
            </h2>

            <div className="academy-about-contact-info-grid">

              <div className="academy-about-contact-info-item">
                <h4 className="academy-about-contact-info-title">
                  📧 Email
                </h4>

                <a
                  href="mailto:oxfordwdr@gmail.com"
                  className="academy-about-contact-info-link"
                >
                  oxfordwdr@gmail.com
                </a>
              </div>

              <div className="academy-about-contact-info-item">
                <h4 className="academy-about-contact-info-title">
                  📞 Phone
                </h4>

                <a
                  href="tel:+91 9447260668"
                  className="academy-about-contact-info-link"
                >
                  +91 8156998798
                </a>
              </div>

              <div className="academy-about-contact-info-item">
                <h4 className="academy-about-contact-info-title">
                  📍 Address
                </h4>

                <p className="academy-about-contact-info-text">
                  Khadeeja Building
Nilambur Road,Wandoor
                </p>
              </div>

            </div>
          </section>

        </div>

        <Footer />
      </div>
    </>
  );
}