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
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/DMS/dms-frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('italic')) {
    // Replace italic surrounded by space/quotes properly, or just whole word 'italic'
    let newContent = content.replace(/\bitalic\b/g, '');
    
    // Cleanup double spaces inside className strings if any
    newContent = newContent.replace(/className="([^"]*)"/g, (match, p1) => {
      return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
    });
    
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
