import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; 
import "./globals.css";
import Provider from "@/components/SessionProvider";
import AuthButton from "@/components/AuthButton";
import Footer from "@/components/Footer"; 
import TransitionProvider from "@/components/TransitionProvider"; // IMPORT THIS
import ChatBot from "@/components/ChatBot";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sahayak X",
  description: "Next-Gen Scheme Discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} bg-[#FDFBF7]`}>
        <Provider>
          {/* WRAP EVERYTHING IN TRANSITION PROVIDER */}
          <TransitionProvider>
            
            {/* Floating Nav */}
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
              <nav className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl shadow-black/5 rounded-full px-2 py-2 flex items-center justify-between gap-6 w-full max-w-4xl transition-all hover:bg-white/90">
                <div className="flex items-center gap-3 pl-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/30">
                    S
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    Sahayak <span className="text-rose-500">X</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 pr-1">
                   <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                   <AuthButton />
                </div>
              </nav>
            </div>

            <div className="min-h-screen flex flex-col">
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>

            {/* GLOBAL CHATBOT WIDGET */}
            <ChatBot />

          </TransitionProvider>
        </Provider>
      </body>
    </html>
  );
}