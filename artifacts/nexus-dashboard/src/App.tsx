import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { TasksProvider } from '@/context/tasks-context';
import { NotificationsProvider } from '@/context/notifications-context';
import { HabitsProvider } from '@/context/habits-context';

// Pages
import { WeatherDashboard } from '@/components/weather-dashboard';
import { Navigation } from '@/components/navigation';
import { OnboardingWrapper } from '@/components/onboarding-wrapper';
import { BackgroundManager } from '@/components/background-manager';
import { TaskManager } from '@/components/task-manager';
import { AIAssistant } from '@/components/ai-assistant';
import { SettingsPanel } from '@/components/settings-panel';
import { HabitTracker } from '@/components/habit-tracker';

const queryClient = new QueryClient();

function HomePage() {
  return (
    <main className="min-h-screen">
      <BackgroundManager />
      <Navigation />
      <OnboardingWrapper />
      <WeatherDashboard />
    </main>
  );
}

function TasksPage() {
  return (
    <main className="min-h-screen">
      <BackgroundManager />
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

function HabitsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HabitTracker />
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/assistant" component={AssistantPage} />
      <Route path="/habits" component={HabitsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TasksProvider>
            <NotificationsProvider>
              <HabitsProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
              <Toaster />
              <SonnerToaster richColors closeButton />
              </HabitsProvider>
            </NotificationsProvider>
          </TasksProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
