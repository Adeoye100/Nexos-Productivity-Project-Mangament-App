import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { YjsProvider } from '@/lib/sync/YjsProvider';
import { AppModeProvider } from '@/context/app-mode-context';
import { TasksProvider } from '@/context/tasks-context';
import { NotificationsProvider } from '@/context/notifications-context';
import { HabitsProvider } from '@/context/habits-context';
import { PromptsProvider } from '@/context/prompts-context';
import { CommandsProvider } from '@/context/commands-context';
import { SkillsProvider } from '@/context/skills-context';
import { GoalsProvider } from '@/context/goals-context';
import { TimeEntriesProvider } from '@/context/time-entries-context';
import { CommandPalette } from '@/components/command-palette';
import { ShortcutsHelp } from '@/components/shortcuts-help';
import { useBlockedDependencyPolling } from '@/hooks/use-blocked-dependency-polling';
import { SkillsPortfolio } from '@/components/skills-portfolio';
import { LifeDashboard } from '@/components/life-dashboard';

function BlockedDependencyWatcher() {
  useBlockedDependencyPolling();
  return null;
}

// Pages
import SyncTestPage from '@/pages/sync-test';
import { Navigation } from '@/components/navigation';
import { OnboardingWrapper } from '@/components/onboarding-wrapper';
import { TaskManager } from '@/components/task-manager';
import { AIAssistant } from '@/components/ai-assistant';
import { SettingsPanel } from '@/components/settings-panel';
import { HabitTracker } from '@/components/habit-tracker';
import { CommandManager } from '@/components/command-manager';

const queryClient = new QueryClient();

function TasksPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-28 md:pb-12">
        <TaskManager />
      </div>
    </main>
  );
}

function AssistantPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-28 md:pb-12">
        <AIAssistant />
      </div>
    </main>
  );
}

function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-28 md:pb-12">
        <SettingsPanel />
      </div>
    </main>
  );
}

import { GitHubActivity } from "@/components/github-activity";

function HabitsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 px-4 container mx-auto space-y-8 pb-28 md:pb-12">
        <GitHubActivity />
        <HabitTracker />
      </div>
    </main>
  );
}

function SkillsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-28 md:pb-12">
        <SkillsPortfolio />
      </div>
    </main>
  );
}

function LifeDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-28 md:pb-12">
        <LifeDashboard />
      </div>
    </main>
  );
}

function CommandsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-28 md:pb-12">
        <CommandManager />
      </div>
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LifeDashboardPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/assistant" component={AssistantPage} />
      <Route path="/habits" component={HabitsPage} />
      <Route path="/skills" component={SkillsPage} />
      <Route path="/commands" component={CommandsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/sync-test" component={SyncTestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="system" themes={['light', 'dark', 'warm']} enableSystem disableTransitionOnChange>
          <AppModeProvider>
          <YjsProvider>
            <SkillsProvider>
            <GoalsProvider>
            <TimeEntriesProvider>
            <TasksProvider>
              <NotificationsProvider>
                <BlockedDependencyWatcher />
                <HabitsProvider>
                  <PromptsProvider>
                    <CommandsProvider>
                      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                        <Router />
                      </WouterRouter>
                      <Toaster />
                      <SonnerToaster richColors closeButton />
                      <CommandPalette />
                      <ShortcutsHelp />
                    </CommandsProvider>
                  </PromptsProvider>
                </HabitsProvider>
              </NotificationsProvider>
            </TasksProvider>
            </TimeEntriesProvider>
            </GoalsProvider>
            </SkillsProvider>
          </YjsProvider>
          </AppModeProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
