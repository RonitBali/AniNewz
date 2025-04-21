import React from 'react';
import { Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#1f1f1f]/60  backdrop-blur-md  text-gray-300  border-t border-pink-500/20 mt-5">
      <div className="max-w-6xl mx-auto px-4 flex flex-col gap-4">
        <div className="flex items-center justify-center gap-4 mt-5 ">
          <a href="https://github.com/your-username" target="_blank" rel="noreferrer">
            <Github className="h-6 w-6 hover:text-pink-400 transition" />
          </a>
          <a href="https://twitter.com/your-handle" target="_blank" rel="noreferrer">
            <Twitter className="h-6 w-6 hover:text-pink-400 transition" />
          </a>
          <a href="https://instagram.com/your-handle" target="_blank" rel="noreferrer">
            <Instagram className="h-6 w-6 hover:text-pink-400 transition" />
          </a>
        </div>
      </div>

     
      <div className="mt-3 pb-3 text-center text-l text-gray-300 ">
        © {new Date().getFullYear()} AniNews || Built by Ronit Bali.
      </div>
    </footer>
  );
};

export default Footer;
