
"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const getTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTime(formattedTime);
    };

    getTime(); // Initial call
    const timerId = setInterval(getTime, 1000); // Update every second

    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>--:--:-- --</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>{time}</span>
    </div>
  );
}
