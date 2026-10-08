const fs = require('fs');
let code = fs.readFileSync('frontend/nexus-dashboard/src/App.tsx', 'utf8');

// 1. Add import for StandupGenerator
if (!code.includes('import { StandupGenerator }')) {
  code = code.replace(
    'import { NotesManager } from \'@/components/notes-manager\';',
    'import { NotesManager } from \'@/components/notes-manager\';\nimport { StandupGenerator } from \'@/components/standup-generator\';'
  );
}

// 2. Add StandupGeneratorPage component
if (!code.includes('function StandupGeneratorPage()')) {
  const pageCode = `
function StandupGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-28 md:pb-12">
        <StandupGenerator />
      </div>
    </main>
  );
}
`;
  code = code.replace('function Router()', pageCode + '\nfunction Router()');
}

// 3. Update router
code = code.replace('<Route path="/dev/standup" component={CommandsPage} />', '<Route path="/dev/standup" component={StandupGeneratorPage} />');

fs.writeFileSync('frontend/nexus-dashboard/src/App.tsx', code);
console.log("App.tsx patched!");
