"use client";

import { Facebook, Twitter, Instagram, Linkedin, Heart, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md">
                S
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Sahayak <span className="text-rose-500">X</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Empowering 1.4 Billion Indians with AI-driven access to government rights. Built for the future of digital governance.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Github size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-rose-500 transition-colors">Schemes Database</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Project Netra (OCR)</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Project Vaani (Voice)</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Vector Engine</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-rose-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-rose-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2025 Sahayak AI Foundation. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            <span>Made with</span>
            <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: any }) {
  return (
    <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
      {icon}
    </a>
  );
}