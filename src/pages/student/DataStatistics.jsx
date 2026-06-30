import { useEffect, useRef } from 'react';
import { Network, Hexagon } from 'lucide-react';
import { getStoredToken } from '../../api/client';

const COLMENA_CALLBACK_URL =
  import.meta.env.VITE_COLMENA_CALLBACK_URL || 'http://localhost:5174/auth/callback';

export default function DataStatistics() {
  const canvasRef = useRef(null);

  const handleConnectColmena = () => {
    const token = getStoredToken();
    if (!token) {
      window.location.hash = '#/login';
      return;
    }
    const separator = COLMENA_CALLBACK_URL.includes('?') ? '&' : '?';
    window.location.href = `${COLMENA_CALLBACK_URL}${separator}token=${encodeURIComponent(token)}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) {
      return undefined;
    }

    let width = 0;
    let height = 0;
    let spores = [];
    let particles = [];
    let animationFrameId;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    class Node {
      constructor(x, y, angle, depth, speed) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.angle = angle;
        this.depth = depth;
        this.speed = speed || 0.45 + Math.random() * 0.55;
        this.length = 0;
        this.maxLength = 38 + Math.random() * 110;
        this.done = false;
        this.children = [];
        this.spawned = false;
        this.opacity = 0;
        this.wobble = (Math.random() - 0.5) * 0.012;
        this.thickness = Math.max(0.16, 1.2 - depth * 0.22);
      }

      grow() {
        if (this.done) {
          this.children.forEach((child) => child.grow());
          return;
        }

        this.opacity = Math.min(1, this.opacity + 0.04);
        this.angle += this.wobble;
        this.length = Math.min(this.length + this.speed, this.maxLength);

        if (this.length >= this.maxLength && !this.spawned) {
          this.spawned = true;

          if (this.depth < 7) {
            const count =
              this.depth < 2 ? 3 : this.depth < 4 ? 2 : Math.random() < 0.55 ? 2 : 1;

            for (let index = 0; index < count; index += 1) {
              const spread = (Math.random() - 0.5) * (Math.PI * 0.55);
              const child = new Node(
                this.x + Math.cos(this.angle) * this.length,
                this.y + Math.sin(this.angle) * this.length,
                this.angle + spread,
                this.depth + 1,
                this.speed * (0.82 + Math.random() * 0.22),
              );
              this.children.push(child);
            }
          }

          this.done = true;
        }

        this.children.forEach((child) => child.grow());
      }

      draw() {
        const endX = this.originX + Math.cos(this.angle) * this.length;
        const endY = this.originY + Math.sin(this.angle) * this.length;
        const alpha = this.opacity * (0.08 + (7 - this.depth) * 0.045);

        ctx.beginPath();
        ctx.moveTo(this.originX, this.originY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(37, 99, 235, ${Math.min(alpha, 0.52)})`;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (this.done) {
          ctx.beginPath();
          ctx.arc(endX, endY, this.thickness * 1.45, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity * 0.34})`;
          ctx.fill();
        }

        this.children.forEach((child) => child.draw());
      }
    }

    class Spore {
      constructor() {
        this.reset();
      }

      reset() {
        const edge = Math.random();

        if (edge < 0.25) {
          this.startX = Math.random() * width;
          this.startY = 0;
        } else if (edge < 0.5) {
          this.startX = width;
          this.startY = Math.random() * height;
        } else if (edge < 0.75) {
          this.startX = Math.random() * width;
          this.startY = height;
        } else {
          this.startX = 0;
          this.startY = Math.random() * height;
        }

        const towardCenter = Math.atan2(height / 2 - this.startY, width / 2 - this.startX);
        const spread = (Math.random() - 0.5) * Math.PI * 0.6;
        this.root = new Node(
          this.startX,
          this.startY,
          towardCenter + spread,
          0,
          0.5 + Math.random() * 0.8,
        );
        this.life = 0;
        this.maxLife = 280 + Math.random() * 220;
        this.fadeOut = 0;
      }

      tick() {
        this.life += 1;

        if (this.life > this.maxLife) {
          this.fadeOut = Math.min(1, this.fadeOut + 0.012);
          if (this.fadeOut >= 1) {
            this.reset();
          }
        }

        this.root.grow();
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - this.fadeOut);
        this.root.draw();
        ctx.restore();
      }
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = 1 + Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -0.1 - Math.random() * 0.35;
        this.alpha = 0;
        this.maxAlpha = 0.1 + Math.random() * 0.2;
        this.life = 0;
        this.maxLife = 120 + Math.random() * 180;
      }

      tick() {
        this.life += 1;
        this.x += this.vx;
        this.y += this.vy;

        const progress = this.life / this.maxLife;
        if (progress < 0.15) {
          this.alpha = (progress / 0.15) * this.maxAlpha;
        } else if (progress > 0.75) {
          this.alpha = ((1 - progress) / 0.25) * this.maxAlpha;
        } else {
          this.alpha = this.maxAlpha;
        }

        if (this.life >= this.maxLife) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${this.alpha})`;
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      const sporeCount = Math.min(18, Math.max(8, Math.floor((width * height) / 42000)));
      spores = Array.from({ length: sporeCount }, () => new Spore());
      spores.forEach((spore, index) => {
        spore.life = Math.floor((index / sporeCount) * spore.maxLife * 0.6);
      });
      particles = Array.from({ length: 40 }, () => new Particle());
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      spores.forEach((spore) => {
        spore.tick();
        spore.draw();
      });
      particles.forEach((particle) => {
        particle.tick();
        particle.draw();
      });
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const handleResize = () => {
      init();
    };

    init();
    loop();
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-[28px] bg-[#eff6ff] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_10%_15%,rgba(191,219,254,0.95)_0%,transparent_55%),radial-gradient(ellipse_60%_70%_at_90%_85%,rgba(199,210,254,0.82)_0%,transparent_55%),radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(224,242,254,0.9)_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute -left-36 -top-40 h-[34rem] w-[34rem] rounded-full bg-blue-300/60 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-[26rem] w-[26rem] rounded-full bg-indigo-300/55 blur-[90px]" />
      <div className="pointer-events-none absolute left-[42%] top-[34%] h-[19rem] w-[19rem] rounded-full bg-cyan-300/45 blur-[90px]" />

      <canvas ref={canvasRef} className="absolute inset-0 z-[1] h-full w-full" />

      <div className="relative z-[2] flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/70 text-blue-600 shadow-[0_12px_30px_rgba(59,130,246,0.16),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
            <Network className="h-6 w-6" />
          </div>
          <p className="font-serif text-2xl font-medium text-blue-800">
            Micelio Estadística
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-[32px] border border-white/90 bg-white/50 px-7 py-10 shadow-[0_10px_40px_rgba(59,130,246,0.1),0_2px_10px_rgba(59,130,246,0.06),inset_0_1px_0_rgba(255,255,255,0.98)] backdrop-blur-[44px] backdrop-saturate-200 sm:px-14 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <img
              src="/colmena-logo.png"
              alt="Colmena"
              className="mx-auto mb-6 h-24 w-auto drop-shadow-sm"
            />
            <p className="mb-6 text-sm leading-6 text-slate-600 sm:text-base">
              Conecta tu cuenta con{' '}
              <span className="font-semibold text-blue-700">Colmena</span> para el
              análisis estadístico de tus datos.
            </p>
            <button
              type="button"
              onClick={handleConnectColmena}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#E6C200] bg-[#FFD700] text-sm font-semibold uppercase tracking-widest text-[#191b23] shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <Hexagon className="h-5 w-5 fill-[#191b23]" />
              Conectar y continuar en Colmena
            </button>
            <p className="mt-3 text-center text-xs italic text-slate-400">
              La vinculación se realizará de forma automática
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
