import { Routes, Route, Navigate } from 'react-router-dom';
import { AcademyProvider } from './context/AcademyContext';
import AcademyHome from './pages/AcademyHome';
import AcademyCourses from './pages/AcademyCourses';
import CourseDetail from './pages/CourseDetail';
import AcademyAbout from './pages/AcademyAbout';
import AcademyContact from './pages/AcademyContact';
import AcademyVerification from './pages/AcademyVerification';
import AcademyTrustSafety from './pages/AcademyTrustSafety';
import AcademyTermsService from './pages/AcademyTermsService';
import AcademyPrivacyAndPolicy from './pages/AcademyPrivacyAndPolicy';
import AcademyNews from './pages/AcademyNews';
import AcademyEvents from './pages/AcademyEvents';
import NewsDetail from './pages/NewsDetail';
import BlogDetail from './pages/BlogDetail';
import EventDetail from './pages/EventDetail';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import WhatsAppFloat from './components/WhatsAppFloat';
import './styles/academy.css';
import GalleryDetail from './pages/GalleryDetail';


function App() {
    // Access store ID from environment variable
    const defaultStoreId = import.meta.env.VITE_APP_STORE_ID || "";

    return (
        <AcademyProvider initialStoreId={defaultStoreId}>
            <ScrollToTop />
            <BackToTopButton />
            <WhatsAppFloat />
            <Routes>
                <Route path="/academy">
                    <Route index element={<AcademyHome />} />
                    <Route path="courses" element={<AcademyCourses />} />
                    <Route path="course/:courseId" element={<CourseDetail />} />
                    <Route path="about" element={<AcademyAbout />} />
                    <Route path="verification" element={<AcademyVerification />} />
                    <Route path="contact" element={<AcademyContact />} />
                    <Route path="blog" element={<Navigate to="/academy/news" replace />} />
                    <Route path="blog/:id" element={<BlogDetail />} />
                  
                    <Route path="news" element={<AcademyNews />} />
                    <Route path="news/:id" element={<NewsDetail />} />
                    <Route path="events-gallery" element={<AcademyEvents />} />
                    <Route path="event/:id" element={<EventDetail />} />
                    <Route path="gallery/:id" element={<GalleryDetail />} />
                    <Route path="trust-safety" element={<AcademyTrustSafety />} />
                    <Route path="terms-service" element={<AcademyTermsService />} />
                    <Route path="privacy-and-policy" element={<AcademyPrivacyAndPolicy />} />
                </Route>
                <Route path="/" element={<Navigate to="/academy" replace />} />
            </Routes>
        </AcademyProvider>
    );
}

export default App;
