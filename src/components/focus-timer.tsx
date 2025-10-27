"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FocusTimer() {
  const [initialHours, setInitialHours] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    if (timeLeft <= 0) {
      const totalSeconds = (initialHours * 3600) + (initialMinutes * 60);
      setTimeLeft(totalSeconds);
    }
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if(timerRef.current) clearInterval(timerRef.current);
          setIsRunning(false);
          // Optional: Play a sound or show a notification
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [isRunning, timeLeft, initialHours, initialMinutes]);

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
    const totalSeconds = (initialHours * 3600) + (initialMinutes * 60);
    setTimeLeft(totalSeconds);
  }, [initialHours, initialMinutes]);

  useEffect(() => {
    const totalSeconds = (initialHours * 3600) + (initialMinutes * 60);
    if (!isRunning) {
      setTimeLeft(totalSeconds);
    }
  }, [initialHours, initialMinutes, isRunning]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const formatTime = (timeInSeconds: number) => {
    if (timeInSeconds < 0) return "00:00:00";
    const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-6xl font-mono font-bold tabular-nums">
        {formatTime(timeLeft)}
      </div>
      <div className="flex w-full items-center gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="hours">Hours</Label>
          <Input 
            type="number" 
            id="hours" 
            value={initialHours}
            onChange={(e) => setInitialHours(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            disabled={isRunning}
            className="text-center"
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="minutes">Minutes</Label>
          <Input 
            type="number" 
            id="minutes" 
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            max="59"
            disabled={isRunning}
            className="text-center"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={startTimer} disabled={isRunning} className="w-24">
          Start
        </Button>
        <Button onClick={stopTimer} disabled={!isRunning} variant="destructive" className="w-24">
          Pause
        </Button>
        <Button onClick={resetTimer} variant="outline" className="w-24">
          Reset
        </Button>
      </div>
    </div>
  );
}
