'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  color: string;
  opacity: number;
  flicker: number;
  neighbors: number[];
  render: () => void;
}

interface Flare {
  x: number;
  y: number;
  z: number;
  color: string;
  opacity: number;
  render: () => void;
}

interface Link {
  length: number;
  verts: number[];
  stage: number;
  linked: number[];
  distances: number[];
  traveled: number;
  fade: number;
  finished: boolean;
  render: () => void;
  drawLine: (points: number[][], alpha?: number) => void;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Settings
    const particleCount = 40;
    const flareCount = 10;
    const motion = 0.05;
    const tilt = 0.05;
    const color = '#FFEED4';
    const particleSizeBase = 1;
    const particleSizeMultiplier = 0.5;
    const flareSizeBase = 100;
    const flareSizeMultiplier = 100;
    const lineWidth = 1;
    const linkChance = 75;
    const linkLengthMin = 5;
    const linkLengthMax = 7;
    const linkOpacity = 0.25;
    const linkFade = 90;
    const linkSpeed = 1;
    const glareAngle = -60;
    const glareOpacityMultiplier = 0.05;
    const renderParticles = true;
    const renderParticleGlare = true;
    const renderFlares = true;
    const renderLinks = true;
    const renderMesh = false;
    const flicker = true;
    const flickerSmoothing = 15;
    const blurSize = 0;
    const orbitTilt = true;
    const randomMotion = true;
    const noiseLength = 1000;
    const noiseStrength = 1;

    const mouse = { x: 0, y: 0 };
    const m = {};
    let r = 0;
    const c = 1000;
    let n = 0;
    const nAngle = (Math.PI * 2) / noiseLength;
    const nRad = 100;
    const nScale = 0.5;
    let nPos = { x: 0, y: 0 };
    const points: number[][] = [];
    let vertices: number[] = [];
    const triangles: number[][] = [];
    const links: Link[] = [];
    const particles: Particle[] = [];
    const flares: Flare[] = [];

    // Utility functions
    function random(min: number, max: number, float?: boolean): number {
      return float
        ? Math.random() * (max - min) + min
        : Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function noisePoint(i: number) {
      const a = nAngle * i;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const rad = nRad;
      return {
        x: rad * cosA,
        y: rad * sinA
      };
    }

    function position(x: number, y: number, z: number) {
      if (!canvas) return { x: 0, y: 0 };
      return {
        x: (x * canvas.width) + ((((canvas.width / 2) - mouse.x + ((nPos.x - 0.5) * noiseStrength)) * z) * motion),
        y: (y * canvas.height) + ((((canvas.height / 2) - mouse.y + ((nPos.y - 0.5) * noiseStrength)) * z) * motion)
      };
    }

    function sizeRatio() {
      if (!canvas) return 1000;
      return canvas.width >= canvas.height ? canvas.width : canvas.height;
    }

    function startLink(vertex: number, length: number) {
      if (!canvas) return;
      links.push(new LinkClass(vertex, length));
    }

    // Particle class
    class ParticleClass implements Particle {
      x: number;
      y: number;
      z: number;
      color: string;
      opacity: number;
      flicker: number;
      neighbors: number[];

      constructor() {
        this.x = random(-0.1, 1.1, true);
        this.y = random(-0.1, 1.1, true);
        this.z = random(0, 4);
        this.color = color;
        this.opacity = random(0.1, 1, true);
        this.flicker = 0;
        this.neighbors = [];
      }

      render() {
        if (!context) return;
        const pos = position(this.x, this.y, this.z);
        const r = ((this.z * particleSizeMultiplier) + particleSizeBase) * (sizeRatio() / 1000);
        let o = this.opacity;

        if (flicker) {
          const newVal = random(-0.5, 0.5, true);
          this.flicker += (newVal - this.flicker) / flickerSmoothing;
          if (this.flicker > 0.5) this.flicker = 0.5;
          if (this.flicker < -0.5) this.flicker = -0.5;
          o += this.flicker;
          if (o > 1) o = 1;
          if (o < 0) o = 0;
        }

        context.fillStyle = this.color;
        context.globalAlpha = o;
        context.beginPath();
        context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();

        if (renderParticleGlare) {
          context.globalAlpha = o * glareOpacityMultiplier;
          context.ellipse(pos.x, pos.y, r * 100, r, (glareAngle - ((nPos.x - 0.5) * noiseStrength * motion)) * (Math.PI / 180), 0, 2 * Math.PI, false);
          context.fill();
          context.closePath();
        }

        context.globalAlpha = 1;
      }
    }

    // Flare class
    class FlareClass implements Flare {
      x: number;
      y: number;
      z: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = random(-0.25, 1.25, true);
        this.y = random(-0.25, 1.25, true);
        this.z = random(0, 2);
        this.color = color;
        this.opacity = random(0.001, 0.01, true);
      }

      render() {
        if (!context) return;
        const pos = position(this.x, this.y, this.z);
        const r = ((this.z * flareSizeMultiplier) + flareSizeBase) * (sizeRatio() / 1000);

        context.beginPath();
        context.globalAlpha = this.opacity;
        context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        context.globalAlpha = 1;
      }
    }

