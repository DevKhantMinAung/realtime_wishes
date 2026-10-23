// src/app/display/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ref, onChildAdded } from "firebase/database";
import { database } from "../../firebase"; // လမ်းကြောင်းမှန်အောင် စစ်ပါ

interface Wish {
  id: string;
  name: string;
  wish: string;
}

// မီးပုံးတစ်လုံးချင်းစီရဲ့ အချက်အလက်တွေကို သိမ်းမယ့် Class ပါ
class Lantern {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  name: string;
  wish: string;
  image: HTMLImageElement;

  constructor(x: number, y: number, name: string, wish: string, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.wish = wish;
    this.image = image;
    // အပေါ်တက်မယ့် အမြန်နှုန်းနဲ့ ဘေးကို ယိမ်းမယ့် အမြန်နှုန်း (Random)
    this.speedY = Math.random() * 1 + 0.5; 
    this.speedX = (Math.random() - 0.5) * 0.5; 
    // မီးပုံးရဲ့ အရွယ်အစား (Random)
    this.size = Math.random() * 40 + 60; 
  }

  draw(ctx: CanvasRenderingContext2D) {
    // မီးပုံးပုံဆွဲမယ်
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size * 1.5);
    
    // စာသားတွေအတွက် စတိုင်
    ctx.fillStyle = "#FFD700"; // ရွှေရောင်စာသား
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;

    // နာမည်ကို မီးပုံးအောက်နားမှာ ရေးမယ်
    ctx.fillText(this.name, this.x + this.size / 2, this.y + this.size * 1.5 + 20);
    
    // ဆုတောင်းစာကို နာမည်အောက်မှာ ရေးမယ်
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    
    // စာရှည်ရင် ခွဲရေးဖို့အတွက် ရိုးရှင်းတဲ့ Logic လေး
    const words = this.wish.split(" ");
    let line = "";
    let lineY = this.y + this.size * 1.5 + 40;
    const maxWidth = 150;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, this.x + this.size / 2, lineY);
        line = words[i] + " ";
        lineY += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, this.x + this.size / 2, lineY);
    ctx.shadowBlur = 0; // Shadow ပြန်ပိတ်
  }

  update() {
    this.y -= this.speedY; // အပေါ်ကို တက်မယ်
    this.x += this.speedX; // ဘေးကို နည်းနည်း ယိမ်းမယ်
  }
}

// အပေါ်က Lantern Class အောက်မှာ ထည့်ရန်
class BgLantern {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  image: HTMLImageElement;
  opacity: number;

  constructor(x: number, y: number, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.image = image;
    // နောက်ခံ မီးပုံးလေးတွေမို့လို့ ပိုနှေးမယ်၊ ပိုသေးမယ်၊ ဝါးဝါးလေး ဖြစ်နေမယ်
    this.speedY = Math.random() * 0.5 + 0.2; 
    this.speedX = (Math.random() - 0.5) * 0.3; 
    this.size = Math.random() * 20 + 20; 
    this.opacity = Math.random() * 0.5 + 0.2; // 0.2 ကနေ 0.7 အတွင်း (မှုန်ဝါးဝါးလေး)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.opacity; // မီးပုံးကို ဝါးအောင်လုပ်မယ်
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size * 1.5);
    ctx.globalAlpha = 1.0; // တခြားဟာတွေ ဆွဲရင် ပုံမှန်အတိုင်း ပြန်ထားမယ်
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
  }
}

