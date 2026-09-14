import React from 'react';
import { Link } from 'react-router-dom';
import AcademyHeader from '../components/AcademyHeader';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import '../styles/academy.css';

const verificationUrl = 'https://verify.oxfordstudycenter.com';

export default function AcademyVerification() {
  return (
    <>
      <Helmet>
        <title>Verification | Oxford Community College</title>
        <meta
          name="description"
          content="Verify your details using the Oxford Study Center verification portal."
        />
      </Helmet>

      <div className="academy-page">
        <AcademyHeader />

        <div className="academy-hero academy-hero--small">
          <div className="academy-container">
            <div className="academy-hero__content">
              <h1 className="academy-hero__title">Verification</h1>
              <p className="academy-hero__subtitle">
                Open the verification portal below. After verification, use the button to return to the Oxford Community College home page.
              </p>
              <div className="academy-hero__actions">
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="academy-btn academy-btn--primary"
                >
                  Open Verification Portal
                </a>
                <Link to="/academy" className="academy-btn academy-btn--secondary">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
