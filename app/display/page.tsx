// "use client";

// import { useEffect, useRef, useState } from "react";
// import { ref, onChildAdded } from "firebase/database";
// import { database } from "../../firebase"; 

// interface Wish {
//   id: string;
//   name: string;
//   wish: string;
// }

// // ---------------------------------------------------
// // ၁။ Gold & Green Sparks (ရွှေရောင်၊ စိမ်းရောင် မီးပွားများ)
// // ---------------------------------------------------
// class GridSpark {
//   x: number;
//   y: number;
//   speedY: number;
//   size: number;
//   color: string;

//   constructor(canvasWidth: number, canvasHeight: number) {
//     this.x = Math.random() * canvasWidth;
//     this.y = canvasHeight + Math.random() * 200;
//     this.speedY = Math.random() * 1.5 + 0.5; 
//     this.size = Math.random() * 2 + 1;
//     // Green နဲ့ Gold Random ရွေးမယ်
//     this.color = Math.random() > 0.5 ? "#00ffcc" : "#ffd700"; 
//   }

//   draw(ctx: CanvasRenderingContext2D) {
//     ctx.beginPath();
//     ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//     ctx.fillStyle = this.color;
//     ctx.shadowColor = this.color;
//     ctx.shadowBlur = 10;
//     ctx.fill();
//     ctx.shadowBlur = 0;
//   }

//   update() {
//     this.y -= this.speedY;
//   }
// }

// // ---------------------------------------------------
// // ၂။ Future Grid Module (ထောင့်ချိုးဘောင်လေးများ)
// // ---------------------------------------------------
// class GridModule {
//   x: number;
//   y: number;
//   speedY: number;
//   width: number = 300;
//   height: number = 130;
//   name: string;
//   wish: string;
//   color: string;

//   constructor(x: number, y: number, name: string, wish: string) {
//     this.x = x;
//     this.y = y;
//     this.name = name;
//     this.wish = wish;
//     this.speedY = Math.random() * 1.2 + 0.8; 
    
//     // Future Grid Colors: Neon Green & Gold
//     const colors = ["#00ffcc", "#ffd700"];
//     this.color = colors[Math.floor(Math.random() * colors.length)];
//   }

//   draw(ctx: CanvasRenderingContext2D) {
//     // ----------------- Octagon/Circuit Shape -----------------
//     const corner = 20;
//     ctx.beginPath();
//     ctx.moveTo(this.x + corner, this.y);
//     ctx.lineTo(this.x + this.width - corner, this.y);
//     ctx.lineTo(this.x + this.width, this.y + corner);
//     ctx.lineTo(this.x + this.width, this.y + this.height - corner);
//     ctx.lineTo(this.x + this.width - corner, this.y + this.height);
//     ctx.lineTo(this.x + corner, this.y + this.height);
//     ctx.lineTo(this.x, this.y + this.height - corner);
//     ctx.lineTo(this.x, this.y + corner);
//     ctx.closePath();

//     // Semi-transparent Deep Green Background
//     ctx.fillStyle = "rgba(4, 26, 16, 0.85)";
//     ctx.fill();

//     // Glowing Tech Border
//     ctx.strokeStyle = this.color;
//     ctx.lineWidth = 1.5;
//     ctx.shadowColor = this.color;
//     ctx.shadowBlur = 15;
//     ctx.stroke();

//     // Inner Corner Accents (ဆားကစ်လိုမျိုး အစက်လေးတွေ ထည့်မယ်)
//     ctx.fillStyle = this.color;
//     ctx.fillRect(this.x - 2, this.y + corner - 2, 4, 4);
//     ctx.fillRect(this.x + this.width - 2, this.y + this.height - corner - 2, 4, 4);

//     // ----------------- စာသားများ -----------------
//     ctx.shadowBlur = 0; 
//     ctx.textAlign = "left";
    
//     // Title (NAME) - ရွှေရောင် (သို့) စိမ်းရောင်
//     ctx.fillStyle = this.color;
//     ctx.font = "bold 15px 'Courier New', monospace";
//     ctx.fillText(`NODE // ${this.name.toUpperCase()}`, this.x + 25, this.y + 30);

//     // Divider Line
//     ctx.beginPath();
//     ctx.moveTo(this.x + 25, this.y + 40);
//     ctx.lineTo(this.x + this.width - 25, this.y + 40);
//     ctx.strokeStyle = "rgba(0, 255, 204, 0.3)";
//     ctx.stroke();

