"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 10); // a centisecond
    }, 10);
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    if (!isRunning || !timerRef.current) return;
    setIsRunning(false);
    clearInterval(timerRef.current);
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTime(0);
  }, []);
  
  const formatTime = (timeInMs: number) => {
    const minutes = Math.floor(timeInMs / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((timeInMs % 60000) / 1000).toString().padStart(2, '0');
    const centiseconds = Math.floor((timeInMs % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${centiseconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-6xl font-mono font-bold tabular-nums">
        {formatTime(time)}
      </div>
      <div className="flex gap-4">
        <Button onClick={startTimer} disabled={isRunning} className="w-24">
          Start
        </Button>
        <Button onClick={stopTimer} disabled={!isRunning} variant="destructive" className="w-24">
          Stop
        </Button>
        <Button onClick={resetTimer} variant="outline" className="w-24">
          Reset
        </Button>
      </div>
    </div>
  );
}
