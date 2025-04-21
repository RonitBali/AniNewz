import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle automatic scroll to top when navigation happens
  useEffect(() => {
    // Use a small delay to make it feel more natural
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }, [pathname]);

  // Show/hide scroll button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 300; // Show button after scrolling this many pixels
      setShowScrollButton(window.scrollY > scrollThreshold);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {showScrollButton && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;