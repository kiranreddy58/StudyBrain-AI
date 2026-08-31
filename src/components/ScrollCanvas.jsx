import { useEffect, useRef, useCallback } from 'react';

const TOTAL_FRAMES = 192;
const FRAME_BASE = '/scrool/_MConverter.eu_Exploding_Glass_Brain_VFX-';
const FRAME_EXT = '.png';


function buildFrameUrls() {
  return Array.from({ length: TOTAL_FRAMES }, (_, i) => `${FRAME_BASE}${i + 1}${FRAME_EXT}`);
}


export default function ScrollCanvas({ onProgress, onReady, onFrameChange }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]); 
  const frameIndexRef = useRef(0);
  const rafRef = useRef(null);
  const targetFrameRef = useRef(0);
  const isDrawingRef = useRef(false);
  const readyRef = useRef(false);

  
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  
  const renderLoop = useCallback(() => {
    const target = targetFrameRef.current;
    if (target !== frameIndexRef.current) {
      frameIndexRef.current = target;
      drawFrame(target);
      onFrameChange?.(target);
    }
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [drawFrame, onFrameChange]);

  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
      const frameIdx = Math.round(progress * (TOTAL_FRAMES - 1));
      targetFrameRef.current = frameIdx;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      drawFrame(frameIndexRef.current);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [drawFrame]);

  
  useEffect(() => {
    const urls = buildFrameUrls();
    let loadedCount = 0;
    const images = new Array(TOTAL_FRAMES).fill(null);
    imagesRef.current = images;

    
    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          images[index] = img;
          loadedCount++;
          onProgress?.(loadedCount, TOTAL_FRAMES);

          
          if (index === 0 && canvasRef.current) {
            drawFrame(0);
          }

          if (loadedCount === TOTAL_FRAMES && !readyRef.current) {
            readyRef.current = true;
            onReady?.();
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          onProgress?.(loadedCount, TOTAL_FRAMES);
          if (loadedCount === TOTAL_FRAMES && !readyRef.current) {
            readyRef.current = true;
            onReady?.();
          }
          resolve();
        };
        img.src = urls[index];
      });
    };

    
    loadImage(0).then(() => {
      
      if (!isDrawingRef.current) {
        isDrawingRef.current = true;
        rafRef.current = requestAnimationFrame(renderLoop);
      }
      
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        loadImage(i);
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, renderLoop, onProgress, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-bg"
      aria-hidden="true"
    />
  );
}
