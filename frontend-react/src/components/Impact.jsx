import React from 'react';

const Impact = () => {
  const impacts = [
    { num: '100K+', label: 'Registered Donors' },
    { num: '300K+', label: 'Lives Saved' },
    { num: '500+', label: 'Cities Covered' },
    { num: '200+', label: 'Hospital Partners' }
  ];

  return (
    <section className="py-[100px] px-[30px] bg-dark text-white relative overflow-hidden">
      <div className="absolute right-[-5%] bottom-[-20%] text-[25rem] opacity-3 rotate-15 animate-heartbeat pointer-events-none">❤️</div>

      <div className="max-w-[1400px] mx-auto relative z-1">
        <div className="text-center max-w-[700px] mx-auto mb-[60px]">
          <span className="section-badge !bg-white/10 !text-white">Our Impact</span>
          <h2 className="text-3xl md:text-[3rem] font-extrabold mb-5 font-clash text-white">Making a <span className="gradient-text">Difference</span> Together</h2>
          <p className="text-white/70 text-lg leading-relaxed">Every number represents a life saved, a family reunited</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px] mb-[60px]">
          {impacts.map((impact, i) => (
            <div key={i} className="text-center p-10 bg-white/5 backdrop-blur-[10px] rounded-lg border border-white/10 transition-all duration-300 hover:-translate-y-2.5 hover:bg-white/10">
              <div className="text-[3.5rem] font-extrabold gradient-text mb-2.5 font-clash">{impact.num}</div>
              <div className="text-[1.1rem] opacity-90">{impact.label}</div>
            </div>
          ))}
        </div>

        <div className="max-w-[800px] mx-auto text-center text-2xl font-medium leading-relaxed p-10 bg-white/5 rounded-[40px] relative">
          <i className="fas fa-quote-left absolute top-5 left-5 text-[3rem] text-primary opacity-30"></i>
          <p>"Donating blood is not just about saving lives - it's about being part of something bigger than yourself. Every drop counts."</p>
          <i className="fas fa-quote-right absolute bottom-5 right-5 text-[3rem] text-primary opacity-30"></i>
          <div className="mt-5 text-base opacity-70">— Dr. Rajesh Kumar, Founder</div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
