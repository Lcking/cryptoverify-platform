import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingContacts from '../ui/FloatingContacts';
import Seo from '../seo/Seo';

const PageLayout = ({ children, title, description, seo }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {seo && (
        <Seo title={seo.title || title} description={seo.description || description} keywords={seo.keywords} />
      )}
      <Navbar />
      {(title || description) && (
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 pt-20 pb-12 text-center text-white px-4">
          {title && <h1 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h1>}
          {description && <p className="max-w-3xl mx-auto text-blue-100 text-lg leading-relaxed">{description}</p>}
        </header>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContacts />
    </div>
  );
};

export default PageLayout;