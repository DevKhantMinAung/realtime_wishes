"use client";

import { useState } from "react";
import { ref, push, serverTimestamp } from "firebase/database";
import { database } from "../firebase"; // firebase.ts ရှိတဲ့ လမ်းကြောင်းကို သေချာစစ်ပေးပါ

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
      // Firebase Database ထဲက 'wishes' ဆိုတဲ့ နေရာကို Data လှမ်းပို့တာပါ
      const wishesRef = ref(database, "wishes");
      await push(wishesRef, {
        name: name,
        wish: wish,
        timestamp: serverTimestamp(),
      });

      // ပို့တာအောင်မြင်သွားရင် Form ကို ရှင်းထုတ်ပြီး Success Message ပြပါမယ်
      setName("");
      setWish("");
      setShowSuccess(true);
      setIsSubmitting(false);

      // ၃ စက္ကန့်ကြာရင် Success Message ကို ပြန်ဖျောက်ပါမယ်
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error adding wish: ", error);
      setIsSubmitting(false);
      alert("ဆုတောင်းပို့ရာတွင် အခက်အခဲရှိနေပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပါ။");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Staff Party 2026
        </h1>
        <p className="text-indigo-200 text-center mb-8 text-sm">
          သင့်ရဲ့ ဆုတောင်းစကားလေးတွေနဲ့ မီးပုံးလေးကို လွှတ်တင်လိုက်ပါ
        </p>

        {showSuccess ? (
          <div className="bg-green-500/20 border border-green-500 text-green-100 p-4 rounded-xl text-center animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">အောင်မြင်ပါသည်! 🎉</h2>
            <p>သင့်ရဲ့ ဆုတောင်းလေး လွင့်တက်သွားပါပြီ။ စင်မြင့်ပေါ်က LED Screen ကို ကြည့်လိုက်ပါ။</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              နောက်ထပ် ဆုတောင်းမည်
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-indigo-100 mb-1">
                သင့်အမည် (သို့) ဌာန
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="ဥပမာ - မောင်မောင် (Marketing)"
              />
            </div>

            <div>
              <label htmlFor="wish" className="block text-sm font-medium text-indigo-100 mb-1">
                ဆုတောင်းစကား
              </label>
              <textarea
                id="wish"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="ပျော်ရွှင်စရာ Staff Party လေး ဖြစ်ပါစေ..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                isSubmitting 
                  ? "bg-indigo-500/50 cursor-not-allowed" 
                  : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "လွှတ်တင်နေသည်..." : "မီးပုံး လွှတ်တင်မည် 🏮"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}