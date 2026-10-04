import { useAppMode } from "@/context/app-mode-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code2, User } from "lucide-react";

export function ModeToggle() {
  const { mode, toggleMode } = useAppMode();
  const isDev = mode === "developer";

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-foreground/5 rounded-full border border-border/40">
      <User className={`w-3.5 h-3.5 ${!isDev ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch 
        checked={isDev} 
        onCheckedChange={toggleMode} 
        className="scale-75 data-[state=checked]:bg-primary"
      />
      <Code2 className={`w-3.5 h-3.5 ${isDev ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
}
