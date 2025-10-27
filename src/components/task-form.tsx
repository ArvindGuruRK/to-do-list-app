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
import { format, add, differenceInMinutes, parse } from "date-fns";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly']),
  startTime: z.string().regex(timeRegex, { message: "Invalid time format (HH:mm)" }).optional().or(z.literal('')),
  duration: z.coerce.number().min(0).optional(),
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
      startTime: "",
      duration: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        recurring: task.recurring,
        startTime: task.startTime || "",
        duration: task.duration,
      });
    } else {
        form.reset({
            title: "",
            description: "",
            priority: "medium",
            recurring: 'none',
            startTime: "",
            duration: undefined,
        });
    }
  }, [task, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const dueDate = task ? task.dueDate : format(new Date(), "yyyy-MM-dd");
    let deadline: string | undefined = undefined;

    if (values.startTime && values.duration) {
      try {
        const startDate = parse(`${dueDate} ${values.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
        if (!isNaN(startDate.getTime())) {
          deadline = add(startDate, { minutes: values.duration }).toISOString();
        }
      } catch (e) {
        console.error("Error calculating deadline:", e)
      }
    }
    
    onSubmit({
      title: values.title,
      description: values.description,
      priority: values.priority,
      recurring: values.recurring,
      dueDate: dueDate,
      startTime: values.startTime || undefined,
      duration: values.duration,
      deadline,
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
        <div className="flex gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 60" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
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
