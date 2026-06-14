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
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // 1. Replace single and double quotes: 'http://localhost:5000/api/...' -> `${process.env.REACT_APP_API_URL}/api/...`
    content = content.replace(/(['"])http:\/\/localhost:5000([^'"]*)\1/g, '`${process.env.REACT_APP_API_URL}$2`');
    
    // 2. Replace remaining (which are inside backticks or other places): `http://localhost:5000/api/${id}` -> `${process.env.REACT_APP_API_URL}/api/${id}`
    content = content.replace(/http:\/\/localhost:5000/g, '${process.env.REACT_APP_API_URL}');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        modifiedCount++;
        console.log(`Modified: ${file}`);
    }
});
console.log(`Done replacing URLs in ${modifiedCount} files.`);
