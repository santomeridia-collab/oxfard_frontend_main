import React, { useState } from 'react';
import '../styles/academy.css';

export default function CurriculumAccordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="academy-curriculum">
      {items.map((item, idx) => (
        <div className="academy-curriculum__item" key={idx}>
          <button className="academy-curriculum__title" type="button" onClick={() => setOpen(open === idx ? null : idx)}>
            {item.title}
            <span className="academy-curriculum__chev">{open === idx ? '−' : '+'}</span>
          </button>
          {open === idx && (
            <div className="academy-curriculum__body">
              <ul>
                {item.lessons.map((l, i) => (
                  <li key={i}>
                    {l.title}
                    {l.isPreview && <span className="academy-lesson-preview"> (preview)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
