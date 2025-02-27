import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLayout from './components/Admin/AdminLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route cho trang chính */}
        <Route
          path="/"
          element={
            <div>
              <Navbar />
              <Hero />
              <Services />
              <About />
              <Gallery />
              <Contact />
              <Footer />
            </div>
          }
        />
        {/* Route cho trang admin */}
        <Route path="/admin" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

export default App;