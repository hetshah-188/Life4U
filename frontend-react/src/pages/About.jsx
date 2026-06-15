import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { bloodbankService } from '../services/api';

const About = () => {
  const [stats, setStats] = useState({
    livesSaved: '100K+',
    hospitals: '200+',
    cities: '500+',
    responseTime: '45min'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await bloodbankService.getStats();
        if (response.success && response.data) {
          const { requests } = response.data;
          setStats(prev => ({
            ...prev,
            livesSaved: `${requests.fulfilled || '100K'}+`,
            responseTime: '45min'
          }));
        }
      } catch (error) {
        console.error('Error fetching blood bank stats:', error);
        // Stats will retain default values defined in useState
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-linear-to-br from-[#fce6e6] to-white py-[60px] px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-radial-to-br from-primary/10 to-transparent rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255, 51, 102, 0.1) 0%, transparent 70%)' }}
        ></div>
        <div className="max-w-(--breakpoint-lg) mx-auto relative z-1">
          <h1 className="text-[3.5rem] mb-5 font-clash font-bold">
            Saving Lives Through <span className="gradient-text">Technology & Compassion</span>
          </h1>
          <p className="text-xl text-gray max-w-[700px] mx-auto">
            Since 2010, we've connected over 100,000 donors with patients in need, saving countless lives across India.
          </p>
        </div>
      </section>

      {/* Stats Banner */}
      <div className="bg-linear-to-br from-primary to-primary-light text-white py-10 px-6 mt-[-20px] relative z-2 rounded-t-[30px]">
        <div className="max-w-[1280px] mx-auto flex justify-around flex-wrap gap-[30px]">
          <div className="text-center">
            <h3 className="text-[2.5rem] font-extrabold mb-1.25">{stats.livesSaved}</h3>
            <p className="text-base opacity-90">Lives Saved</p>
          </div>
          <div className="text-center">
            <h3 className="text-[2.5rem] font-extrabold mb-1.25">{stats.hospitals}</h3>
            <p className="text-base opacity-90">Hospital Partners</p>
          </div>
          <div className="text-center">
            <h3 className="text-[2.5rem] font-extrabold mb-1.25">{stats.cities}</h3>
            <p className="text-base opacity-90">Cities Covered</p>
          </div>
          <div className="text-center">
            <h3 className="text-[2.5rem] font-extrabold mb-1.25">{stats.responseTime}</h3>
            <p className="text-base opacity-90">Avg Response Time</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Mission Card */}
          <div className="bg-white rounded-lg p-10 shadow-md border border-[#E2E8F0] transition-all hover:-translate-y-1.25 hover:shadow-lg relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-linear-to-b before:from-primary before:to-primary-light">
            <h2 className="text-[2rem] mb-5 flex items-center gap-2.5 font-clash font-semibold">
              <i className="fas fa-bullseye text-primary"></i> Our Mission
            </h2>
            <p className="text-gray mb-[30px] text-[1.1rem] leading-[1.8]">
              To ensure that no patient in India ever has to wait for blood during medical emergencies by creating a seamless, technology-driven bridge between voluntary donors and those in need.
            </p>
            <h3 className="mt-[30px] mb-5 text-[1.3rem] font-bold">How We Do It:</h3>
            <ul className="list-none">
              <li className="flex items-center gap-[15px] mb-5 p-[15px] bg-[#F8FAFC] rounded-sm transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group">
                <i className="fas fa-bolt text-primary text-[1.2rem] group-hover:text-white"></i>
                <span><strong>Real-time Matching:</strong> Intelligent algorithms connect donors with patients instantly.</span>
              </li>
              <li className="flex items-center gap-[15px] mb-5 p-[15px] bg-[#F8FAFC] rounded-sm transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group">
                <i className="fas fa-ambulance text-primary text-[1.2rem] group-hover:text-white"></i>
                <span><strong>Emergency Response:</strong> 24/7 system for urgent blood requirements with 45min average response.</span>
              </li>
              <li className="flex items-center gap-[15px] mb-5 p-[15px] bg-[#F8FAFC] rounded-sm transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group">
                <i className="fas fa-users text-primary text-[1.2rem] group-hover:text-white"></i>
                <span><strong>Community Building:</strong> Creating a culture of regular blood donation through engagement.</span>
              </li>
            </ul>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-lg p-10 shadow-md border border-[#E2E8F0] transition-all hover:-translate-y-1.25 hover:shadow-lg relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-linear-to-b before:from-primary before:to-primary-light">
            <h2 className="text-[2rem] mb-5 flex items-center gap-2.5 font-clash font-semibold">
              <i className="fas fa-eye text-primary"></i> Our Vision
            </h2>
            <p className="text-gray mb-[30px] text-[1.1rem] leading-[1.8]">
              To build India's most trusted and efficient blood donation ecosystem where every eligible citizen becomes a regular donor, eliminating blood shortages forever.
            </p>
            <h3 className="mt-[30px] mb-5 text-[1.3rem] font-bold">Our 2030 Goals:</h3>
            <div className="mt-[30px]">
              <div className="flex items-center gap-[15px] mb-5 p-[15px] bg-[#F8FAFC] rounded-sm transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group">
                <span className="text-[1.5rem] font-extrabold text-primary min-w-20 group-hover:text-white">1% → 5%</span>
                <p className="m-0 text-dark group-hover:text-white">Increase donation rate from 1% to 5% of population</p>
              </div>
              <div className="flex items-center gap-[15px] mb-5 p-[15px] bg-[#F8FAFC] rounded-sm transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group">
                <span className="text-[1.5rem] font-extrabold text-primary min-w-20 group-hover:text-white">30min</span>
                <p className="m-0 text-dark group-hover:text-white">Reduce emergency response time to under 30 minutes</p>
              </div>
              <div className="flex items-center gap-[15px] mb-5 p-[15px] bg-[#F8FAFC] rounded-sm transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group">
                <span className="text-[1.5rem] font-extrabold text-primary min-w-20 group-hover:text-white">500+</span>
                <p className="m-0 text-dark group-hover:text-white">Expand to 500+ cities across India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[2.5rem] text-center mb-5 font-clash font-semibold">Our Core <span className="gradient-text">Values</span></h2>
          <p className="text-center text-gray max-w-[700px] mx-auto mb-[60px] text-[1.1rem]">The principles that guide every decision we make and every life we touch.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
            <div className="bg-white rounded-lg p-[40px_30px] shadow-md border border-[#E2E8F0] transition-all hover:-translate-y-2.5 hover:shadow-lg text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light translate-x-[-100%] transition-transform duration-300 group-hover:translate-x-0"></div>
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px]">
                <i className="fas fa-heart text-[2.5rem] text-white"></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold">Life First</h3>
              <p className="text-gray leading-[1.8]">Every decision prioritizes patient safety and timely access to blood. Zero tolerance for quality compromise. We treat every unit of blood as if it's for our own family.</p>
            </div>

            <div className="bg-white rounded-lg p-[40px_30px] shadow-md border border-[#E2E8F0] transition-all hover:-translate-y-2.5 hover:shadow-lg text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light translate-x-[-100%] transition-transform duration-300 group-hover:translate-x-0"></div>
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px]">
                <i className="fas fa-robot text-[2.5rem] text-white"></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold">Technology with Heart</h3>
              <p className="text-gray leading-[1.8]">We combine cutting-edge AI with human empathy, creating systems designed for ease of use while maintaining that crucial personal touch in every interaction.</p>
            </div>

            <div className="bg-white rounded-lg p-[40px_30px] shadow-md border border-[#E2E8F0] transition-all hover:-translate-y-2.5 hover:shadow-lg text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light translate-x-[-100%] transition-transform duration-300 group-hover:translate-x-0"></div>
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px]">
                <i className="fas fa-hand-holding-heart text-[2.5rem] text-white"></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold">Community Powered</h3>
              <p className="text-gray leading-[1.8]">We believe in the power of community participation, building local donor networks and volunteer-driven initiatives that strengthen neighborhoods.</p>
            </div>

            <div className="bg-white rounded-lg p-[40px_30px] shadow-md border border-[#E2E8F0] transition-all hover:-translate-y-2.5 hover:shadow-lg text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light translate-x-[-100%] transition-transform duration-300 group-hover:translate-x-0"></div>
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px]">
                <i className="fas fa-shield-alt text-[2.5rem] text-white"></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold">Transparency & Trust</h3>
              <p className="text-gray leading-[1.8]">From donor to recipient, every step is trackable with real-time status updates and public dashboards. No secrets, just complete transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 px-6 bg-linear-to-br from-[#fce6e6] to-white">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[2.5rem] text-center mb-[60px] font-clash font-semibold">Meet Our <span className="gradient-text">Leadership</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {/* Dr. Rajesh Kumar */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-2.5 hover:shadow-lg">
              <div className="h-[250px] bg-linear-to-br from-primary to-primary-light flex items-center justify-center relative">
                <i className="fas fa-user-md text-[8rem] text-white/30"></i>
              </div>
              <div className="p-[30px]">
                <h3 className="text-[1.5rem] mb-[5px] font-bold">Dr. Rajesh Kumar</h3>
                <div className="text-primary font-semibold mb-[15px]">Founder & Chief Medical Officer</div>
                <p className="text-gray italic leading-[1.8] relative pl-5 border-l-3 border-primary">
                  "Losing a patient for want of blood changed my life. This platform is our promise that no one else has to suffer the same fate. Every donation notification reminds us why we do this."
                </p>
                <p className="text-gray mt-[15px] text-[0.9rem]">MBBS, MD (Hematology) | 25+ years experience</p>
              </div>
            </div>

            {/* Dr. Priya Sharma */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-2.5 hover:shadow-lg">
              <div className="h-[250px] bg-linear-to-br from-primary to-primary-light flex items-center justify-center relative">
                <i className="fas fa-user-nurse text-[8rem] text-white/30"></i>
              </div>
              <div className="p-[30px]">
                <h3 className="text-[1.5rem] mb-[5px] font-bold">Dr. Priya Sharma</h3>
                <div className="text-primary font-semibold mb-[15px]">Medical Director</div>
                <p className="text-gray italic leading-[1.8] relative pl-5 border-l-3 border-primary">
                  "In transfusion medicine, every second counts. We've built systems that ensure the right blood reaches the right patient at the right time. That's our commitment."
                </p>
                <p className="text-gray mt-[15px] text-[0.9rem]">15 years in transfusion medicine | AIIMS Alumna</p>
              </div>
            </div>

            {/* Community Leader */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-2.5 hover:shadow-lg">
              <div className="h-[250px] bg-linear-to-br from-primary to-primary-light flex items-center justify-center relative">
                <i className="fas fa-users-cog text-[8rem] text-white/30"></i>
              </div>
              <div className="p-[30px]">
                <h3 className="text-[1.5rem] mb-[5px] font-bold">Community Council</h3>
                <div className="text-primary font-semibold mb-[15px]">Volunteer Leadership</div>
                <p className="text-gray italic leading-[1.8] relative pl-5 border-l-3 border-primary">
                  "We believe in the power of community participation, building local donor networks and volunteer-driven initiatives across 500+ cities."
                </p>
                <p className="text-gray mt-[15px] text-[0.9rem]">10,000+ Active Volunteers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Promise */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-center text-[2.5rem] mb-[60px] font-clash font-semibold">Our Safety <span className="gradient-text">Promise</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            <div className="bg-linear-to-br from-[#fce6e6] to-white rounded-lg p-[40px_30px] text-center transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center mx-auto mb-[25px] shadow-md">
                <i className="fas fa-shield-virus text-[2rem] text-primary"></i>
              </div>
              <h3 className="text-[1.3rem] mb-[15px] font-bold">Quality Certifications</h3>
              <p className="text-gray">From donor to recipient, every step is trackable with real-time status updates and public dashboards. ISO 9001:2015 certified.</p>
            </div>

            <div className="bg-linear-to-br from-[#fce6e6] to-white rounded-lg p-[40px_30px] text-center transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center mx-auto mb-[25px] shadow-md">
                <i className="fas fa-flask text-[2rem] text-primary"></i>
              </div>
              <h3 className="text-[1.3rem] mb-[15px] font-bold">Advanced Screening</h3>
              <p className="text-gray">Every donation undergoes comprehensive testing for 8+ infectious diseases using latest technology. Your safety is our priority.</p>
            </div>

            <div className="bg-linear-to-br from-[#fce6e6] to-white rounded-lg p-[40px_30px] text-center transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center mx-auto mb-[25px] shadow-md">
                <i className="fas fa-hand-holding-medical text-[2rem] text-primary"></i>
              </div>
              <h3 className="text-[1.3rem] mb-[15px] font-bold">Sterile Process</h3>
              <p className="text-gray">Single-use, sterile equipment for every donation. Trained professionals ensure safe and comfortable experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Recognition */}
      <section className="py-20 px-6 bg-linear-to-br from-[#fce6e6] to-white">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[2.5rem] text-center mb-5 font-clash font-semibold">Partners & <span className="gradient-text">Recognition</span></h2>
          <p className="text-center text-gray max-w-[700px] mx-auto mb-[60px] text-[1.1rem]">Trusted by leading healthcare institutions and certified by national bodies</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
            <div className="bg-white rounded-lg p-[30px] text-center shadow-md transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-certificate text-[2.5rem] text-primary"></i>
              </div>
              <h3 className="text-[1.2rem] mb-[10px] font-bold">National Blood Transfusion Council</h3>
              <p className="text-gray text-[0.9rem]">Certified Partner</p>
            </div>

            <div className="bg-white rounded-lg p-[30px] text-center shadow-md transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-award text-[2.5rem] text-primary"></i>
              </div>
              <h3 className="text-[1.2rem] mb-[10px] font-bold">ISO 9001:2015</h3>
              <p className="text-gray text-[0.9rem]">Quality Management</p>
            </div>

            <div className="bg-white rounded-lg p-[30px] text-center shadow-md transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-hospital text-[2.5rem] text-primary"></i>
              </div>
              <h3 className="text-[1.2rem] mb-[10px] font-bold">NABH</h3>
              <p className="text-gray text-[0.9rem]">Hospital Partnerships</p>
            </div>

            <div className="bg-white rounded-lg p-[30px] text-center shadow-md transition-all hover:-translate-y-1.25 hover:shadow-lg">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-5">
                <i className="fas fa-trophy text-[2.5rem] text-primary"></i>
              </div>
              <h3 className="text-[1.2rem] mb-[10px] font-bold">Best Health Tech Startup</h3>
              <p className="text-gray text-[0.9rem]">India Innovation Summit 2018</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Mission CTA */}
      <section className="py-20 px-6 bg-linear-to-br from-primary to-primary-light text-white text-center">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[2.5rem] mb-5 font-clash font-semibold">Join Our <span className="text-white">Mission</span></h2>
          <p className="text-[1.2rem] max-w-[700px] mx-auto mb-10 opacity-90">Whether you are a donor, a volunteer, a corporate partner, or a hospital, you can be part of this life-saving journey.</p>
          <div className="flex gap-5 justify-center flex-wrap">
            <Link to="/signup" className="px-10 py-4 bg-white text-primary rounded-[50px] font-semibold transition-all hover:-translate-y-0.75 hover:shadow-xl inline-flex items-center gap-2.5 no-underline">
              <i className="fas fa-hand-holding-heart"></i> Become a Donor
            </Link>
            <a href="#" className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-[50px] font-semibold transition-all hover:bg-white hover:text-primary hover:-translate-y-0.75 inline-flex items-center gap-2.5 no-underline">
              <i className="fas fa-handshake"></i> Partner With Us
            </a>
            <Link to="/admin-dashboard" className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-[50px] font-semibold transition-all hover:bg-white hover:text-primary hover:-translate-y-0.75 inline-flex items-center gap-2.5 no-underline">
              <i className="fas fa-building"></i> Hospital Login
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
