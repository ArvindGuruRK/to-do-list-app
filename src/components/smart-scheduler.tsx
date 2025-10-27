"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { smartScheduleTasks } from "@/ai/flows/smart-schedule-tasks";
import type { Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SmartSchedulerProps {
  tasks: Task[];
}

export function SmartScheduler({ tasks }: SmartSchedulerProps) {
  const [schedule, setSchedule] = useState("9am-11am: Work block\n12pm-1pm: Lunch break\n2pm-5pm: Meetings");
  const [suggestions, setSuggestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const taskListString = tasks
    .filter(t => !t.isCompleted)
    .map(t => `- ${t.title} (Priority: ${t.priority})`)
    .join("\n");

  const getSuggestions = async () => {
    if (!taskListString) {
      toast({
        title: "No tasks to schedule",
        description: "Add some tasks for today before using the scheduler.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSuggestions("");
    try {
      const result = await smartScheduleTasks({
        schedule,
        tasks: taskListString,
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error getting smart schedule:", error);
      toast({
        title: "Error",
        description: "Could not generate schedule suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="smart-scheduler-trigger">
          <Wand2 className="mr-2 h-4 w-4" /> Smart Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Smart Task Scheduler</DialogTitle>
          <DialogDescription>
            Let AI suggest the optimal time for your tasks based on your current schedule and priorities.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="current-schedule">Your General Schedule</label>
            <Textarea
              id="current-schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              rows={4}
              placeholder="e.g., 9am-12pm: Deep work, 1pm-2pm: Lunch..."
            />
          </div>
          <div className="grid gap-2">
            <label>Today's Uncompleted Tasks</label>
            <Textarea
              id="tasks-list"
              readOnly
              value={taskListString || "No tasks to schedule."}
              rows={5}
              className="bg-muted"
            />
          </div>
          <Button onClick={getSuggestions} disabled={isLoading || !taskListString}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Suggestions"
            )}
          </Button>
        </div>
        {suggestions && (
          <Alert>
            <AlertTitle>Suggested Schedule</AlertTitle>
            <AlertDescription>
                <pre className="whitespace-pre-wrap font-sans text-sm">{suggestions}</pre>
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
