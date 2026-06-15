import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { bloodbankService } from '../services/api';

const WhyDonate = () => {
  // Counters State
  const [counts, setCounts] = useState({
    nextNeed: 2,
    donationsToday: 0,
    livesSavedToday: 0,
    activeDonors: 0
  });

  // Live Stats State
  const [liveStats, setLiveStats] = useState({
    supply: 65,
    responseTime: 45,
    livesTarget: 78,
    growthRate: 23
  });

  // Interactive Logic
  const [activeStep, setActiveStep] = useState(1);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const [flippedMyths, setFlippedMyths] = useState({});

  // Fetch Data and Animation Effect
  useEffect(() => {
    let timer;
    const fetchData = async () => {
      let targets = {
        donationsToday: 1247,
        livesSavedToday: 3741,
        activeDonors: 342
      };

      try {
        const response = await bloodbankService.getStats();
        if (response.success && response.data) {
          const { inventory, requests, donors } = response.data;

          targets = {
            donationsToday: inventory.total || 1247,
            livesSavedToday: requests.fulfilled || 3741,
            activeDonors: donors.total || 342
          };

          // Set live stats from backend
          setLiveStats({
            supply: Math.floor((inventory.available / inventory.total) * 100) || 65,
            responseTime: 45,
            livesTarget: Math.floor(requests.fulfillmentRate) || 78,
            growthRate: 23
          });
        }
      } catch (error) {
        console.error('Error fetching data for Why Donate:', error);
      } finally {
        // Animate counters with either API data or defaults
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        timer = setInterval(() => {
          currentStep++;
          if (currentStep >= steps) {
            setCounts(prev => ({ ...prev, ...targets }));
            if (timer) clearInterval(timer);
          } else {
            setCounts(prev => ({
              ...prev,
              donationsToday: Math.floor((targets.donationsToday / steps) * currentStep),
              livesSavedToday: Math.floor((targets.livesSavedToday / steps) * currentStep),
              activeDonors: Math.floor((targets.activeDonors / steps) * currentStep)
            }));
          }
        }, interval);
      }
    };
    fetchData();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const toggleMyth = (id) => {
    setFlippedMyths(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqs = [
    { q: "How often can I donate?", a: "Men can donate every 3 months (4 times a year). Women can donate every 4 months (3 times a year). Your body needs time to replenish red blood cells.", cat: "before" },
    { q: "What should I eat before donating?", a: "Eat iron-rich foods like spinach, beans, red meat. Have a light meal 2-3 hours before. Avoid fatty foods. Stay hydrated!", cat: "before" },
    { q: "Can I donate if I'm menstruating?", a: "Yes, you can donate during menstruation if you're feeling well and your hemoglobin levels are normal (above 12.5 g/dL).", cat: "before" },
    { q: "When can I exercise after donation?", a: "Avoid heavy exercise for 24 hours. Light activities are fine. Give your body time to replenish fluids and red blood cells.", cat: "after" },
    { q: "What if I feel dizzy after donation?", a: "Lie down with feet elevated, drink plenty of fluids, and eat something. If symptoms persist, contact our helpline immediately.", cat: "after" },
    { q: "Can I donate if I have a tattoo?", a: "Yes, you can donate after 6 months of getting a tattoo from a licensed and regulated parlor.", cat: "eligibility" },
    { q: "What is the minimum age to donate?", a: "You must be between 18-65 years old and weigh at least 50 kg to donate blood.", cat: "eligibility" }
  ];

  const filteredFaqs = faqs.filter(f =>
    (faqCategory === 'all' || f.cat === faqCategory) &&
    (f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase()))
  );

  const tickerItems = [
    "🩸 Someone donated blood in Mumbai just now!",
    "❤️ 3 lives saved in Delhi through donations",
    "🚑 Emergency blood request fulfilled in Bangalore",
    "🩸 New donor registered in Chennai",
    "❤️ Platelets donated for cancer patient in Kolkata"
  ];

  return (
    <Layout>
      {/* Live Donation Ticker */}
      <div className="bg-linear-to-br from-primary to-primary-light py-5 overflow-hidden relative">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="inline-flex items-center gap-5 px-[30px] text-white text-[1.1rem]">
              <i className="fas fa-tint text-[1.5rem] animate-heartbeat"></i>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Hero Section */}
      <section className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] py-[100px] px-6 relative overflow-hidden text-white text-center">
        <div
          className="absolute inset-0 opacity-10 bg-[size:100px_100px] animate-float"
          style={{ backgroundImage: `url('data:image/svg+xml;charset=utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath d=%22M50 0 L61 35 L98 35 L68 57 L79 92 L50 70 L21 92 L32 57 L2 35 L39 35 Z%22 fill=%22white%22/%3E%3C/svg%3E')` }}
        ></div>
        <div className="absolute right-[-5%] bottom-[-20%] text-[20rem] opacity-10 rotate-10 animate-heartbeat">❤️</div>
        <div className="max-w-[1280px] mx-auto relative z-1">
          <h1 className="text-[4rem] font-extrabold mb-5 font-clash">Be Someone's <span className="gradient-text">Hero</span></h1>
          <p className="text-[1.3rem] max-w-[700px] mx-auto mb-10 opacity-90">Every 2 seconds, someone needs blood. Your one donation can save up to 3 lives. Join the movement of young heroes saving lives everyday.</p>
          <div className="flex justify-center gap-5 flex-wrap">
            <Link to="/signup" className="px-[45px] py-[18px] bg-linear-to-br from-primary to-primary-light text-white rounded-[50px] font-bold text-[1.2rem] transition-all hover:-translate-y-1.25 hover:scale-105 hover:shadow-[0_30px_60px_rgba(255,75,75,0.3)] no-underline flex items-center gap-2.5">
              <i className="fas fa-hand-holding-heart"></i> Become a Donor Now
            </Link>
            <a href="#impact" className="px-[45px] py-[18px] bg-transparent text-white border-2 border-white rounded-[50px] font-bold text-[1.2rem] transition-all hover:bg-white hover:text-primary hover:-translate-y-1.25 no-underline flex items-center gap-2.5">
              <i className="fas fa-play"></i> See Impact
            </a>
          </div>
        </div>
      </section>

      {/* Live Counter Section */}
      <section className="py-[60px] px-6 bg-white mt-[-40px] relative z-2">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[30px]">
          <div className="bg-white rounded-2xl p-[30px] text-center shadow-md border border-primary/10 transition-all hover:-translate-y-2.5 hover:shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            <div className="w-[70px] h-[70px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-full flex items-center justify-center mx-auto mb-5 text-[2rem] text-primary">
              <i className="fas fa-clock"></i>
            </div>
            <div className="text-[3rem] font-extrabold gradient-text leading-tight">{counts.nextNeed}s</div>
            <div className="text-gray text-base mt-2.5">Seconds until next need</div>
            <div className="inline-block px-[15px] py-[5px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[30px] text-primary text-[0.8rem] font-semibold mt-[15px]">
              <i className="fas fa-circle animate-pulse mr-1"></i> LIVE
            </div>
          </div>

          <div className="bg-white rounded-2xl p-[30px] text-center shadow-md border border-primary/10 transition-all hover:-translate-y-2.5 hover:shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            <div className="w-[70px] h-[70px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-full flex items-center justify-center mx-auto mb-5 text-[2rem] text-primary">
              <i className="fas fa-tint"></i>
            </div>
            <div className="text-[3rem] font-extrabold gradient-text leading-tight">{counts.donationsToday}+</div>
            <div className="text-gray text-base mt-2.5">Total Donations</div>
            <div className="inline-block px-[15px] py-[5px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[30px] text-primary text-[0.8rem] font-semibold mt-[15px]">
              <i className="fas fa-circle animate-pulse mr-1"></i> LIVE
            </div>
          </div>

          <div className="bg-white rounded-2xl p-[30px] text-center shadow-md border border-primary/10 transition-all hover:-translate-y-2.5 hover:shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            <div className="w-[70px] h-[70px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-full flex items-center justify-center mx-auto mb-5 text-[2rem] text-primary">
              <i className="fas fa-heart"></i>
            </div>
            <div className="text-[3rem] font-extrabold gradient-text leading-tight">{counts.livesSavedToday}+</div>
            <div className="text-gray text-base mt-2.5">Total Lives saved</div>
            <div className="inline-block px-[15px] py-[5px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[30px] text-primary text-[0.8rem] font-semibold mt-[15px]">
              <i className="fas fa-circle animate-pulse mr-1"></i> LIVE
            </div>
          </div>

          <div className="bg-white rounded-2xl p-[30px] text-center shadow-md border border-primary/10 transition-all hover:-translate-y-2.5 hover:shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            <div className="w-[70px] h-[70px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-full flex items-center justify-center mx-auto mb-5 text-[2rem] text-primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="text-[3rem] font-extrabold gradient-text leading-tight">{counts.activeDonors}+</div>
            <div className="text-gray text-base mt-2.5">Total Donors</div>
            <div className="inline-block px-[15px] py-[5px] bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[30px] text-primary text-[0.8rem] font-semibold mt-[15px]">
              <i className="fas fa-circle animate-pulse mr-1"></i> LIVE
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Impact Cards */}
      <section className="py-20 px-6 bg-linear-to-br from-[#f8f9fa] to-white" id="impact">
        <h2 className="text-center text-[3rem] mb-5 font-clash font-semibold">The <span className="gradient-text">Ripple Effect</span> of Your Gift</h2>
        <p className="text-center text-gray max-w-[700px] mx-auto mb-[60px] text-[1.2rem]">One donation creates waves of impact across multiple lives</p>

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[30px]">
          {/* Card 1 */}
          <div className="bg-white rounded-[30px] p-[40px_30px] shadow-md transition-all hover:-translate-y-[15px] hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(255,75,75,0.2)] cursor-pointer relative overflow-hidden group">
            <div className="absolute top-5 right-5 px-4 py-2 bg-linear-to-br from-primary to-primary-light text-white rounded-[30px] text-[0.8rem] font-semibold animate-pulse">🩸 Most Common</div>
            <div className="w-[90px] h-[90px] bg-linear-to-br from-primary to-primary-light rounded-[30px] flex items-center justify-center mb-[30px] text-[3rem] text-white rotate-[-5deg] transition-all group-hover:rotate-0 group-hover:scale-110">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3 className="text-[1.8rem] mb-5 font-bold">Save Lives</h3>
            <p className="text-gray mb-6">Your blood is separated into 3 life-saving components:</p>
            <div className="space-y-[15px]">
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-tint text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Red Blood Cells:</strong> For accident victims, surgery</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-microscope text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Platelets:</strong> For cancer patients</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-water text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Plasma:</strong> For burn victims</span>
              </div>
            </div>
            <div className="mt-[25px] p-5 bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[20px] italic relative before:content-[''] before:absolute before:top-[-10px] before:left-[30px] before:w-5 before:h-5 before:bg-inherit before:clip-path-[polygon(50%_0%,0%_100%,100%_100%)]">
              "Rahul, 8, leukemia survivor thanks 4 donors"
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[30px] p-[40px_30px] shadow-md transition-all hover:-translate-y-[15px] hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(255,75,75,0.2)] cursor-pointer relative overflow-hidden group">
            <div className="absolute top-5 right-5 px-4 py-2 bg-linear-to-br from-primary to-primary-light text-white rounded-[30px] text-[0.8rem] font-semibold animate-pulse">💪 Your Benefits</div>
            <div className="w-[90px] h-[90px] bg-linear-to-br from-primary to-primary-light rounded-[30px] flex items-center justify-center mb-[30px] text-[3rem] text-white rotate-[-5deg] transition-all group-hover:rotate-0 group-hover:scale-110">
              <i className="fas fa-heart"></i>
            </div>
            <h3 className="text-[1.8rem] mb-5 font-bold">Health Benefits</h3>
            <p className="text-gray mb-6">Giving back actually helps you too!</p>
            <div className="space-y-[15px]">
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-check-circle text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Reduce Heart Risk:</strong> Lower iron stores</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-fire text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Burns Calories:</strong> 650 calories per donation</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-sync text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>New Blood Cells:</strong> Replaced in 48 hours</span>
              </div>
            </div>
            <div className="mt-[25px] p-5 bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[20px] italic relative before:content-[''] before:absolute before:top-[-10px] before:left-[30px] before:w-5 before:h-5 before:bg-inherit before:clip-path-[polygon(50%_0%,0%_100%,100%_100%)]">
              ⚡ Myth Buster: You won't feel weak - plasma replaces in 24h!
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[30px] p-[40px_30px] shadow-md transition-all hover:-translate-y-[15px] hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(255,75,75,0.2)] cursor-pointer relative overflow-hidden group">
            <div className="absolute top-5 right-5 px-4 py-2 bg-linear-to-br from-primary to-primary-light text-white rounded-[30px] text-[0.8rem] font-semibold animate-pulse">🌍 Community</div>
            <div className="w-[90px] h-[90px] bg-linear-to-br from-primary to-primary-light rounded-[30px] flex items-center justify-center mb-[30px] text-[3rem] text-white rotate-[-5deg] transition-all group-hover:rotate-0 group-hover:scale-110">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="text-[1.8rem] mb-5 font-bold">Community Impact</h3>
            <p className="text-gray mb-6">Ready for local emergencies always:</p>
            <div className="space-y-[15px]">
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-car-crash text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Accident victim:</strong> Needs 100 units</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-heart text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Heart surgery:</strong> Needs 3-8 units</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] transition-all hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white group/item">
                <i className="fas fa-lungs text-primary text-[1.2rem] group-hover/item:text-white"></i>
                <span><strong>Organ transplant:</strong> Needs 10-30 units</span>
              </div>
            </div>
            <div className="mt-[25px] p-5 bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[20px] italic relative before:content-[''] before:absolute before:top-[-10px] before:left-[30px] before:w-5 before:h-5 before:bg-inherit before:clip-path-[polygon(50%_0%,0%_100%,100%_100%)]">
              🏥 Your blood stays ready for local emergencies
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Myth Buster Slider */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-center text-[2.5rem] mb-5 font-clash font-semibold">Myths vs <span className="gradient-text">Facts</span></h2>
        <p className="text-center text-gray max-w-[700px] mx-auto mb-10 text-[1.1rem]">Click on any card to flip and reveal the truth</p>

        <div className="max-w-[1280px] mx-auto flex gap-[30px] overflow-x-auto pb-5 snap-x">
          {[
            { id: 1, m: "Donating blood is painful", f: "You'll only feel a quick pinch, much less painful than expected!", icon: "fa-times-circle" },
            { id: 2, m: "It takes too much time", f: "Total process: 45-60 min. Actual donation: Only 8-12 min!", icon: "fa-clock" },
            { id: 3, m: "I'll feel weak after", f: "Most resume normal activities immediately. Plasma replaces in 24h!", icon: "fa-dumbbell" },
            { id: 4, m: "My blood isn't needed", f: "Every type is needed! Only 1% of eligible Indians donate.", icon: "fa-tint" },
            { id: 5, m: "Can't donate with tattoo", f: "You can donate 6 months after getting a tattoo from licensed parlor!", icon: "fa-syringe" }
          ].map((myth) => (
            <div
              key={myth.id}
              onClick={() => toggleMyth(myth.id)}
              className={`min-w-[350px] rounded-[30px] p-10 snap-start cursor-pointer transition-all duration-500 transform ${flippedMyths[myth.id] ? 'bg-linear-to-br from-primary to-primary-light text-white [transform:rotateY(180deg)]' : 'bg-linear-to-br from-[#fce6e6] to-white shadow-md hover:scale-105 hover:shadow-lg'}`}
            >
              <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5 text-[1.8rem] ${flippedMyths[myth.id] ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <i className={`fas ${flippedMyths[myth.id] ? 'fa-check-circle' : myth.icon}`}></i>
              </div>
              {!flippedMyths[myth.id] ? (
                <>
                  <h3 className="text-[1.5rem] mb-[15px] font-bold">"{myth.m}"</h3>
                  <p className="text-gray">Click to reveal fact →</p>
                </>
              ) : (
                <div className="[transform:rotateY(180deg)]">
                  <h3 className="text-[1.5rem] mb-[15px] font-bold">The Fact:</h3>
                  <p className="text-white text-[1.1rem] leading-relaxed">{myth.f}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Process Timeline */}
      <section className="py-20 px-6 bg-linear-to-br from-[#f8f9fa] to-white">
        <h2 className="text-center text-[2.5rem] mb-5 font-clash font-semibold">The <span className="gradient-text">Donation Process</span></h2>
        <p className="text-center text-gray max-w-[700px] mx-auto mb-10 text-[1.1rem]">Click on each step to learn more</p>

        <div className="max-w-[1280px] mx-auto relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-linear-to-r from-primary via-secondary to-accent translate-y-[-50%] z-0"></div>
          <div className="flex flex-col md:flex-row justify-between relative z-1 gap-10 md:gap-0">
            {[
              { id: 1, label: "Registration", time: "5 mins", title: "📝 Registration", desc: "Fill a simple form with your basic details and show your ID proof. You'll receive a donor card with a unique ID.", tip: "Pre-register online to save time!" },
              { id: 2, label: "Health Screening", time: "10 mins", title: "🩺 Health Screening", desc: "A quick medical check including hemoglobin test, blood pressure check, and confidential health questionnaire.", tip: "All your information is kept private." },
              { id: 3, label: "Donation", time: "8-12 mins", title: "💉 Donation", desc: "Relax in a comfortable chair while 350-450ml of blood is collected using sterile, single-use equipment.", tip: "Listen to music or podcasts while donating!" },
              { id: 4, label: "Recovery", time: "15 mins", title: "🍪 Recovery", desc: "Rest for a few minutes, enjoy snacks and juice. Get SMS when your blood saves a life!", tip: "Drink plenty of fluids after donation." }
            ].map((step) => (
              <div key={step.id} className="text-center w-full md:w-[180px] cursor-pointer group" onClick={() => setActiveStep(step.id)}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-[2rem] font-extrabold border-4 transition-all ${activeStep === step.id ? 'bg-linear-to-br from-primary to-primary-light text-white border-white scale-125 shadow-lg' : 'bg-white text-primary border-transparent shadow-md hover:scale-110'}`}>
                  {step.id}
                </div>
                <div className={`font-bold mb-1 transition-colors ${activeStep === step.id ? 'text-primary' : ''}`}>{step.label}</div>
                <div className="text-[0.9rem] text-gray">{step.time}</div>
              </div>
            ))}
          </div>

          <div className="mt-[50px] p-10 bg-white rounded-[30px] shadow-md animate-fadeIn transition-all">
            { [1,2,3,4].map(id => id === activeStep && (
              <div key={id}>
                <h3 className="text-[1.8rem] mb-5 font-bold">
                  {[
                    "📝 Registration", "🩺 Health Screening", "💉 Donation", "🍪 Recovery"
                  ][id-1]}
                </h3>
                <p className="text-gray text-[1.1rem] mb-5">
                  {[
                    "Fill a simple form with your basic details and show your ID proof. You'll receive a donor card with a unique ID.",
                    "A quick medical check including hemoglobin test, blood pressure check, and confidential health questionnaire.",
                    "Relax in a comfortable chair while 350-450ml of blood is collected using sterile, single-use equipment.",
                    "Rest for a few minutes, enjoy snacks and juice. Get SMS when your blood saves a life!"
                  ][id-1]}
                </p>
                <div className="p-5 bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] rounded-[15px] flex items-center gap-2.5">
                  <i className={`fas ${id === 1 ? 'fa-lightbulb' : id === 2 ? 'fa-lock' : id === 3 ? 'fa-headphones' : 'fa-bottle-water'} text-primary`}></i>
                  <strong>
                    {[
                      "Pro Tip: Pre-register online to save time!",
                      "Confidential: All your information is kept private.",
                      "Listen to music or podcasts while donating!",
                      "Drink plenty of fluids after donation."
                    ][id-1]}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-center text-[2.5rem] mb-10 font-clash font-semibold">Frequently Asked <span className="gradient-text">Questions</span></h2>

        <div className="max-w-[600px] mx-auto mb-10 relative">
          <i className="fas fa-search absolute left-6 top-1/2 translate-y-[-50%] text-gray text-[1.2rem]"></i>
          <input
            type="text"
            placeholder="Search your question..."
            className="w-full p-[20px_20px_20px_60px] border-2 border-[#e0e0e0] rounded-[50px] text-[1.1rem] transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,75,75,0.1)]"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
          />
        </div>

        <div className="flex justify-center gap-[15px] mb-10 flex-wrap">
          {['all', 'before', 'after', 'eligibility'].map(cat => (
            <button
              key={cat}
              onClick={() => setFaqCategory(cat)}
              className={`px-6 py-3 rounded-[30px] font-semibold text-base transition-all border-2 border-transparent hover:-translate-y-0.5 hover:shadow-md ${faqCategory === cat ? 'bg-linear-to-br from-primary to-primary-light text-white' : 'bg-linear-to-br from-[#f8f9fa] to-white'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="max-w-[800px] mx-auto space-y-[15px]">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="bg-linear-to-br from-[#f8f9fa] to-white rounded-[15px] overflow-hidden transition-all hover:translate-x-2.5 shadow-sm border border-[#E2E8F0]">
              <div
                className="p-5 flex justify-between items-center font-bold cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <i className={`fas fa-chevron-down transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-primary' : ''}`}></i>
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${openFaq === i ? 'max-h-[200px] p-[0_20px_20px_20px]' : 'max-h-0'}`}>
                <p className="text-gray leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-[100px] px-6 bg-linear-to-br from-[#1a1a2e] to-[#16213e] text-white text-center relative overflow-hidden">
        <div className="absolute left-[-5%] bottom-[-20%] text-[15rem] opacity-10 rotate-[-10deg] animate-heartbeat">❤️</div>
        <h2 className="text-[3.5rem] mb-5 font-clash font-extrabold">Ready to Be a <span className="gradient-text">Hero?</span></h2>
        <p className="text-[1.3rem] max-w-[700px] mx-auto mb-10 opacity-90">Join 100,000+ donors saving lives across India. It takes only 45 minutes to save 3 lives.</p>
        <div className="flex justify-center gap-5 flex-wrap">
          <Link to="/signup" className="px-[45px] py-[18px] bg-linear-to-br from-primary to-primary-light text-white rounded-[50px] font-bold text-[1.2rem] transition-all hover:-translate-y-1.25 hover:scale-105 hover:shadow-[0_30px_60px_rgba(255,75,75,0.3)] no-underline flex items-center gap-2.5">
            <i className="fas fa-hand-holding-heart"></i> Become a Donor
          </Link>
          <Link to="/login" className="px-[45px] py-[18px] bg-transparent text-white border-2 border-white rounded-[50px] font-bold text-[1.2rem] transition-all hover:bg-white hover:text-primary hover:-translate-y-1.25 no-underline flex items-center gap-2.5">
            <i className="fas fa-calendar-check"></i> Schedule Donation
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default WhyDonate;
