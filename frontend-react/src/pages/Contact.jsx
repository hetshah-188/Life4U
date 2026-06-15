import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useToast } from '../context/ToastContext';
import { bloodbankService } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    subject: '',
    message: ''
  });
  const toast = useToast();

  const [bankInfo, setBankInfo] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: '👋 Hi! I\'m your virtual assistant. How can I help you today?' },
    { type: 'bot', text: 'You can ask me about:\n• Emergency blood requests\n• Donation process\n• Finding blood banks\n• General queries' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const response = await bloodbankService.getInfo();
        if (response.success && response.data) {
          setBankInfo(response.data);
        }
      } catch (error) {
        console.error('Error fetching blood bank info:', error);
      }
    };
    fetchBankInfo();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    toast('✅ Thank you for reaching out! Our team will contact you within 2 hours. For emergencies, please call our 24/7 helpline.', 'success');
    setFormData({ name: '', email: '', phone: '', bloodGroup: '', subject: '', message: '' });
  };

  const toggleFaq = (i) => {
    setActiveFaq(activeFaq === i ? null : i);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessages = [...chatMessages, { type: 'user', text: chatInput }];
    setChatMessages(newMessages);
    const userInput = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let botResponse = '';
      if (userInput.includes('emergency')) {
        botResponse = '🚨 For emergencies, please call our 24/7 helpline immediately: 1800-999-9999. I\'m connecting you with a live agent.';
      } else if (userInput.includes('donate')) {
        botResponse = '💝 Thank you for your interest in donating! You can register at our Become a Donor page or visit any of our centers. Would you like to know the nearest donation center?';
      } else if (userInput.includes('blood')) {
        botResponse = '🩸 To find blood, please use our emergency request system or call 1800-123-4567. What\'s your location?';
      } else {
        botResponse = 'Thanks for your message! Our team will get back to you shortly. For immediate assistance, please call our helpline.';
      }
      setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-[#fce6e6] to-[#ffe5e5] py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute right-5 bottom-[-20%] text-[15rem] opacity-10 rotate-10">📞</div>
        <div className="absolute left-5 top-[-10%] text-[12rem] opacity-10 rotate-[-15deg]">💬</div>
        <div className="max-w-[1280px] mx-auto relative z-1">
          <h1 className="text-[3.5rem] mb-5 font-clash font-bold">Get in <span className="gradient-text">Touch</span></h1>
          <p className="text-[1.2rem] text-gray max-w-[700px] mx-auto">We're here for you 24/7. Whether you need blood urgently, want to donate, or have questions, our team is ready to help.</p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-[60px] px-6 bg-white mt-[-40px] relative z-2">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          {[
            { icon: 'fa-phone-alt', title: 'Call Us', desc: 'Available 24/7 for emergencies and inquiries.', link: bankInfo?.phone || '1800-123-4567', href: `tel:${bankInfo?.phone || '1800-123-4567'}`, linkText: bankInfo?.phone || '1800-123-4567' },
            { icon: 'fa-envelope', title: 'Email Us', desc: 'Get a response within 2 hours for support.', link: bankInfo?.email || 'support@life4u.in', href: `mailto:${bankInfo?.email || 'support@life4u.in'}`, linkText: bankInfo?.email || 'support@life4u.in' },
            { icon: 'fa-map-marker-alt', title: 'Visit Us', desc: 'Come meet our team at our headquarters.', link: '#', href: '#', linkText: 'Get Directions' },
            { icon: 'fa-comment-dots', title: 'Live Chat', desc: 'Chat with our support team instantly.', link: '#', onClick: () => setChatOpen(true), linkText: 'Start Chat' }
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-lg p-[40px_30px] shadow-lg text-center transition-all hover:-translate-y-2.5 hover:shadow-[0_20px_30px_rgba(255,51,102,0.15)] relative overflow-hidden border border-[#E2E8F0] group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-primary-light scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
              <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px] animate-pulse">
                <i className={`fas ${card.icon} text-[2.5rem] text-white`}></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold">{card.title}</h3>
              <p className="text-gray mb-5 leading-[1.8]">{card.desc}</p>
              <a
                href={card.href}
                onClick={card.onClick}
                className="inline-flex items-center gap-2 text-primary font-bold no-underline transition-all hover:gap-3"
              >
                <i className={`fas ${card.icon.replace('-alt', '')}`}></i> {card.linkText}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 px-6 bg-linear-to-br from-[#f9f9f9] to-white">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[50px]">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-10 shadow-lg">
            <h2 className="text-[2rem] mb-[30px] font-clash font-semibold">Send Us a <span className="gradient-text">Message</span></h2>
            <form onSubmit={handleFormSubmit} className="space-y-[25px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <i className="fas fa-user absolute left-[15px] top-1/2 translate-y-[-50%] text-gray transition-colors"></i>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Your Name" required className="w-full p-[15px_15px_15px_45px] border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,51,102,0.1)] transition-all" />
                </div>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-[15px] top-1/2 translate-y-[-50%] text-gray"></i>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Your Email" required className="w-full p-[15px_15px_15px_45px] border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,51,102,0.1)] transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <i className="fas fa-phone absolute left-[15px] top-1/2 translate-y-[-50%] text-gray"></i>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone Number" required className="w-full p-[15px_15px_15px_45px] border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,51,102,0.1)] transition-all" />
                </div>
                <div className="relative">
                  <i className="fas fa-tint absolute left-[15px] top-1/2 translate-y-[-50%] text-gray"></i>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleFormChange} className="w-full p-[15px_15px_15px_45px] border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-primary transition-all appearance-none bg-white">
                    <option value="" disabled>Select Blood Group (Optional)</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative">
                <i className="fas fa-tag absolute left-[15px] top-1/2 translate-y-[-50%] text-gray"></i>
                <select name="subject" value={formData.subject} onChange={handleFormChange} required className="w-full p-[15px_15px_15px_45px] border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-primary transition-all appearance-none bg-white">
                  <option value="" disabled>Select Subject</option>
                  <option value="emergency">🚨 Emergency Blood Request</option>
                  <option value="donor">💝 Become a Donor</option>
                  <option value="hospital">🏥 Hospital Partnership</option>
                  <option value="query">❓ General Query</option>
                  <option value="feedback">💬 Feedback</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
              <div className="relative">
                <i className="fas fa-message absolute left-[15px] top-[18px] text-gray"></i>
                <textarea name="message" value={formData.message} onChange={handleFormChange} placeholder="Your Message..." required className="w-full p-[15px_15px_15px_45px] border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-primary transition-all min-h-[120px]"></textarea>
              </div>
              <button type="submit" className="w-full p-4 bg-linear-to-br from-primary to-primary-light text-white rounded-sm text-[1.1rem] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-hover flex items-center justify-center gap-2.5">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg p-10 shadow-lg">
            <h2 className="text-[2rem] mb-[30px] font-clash font-semibold">Contact <span className="gradient-text">Information</span></h2>
            <div className="space-y-[30px]">
              {[
                { icon: 'fa-map-pin', title: 'Headquarters', content: bankInfo ? [`${bankInfo.street || ''}, ${bankInfo.city || ''}`, `${bankInfo.state || ''} - ${bankInfo.pincode || ''}`, bankInfo.country || ''] : ['123 Donor Street, Healthcare District', 'New Delhi, Delhi - 110001', 'India'], link: 'Get Directions' },
                { icon: 'fa-phone', title: 'Emergency Helpline', content: [`24/7 Toll Free: ${bankInfo?.phone || '1800-123-4567'}`, 'SMS: BLOOD to 575758', `WhatsApp: ${bankInfo?.phone || '+91 12345 67890'}`] },
                { icon: 'fa-envelope', title: 'Email Support', content: [`General: ${bankInfo?.email || 'info@life4u.in'}`, 'Donors: donors@life4u.in', 'Patients: patients@life4u.in'] },
                { icon: 'fa-clock', title: 'Working Hours', content: ['Emergency: 24/7 (Always Open)', 'Donation Centers: 8:00 AM - 8:00 PM', 'Helpline: 24/7 (Toll Free)'] }
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-5 p-5 bg-linear-to-br from-[#fce6e6] to-white rounded-sm transition-all hover:translate-x-2.5 hover:shadow-md">
                  <div className="w-[50px] h-[50px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center shrink-0">
                    <i className={`fas ${info.icon} text-[1.5rem] text-white`}></i>
                  </div>
                  <div>
                    <h3 className="text-[1.2rem] mb-1.25 font-bold">{info.title}</h3>
                    {info.content.map((line, j) => <p key={j} className="text-gray mb-1">{line}</p>)}
                    {info.link && <a href="#" className="text-primary font-bold no-underline hover:underline flex items-center gap-1.25 mt-1"><i className="fas fa-directions"></i> {info.link}</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[2.5rem] text-center mb-5 font-clash font-semibold">Emergency <span className="gradient-text">Contacts</span></h2>
          <p className="text-center text-gray max-w-[700px] mx-auto mb-[60px] text-[1.1rem]">For life-threatening emergencies, use these direct contacts. Response within 5 minutes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
            <div className="bg-linear-to-br from-primary to-primary-light text-white rounded-lg p-[40px_30px] text-center transition-all hover:-translate-y-1.25 relative overflow-hidden group border-2 border-transparent">
              <div className="absolute top-[-50%] right-[-50%] w-[200px] h-[200px] bg-white/10 rounded-full transition-transform duration-300 group-hover:scale-150"></div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-[25px] relative z-1">
                <i className="fas fa-ambulance text-[2.5rem]"></i>
              </div>
              <h3 className="text-[1.5rem] mb-[15px] font-bold relative z-1">🚨 24/7 Emergency</h3>
              <p className="text-white/90 mb-[25px] relative z-1">Immediate blood requirement? Call now. Our team will coordinate instantly.</p>
              <a href={`tel:${bankInfo?.phone || '1800-999-9999'}`} className="inline-flex items-center gap-2.5 px-[30px] py-3 bg-white/20 text-white rounded-[50px] font-bold no-underline transition-all hover:-translate-y-0.75 hover:bg-white/30 relative z-1">
                <i className="fas fa-phone-alt"></i> {bankInfo?.phone || '1800-999-9999'}
              </a>
            </div>

            {[
              { icon: 'fa-hand-holding-heart', title: 'Donor Helpline', desc: 'Questions about donation, camps, or your profile. We\'re here.', link: 'tel:1800-DONOR-99', linkText: '1800-DONOR-99' },
              { icon: 'fa-hospital', title: 'Hospital Support', desc: 'For partners and professionals. Inventory and requisitions.', link: 'tel:1800-HOSP-99', linkText: '1800-HOSP-99' },
              { icon: 'fa-comment-medical', title: 'SMS Emergency', desc: 'Text BLOOD to 575758 with location for nearest donors.', link: '#', linkText: 'Text BLOOD to 575758', icon2: 'fa-sms' }
            ].map((ec, i) => (
              <div key={i} className="bg-linear-to-br from-[#fce6e6] to-white rounded-lg p-[40px_30px] text-center transition-all hover:-translate-y-1.25 border-2 border-transparent hover:shadow-lg group">
                <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-[25px]">
                  <i className={`fas ${ec.icon} text-[2.5rem] text-white`}></i>
                </div>
                <h3 className="text-[1.5rem] mb-[15px] font-bold">{ec.title}</h3>
                <p className="text-gray mb-[25px]">{ec.desc}</p>
                <a href={ec.link} className="inline-flex items-center gap-2.5 px-[30px] py-3 bg-linear-to-br from-primary to-primary-light text-white rounded-[50px] font-bold no-underline transition-all hover:-translate-y-0.75 hover:shadow-hover">
                  <i className={`fas ${ec.icon2 || 'fa-phone'}`}></i> {ec.linkText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section placeholder */}
      <section className="py-20 px-6 bg-linear-to-br from-[#fce6e6] to-white">
        <div className="max-w-[1280px] mx-auto rounded-lg overflow-hidden shadow-lg border border-[#E2E8F0]">
          <div className="w-full h-[400px] bg-linear-to-br from-primary to-primary-light flex items-center justify-center relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-10 bg-[size:50px_50px] animate-float transition-all duration-[20s] linear group-hover:scale-150"
              style={{ backgroundImage: `url('data:image/svg+xml;charset=utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath d=%22M50 0 L61 35 L98 35 L68 57 L79 92 L50 70 L21 92 L32 57 L2 35 L39 35 Z%22 fill=%22white%22/%3E%3C/svg%3E')` }}
            ></div>
            <div className="text-center text-white relative z-1">
              <i className="fas fa-map-marked-alt text-[5rem] mb-5 animate-bounce"></i>
              <h3 className="text-[2rem] mb-2.5 font-bold">{bankInfo?.name || 'Life4U Headquarters'}</h3>
              <p className="text-[1.2rem] opacity-90">{bankInfo ? `${bankInfo.street || ''}, ${bankInfo.city || ''}` : '123 Donor Street, Healthcare District, New Delhi - 110001'}</p>
              <p className="mt-5 text-base">🗺️ Interactive Map Loading...</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[2.5rem] text-center mb-5 font-clash font-semibold">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <p className="text-center text-gray max-w-[700px] mx-auto mb-[60px]">Quick answers to common queries about contacting us</p>
          <div className="max-w-[800px] mx-auto space-y-[15px]">
            {[
              { q: 'How quickly do you respond to emails?', a: 'We aim to respond to all emails within 2 hours during working hours. For emergencies, please use our 24/7 helpline for immediate assistance.' },
              { q: 'What should I do in a blood emergency?', a: 'Call our emergency helpline immediately at 1800-999-9999. Our team will coordinate with the nearest blood bank and activate our emergency donor network.' },
              { q: 'Can I visit your office without appointment?', a: 'Yes, you can visit during working hours. However, for specific queries or meetings, we recommend scheduling an appointment.' },
              { q: 'Is live chat available 24/7?', a: 'Yes, our live chat support is available 24/7. In case of high volume, you might experience a short wait time. For emergencies, please use phone support.' }
            ].map((faq, i) => (
              <div key={i} className={`bg-linear-to-br from-[#fce6e6] to-white rounded-sm overflow-hidden shadow-sm transition-all ${activeFaq === i ? 'ring-2 ring-primary/20' : ''}`}>
                <div onClick={() => toggleFaq(i)} className="p-5 flex justify-between items-center cursor-pointer hover:bg-primary/5 transition-colors">
                  <h3 className="text-[1.1rem] font-bold">{faq.q}</h3>
                  <i className={`fas fa-chevron-down transition-transform duration-300 text-primary ${activeFaq === i ? 'rotate-180' : ''}`}></i>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${activeFaq === i ? 'max-h-[200px] p-[0_20px_20px_20px]' : 'max-h-0'}`}>
                  <p className="text-gray leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Connect */}
      <section className="py-[60px] px-6 bg-[#F8FAFC] text-center">
        <h2 className="text-[2.5rem] mb-5 font-clash font-semibold">Connect With <span className="gradient-text">Us</span></h2>
        <p className="text-gray max-w-[600px] mx-auto mb-10">Follow us on social media for updates, emergency alerts, and community stories</p>
        <div className="flex justify-center gap-[30px] flex-wrap">
          {['fa-instagram', 'fa-facebook-f', 'fa-twitter', 'fa-whatsapp', 'fa-youtube', 'fa-linkedin-in', 'fa-telegram'].map((icon, i) => (
            <a key={i} href="#" className="w-[70px] h-[70px] bg-linear-to-br from-[#fce6e6] to-white rounded-full flex items-center justify-center text-[2rem] text-primary shadow-md transition-all hover:-translate-y-1.25 hover:rotate-[360deg] relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <i className={`fab ${icon} relative z-1 transition-colors group-hover:text-white`}></i>
            </a>
          ))}
        </div>
      </section>

      {/* Chat Widget */}
      <div className="fixed bottom-[30px] right-[30px] z-[1000]">
        <div onClick={() => setChatOpen(!chatOpen)} className="w-[70px] h-[70px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-[2rem] cursor-pointer shadow-lg transition-all hover:scale-110 animate-pulse">
          <i className={`fas ${chatOpen ? 'fa-times' : 'fa-comment-dots'}`}></i>
        </div>

        <div className={`absolute bottom-[90px] right-0 w-[350px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform ${chatOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-5 pointer-events-none'}`}>
          <div className="bg-linear-to-br from-primary to-primary-light text-white p-5 flex justify-between items-center">
            <h3 className="text-[1.2rem] font-bold flex items-center gap-2"><i className="fas fa-robot"></i> Life4U Assistant</h3>
            <i className="fas fa-times cursor-pointer" onClick={() => setChatOpen(false)}></i>
          </div>
          <div className="h-[300px] p-5 overflow-y-auto bg-[#f9f9f9] flex flex-col gap-[15px]">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.type === 'bot' ? 'items-start' : 'items-end'}`}>
                <div className={`max-w-[80%] p-[10px_15px] rounded-[20px] text-[0.9rem] ${msg.type === 'bot' ? 'bg-white border border-[#E2E8F0]' : 'bg-linear-to-br from-primary to-primary-light text-white'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex p-[15px] bg-white border-t border-[#E2E8F0] gap-2.5">
            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2.5 border border-[#E2E8F0] rounded-[25px] focus:outline-none"
            />
            <button onClick={handleSendMessage} className="w-10 h-10 bg-linear-to-br from-primary to-primary-light border-none rounded-full text-white cursor-pointer transition-all hover:scale-110 flex items-center justify-center shrink-0">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
