import React from 'react';

const HowItWorks = () => {
  const steps = [
    { title: 'Register Online', desc: 'Fill the form in 5 minutes. Create your donor profile.' },
    { title: 'Get Screened', desc: 'Quick health check at your nearest center.' },
    { title: 'Donate Blood', desc: '8-12 minute donation process. Comfortable chairs, music.' },
    { title: 'Save Lives', desc: 'Get SMS when your blood saves someone\'s life!' }
  ];

  return (
    <section className="py-[100px] px-[30px] bg-white">
      <div className="text-center max-w-[700px] mx-auto mb-[60px]">
        <span className="section-badge">Simple Process</span>
        <h2 className="text-3xl md:text-[3rem] font-extrabold mb-5 font-clash">How It <span className="gradient-text">Works</span></h2>
        <p className="text-gray text-lg leading-relaxed">Four simple steps to become a life-saver</p>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px] relative">
        <div className="hidden lg:block absolute top-20 left-[10%] w-[80%] h-0.5 bg-linear-to-r from-primary to-transparent z-0"></div>
        {steps.map((step, i) => (
          <div key={i} className="text-center relative z-1">
            <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px] text-[2rem] font-bold text-white relative after:content-[''] after:absolute after:inset-[-5px] after:bg-linear-to-br after:from-primary after:to-primary-light after:rounded-full after:opacity-30 after:z-[-1] after:animate-pulse-step">
              {i + 1}
            </div>
            <h3 className="text-[1.3rem] mb-2.5 font-clash">{step.title}</h3>
            <p className="text-gray leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