export default function DisplayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wishesQueue, setWishesQueue] = useState<Wish[]>([]); // တန်းစီထားမယ့် Data တွေ
  const lanternsRef = useRef<Lantern[]>([]); // Canvas ပေါ်ရောက်နေတဲ့ မီးပုံးတွေ
  const bgLanternsRef = useRef<BgLantern[]>([]); // ဒါလေး အသစ်ထည့်ပါ
  const lanternImageRef = useRef<HTMLImageElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ၁။ Firebase ကနေ Data အသစ်ဝင်လာရင် ဖမ်းပြီး Queue ထဲ ထည့်မယ်
  useEffect(() => {
    const wishesRef = ref(database, "wishes");
    
    const unsubscribe = onChildAdded(wishesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWishesQueue((prev) => {
          // ID တူတာရှိနေရင် Queue ထဲ ထပ်မထည့်တော့ပါဘူး (Duplicate ဖြစ်ခြင်းမှ ကာကွယ်ရန်)
          if (prev.some((wish) => wish.id === snapshot.key)) {
            return prev;
          }
          
          // ID မတူတာ အသစ်ဆိုမှသာ Queue ထဲ ပေါင်းထည့်ပါမယ်
          return [
            ...prev, 
            { id: snapshot.key as string, name: data.name, wish: data.wish }
          ];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // ၂။ မီးပုံးပုံလေးကို အရင် Load လုပ်ထားမယ် (ပုံမရှိသေးရင် ဒီနေရာမှာ Error တက်နိုင်ပါတယ်)
  useEffect(() => {
    const img = new window.Image();
    // public folder ထဲမှာ lantern.png ဆိုတာ ရှိရပါမယ်။ လောလောဆယ် placeholder link လေး ထည့်ထားပါတယ်။
    img.src = "https://cdn-icons-png.flaticon.com/128/13846/13846386.png"; 
    img.onload = () => {
      lanternImageRef.current = img;
    };
  }, []);

  // ၃။ Queue ထဲမှာ Data ရှိရင် ၁ စက္ကန့်ကို တစ်လုံးနှုန်းနဲ့ Canvas ပေါ် လွှတ်တင်မယ်
  // ၃။ Queue ထဲမှာ Data ရှိရင် ၁ စက္ကန့်ကို တစ်လုံးနှုန်းနဲ့ Canvas ပေါ် လွှတ်တင်မယ်
  useEffect(() => {
    if (wishesQueue.length === 0 || !lanternImageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // ရှိပြီးသား Timer ကို အရင်ရှင်းမယ် (Timer ၂ ခု ထပ်မနေအောင်)
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setWishesQueue((prevQueue) => {
        if (prevQueue.length > 0) {
          const nextWish = prevQueue[0];
          const newQueue = prevQueue.slice(1);
          
          const startX = Math.random() * (canvas.width - 100) + 50;
          const startY = canvas.height + 50;

          lanternsRef.current.push(
            new Lantern(startX, startY, nextWish.name, nextWish.wish, lanternImageRef.current!)
          );

          return newQueue;
        }
        return prevQueue;
      });
    }, 1500); // ၁.၅ စက္ကန့်ခြား

    // Component ပိတ်တဲ့အခါ Timer ကို သေချာရှင်းမယ်
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [wishesQueue.length]); // Queue အရေအတွက် ပြောင်းတိုင်း ဒီ Effect ပြန် Run ပါမယ်

  // ၄။ Canvas Animation Loop (တစ်စက္ကန့်ကို အခါ ၆၀ ပုံပြန်ဆွဲမယ်)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // မျက်နှာပြင် အပြည့်ဖြစ်အောင် ချိန်မယ်
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId: number;

    const render = () => {
      // မျက်နှာပြင်ကို အရင်ရှင်းမယ်
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- အသစ်ထည့်မယ့်အပိုင်း စတင် ---
      // နောက်ခံ မီးပုံးလေးတွေကို Canvas ပေါ်မှာ အလုံး ၃၀ လောက် အမြဲရှိနေအောင် ဖြည့်မယ်
      if (bgLanternsRef.current.length < 30 && lanternImageRef.current) {
         // ၂% လောက် အခွင့်အရေးနဲ့ မီးပုံးအသစ် တစ်လုံးချင်း ထွက်လာမယ် (အရမ်းမများအောင်)
         if(Math.random() < 0.02) {
             const startX = Math.random() * canvas.width;
             const startY = canvas.height + 50;
             bgLanternsRef.current.push(new BgLantern(startX, startY, lanternImageRef.current));
         }
      }

      // နောက်ခံ မီးပုံးလေးတွေကို အရင်ဆွဲမယ် (အနောက်မှာ နေအောင်)
      bgLanternsRef.current.forEach((bgLantern, index) => {
        bgLantern.update();
        bgLantern.draw(ctx);
        if (bgLantern.y + bgLantern.size * 2 < 0) {
          bgLanternsRef.current.splice(index, 1);
        }
      });
      // --- အသစ်ထည့်မယ့်အပိုင်း ပြီးဆုံး ---

      // မီးပုံးတွေကို ဆွဲမယ်၊ အပေါ်ကို တက်ခိုင်းမယ်
      lanternsRef.current.forEach((lantern, index) => {
        lantern.update();
        lantern.draw(ctx);

        // မျက်နှာပြင်အပေါ်ကနေ ပျောက်သွားရင် array ထဲကနေ ဖျက်ထုတ်မယ် (စက်မလေးအောင်လို့ပါ)
        if (lantern.y + lantern.size * 2 < 0) {
          lanternsRef.current.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Browser Size ပြောင်းရင် Canvas Size ပြန်ချိန်ဖို့
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    // ညကောင်းကင်ယံ Background လေးနဲ့ Canvas ကို အပြည့်ထားပါမယ်
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative">
      {/* ကြယ်လေးတွေလို လင်းလက်နေအောင် ရိုးရှင်းတဲ့ CSS background သုံးထားပါတယ် */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
      
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
      />
      
      {/* ညာဘက်အောက်ထောင့်မှာ Queue အခြေအနေကို ပြပေးထားပါတယ် */}
      <div className="absolute bottom-4 right-4 z-20 text-white/50 text-sm">
        တန်းစီနေသော ဆုတောင်းများ: {wishesQueue.length}
      </div>
    </div>
  );
}