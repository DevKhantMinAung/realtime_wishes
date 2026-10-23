"use client";

import { useState } from "react";
import { ref, push, serverTimestamp } from "firebase/database";
import { database } from "../firebase"; // လမ်းကြောင်းမှန်အောင် စစ်ပါ

export default function Home() {
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !wish) return;

    setIsSubmitting(true);

    try {
      const wishesRef = ref(database, "wishes");
      await push(wishesRef, {
        name: name,
        wish: wish,
        timestamp: serverTimestamp(),
      });

      setName("");
      setWish("");
      setShowSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error adding wish: ", error);
      setIsSubmitting(false);
      alert("SYSTEM ERROR: TRANSMISSION FAILED. PLEASE RETRY.");
    }
  };

  return (
    // font-mono ကိုသုံးပြီး Futuristic စာလုံးစတိုင် ပြောင်းထားပါတယ်
    <main className="min-h-screen bg-[#040914] flex items-center justify-center p-4 relative font-mono overflow-hidden">
      
      {/* Background Grid (Display Page နဲ့ ဆင်တူအောင် ထည့်ထားပါတယ်) */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)`,
          backgroundSize: `40px 40px`
        }}
      ></div>

      {/* <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url('/bg.jpeg')`, 
          backgroundSize: `cover`,
          backgroundPosition: `center`,
        }}
      ></div> */}

      {/* Form Container */}
      <div className="relative z-10 bg-black/60 backdrop-blur-md p-6 md:p-8 w-full max-w-md border border-[#00f3ff]/50 shadow-[0_0_20px_rgba(0,243,255,0.2)] rounded-none">
        
        {/* Cyberpunk UI Accents (ထောင့်လေးတွေမှာ Neon အစက်လေးတွေ) */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-[#00f3ff]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#ff00ff]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#b026ff]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#00f3ff]"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00f3ff] mb-2 tracking-widest drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">
            OVERDRIVE
          </h1>
          <p className="text-[#00f3ff]/70 text-xs tracking-widest">
            STAFF PARTY 2026 // SYSTEM ONLINE
          </p>
        </div>

        {showSuccess ? (
          <div className="border border-[#00f3ff] text-[#00f3ff] p-6 text-center bg-[#00f3ff]/10">
            <h2 className="text-lg font-bold mb-2 animate-pulse">TRANSMISSION SUCCESSFUL</h2>
            <p className="text-xs mb-6 text-white/80 tracking-widest">DATA UPLOADED TO MAINFRAME.</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 border border-[#00f3ff] hover:bg-[#00f3ff] hover:text-black transition-all text-xs tracking-widest uppercase font-bold"
            >
              [ INITIALIZE NEW MESSAGE ]
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#ff00ff] mb-2 tracking-widest">
                USER_ID / NAME
              </label>
              {/* Input တွေကို Border အပြည့်မသုံးဘဲ အောက်ခြေမျဉ်း (Border-bottom) ပဲ သုံးထားပါတယ် */}
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-2 py-2 bg-transparent border-b-2 border-[#ff00ff]/40 text-white placeholder-white/20 focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_4px_15px_-3px_rgba(255,0,255,0.4)] transition-all rounded-none text-sm"
                placeholder="Enter your name..."
              />
            </div>

            <div>
              <label htmlFor="wish" className="block text-xs font-bold text-[#00f3ff] mb-2 tracking-widest">
                DATA_PAYLOAD / WISH
              </label>
              <textarea
                id="wish"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                required
                rows={3}
                className="w-full px-2 py-2 bg-transparent border-b-2 border-[#00f3ff]/40 text-white placeholder-white/20 focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_4px_15px_-3px_rgba(0,243,255,0.4)] transition-all resize-none rounded-none text-sm"
                placeholder="Enter your message..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 text-sm font-bold tracking-widest uppercase border transition-all duration-300 ${
                isSubmitting 
                  ? "border-gray-600 text-gray-600 cursor-not-allowed bg-transparent" 
                  : "border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] bg-transparent"
              }`}
            >
              {isSubmitting ? "TRANSMITTING..." : "[ TRANSMIT DATA ]"}
            </button>
          </form>
        )}
        
        {/* Decorative Color Bar at bottom */}
        <div className="mt-8 h-1 w-full bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#b026ff]"></div>
      </div>
    </main>
  );
}