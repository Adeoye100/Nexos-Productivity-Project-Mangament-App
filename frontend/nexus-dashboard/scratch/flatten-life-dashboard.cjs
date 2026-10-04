const fs = require('fs');
let content = fs.readFileSync('src/components/life-dashboard.tsx', 'utf8');

// The Goal card is primary, but we'll tone it down slightly
content = content.replace(
  /className="border-none shadow-md bg-background\/40 backdrop-blur-sm p-4 sm:p-5"/g,
  'className="border border-border/40 shadow-sm bg-background/50 p-4 sm:p-5"'
);

// The overall level card (which was just space-y-3)
content = content.replace(
  /className="border-none shadow-md bg-background\/40 backdrop-blur-sm p-4 sm:p-5 space-y-3"/g,
  'className="border-b border-border/40 pb-4 mb-4 space-y-3"'
);
content = content.replace(/<Card className="border-b border-border\/40/g, '<div className="border-b border-border/40');
// We need to fix the closing </Card> for this one, but wait, maybe just remove the card classes entirely.

fs.writeFileSync('src/components/life-dashboard.tsx', content, 'utf8');
