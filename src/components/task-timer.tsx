"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskTimerProps {
  deadline: string;
}

export function TaskTimer({ deadline }: TaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Deadline passed");
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      if (hours < 1) {
        setIsUrgent(true);
      } else {
        setIsUrgent(false);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm mt-1", isUrgent ? "text-red-500 font-medium" : "text-muted-foreground")}>
      <Timer className="h-4 w-4" />
      <span>{timeLeft}</span>
    </div>
  );
}
