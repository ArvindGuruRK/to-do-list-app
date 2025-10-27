"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const getTime = () => {
      const now = new Date();
      // IST is UTC+5:30
      const utcOffset = now.getTimezoneOffset() * 60 * 1000;
      const istOffset = (5 * 60 + 30) * 60 * 1000;
      const istTime = new Date(now.getTime() + utcOffset + istOffset);
      
      const formattedTime = istTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTime(`${formattedTime} IST`);
    };

    getTime(); // Initial call
    const timerId = setInterval(getTime, 1000); // Update every second

    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);

  if (!time) {
    return null; // Don't render on server or before first client-side render
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>{time}</span>
    </div>
  );
}
