"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Archive,
  CheckCircle2,
  Circle,
  Clock,
  Edit,
  MoreVertical,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import { add, format, startOfDay } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import type { Task } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/task-form";
import { SmartScheduler } from "@/components/smart-scheduler";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveClock } from "@/components/live-clock";
import { Stopwatch } from "@/components/stopwatch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskTimer } from "@/components/task-timer";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TaskNotifications } from "@/components/task-notifications";


const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design landing page wireframes",
    dueDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
    startTime: "10:00",
    duration: 120,
    deadline: add(new Date(), { hours: 2 }).toISOString(),
    priority: "high",
    isCompleted: false,
    recurring: "none",
  },
  {
    id: "2",
    title: "Team meeting",
    description: "Discuss Q3 goals and roadmap.",
    dueDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
    startTime: "14:00",
    duration: 60,
    deadline: add(new Date(), { hours: 4 }).toISOString(),
    priority: "medium",
    isCompleted: false,
    recurring: "none",
  },
  {
    id: "3",
    title: "Develop user authentication",
    dueDate: format(add(startOfDay(new Date()), { days: 1 }), "yyyy-MM-dd"),
    deadline: add(new Date(), { days: 1, hours: 8 }).toISOString(),
    priority: "high",
    isCompleted: false,
    recurring: "none",
  },
  {
    id: "4",
    title: "Write weekly report",
    dueDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
    priority: "low",
    isCompleted: true,
    recurring: "weekly",
  },
];

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", initialTasks);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { toast } = useToast();

  const selectedDateStr = useMemo(
    () => (date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
    [date]
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const getRecurringTasksForDate = (allTasks: Task[], targetDate: string) => {
    const target = new Date(targetDate);
    return allTasks.filter(task => {
      if (!task.recurring || task.recurring === 'none') return false;
      const taskDate = new Date(task.dueDate);
      if (taskDate > target) return false;

      switch(task.recurring) {
        case 'daily':
          return true;
        case 'weekly':
          return taskDate.getDay() === target.getDay();
        case 'monthly':
          return taskDate.getDate() === target.getDate();
        default:
          return false;
      }
    }).map(task => ({
      ...task,
      dueDate: targetDate, // show it as if it's for today
      isCompleted: false, // recurring tasks are not completed by default on future days
      id: `${task.id}-${targetDate}` // unique id for this instance
    }));
  };

  const tasksForSelectedDate = useMemo(() => {
    const nonRecurring = tasks.filter(
      (task) => task.dueDate === selectedDateStr && (task.recurring === 'none' || !task.recurring)
    );
    const recurringInstances = getRecurringTasksForDate(tasks, selectedDateStr);
    
    const uniqueRecurring = recurringInstances.filter(rt => !tasks.some(t => t.id === rt.id && t.isCompleted));
    
    return [...nonRecurring, ...uniqueRecurring].sort(
      (a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1) || a.title.localeCompare(b.title)
    );
  }, [tasks, selectedDateStr]);
  
  const completedTasks = useMemo(
    () => tasksForSelectedDate.filter((task) => task.isCompleted).length,
    [tasksForSelectedDate]
  );
  const totalTasks = tasksForSelectedDate.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleTaskSubmit = (taskData: Omit<Task, "id" | "isCompleted">) => {
    if (editingTask) {
      const originalId = editingTask.id.split('-')[0];
      setTasks(
        tasks.map((t) => (t.id === originalId ? { ...t, ...taskData, id: originalId } : t))
      );
      toast({ title: "Task updated successfully!" });
    } else {
      setTasks([...tasks, { ...taskData, id: crypto.randomUUID(), isCompleted: false }]);
      toast({ title: "Task added successfully!" });
    }
    setIsSheetOpen(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  };

  const handleDelete = (taskId: string) => {
    const originalId = taskId.split('-')[0];
    setTasks(tasks.filter((t) => t.id !== originalId));
    toast({ title: "Task deleted", variant: "destructive" });
  };
  
  const toggleComplete = (taskId: string) => {
    const originalId = taskId.split('-')[0];

    const taskExists = tasks.some(t => t.id === taskId);

    if (taskExists) {
        setTasks(
            tasks.map(task =>
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    } else {
        // This is a recurring instance, so we create a specific entry for it
        const baseTask = tasks.find(t => t.id === originalId);
        if (baseTask) {
            const newInstance = {
                ...baseTask,
                id: taskId,
                dueDate: selectedDateStr,
                isCompleted: true,
                recurring: 'none' // This instance is now a one-off
            };
            setTasks([...tasks, newInstance]);
        }
    }
  };

  const priorityClasses = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  if (!isMounted) {
    return null; // Don't render on server
  }

  return (
    <SidebarProvider>
      <TaskNotifications tasks={tasks} />
      <div className="flex h-screen w-full bg-background font-body">
        <Sidebar>
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent className="flex-1 flex flex-col justify-center items-center p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md"
              />
            </SidebarContent>
            <SidebarFooter className="p-4 flex items-center justify-between">
              <LiveClock />
              <ThemeToggle />
            </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-4">
                 <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {format(date || new Date(), "EEEE, MMMM d")}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2">
                    <SmartScheduler tasks={tasksForSelectedDate} />
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline">
                            <Timer className="mr-2 h-4 w-4" /> Stopwatch
                        </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Stopwatch</DialogTitle>
                        </DialogHeader>
                        <Stopwatch />
                        </DialogContent>
                    </Dialog>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button onClick={() => setEditingTask(null)}>
                      <Plus className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Add Task</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{editingTask ? "Edit Task" : "Add a new task"}</SheetTitle>
                    </SheetHeader>
                    <TaskForm
                      onSubmit={handleTaskSubmit}
                      task={editingTask}
                      onClose={() => setIsSheetOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onSelect={() => document.querySelector<HTMLButtonElement>('.smart-scheduler-trigger')?.click()}>
                        Smart Schedule
                      </DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => document.querySelector<HTMLButtonElement>('.stopwatch-trigger')?.click()}>
                        Stopwatch
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Progress</CardTitle>
                    <CardDescription>
                      You've completed {completedTasks} of {totalTasks} tasks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {tasksForSelectedDate.length > 0 ? (
                    tasksForSelectedDate.map((task, index) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          className={cn(
                            "transition-all",
                            task.isCompleted && "bg-muted/50"
                          )}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <button onClick={() => toggleComplete(task.id)}>
                              {task.isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-accent" />
                              ) : (
                                <Circle className="h-6 w-6 text-muted-foreground" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p
                                className={cn(
                                  "font-medium",
                                  task.isCompleted && "line-through text-muted-foreground"
                                )}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground">
                                  {task.description}
                                </p>
                              )}
                               <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                {task.startTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{task.startTime}</span>
                                  </div>
                                )}
                                {task.duration && (
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3.5 w-3.5" />
                                    <span>{task.duration} min</span>
                                  </div>
                                )}
                              </div>
                              {task.deadline && !task.isCompleted && (
                                <TaskTimer deadline={task.deadline} />
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  priorityClasses[task.priority]
                                )}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEdit(task)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => handleDelete(task.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                          <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No tasks for today</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Enjoy your free day or add a new task to get started.
                          </p>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
