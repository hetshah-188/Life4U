import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { bloodbankService } from '../services/api';

const BecomeDonor = () => {
  // Eligibility Checker State
  const [checks, setChecks] = useState({
    age: false,
    weight: false,
    health: false,
    sleep: false,
    food: false,
    tattoo: false
  });

  // Countdown State
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  const [stats, setStats] = useState({
    activeDonors: '100K+',
    timeRequired: '45min',
    livesSaved: '3',
    support: '24/7'
  });

  const [faqOpen, setFaqOpen] = useState(null);

  // Fetch Stats Logic
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await bloodbankService.getStats();
        if (response.success && response.data) {
          setStats(prev => ({
            ...prev,
            activeDonors: `${response.data.donors.total}+`,
            livesSaved: '3' // Re-confirmed standard value
          }));
        }
      } catch (error) {
        console.error('Error fetching stats for Become Donor:', error);
      }
    };
    fetchStats();
  }, []);

  // Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setDate(target.getDate() + ((6 - target.getDay() + 7) % 7));
      target.setHours(9, 0, 0, 0);

      const diff = target - now;
      if (diff <= 0) {
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      } else {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
          seconds: Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0')
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const progressPercent = (checkedCount / 6) * 100;

  const isEligible = checkedCount === 6;
  const isClose = checkedCount >= 4;

  return (
    <Layout>
      {/* Donor Countdown Timer */}
      <div className="bg-linear-to-br from-primary to-primary-light py-10 px-6 text-white text-center">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-[1.5rem] mb-5 font-semibold">⏰ Next Donation Camp in Your Area Starts In:</div>
          <div className="flex justify-center gap-10 flex-wrap">
            {[
              { val: countdown.days, label: "Days" },
              { val: countdown.hours, label: "Hours" },
              { val: countdown.minutes, label: "Minutes" },
              { val: countdown.seconds, label: "Seconds" }
            ].map((unit, i) => (
              <div key={i} className="text-center">
                <div className="text-[3rem] font-extrabold bg-white/20 p-5 rounded-[20px] min-w-[120px]">{unit.val}</div>
                <div className="mt-2.5 text-base opacity-90">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] py-[100px] px-6 relative overflow-hidden text-white text-center">
        <div className="absolute left-[-5%] bottom-[-20%] text-[20rem] opacity-10 rotate-[-10deg] animate-float">🩸</div>
        <div className="absolute right-[-5%] top-[-10%] text-[15rem] opacity-10 rotate-[15deg] animate-float direction-reverse">❤️</div>
        <div className="max-w-[1280px] mx-auto relative z-1">
          <h1 className="text-[4rem] font-extrabold mb-5 font-clash">Become a <span className="gradient-text">Donor</span></h1>
          <p className="text-[1.3rem] max-w-[700px] mx-auto mb-10 opacity-90">Join {stats.activeDonors} heroes who save lives every day. It takes only 45 minutes to become someone's superhero.</p>

          <div className="flex justify-center gap-10 mt-[50px] flex-wrap">
            {[
              { val: stats.activeDonors, label: "Active Donors" },
              { val: stats.timeRequired, label: "Time Required" },
              { val: stats.livesSaved, label: "Lives Saved" },
              { val: stats.support, label: "Emergency Support" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-[2.5rem] font-extrabold gradient-text">{stat.val}</div>
                <div className="text-base opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Eligibility Checker */}
      <section className="py-[60px] px-6 bg-white mt-[-40px] relative z-2">
        <div className="max-w-[1280px] mx-auto bg-linear-to-br from-[#fce6e6] to-white rounded-[40px] p-12 shadow-lg border border-primary/5">
          <h2 className="text-[2.5rem] text-center mb-10 font-clash font-semibold">Check Your <span className="gradient-text">Eligibility</span> in 30 Seconds</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px] items-center">
            <div className="flex flex-col gap-5">
              {[
                { id: 'age', label: 'I am between 18-65 years old' },
                { id: 'weight', label: 'I weigh at least 50 kg (110 lbs)' },
                { id: 'health', label: 'I am generally healthy today' },
                { id: 'sleep', label: 'I had 5+ hours of sleep last night' },
                { id: 'food', label: 'I ate something in last 4 hours' },
                { id: 'tattoo', label: 'No tattoos/piercings in last 6 months' }
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-[15px] bg-white rounded-[15px] shadow-sm cursor-pointer transition-all hover:translate-x-2.5 hover:shadow-[0_10px_25px_rgba(255,75,75,0.1)] group" onClick={() => toggleCheck(item.id)}>
                  <input type="checkbox" checked={checks[item.id]} readOnly className="w-6 h-6 accent-primary" />
                  <label className="text-[1.1rem] font-medium cursor-pointer group-hover:text-primary transition-colors">{item.label}</label>
                </div>
              ))}
            </div>

            <div className="text-center p-10 bg-white rounded-[30px] shadow-sm">
              <div className="text-[4rem] mb-5">
                {isEligible ? '✅' : isClose ? '⚠️' : '🩸'}
              </div>
              <div className={`text-[2rem] font-bold mb-[15px] ${isEligible ? 'text-success' : isClose ? 'text-warning' : ''}`}>
                {isEligible ? 'You Are Eligible!' : isClose ? 'Almost There!' : 'Check Your Eligibility'}
              </div>
              <p className="text-gray mb-[25px]">
                {isEligible ? 'Congratulations! You can donate blood today. Click below to register.' : 'Select the checkboxes to see if you can donate today'}
              </p>
              <div className="w-full h-2.5 bg-[#f0f0f0] rounded-[10px] overflow-hidden my-5">
                <div className="h-full bg-linear-to-br from-primary to-primary-light transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="font-bold mt-2.5">{checkedCount}/6 completed</div>
              {isEligible && (
                <Link to="/signup" className="mt-4 inline-block px-[30px] py-3 bg-linear-to-br from-primary to-primary-light text-white rounded-[30px] font-bold no-underline transition-all hover:scale-105">
                  Register as Donor →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Donor Journey Timeline */}
      <section className="py-20 px-6 bg-linear-to-br from-[#f8f9fa] to-white">
        <h2 className="text-center text-[2.5rem] mb-5 font-clash font-semibold">Your <span className="gradient-text">Journey</span> as a Donor</h2>
        <p className="text-center text-gray max-w-[700px] mx-auto mb-10">Four simple steps to become a life-saving hero</p>

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[30px]">
          {[
            { id: 1, title: "Register Online", desc: "Fill the form in 5 minutes. Create your donor profile." },
            { id: 2, title: "Get Screened", desc: "Quick health check at your nearest center." },
            { id: 3, title: "Donate Blood", desc: "8-12 minute donation process. Comfortable chairs, music." },
            { id: 4, title: "Save Lives", desc: "Get SMS when your blood saves someone's life!" }
          ].map((step) => (
            <div key={step.id} className="text-center relative group">
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-5 text-[2rem] text-white relative z-1 before:content-[''] before:absolute before:inset-[-5px] before:bg-linear-to-br before:from-primary before:to-primary-light before:rounded-full before:opacity-30 before:animate-pulse-step before:z-[-1]">
                {step.id}
              </div>
              <h3 className="text-[1.3rem] mb-2.5 font-bold group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-gray text-[0.95rem]">{step.desc}</p>
              {step.id < 4 && <div className="hidden md:block absolute top-[30%] right-[-15%] text-[2rem] text-primary/30">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Donor Benefits */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-center text-[2.5rem] mb-5 font-clash font-semibold">Perks of Being a <span className="gradient-text">Donor</span></h2>
        <p className="text-center text-gray max-w-[700px] mx-auto mb-[60px]">More than just saving lives - you get awesome benefits too!</p>

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[30px]">
          {[
            { icon: 'fa-medal', title: 'Donor Rewards', points: ['500 reward points per donation', 'Redeem for vouchers & merch', 'Exclusive donor badges', 'Priority hospital access'] },
            { icon: 'fa-heart', title: 'Health Benefits', points: ['Free health checkup every time', 'Reduces heart disease risk', 'Burns 650 calories', 'Free hemoglobin test'] },
            { icon: 'fa-star', title: 'Special Privileges', points: ['Donor ID card', 'Priority for family in need', 'Invitation to donor events', 'Certificate of appreciation'] }
          ].map((benefit, i) => (
            <div key={i} className="bg-linear-to-br from-[#fce6e6] to-white rounded-[30px] p-[40px_30px] text-center transition-all hover:-translate-y-[15px] hover:shadow-lg group">
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-[30px] flex items-center justify-center mx-auto mb-[25px] text-[2.5rem] text-white rotate-[-5deg] group-hover:rotate-0 group-hover:scale-110 transition-all">
                <i className={`fas ${benefit.icon}`}></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold">{benefit.title}</h3>
              <ul className="list-none text-left space-y-3">
                {benefit.points.map((p, j) => (
                  <li key={j} className="flex items-center gap-2.5 p-2 bg-white/50 rounded-[10px]">
                    <i className="fas fa-check-circle text-secondary"></i>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Registration CTA */}
      <section className="py-20 px-6 bg-linear-to-br from-[#1a1a2e] to-[#16213e] text-white">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[50px] items-center">
          <div className="flex flex-col gap-5">
            <h2 className="text-[3rem] font-clash font-extrabold">Ready to Join? <span className="gradient-text">Register Now</span></h2>
            <p className="text-[1.2rem] opacity-90">Become a donor in just 5 minutes. It's free, it's simple, and it saves lives.</p>

            <div className="space-y-[15px]">
              {[
                { icon: 'fa-bolt', text: 'Quick registration - only 5 minutes' },
                { icon: 'fa-shield-alt', text: 'Your data is 100% secure' },
                { icon: 'fa-clock', text: 'Get notified when blood is needed' },
                { icon: 'fa-map-marker-alt', text: 'Find donation camps near you' }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <i className={`fas ${f.icon} text-secondary text-[1.3rem]`}></i>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-5 flex-wrap mt-[15px]">
              <Link to="/signup" className="px-[45px] py-[18px] bg-linear-to-br from-primary to-primary-light text-white rounded-[50px] font-bold text-[1.2rem] transition-all hover:-translate-y-1.25 hover:scale-105 no-underline flex items-center gap-2.5">
                <i className="fas fa-user-plus"></i> Create Donor Account
              </Link>
              <Link to="/login" className="px-[45px] py-[18px] bg-transparent text-white border-2 border-white rounded-[50px] font-bold text-[1.2rem] transition-all hover:bg-white hover:text-primary hover:-translate-y-1.25 no-underline flex items-center gap-2.5">
                <i className="fas fa-sign-in-alt"></i> Existing Donor? Login
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-[10px] rounded-[40px] p-10 border border-white/20">
            <h3 className="text-[1.8rem] mb-[30px] text-center font-bold">Quick Donor Registration</h3>
            <div className="space-y-5">
              {['Full Name', 'Email Address', 'Phone Number', 'Blood Group'].map((field, i) => (
                <div key={i} className="w-full">
                  <input type="text" placeholder={field} disabled className="w-full p-[15px_20px] bg-white/15 border border-white/30 rounded-[15px] text-white placeholder:text-white/60" />
                </div>
              ))}
              <button onClick={() => window.location.href='/signup'} className="w-full p-[15px] bg-linear-to-br from-primary to-primary-light border-none rounded-[15px] text-white text-[1.1rem] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(255,75,75,0.3)]">
                <i className="fas fa-arrow-right"></i> Complete Registration
              </button>
              <p className="text-center opacity-80 text-[0.9rem] mt-[15px]">👆 Click to create your donor profile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Testimonials */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-center text-[2.5rem] mb-[60px] font-clash font-semibold">What Our <span className="gradient-text">Donors</span> Say</h2>
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[30px]">
          {[
            { name: "Rajesh Kumar", role: "Regular Donor • 12 donations", badge: "⭐ Platinum Donor", text: "I've donated 12 times in 3 years. Getting that SMS that my blood saved a child's life is the best feeling ever!" },
            { name: "Priya Sharma", role: "First-time Donor", badge: "✨ New Hero", text: "The process is so smooth! I walk in, donate in 10 minutes, and get juice & cookies. Plus I get updates when my blood is used." },
            { name: "Arun Patel", role: "Universal Donor • 8 donations", badge: "🩸 O- Hero", text: "I'm O negative (universal donor). Knowing my blood can be used in emergencies motivates me to donate regularly." }
          ].map((t, i) => (
            <div key={i} className="bg-linear-to-br from-[#fce6e6] to-white rounded-[30px] p-10 transition-all hover:-translate-y-2.5 hover:shadow-lg relative">
              <div className="absolute top-5 right-[30px] text-[3rem] text-primary opacity-30 font-serif">"</div>
              <p className="text-[1.1rem] leading-[1.8] mb-[30px] text-[#444] italic">{t.text}</p>
              <div className="flex items-center gap-[15px]">
                <div className="w-[60px] h-[60px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-[1.5rem]">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <h4 className="text-[1.2rem] font-bold mb-[5px]">{t.name}</h4>
                  <p className="text-gray text-[0.9rem]">{t.role}</p>
                  <span className="inline-block px-[15px] py-[5px] bg-linear-to-br from-primary to-primary-light text-white rounded-[30px] text-[0.8rem] mt-2 font-semibold">{t.badge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Donor FAQ */}
      <section className="py-20 px-6 bg-linear-to-br from-[#f8f9fa] to-white">
        <h2 className="text-center text-[2.5rem] mb-[60px] font-clash font-semibold">Donor <span className="gradient-text">FAQs</span></h2>
        <div className="max-w-[800px] mx-auto space-y-[15px]">
          {[
            { q: "How often can I donate blood?", a: "Men can donate every 3 months (4 times a year). Women can donate every 4 months (3 times a year). Your body needs time to replenish red blood cells." },
            { q: "Is there any age limit for donation?", a: "Yes, you must be between 18-65 years old. First-time donors up to 60 years are accepted. Regular healthy donors can continue up to 65 years." },
            { q: "Will I get any donor benefits?", a: "Absolutely! You get reward points for every donation, free health checkups, donor ID card, priority for family in emergencies, and exclusive donor events." },
            { q: "How will I know when to donate?", a: "You'll get notifications via SMS, email, and app when blood of your type is needed near you. You can also track your eligibility and schedule donations." },
            { q: "What should I do before donating?", a: "Eat iron-rich foods, stay hydrated, get good sleep, avoid alcohol for 24 hours, and bring a valid ID proof." },
            { q: "Can I cancel my donor registration?", a: "Yes, you can deactivate your donor profile anytime from your dashboard. However, we hope you stay and continue saving lives! 🩸" }
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-[20px] overflow-hidden transition-all hover:translate-x-2.5 shadow-sm border border-primary/5">
              <div
                className="p-5 flex justify-between items-center font-bold cursor-pointer"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                {faq.q}
                <i className={`fas fa-chevron-down transition-transform duration-300 text-primary ${faqOpen === i ? 'rotate-180' : ''}`}></i>
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${faqOpen === i ? 'max-h-[200px] p-[0_20px_20px_20px]' : 'max-h-0'}`}>
                <p className="text-gray leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default BecomeDonor;
