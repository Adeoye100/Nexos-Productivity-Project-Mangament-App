const fs = require('fs');
let content = fs.readFileSync('src/components/habit-tracker.tsx', 'utf8');

// Change card rows to simple divs with hover
content = content.replace(
  /<Card className="glass-card px-5 py-3 flex items-center gap-3">/g,
  '<div className="group flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">'
);

// We'll need to change </Card> to </div> for these rows.
// Because there are two such replacements, let's fix the closing tags.
// But wait, the main sections also use glass-card:
// <Card className="glass-card p-6 mb-6 animate-slide-in-up delay-100">
// We can change them to:
// <div className="mb-6 p-6 border rounded-2xl bg-card text-card-foreground shadow-sm animate-slide-in-up delay-100">

content = content.replace(
  /<Card className="glass-card/g,
  '<div className="glass-card'
);
content = content.replace(
  /<\/Card>/g,
  '</div>'
);

fs.writeFileSync('src/components/habit-tracker.tsx', content, 'utf8');
