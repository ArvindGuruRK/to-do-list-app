export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // "yyyy-MM-dd"
  deadline?: string; // ISO string
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
};
