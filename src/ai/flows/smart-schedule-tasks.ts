'use server';

/**
 * @fileOverview An AI agent that suggests optimal times for tasks based on the user's schedule and priorities.
 *
 * - smartScheduleTasks - A function that suggests optimal times for tasks.
 * - SmartScheduleTasksInput - The input type for the smartScheduleTasks function.
 * - SmartScheduleTasksOutput - The return type for the smartScheduleTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleTasksInputSchema = z.object({
  schedule: z.string().describe('The user\'s existing schedule.'),
  tasks: z.string().describe('A list of tasks with their priorities.'),
});
export type SmartScheduleTasksInput = z.infer<typeof SmartScheduleTasksInputSchema>;

const SmartScheduleTasksOutputSchema = z.object({
  suggestions: z.string().describe('Suggested times for each task.'),
});
export type SmartScheduleTasksOutput = z.infer<typeof SmartScheduleTasksOutputSchema>;

export async function smartScheduleTasks(input: SmartScheduleTasksInput): Promise<SmartScheduleTasksOutput> {
  return smartScheduleTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartScheduleTasksPrompt',
  input: {schema: SmartScheduleTasksInputSchema},
  output: {schema: SmartScheduleTasksOutputSchema},
  prompt: `You are a personal assistant that schedules tasks based on a user's existing schedule and task priorities.

  Analyze the schedule and suggest the best times for each task.

  Existing Schedule: {{{schedule}}}
  Tasks: {{{tasks}}}

  Respond with the task and the suggested time.`,
});

const smartScheduleTasksFlow = ai.defineFlow(
  {
    name: 'smartScheduleTasksFlow',
    inputSchema: SmartScheduleTasksInputSchema,
    outputSchema: SmartScheduleTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
