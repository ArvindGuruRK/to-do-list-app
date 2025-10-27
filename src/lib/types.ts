export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // "yyyy-MM-dd"
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
};
