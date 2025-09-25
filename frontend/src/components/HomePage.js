import React from 'react';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import HeroBanner from './sections/HeroBanner';
import FeaturesSection from './sections/FeaturesSection';
import ContentTabs from './sections/ContentTabs';
import ValuesSection from './sections/ValuesSection';
import FloatingContacts from './ui/FloatingContacts';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Banner - First Screen */}
      <HeroBanner />
      
      {/* Features Section - Second Screen */}
      <FeaturesSection />
      
      {/* Content Tabs - Third Screen */}
      <ContentTabs />
      
      {/* Values & Partners - Fourth Screen */}
      <ValuesSection />
      
      {/* Footer - Fifth Screen */}
      <Footer />
      
      {/* Floating Contact Buttons */}
      <FloatingContacts />
    </div>
  );
};

export default HomePage;