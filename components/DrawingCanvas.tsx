import React, { useRef, useState } from 'react';

interface DrawingCanvasProps {
  onDrawEnd: (dataUrl: string) => void;
  width: number;
  height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onDrawEnd, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);

  const getCoords = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 0) {
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else if ('clientX' in event.nativeEvent) {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    } else {
        return null;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const coords = getCoords(event);
    if (!coords) return;
    setIsDrawing(true);
    setStartPoint(coords);
    setEndPoint(coords);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) return;
    event.preventDefault();
    const coords = getCoords(event);
    if (!coords) return;
    setEndPoint(coords);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radiusX = Math.abs(coords.x - startPoint.x) / 2;
    const radiusY = Math.abs(coords.y - startPoint.y) / 2;
    const centerX = Math.min(startPoint.x, coords.x) + radiusX;
    const centerY = Math.min(startPoint.y, coords.y) + radiusY;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !startPoint || !endPoint || (startPoint.x === endPoint.x && startPoint.y === endPoint.y)) {
        setIsDrawing(false);
        return;
    }

    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radiusX = Math.abs(endPoint.x - startPoint.x) / 2;
    const radiusY = Math.abs(endPoint.y - startPoint.y) / 2;
    const centerX = Math.min(startPoint.x, endPoint.x) + radiusX;
    const centerY = Math.min(startPoint.y, endPoint.y) + radiusY;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/png');
    onDrawEnd(dataUrl);

    setStartPoint(null);
    setEndPoint(null);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair z-20"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};