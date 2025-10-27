"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";
import { useEffect } from "react";
import { format, add } from "date-fns";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly']),
  deadlineHours: z.coerce.number().min(0).optional(),
});

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "isCompleted">) => void;
  task?: Task | null;
  onClose: () => void;
}

export function TaskForm({ onSubmit, task, onClose }: TaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      recurring: 'none',
      deadlineHours: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      let deadlineHours;
      if (task.deadline) {
        const now = new Date();
        const deadlineDate = new Date(task.deadline);
        const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        deadlineHours = Math.max(0, Math.round(diffHours));
      }
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        recurring: task.recurring,
        deadlineHours: deadlineHours,
      });
    } else {
        form.reset({
            title: "",
            description: "",
            priority: "medium",
            recurring: 'none',
            deadlineHours: undefined,
        });
    }
  }, [task, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const deadline = values.deadlineHours ? add(new Date(), { hours: values.deadlineHours }).toISOString() : undefined;
    
    onSubmit({
      title: values.title,
      description: values.description,
      priority: values.priority,
      recurring: values.recurring,
      dueDate: task ? task.dueDate : format(new Date(), "yyyy-MM-dd"),
      deadline: deadline,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Finish project proposal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="deadlineHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline (hours from now)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="recurring"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Recurring</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
        </div>
      </form>
    </Form>
  );
}
