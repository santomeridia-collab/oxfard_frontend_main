import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/academy.css';

// Path segment to display label (for static segments)
const SEGMENT_LABELS = {
  academy: 'Home',
  about: 'About',
  contact: 'Contact',
  courses: 'Courses',
  course: 'Course',
  news: 'News / Blog',
  blog: 'News / Blog',
  'events-gallery': 'Gallery / Events',
  event: 'Event',
  'trust-safety': 'Trust & Safety',
  'terms-service': 'Terms of Service',
  'privacy-and-policy': 'Privacy Policy',
};

/**
 * Builds breadcrumb items from current pathname.
 * Handles dynamic segments (e.g. courseId, id) with generic labels.
 */
function useBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, '') || '/';
  const base = '/academy';

  if (!pathname.startsWith(base)) return [];

  const segments = pathname.slice(base.length).split('/').filter(Boolean);
  if (segments.length === 0) return [{ path: base, label: 'Home', isLast: true }];

  const items = [];
  let acc = base;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;
    const nextSeg = segments[i + 1];
    const isNextDynamic = nextSeg && !SEGMENT_LABELS[nextSeg] && (/^[\d-a-f]+$/i.test(nextSeg) || nextSeg.length > 10);

    // Event detail: /academy/event/:id → "Home / Gallery / Events / Detail" (same pattern as News/Blog → Home / News / Blog / Article)
    if (seg === 'event' && i === 0 && isNextDynamic) {
      items.push({ path: `${base}/events-gallery`, label: 'Gallery / Events', isLast: false });
      acc = `${acc}/${seg}/${nextSeg}`;
      items.push({ path: acc, label: 'Detail', isLast: true });
      break;
    }
    if (seg === 'event' && i === 0) {
      items.push({ path: `${base}/events-gallery`, label: 'Gallery / Events', isLast: false });
    }

    // Course details page: /academy/course/:id → show only "Home / Course" (no duplicate "Course")
    if (seg === 'course' && isNextDynamic) {
      acc = `${acc}/${seg}/${nextSeg}`;
      items.push({ path: acc, label: 'Course', isLast: true });
      break;
    }

    acc = `${acc}/${seg}`;

    // Known static segments (e.g. events-gallery) must not be treated as dynamic even if long
    const isKnownSegment = seg in SEGMENT_LABELS;
    const isDynamic = !isKnownSegment && (/^[\d-a-f]+$/i.test(seg) || seg.length > 10);
    let label;

    if (isDynamic) {
      const prevSeg = segments[i - 1];
      if (prevSeg === 'news' || prevSeg === 'blog') label = 'Article';
      else if (prevSeg === 'event') label = 'Detail';
      else label = 'Details';
    } else {
      label = SEGMENT_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    items.push({ path: acc, label, isLast });
  }

  return [{ path: base, label: 'Home', isLast: false }, ...items];
}

export default function Breadcrumb() {
  const items = useBreadcrumbs();

  if (items.length <= 1) return null;

  return (
    <nav
      className="academy-breadcrumb"
      aria-label="Breadcrumb"
    >
      <ol className="academy-breadcrumb__list" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li
            key={item.path}
            className="academy-breadcrumb__item"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <span className="academy-breadcrumb__sep" aria-hidden="true">
                /
              </span>
            )}
            {item.isLast ? (
              <span className="academy-breadcrumb__current" itemProp="name" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="academy-breadcrumb__link"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
