import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLayout from './components/Admin/AdminLayout';

function App() {
  const isAdminRoute = window.location.pathname === '/admin';

  if (isAdminRoute) {
    return <AdminLayout />;
  }

  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;