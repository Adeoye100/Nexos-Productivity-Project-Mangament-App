import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface CommandSnippet {
  id: string;
  tool: string;
  command: string;
  description: string;
  tags?: string[];
  isCustom: boolean;
}

interface CommandsContextValue {
  commands: CommandSnippet[];
  addCommand: (command: Omit<CommandSnippet, 'id' | 'isCustom'>) => CommandSnippet;
  deleteCommand: (id: string) => void;
}

const SEED_COMMANDS: CommandSnippet[] = [
  // Git
  { id: 'g1', tool: 'Git', command: 'git rebase -i HEAD~3', description: 'Interactive rebase of the last 3 commits', tags: ['rebase', 'interactive'], isCustom: false },
  { id: 'g2', tool: 'Git', command: 'git stash pop', description: 'Apply and remove the last stashed changes', tags: ['stash'], isCustom: false },
  { id: 'g3', tool: 'Git', command: 'git cherry-pick <commit-hash>', description: 'Apply the changes introduced by some existing commits', tags: ['cherry-pick'], isCustom: false },
  { id: 'g4', tool: 'Git', command: 'git commit --amend --no-edit', description: 'Amend the last commit without changing the message', tags: ['commit', 'amend'], isCustom: false },
  { id: 'g5', tool: 'Git', command: 'git log --oneline --graph --all', description: 'View a beautiful graph of all commits', tags: ['log', 'visual'], isCustom: false },
  
  // SSH
  { id: 's1', tool: 'SSH', command: 'ssh-keygen -t ed25519 -C "your_email@example.com"', description: 'Generate a new SSH key using Ed25519 algorithm', tags: ['keygen'], isCustom: false },
  { id: 's2', tool: 'SSH', command: 'ssh -L 8080:localhost:80 user@remote', description: 'Local port forwarding: forward remote port 80 to local 8080', tags: ['tunnel', 'port-forwarding'], isCustom: false },
  { id: 's3', tool: 'SSH', command: 'ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote', description: 'Copy SSH public key to remote server for passwordless login', tags: ['auth'], isCustom: false },
  { id: 's4', tool: 'SSH', command: 'Host alias\n  HostName remote.example.com\n  User username\n  IdentityFile ~/.ssh/id_ed25519', description: 'SSH config alias example', tags: ['config'], isCustom: false },
  
  // Aria2c
  { id: 'a1', tool: 'Aria2c', command: 'aria2c -c <url>', description: 'Resume a partially downloaded file', tags: ['download', 'resume'], isCustom: false },
  { id: 'a2', tool: 'Aria2c', command: 'aria2c -x 16 -s 16 <url>', description: 'Download using 16 connections for faster speed', tags: ['download', 'multi-connection'], isCustom: false },
  { id: 'a3', tool: 'Aria2c', command: 'aria2c --input-file=links.txt', description: 'Download multiple URLs from a text file', tags: ['batch'], isCustom: false },
  
  // Linux / Other
  { id: 'l1', tool: 'Linux', command: 'tar -czvf archive.tar.gz /path/to/directory', description: 'Create a compressed tar.gz archive', tags: ['compression'], isCustom: false },
  { id: 'l2', tool: 'Linux', command: 'find . -name "*.log" -type f -delete', description: 'Find and delete all .log files in current directory', tags: ['cleanup'], isCustom: false },
  { id: 'l3', tool: 'Linux', command: 'sudo lsof -i :8080', description: 'Check what process is using port 8080', tags: ['network', 'debug'], isCustom: false },
  { id: 'l4', tool: 'Linux', command: 'du -sh * | sort -h', description: 'Show disk usage of files and folders in human-readable format, sorted', tags: ['disk'], isCustom: false },
  { id: 'l5', tool: 'Linux', command: 'grep -r "search_term" .', description: 'Recursively search for a string in all files in current directory', tags: ['search'], isCustom: false }
];

const CommandsContext = createContext<CommandsContextValue | null>(null);

export function CommandsProvider({ children }: { children: ReactNode }) {
  const [commands, setCommands] = useState<CommandSnippet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('nexus-commands');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCommands(parsed);
      } catch (e) {
        console.error('Failed to parse commands', e);
        setCommands(SEED_COMMANDS);
      }
    } else {
      setCommands(SEED_COMMANDS);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('nexus-commands', JSON.stringify(commands));
    }
  }, [commands, loaded]);

  const addCommand = useCallback((data: Omit<CommandSnippet, 'id' | 'isCustom'>): CommandSnippet => {
    const command: CommandSnippet = {
      ...data,
      id: Date.now().toString(),
      isCustom: true,
    };
    setCommands(prev => [command, ...prev]);
    return command;
  }, []);

  const deleteCommand = useCallback((id: string) => {
    setCommands(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <CommandsContext.Provider value={{ commands, addCommand, deleteCommand }}>
      {children}
    </CommandsContext.Provider>
  );
}

export function useCommands() {
  const ctx = useContext(CommandsContext);
  if (!ctx) throw new Error('useCommands must be used within CommandsProvider');
  return ctx;
}