    // Link class
    class LinkClass implements Link {
      length: number;
      verts: number[];
      stage: number;
      linked: number[];
      distances: number[];
      traveled: number;
      fade: number;
      finished: boolean;

      constructor(startVertex: number, numPoints: number) {
        this.length = numPoints;
        this.verts = [startVertex];
        this.stage = 0;
        this.linked = [startVertex];
        this.distances = [];
        this.traveled = 0;
        this.fade = 0;
        this.finished = false;
      }

      render() {
        let i: number, p: Particle, pos: { x: number; y: number }, points: number[][];

        switch (this.stage) {
          case 0:
            const last = particles[this.verts[this.verts.length - 1]];
            if (last && last.neighbors && last.neighbors.length > 0) {
              const neighbor = last.neighbors[random(0, last.neighbors.length - 1)];
              if (this.verts.indexOf(neighbor) == -1) {
                this.verts.push(neighbor);
              }
            } else {
              this.stage = 3;
              this.finished = true;
            }

            if (this.verts.length >= this.length) {
              for (i = 0; i < this.verts.length - 1; i++) {
                const p1 = particles[this.verts[i]];
                const p2 = particles[this.verts[i + 1]];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                this.distances.push(dist);
              }
              this.stage = 1;
            }
            break;

          case 1:
            if (this.distances.length > 0) {
              points = [];

              for (i = 0; i < this.linked.length; i++) {
                p = particles[this.linked[i]];
                pos = position(p.x, p.y, p.z);
                points.push([pos.x, pos.y]);
              }

              const linkSpeedRel = linkSpeed * 0.00001 * (canvas?.width || 1000);
              this.traveled += linkSpeedRel;
              const d = this.distances[this.linked.length - 1];

              if (this.traveled >= d) {
                this.traveled = 0;
                this.linked.push(this.verts[this.linked.length]);
                p = particles[this.linked[this.linked.length - 1]];
                pos = position(p.x, p.y, p.z);
                points.push([pos.x, pos.y]);

                if (this.linked.length >= this.verts.length) {
                  this.stage = 2;
                }
              } else {
                const a = particles[this.linked[this.linked.length - 1]];
                const b = particles[this.verts[this.linked.length]];
                const t = d - this.traveled;
                const x = ((this.traveled * b.x) + (t * a.x)) / d;
                const y = ((this.traveled * b.y) + (t * a.y)) / d;
                const z = ((this.traveled * b.z) + (t * a.z)) / d;

                pos = position(x, y, z);
                points.push([pos.x, pos.y]);
              }

              this.drawLine(points);
            } else {
              this.stage = 3;
              this.finished = true;
            }
            break;

          case 2:
            if (this.verts.length > 1) {
              if (this.fade < linkFade) {
                this.fade++;

                points = [];
                const alpha = (1 - (this.fade / linkFade)) * linkOpacity;
                for (i = 0; i < this.verts.length; i++) {
                  p = particles[this.verts[i]];
                  pos = position(p.x, p.y, p.z);
                  points.push([pos.x, pos.y]);
                }
                this.drawLine(points, alpha);
              } else {
                this.stage = 3;
                this.finished = true;
              }
            } else {
              this.stage = 3;
              this.finished = true;
            }
            break;

          case 3:
          default:
            this.finished = true;
            break;
        }
      }

