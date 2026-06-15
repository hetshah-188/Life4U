import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-[100px] px-[30px] bg-linear-to-br from-primary to-primary-light text-white text-center relative overflow-hidden">
      <div className="absolute left-[-5%] bottom-[-20%] text-[20rem] opacity-10 rotate-15 animate-float-cta pointer-events-none">🩸</div>
      <div className="absolute right-[-5%] top-[-20%] text-[15rem] opacity-10 -rotate-15 animate-float-cta [animation-direction:reverse] pointer-events-none">❤️</div>

      <div className="max-w-[800px] mx-auto relative z-1">
        <h2 className="text-3xl md:text-[3.5rem] font-extrabold mb-5 font-clash">Ready to Be a <span className="text-white">Hero?</span></h2>
        <p className="text-[1.3rem] opacity-90 mb-10 leading-relaxed">Join 100,000+ donors saving lives across India. It takes only 45 minutes to save 3 lives.</p>
        <div className="flex flex-wrap gap-5 justify-center">
          <Link to="/become-donor" className="px-[45px] py-[18px] bg-white text-primary rounded-2xl font-bold text-[1.1rem] transition-all duration-300 inline-flex items-center gap-2.5 no-underline hover:-translate-y-0.75 hover:shadow-[0_20px_30px_rgba(0,0,0,0.2)]">
            <i className="fas fa-hand-holding-heart"></i> Become a Donor
          </Link>
          <Link to="/login" className="px-[45px] py-[18px] bg-transparent text-white rounded-2xl font-bold text-[1.1rem] transition-all duration-300 inline-flex items-center gap-2.5 no-underline border-2 border-white hover:bg-white hover:text-primary hover:-translate-y-0.75">
            <i className="fas fa-calendar-check"></i> Schedule Donation
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
