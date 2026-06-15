import React, { useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const Particles = () => {
  const canvasRef = useRef(null);
  const context = useContext(AppContext);
  const theme = context?.theme || 'dark';
  const isLight = theme === 'light';

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particlesArray = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const mouse = {
      x: null,
      y: null,
      radius: 130
    };
    
    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        // Bounce off bounds
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }
        
        // Mouse gravity pull
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
              this.x += 1;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
              this.x -= 1;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
              this.y += 1;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
              this.y -= 1;
            }
          }
        }
        
        // Move particle
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }
    
    const init = () => {
      particlesArray = [];
      let numberOfParticles = Math.floor((canvas.width * canvas.height) / 13000);
      numberOfParticles = Math.min(Math.max(numberOfParticles, 40), 120); // Cap particles
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        
        // Define colors based on light/dark mode
        let color = '';
        if (isLight) {
          color = Math.random() > 0.5 
            ? 'rgba(2, 132, 199, 0.15)'  // Light Sky Blue
            : 'rgba(6, 182, 212, 0.15)'; // Light Cyan
        } else {
          color = Math.random() > 0.5
            ? 'rgba(0, 194, 255, 0.25)'  // Electric Cyan/Blue
            : 'rgba(6, 182, 212, 0.25)';  // Medium Cyan
        }
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };
    
    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 110) {
            opacityValue = 1 - (distance / 110);
            if (isLight) {
              ctx.strokeStyle = `rgba(2, 132, 199, ${opacityValue * 0.08})`;
            } else {
              ctx.strokeStyle = `rgba(6, 182, 212, ${opacityValue * 0.12})`;
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isLight, isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};
