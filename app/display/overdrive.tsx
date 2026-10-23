"use client";

import { useEffect, useRef, useState } from "react";
import { ref, onChildAdded } from "firebase/database";
import { database } from "../../firebase"; 

interface Wish {
  id: string;
  name: string;
  wish: string;
}

// ---------------------------------------------------
// ၁။ နောက်ခံ Digital အမှုန်အမွှားများ (Data Stream)
// ---------------------------------------------------
class DigitalParticle {
  x: number;
  y: number;
  speedY: number;
  length: number;
  opacity: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight + Math.random() * 200;
    this.speedY = Math.random() * 2 + 1; // အပေါ်ကို အမြန်တက်မယ်
    this.length = Math.random() * 30 + 10; // မျဉ်းအရှည်
    this.opacity = Math.random() * 0.5 + 0.1; 
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y - this.length);
    ctx.strokeStyle = `rgba(0, 243, 255, ${this.opacity})`; // Neon Cyan Color
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  update() {
    this.y -= this.speedY;
  }
}

// ---------------------------------------------------
// ၂။ Holographic Data Card (မီးပုံးအစား)
// ---------------------------------------------------
class HologramCard {
  x: number;
  y: number;
  speedY: number;
  width: number = 280;
  height: number = 120;
  name: string;
  wish: string;
  color: string;

  constructor(x: number, y: number, name: string, wish: string) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.wish = wish;
    this.speedY = Math.random() * 1.5 + 1; 
    
    // Cyberpunk အရောင်တွေထဲက Random ရွေးမယ် (Cyan, Neon Pink, Electric Purple)
    const colors = ["#00f3ff", "#ff00ff", "#b026ff"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  draw(ctx: CanvasRenderingContext2D) {
    // ----------------- Cyberpunk Card Shape (ထောင့်ချွန်း) -----------------
    ctx.beginPath();
    ctx.moveTo(this.x + 15, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height - 15);
    ctx.lineTo(this.x + this.width - 15, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x, this.y + 15);
    ctx.closePath();

    // ကတ်ရဲ့ နောက်ခံအရောင် (မှောင်မှောင်နဲ့ မှန်လိုမြင်ရအောင်)
    ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
    ctx.fill();

    // Glowing Border (လင်းလက်နေတဲ့ ဘောင်)
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // ----------------- စာသားများ (Typography) -----------------
    ctx.shadowBlur = 0; // စာသားအတွက် အရမ်းမလင်းအောင် ပြန်ပိတ်မယ်
    ctx.textAlign = "left";
    
    // Title (NAME)
    ctx.fillStyle = this.color;
    ctx.font = "bold 14px monospace";
    ctx.fillText(`USER: ${this.name.toUpperCase()}`, this.x + 20, this.y + 25);

    // Divider Line (မျဉ်းလေးတားမယ်)
    ctx.beginPath();
    ctx.moveTo(this.x + 20, this.y + 35);
    ctx.lineTo(this.x + this.width - 20, this.y + 35);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wish Text (ဆုတောင်းစာ)
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    
    const words = this.wish.split(" ");
    let line = "";
    let lineY = this.y + 60;
    const maxWidth = this.width - 40;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, this.x + 20, lineY);
        line = words[i] + " ";
        lineY += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, this.x + 20, lineY);
  }

  update() {
    this.y -= this.speedY;
  }
}

// ---------------------------------------------------
// ၃။ Main Display Component
// ---------------------------------------------------
export default function DisplayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wishesQueue, setWishesQueue] = useState<Wish[]>([]);
  const cardsRef = useRef<HologramCard[]>([]);
  const particlesRef = useRef<DigitalParticle[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Data ဖမ်းခြင်း
  useEffect(() => {
    const wishesRef = ref(database, "wishes");
    const unsubscribe = onChildAdded(wishesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWishesQueue((prev) => {
          if (prev.some((wish) => wish.id === snapshot.key)) return prev;
          return [...prev, { id: snapshot.key as string, name: data.name, wish: data.wish }];
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Queue ထဲက Data ကို Card အဖြစ် ပြောင်းခြင်း
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setWishesQueue((prevQueue) => {
        if (prevQueue.length > 0) {
          const nextWish = prevQueue[0];
          const newQueue = prevQueue.slice(1);
          
          const startX = Math.random() * (canvas.width - 300) + 50;
          const startY = canvas.height + Math.random() * 50 + 20;
          cardsRef.current.push(new HologramCard(startX, startY, nextWish.name, nextWish.wish));

          return newQueue;
        }
        return prevQueue;
      });
    }, 600);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [wishesQueue.length]);

  // Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId: number;

    const render = () => {
      // ရှင်းထုတ်မယ့်အစား နည်းနည်း မှောင်တဲ့အရောင်ကို အုပ်လိုက်ရင် လှုပ်ရှားမှုက အမြီးတန်းလေးတွေ ကျန်ခဲ့ပြီး ပိုမိုက်ပါတယ်
      ctx.fillStyle = "rgba(4, 9, 20, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Digital Particles တွေကို အမြဲထွက်နေအောင် ဖန်တီးမယ်
      if (particlesRef.current.length < 50) {
        if (Math.random() < 0.1) {
          particlesRef.current.push(new DigitalParticle(canvas.width, canvas.height));
        }
      }

      particlesRef.current.forEach((particle, index) => {
        particle.update();
        particle.draw(ctx);
        if (particle.y + particle.length < 0) {
          particlesRef.current.splice(index, 1);
        }
      });

      // Hologram Cards
      cardsRef.current.forEach((card, index) => {
        card.update();
        card.draw(ctx);
        if (card.y + card.height + 50 < 0) {
          cardsRef.current.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

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
    // Deep Cyber Blue နောက်ခံ
    <div className="w-full h-screen bg-[#040914] overflow-hidden relative">
      {/* Grid Pattern လေး နောက်ခံမှာ ခပ်ရေးရေး ပေါ်နေအောင် */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
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
          filter: `blur(2px) brightness(0.5)`,
        }}
      ></div> */}
      
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none mix-blend-screen"
      />
      
      <div className="absolute bottom-4 right-4 z-20 font-mono text-[#00f3ff] text-sm tracking-widest uppercase shadow-lg shadow-cyan-500/20 px-4 py-2 border border-[#00f3ff]/30 bg-black/50 backdrop-blur-sm rounded">
        SYSTEM QUEUE: {wishesQueue.length}
      </div>
    </div>
  );
}