      drawLine(points: number[][], alpha?: number) {
        if (!context) return;
        if (typeof alpha !== 'number') alpha = linkOpacity;

        if (points.length > 1 && alpha > 0) {
          context.globalAlpha = alpha;
          context.beginPath();
          for (let i = 0; i < points.length - 1; i++) {
            context.moveTo(points[i][0], points[i][1]);
            context.lineTo(points[i + 1][0], points[i + 1][1]);
          }
          context.strokeStyle = color;
          context.lineWidth = lineWidth;
          context.stroke();
          context.closePath();
          context.globalAlpha = 1;
        }
      }
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);
    }

    function render() {
      if (!context || !canvas) return;
      if (randomMotion) {
        n++;
        if (n >= noiseLength) {
          n = 0;
        }
        nPos = noisePoint(n);
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (blurSize > 0) {
        context.shadowBlur = blurSize;
        context.shadowColor = color;
      }

      if (renderParticles) {
        for (let i = 0; i < particleCount; i++) {
          particles[i].render();
        }
      }

      if (renderMesh) {
        context.beginPath();
        for (let v = 0; v < vertices.length - 1; v++) {
          if ((v + 1) % 3 === 0) continue;

          const p1 = particles[vertices[v]];
          const p2 = particles[vertices[v + 1]];

          const pos1 = position(p1.x, p1.y, p1.z);
          const pos2 = position(p2.x, p2.y, p2.z);

          context.moveTo(pos1.x, pos1.y);
          context.lineTo(pos2.x, pos2.y);
        }
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
        context.closePath();
      }

      if (renderLinks) {
        if (random(0, linkChance) == linkChance) {
          const length = random(linkLengthMin, linkLengthMax);
          const start = random(0, particles.length - 1);
          startLink(start, length);
        }

        for (let l = links.length - 1; l >= 0; l--) {
          if (links[l] && !links[l].finished) {
            links[l].render();
          } else {
            delete links[l];
          }
        }
      }

      if (renderFlares) {
        for (let j = 0; j < flareCount; j++) {
          flares[j].render();
        }
      }
    }

    function init() {
      if (!canvas) return;
      resize();

      mouse.x = canvas.clientWidth / 2;
      mouse.y = canvas.clientHeight / 2;

      // Create particle positions
      for (let i = 0; i < particleCount; i++) {
        const p = new ParticleClass();
        particles.push(p);
        points.push([p.x * c, p.y * c]);
      }

      // Simple triangulation (simplified version)
      vertices = [];
      for (let i = 0; i < points.length; i++) {
        vertices.push(i);
      }

      // Create triangles
      for (let i = 0; i < vertices.length; i += 3) {
        if (i + 2 < vertices.length) {
          triangles.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
        }
      }

      // Tell all the particles who their neighbors are
      for (let i = 0; i < particles.length; i++) {
        for (let j = 0; j < triangles.length; j++) {
          const k = triangles[j].indexOf(i);
          if (k !== -1) {
            triangles[j].forEach(function (value, index, array) {
              if (value !== i && particles[i].neighbors.indexOf(value) == -1) {
                particles[i].neighbors.push(value);
              }
            });
          }
        }
      }

      if (renderFlares) {
        for (let i = 0; i < flareCount; i++) {
          flares.push(new FlareClass());
        }
      }

      // Device orientation and mouse movement handlers
      const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };

      const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
        if (e.gamma !== null && e.beta !== null) {
          // Map device orientation to screen coordinates
          // gamma: left-right tilt (-90 to 90)
          // beta: front-back tilt (-180 to 180)
          const maxTilt = 45; // Maximum tilt angle to consider
          
          // Clamp values to prevent extreme movements
          const clampedGamma = Math.max(-maxTilt, Math.min(maxTilt, e.gamma));
          const clampedBeta = Math.max(-maxTilt, Math.min(maxTilt, e.beta));
          
          // Convert tilt to screen coordinates
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          
          // Map gamma (left-right) to x position
          const xRatio = (clampedGamma + maxTilt) / (maxTilt * 2);
          mouse.x = xRatio * screenWidth;
          
          // Map beta (front-back) to y position
          const yRatio = (clampedBeta + maxTilt) / (maxTilt * 2);
          mouse.y = yRatio * screenHeight;
        }
      };

      // Check if device is touch-enabled
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Only add mouse movement listener on non-touch devices
      if (!isTouchDevice) {
        document.body.addEventListener('mousemove', handleMouseMove);
      }
      
      // Check if device orientation is supported and add listener
      if ('DeviceOrientationEvent' in window && 'ontouchstart' in document.documentElement) {
        // Request permission for iOS devices
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          // For iOS, we need to request permission
          const requestPermission = async () => {
            try {
              const permission = await (DeviceOrientationEvent as any).requestPermission();
              if (permission === 'granted') {
                window.addEventListener('deviceorientation', handleDeviceOrientation, true);
              }
            } catch (error) {
              console.log('Device orientation permission denied');
            }
          };
          
          // Add a button or trigger to request permission
          const requestButton = document.createElement('button');
          requestButton.textContent = 'Enable Motion Controls';
          requestButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(255, 238, 212, 0.9);
            color: #31102F;
            border: 2px solid #FFEED4;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 12px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          `;
          requestButton.addEventListener('click', requestPermission);
          document.body.appendChild(requestButton);
          
          // Auto-remove button after 5 seconds
          setTimeout(() => {
            if (requestButton.parentNode) {
              requestButton.parentNode.removeChild(requestButton);
            }
          }, 5000);
        } else {
          // For Android and other devices, add listener directly
          window.addEventListener('deviceorientation', handleDeviceOrientation, true);
        }
      }

      // Animation loop
      function animloop() {
        animationRef.current = requestAnimationFrame(animloop);
        resize();
        render();
      }

      animloop();

      // Cleanup function
      return () => {
        if (!isTouchDevice) {
          document.body.removeEventListener('mousemove', handleMouseMove);
        }
        window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }

    const cleanup = init();

    return cleanup;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="stars"
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
} 