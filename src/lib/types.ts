export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // "yyyy-MM-dd"
  startTime?: string; // "HH:mm"
  duration?: number; // in minutes
  deadline?: string; // ISO string
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
};
