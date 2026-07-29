import { Task } from "@/context/tasks-context";
import { Habit, HabitEntry } from "@/context/habits-context";
import { TimeEntry } from "@/context/time-entries-context";
import { Goal } from "@/context/goals-context";
import { toDateString, startOfToday, calcHabitStreaks } from "@/lib/habit-streak";
import { deriveGoalProgress } from "@/lib/goal-progress";

export function generateDigest(
  tasks: Task[],
  habits: Habit[],
  habitEntries: HabitEntry[],
  timeEntries: TimeEntry[],
  goals: Goal[]
): string {
  const today = startOfToday();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoStr = toDateString(sevenDaysAgo);

  // 1. Check data density
  const allDates = new Set<string>();
  tasks.forEach(t => allDates.add(toDateString(t.createdAt)));
  habitEntries.forEach(e => allDates.add(e.date));
  timeEntries.forEach(e => allDates.add(e.date));

  if (allDates.size < 3) {
    return `Limited data — only ${allDates.size} days tracked so far.`;
  }

  const lines: string[] = [];
  lines.push("Activity Digest (Last 7 Days):");

  // 2. Completed tasks
  const recentCompleted = tasks.filter(t => 
    t.completed && 
    t.status === 'completed' && 
    toDateString(t.createdAt) >= sevenDaysAgoStr
  );
  
  if (recentCompleted.length > 0) {
    const high = recentCompleted.filter(t => t.priority === 'High').length;
    const med = recentCompleted.filter(t => t.priority === 'Medium').length;
    const low = recentCompleted.filter(t => t.priority === 'Low').length;
    lines.push(`- Tasks completed: ${recentCompleted.length} (${high} High, ${med} Medium, ${low} Low priority)`);
  } else {
    lines.push("- No tasks completed in the last 7 days.");
  }

  // 3. Time entries
  const recentTime = timeEntries.filter(e => e.date >= sevenDaysAgoStr && e.durationMinutes);
  const totalMins = recentTime.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  
  if (totalMins > 0) {
    const hours = (totalMins / 60).toFixed(1);
    
    // Rough morning/afternoon/evening split
    let morning = 0; // 5am - 12pm
    let afternoon = 0; // 12pm - 6pm
    let evening = 0; // 6pm - 5am
    
    recentTime.forEach(e => {
      const start = new Date(e.startTime);
      const hour = start.getHours();
      if (hour >= 5 && hour < 12) morning += e.durationMinutes || 0;
      else if (hour >= 12 && hour < 18) afternoon += e.durationMinutes || 0;
      else evening += e.durationMinutes || 0;
    });
    
    lines.push(`- Time tracked: ${hours} hours total.`);
    lines.push(`  Split: ${Math.round(morning/60)}h morning, ${Math.round(afternoon/60)}h afternoon, ${Math.round(evening/60)}h evening/night.`);
  }

  // 4. Habit streaks
  const habitDates = new Set<string>();
  habitEntries.forEach(e => habitDates.add(e.date));
  const streaks = calcHabitStreaks(habitDates);
  if (streaks.current > 0) {
    lines.push(`- Current overall habit streak: ${streaks.current} days.`);
  }

  // 5. At-risk goals
  const atRiskGoals = goals.filter(g => {
    if (!g.targetDate || g.status === 'completed') return false;
    const target = new Date(g.targetDate);
    const diffDays = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 7) {
      const progress = deriveGoalProgress(g.id, tasks);
      return progress.kind === 'ratio' && progress.percent < 70;
    }
    return false;
  });

  if (atRiskGoals.length > 0) {
    lines.push("- Goals nearing target date with < 70% progress:");
    atRiskGoals.forEach(g => {
      const progress = deriveGoalProgress(g.id, tasks);
      const pText = progress.kind === 'ratio' ? `${progress.percent}%` : '0%';
      lines.push(`  • "${g.title}" (${pText} complete, due ${new Date(g.targetDate!).toLocaleDateString()})`);
    });
  }

  return lines.join('\n');
}
