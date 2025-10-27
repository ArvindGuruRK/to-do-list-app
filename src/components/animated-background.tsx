
"use client";

import React, { useRef, useEffect, useState } from 'react';

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
}

const Squares: React.FC<SquaresProps> = ({
  direction = 'right',
  speed = 0.5,
  borderColor = 'rgba(128, 128, 128, 0.2)',
  squareSize = 40,
  hoverFillColor = 'rgba(128, 128, 128, 0.1)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const mousePosition = useRef<{ x: number, y: number } | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.9)');

  useEffect(() => {
    // This will run on the client after mount, so window is available.
    const bodyColor = getComputedStyle(document.body).getPropertyValue('background-color');
    // Convert 'rgb(r, g, b)' to 'rgba(r, g, b, 0.9)'
    if (bodyColor) {
       setBackgroundColor(bodyColor.replace('rgb', 'rgba').replace(')', ', 0.9)'));
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = borderColor;

      const numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
      const numSquaresY = Math.ceil(canvas.height / squareSize) + 1;

      for (let i = 0; i < numSquaresX; i++) {
        for (let j = 0; j < numSquaresY; j++) {
          const x = i * squareSize + gridOffset.current.x;
          const y = j * squareSize + gridOffset.current.y;
          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }
      
      if (mousePosition.current) {
        const mouseX = mousePosition.current.x;
        const mouseY = mousePosition.current.y;
        
        const i = Math.floor((mouseX - gridOffset.current.x) / squareSize);
        const j = Math.floor((mouseY - gridOffset.current.y) / squareSize);

        const x = i * squareSize + gridOffset.current.x;
        const y = j * squareSize + gridOffset.current.y;
        
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(x, y, squareSize, squareSize);
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, backgroundColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      const totalSizeX = squareSize;
      const totalSizeY = squareSize;

      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed);
          if (gridOffset.current.x < -totalSizeX) gridOffset.current.x += totalSizeX;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed);
          if (gridOffset.current.x > 0) gridOffset.current.x -= totalSizeX;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed);
           if (gridOffset.current.y > 0) gridOffset.current.y -= totalSizeY;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed);
           if (gridOffset.current.y < -totalSizeY) gridOffset.current.y += totalSizeY;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed);
           if (gridOffset.current.x < -totalSizeX) gridOffset.current.x += totalSizeX;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed);
           if (gridOffset.current.y < -totalSizeY) gridOffset.current.y += totalSizeY;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePosition.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
      };

    const handleMouseLeave = () => {
        mousePosition.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    updateAnimation();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, backgroundColor]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block opacity-50"></canvas>;
};

export default Squares;
