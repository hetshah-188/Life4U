import React, { useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import LiveTicker from '../components/LiveTicker';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import EmergencyModal from '../components/EmergencyModal';

const Home = () => {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <Layout>
      <Hero />
      <LiveTicker />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <EmergencyModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
    </Layout>
  );
};

export default Home;
