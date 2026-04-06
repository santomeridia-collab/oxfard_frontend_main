import React, { useState } from 'react';
import '../styles/academy.css';

export default function FAQAccordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  
  return (
    <div className="academy-faq">
      {items.map((item, idx) => (
        <div className="academy-faq__item" key={idx}>
          <button 
            className="academy-faq__title" 
            type="button" 
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <span className="academy-faq__question">{item.question}</span>
            <span className="academy-faq__icon">{open === idx ? '−' : '+'}</span>
          </button>
          {open === idx && (
            <div className="academy-faq__body">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
