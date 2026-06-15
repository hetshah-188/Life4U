import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import EmergencyBanner from './EmergencyBanner';
import EmergencyModal from './EmergencyModal';

const Layout = ({ children }) => {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const showEmergencyModal = () => setIsEmergencyModalOpen(true);
  const hideEmergencyModal = () => setIsEmergencyModalOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      <EmergencyBanner onShowModal={showEmergencyModal} />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <EmergencyModal isOpen={isEmergencyModalOpen} onClose={hideEmergencyModal} />
    </div>
  );
};

export default Layout;
