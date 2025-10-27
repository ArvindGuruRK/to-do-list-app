"use client";

import { useEffect, useRef } from 'react';
import { parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { type Task } from '@/lib/types';

interface TaskNotificationsProps {
  tasks: Task[];
}

export function TaskNotifications({ tasks }: TaskNotificationsProps) {
  const { toast } = useToast();
  const notifiedTasks = useRef(new Set<string>());

  useEffect(() => {
    const checkTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.startTime && task.dueDate && !task.isCompleted) {
          const taskDateTime = parse(`${task.dueDate} ${task.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
          const notificationTime = new Date(taskDateTime.getTime() - 5 * 60 * 1000); // 5 minutes before

          const notificationId = `${task.id}-${task.dueDate}`;

          if (now >= notificationTime && now < taskDateTime && !notifiedTasks.current.has(notificationId)) {
            toast({
              title: 'Upcoming Task',
              description: `Your task "${task.title}" is starting in 5 minutes.`,
            });
            notifiedTasks.current.add(notificationId);
          }
        }
      });
    };

    const intervalId = setInterval(checkTasks, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [tasks, toast]);

  return null; // This component doesn't render anything visible
}
