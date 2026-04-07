const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace single-quoted string: 'http://localhost:8080/api/foo'
      content = content.replace(/'http:\/\/localhost:8080(\/api[^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}$1`");
      
      // Replace template literals: `http://localhost:8080/api/foo/${id}`
      content = content.replace(/`http:\/\/localhost:8080(\/api[^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}$1`");
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('d:/FSAD/FSAD-PROJECT/src');
console.log('URLs updated successfully.');