//     // Wish Text 
//     ctx.fillStyle = "#e0f2f1"; // Light cyan/white for text
//     ctx.font = "14px 'Courier New', monospace";
    
//     const words = this.wish.split(" ");
//     let line = "";
//     let lineY = this.y + 65;
//     const maxWidth = this.width - 50;

//     for (let i = 0; i < words.length; i++) {
//       const testLine = line + words[i] + " ";
//       const metrics = ctx.measureText(testLine);
//       if (metrics.width > maxWidth && i > 0) {
//         ctx.fillText(line, this.x + 25, lineY);
//         line = words[i] + " ";
//         lineY += 22;
//       } else {
//         line = testLine;
//       }
//     }
//     ctx.fillText(line, this.x + 25, lineY);
//   }

//   update() {
//     this.y -= this.speedY;
//   }
// }

// // ---------------------------------------------------
// // ၃။ Main Display Component
// // ---------------------------------------------------
// export default function DisplayPage() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [wishesQueue, setWishesQueue] = useState<Wish[]>([]);
//   const modulesRef = useRef<GridModule[]>([]);
//   const sparksRef = useRef<GridSpark[]>([]);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const wishesRef = ref(database, "wishes");
//     const unsubscribe = onChildAdded(wishesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setWishesQueue((prev) => {
//           if (prev.some((wish) => wish.id === snapshot.key)) return prev;
//           return [...prev, { id: snapshot.key as string, name: data.name, wish: data.wish }];
//         });
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     if (timerRef.current) clearInterval(timerRef.current);
    
//     // အမြန်နှုန်းကို စက္ကန့်ဝက်ခန့် ထားပါတယ်
//     timerRef.current = setInterval(() => {
//       setWishesQueue((prevQueue) => {
//         if (prevQueue.length > 0) {
//           const nextWish = prevQueue[0];
//           const newQueue = prevQueue.slice(1);
          
//           const startX = Math.random() * (canvas.width - 320) + 50;
//           const startY = canvas.height + Math.random() * 50 + 20; 
          
//           modulesRef.current.push(new GridModule(startX, startY, nextWish.name, nextWish.wish));
//           return newQueue;
//         }
//         return prevQueue;
//       });
//     }, 600);

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [wishesQueue.length]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     let animationFrameId: number;

//     const render = () => {
//       // Deep Green Tech Background အုပ်မယ်
//       ctx.fillStyle = "rgba(2, 10, 6, 0.3)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       if (sparksRef.current.length < 80) {
//         if (Math.random() < 0.2) {
//           sparksRef.current.push(new GridSpark(canvas.width, canvas.height));
//         }
//       }

//       sparksRef.current.forEach((spark, index) => {
//         spark.update();
//         spark.draw(ctx);
//         if (spark.y + spark.size < 0) {
//           sparksRef.current.splice(index, 1);
//         }
//       });

//       modulesRef.current.forEach((mod, index) => {
//         mod.update();
//         mod.draw(ctx);
//         if (mod.y + mod.height + 50 < 0) {
//           modulesRef.current.splice(index, 1);
//         }
//       });

//       animationFrameId = requestAnimationFrame(render);
//     };

//     render();

//     const handleResize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     window.addEventListener("resize", handleResize);

//     return () => {
//       cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   return (
//     // Background ကို အစိမ်းရင့်ရောင် သုံးထားပါတယ်
//     <div className="w-full h-screen bg-[#010804] overflow-hidden relative">
      
//       {/* ကြီးမားတဲ့ Radial Glowing Circle လေး အလယ်မှာ ထားပါမယ် (ပုံထဲက စက်ဝိုင်းတွေလိုမျိုး) */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#00ffcc]/10 shadow-[0_0_100px_rgba(0,255,204,0.05)] z-0"></div>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#ffd700]/10 border-dashed z-0 animate-[spin_60s_linear_infinite]"></div>

//       {/* Grid Pattern (အစိမ်းရောင်လိုင်းများ) */}
//       <div 
//         className="absolute inset-0 z-0 opacity-[0.03]"
//         style={{
//           backgroundImage: `linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)`,
//           backgroundSize: `50px 50px`
//         }}
//       ></div>
      
//       <canvas 
//         ref={canvasRef} 
//         className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none mix-blend-screen"
//       />
      
//       <div className="absolute bottom-4 right-4 z-20 font-mono text-[#ffd700] text-sm tracking-widest uppercase border border-[#ffd700]/30 bg-[#010804]/80 backdrop-blur-sm px-4 py-2">
//         GRID LOAD: {wishesQueue.length}
//       </div>
//     </div>
//   );
// }

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