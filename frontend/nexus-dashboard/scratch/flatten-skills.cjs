const fs = require('fs');
let content = fs.readFileSync('src/components/skills-portfolio.tsx', 'utf8');

// The overall summary card is fine to keep as a card, but the individual skill rows should be flattened.
// <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm overflow-hidden">
// Let's replace the skill row card wrappers.
// Actually, it's: <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm overflow-hidden">
content = content.replace(
  /<Card className="border-none shadow-md bg-background\/40 backdrop-blur-sm overflow-hidden">/g,
  '<div className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors rounded-none bg-transparent">'
);
content = content.replace(
  /<\/Card>/g, // We have to be careful not to replace the first card's closing tag.
  '</Card>' // I'll do this manually.
);

fs.writeFileSync('scratch/skills-portfolio-tmp.tsx', content, 'utf8');
