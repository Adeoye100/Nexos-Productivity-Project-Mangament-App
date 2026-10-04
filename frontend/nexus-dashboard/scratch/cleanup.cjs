const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/uppercase tracking-wider text-muted-foreground/g, "font-semibold tracking-tight text-foreground");
  content = content.replace(/uppercase tracking-widest text-zinc-500 dark:text-zinc-400/g, "font-semibold tracking-tight text-foreground");
  content = content.replace(/uppercase tracking-wider text-muted-foreground font-medium/g, "font-semibold tracking-tight text-foreground");
  content = content.replace(/text-xs font-semibold uppercase tracking-wider/g, "text-xs font-semibold tracking-tight");
  content = content.replace(/text-xs font-medium text-muted-foreground uppercase tracking-wider/g, "text-xs font-semibold tracking-tight text-foreground");
  content = content.replace(/uppercase tracking-wider/g, "font-semibold tracking-tight");
  
  content = content.replace(/<ArrowRight className="w-3 h-3" \/>/g, "");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
