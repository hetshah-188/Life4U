import React from 'react';

const Features = () => {
  const features = [
    {
      icon: 'fa-bolt',
      title: 'Real-time Matching',
      desc: 'Our AI matches donors with patients instantly based on location and blood type.'
    },
    {
      icon: 'fa-shield-alt',
      title: '100% Secure',
      desc: 'Your data is encrypted and protected. We follow strict medical privacy guidelines.'
    },
    {
      icon: 'fa-clock',
      title: '45min Response',
      desc: 'Average emergency response time - fastest in the industry.'
    },
    {
      icon: 'fa-gift',
      title: 'Rewards Program',
      desc: 'Earn points with every donation. Redeem for vouchers and merchandise.'
    }
  ];

  return (
    <section className="py-[40px] px-[30px] bg-white relative overflow-hidden">
      <div className="text-center max-w-[700px] mx-auto mb-[30px]">
        <span className="section-badge">Why Choose Us</span>
        <h2 className="text-3xl md:text-[3rem] font-extrabold mb-5 font-clash">Making Blood Donation <span className="gradient-text">Simple & Impactful</span></h2>
        <p className="text-gray text-lg leading-relaxed">We've revolutionized the blood donation ecosystem with technology and compassion</p>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
        {features.map((feature, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md transition-all duration-300 relative overflow-hidden z-1 group hover:-translate-y-2.5 hover:shadow-xl">
            <div className="absolute top-0 left-0 w-full h-0 bg-linear-to-br from-primary to-primary-light opacity-5 transition-[height] duration-500 z-[-1] group-hover:h-full"></div>
            <div className="w-[60px] h-[60px] bg-linear-to-br from-primary to-primary-light rounded-[20px] flex items-center justify-center mb-4 text-[1.8rem] text-white -rotate-5 transition-all duration-300 group-hover:rotate-0 group-hover:scale-110">
              <i className={`fas ${feature.icon}`}></i>
            </div>
            <h3 className="text-[1.3rem] mb-[15px] font-clash">{feature.title}</h3>
            <p className="text-gray mb-5 leading-relaxed">{feature.desc}</p>
            <a href="#" className="text-primary no-underline font-semibold flex items-center gap-1.25 transition-[gap] duration-300 hover:gap-2.5">
              Learn More <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
