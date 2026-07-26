
import { Task } from '@/context/tasks-context';
import { HabitEntry, Habit } from '@/context/habits-context';
import { GitHubIssue } from '@/lib/github';

export function generateStandup(
  tasks: Task[],
  habitEntries: HabitEntry[],
  habits: Habit[],
  githubIssues: GitHubIssue[]
): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayDs = now.toISOString().split('T')[0];

  const completedYesterday = tasks.filter(t => 
    t.completed && t.status === 'completed' && t.createdAt >= yesterday
  );

  const habitsToday = habitEntries
    .filter(e => e.date === todayDs && e.completed)
    .map(e => habits.find(h => h.id === e.habitId)?.name)
    .filter(Boolean);

  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  
  const githubInProgress = githubIssues.filter(issue => issue.state === 'open');

  if (completedYesterday.length === 0 && habitsToday.length === 0 && inProgressTasks.length === 0 && githubInProgress.length === 0) {
    return "Nothing logged yet today";
  }

  let markdown = "## Yesterday\n";
  if (completedYesterday.length > 0 || habitEntries.filter(e => e.date === yesterday.toISOString().split('T')[0] && e.completed).length > 0) {
    completedYesterday.forEach(t => {
      markdown += `- ${t.title}\n`;
    });
    // Also include habits completed yesterday for completeness
    habitEntries
      .filter(e => e.date === yesterday.toISOString().split('T')[0] && e.completed)
      .forEach(e => {
        const hName = habits.find(h => h.id === e.habitId)?.name;
        if (hName) markdown += `- Habit: ${hName}\n`;
      });
  } else {
    markdown += "- No tasks completed yesterday\n";
  }

  markdown += "\n## Today\n";
  if (inProgressTasks.length > 0 || githubInProgress.length > 0 || habitsToday.length > 0) {
    inProgressTasks.forEach(t => {
      markdown += `- ${t.title} (In Progress)\n`;
    });
    githubInProgress.forEach(issue => {
      markdown += `- GitHub: ${issue.title} (#${issue.number})\n`;
    });
    habitsToday.forEach(hName => {
      markdown += `- Habit: ${hName} (Done)\n`;
    });
  } else {
    markdown += "- No active items today\n";
  }

  markdown += "\n## Blockers\n";
  // Check for blocked status in github issues labels if possible
  const blockedIssues = githubIssues.filter(issue => 
    issue.labels.some(l => l.name.toLowerCase().includes('block'))
  );
  
  if (blockedIssues.length > 0) {
    blockedIssues.forEach(issue => {
      markdown += `- BLOCKED: ${issue.title} (#${issue.number})\n`;
    });
  } else {
    markdown += "- None\n";
  }

  return markdown;
}
