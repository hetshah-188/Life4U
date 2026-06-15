import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
    })), []);

  return (
    <section className="min-h-[90vh] flex items-center relative overflow-hidden bg-linear-to-br from-[#FFF5F5] to-[#F0F7FF] py-10 px-[30px]" id="home">
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none">
        {/* Simple particle placeholders */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2.5 h-2.5 bg-primary rounded-full animate-float-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDuration: p.duration,
              animationDelay: p.delay
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center relative z-1">
        <div className="animate-fadeInLeft">
          <span className="inline-block px-5 py-2 bg-primary/10 rounded-2xl text-primary font-semibold text-sm mb-5 border border-primary/20 backdrop-blur-md">
            <i className="fas fa-bolt"></i> Emergency Response 24/7
          </span>
          <h1 className="text-4xl md:text-[4.5rem] font-extrabold leading-[1.1] mb-6 font-clash">
            Every Drop <span className="bg-linear-to-br from-primary to-primary-light bg-clip-text text-transparent inline-block">Saves</span><br />
            Up to <span className="bg-linear-to-br from-primary to-primary-light bg-clip-text text-transparent inline-block">3 Lives</span>
          </h1>
          <p className="text-xl text-gray mb-[30px] leading-relaxed max-w-[90%]">
            Join 100,000+ donors in our mission to ensure no patient waits for blood. Simple, safe, and impactful. Be someone's hero today.
          </p>
          <div className="flex flex-wrap gap-5 mb-10">
            <Link to="/become-donor" className="btn-primary">
              <i className="fas fa-hand-holding-heart"></i> Become a Donor
            </Link>
            <a href="#blood-stock" className="btn-secondary">
              <i className="fas fa-tint"></i> Check Blood Stock
            </a>
          </div>
          <div className="flex gap-10 flex-wrap">
            {[
              { num: '100K+', label: 'Active Donors' },
              { num: '45min', label: 'Response Time' },
              { num: '300K+', label: 'Lives Saved' },
              { num: '500+', label: 'Cities' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-[2.5rem] font-extrabold bg-linear-to-br from-primary to-primary-light bg-clip-text text-transparent leading-none mb-1.25">
                  {stat.num}
                </div>
                <div className="text-gray text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fadeInRight hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Blood Donation"
            className="w-full h-auto rounded-lg shadow-xl [perspective:1000px] [transform:rotateY(-10deg)] transition-transform duration-500 hover:[transform:rotateY(0deg)]"
          />

          <div className="absolute top-[-30px] right-[-30px] bg-white/90 backdrop-blur-[10px] p-[15px_25px] rounded-lg shadow-lg flex items-center gap-[15px] animate-float">
            <div className="w-[50px] h-[50px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-[1.5rem]">
              <i className="fas fa-heart"></i>
            </div>
            <div>
              <h4 className="text-base mb-1 font-clash">3 Lives Saved</h4>
              <p className="text-sm text-gray m-0">Just 45 minutes ago</p>
            </div>
          </div>

          <div className="absolute bottom-[50px] left-[-30px] bg-white/90 backdrop-blur-[10px] p-[15px_25px] rounded-lg shadow-lg flex items-center gap-[15px] animate-float [animation-delay:2s]">
            <div className="w-[50px] h-[50px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-[1.5rem]">
              <i className="fas fa-tint"></i>
            </div>
            <div>
              <h4 className="text-base mb-1 font-clash">O+ Available</h4>
              <p className="text-sm text-gray m-0">48 units in stock</p>
            </div>
          </div>

          <div className="absolute bottom-[-30px] right-[50px] bg-white/90 backdrop-blur-[10px] p-[15px_25px] rounded-lg shadow-lg flex items-center gap-[15px] animate-float [animation-delay:1s]">
            <div className="w-[50px] h-[50px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-[1.5rem]">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <h4 className="text-base mb-1 font-clash">Emergency Response</h4>
              <p className="text-sm text-gray m-0">24/7 Active</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
