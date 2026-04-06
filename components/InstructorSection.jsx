import React from 'react';
import '../styles/academy.css';

export default function InstructorSection({ instructor = {} }) {
  return (
    <section className="academy-instructor">
      <div className="academy-instructor__header">
        {instructor.photo && <img className="academy-instructor__photo" src={instructor.photo} alt={instructor.name} />}
        <div className="academy-instructor__info">
          <h4 className="academy-instructor__name">{instructor.name}</h4>
          {instructor.designation && <p className="academy-instructor__designation">{instructor.designation}</p>}
        </div>
      </div>
      {instructor.bio && <p className="academy-instructor__bio">{instructor.bio}</p>}
    </section>
  );
}
