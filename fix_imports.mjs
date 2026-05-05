import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'packages', 'aix-core', 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(srcDir);
let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    const newContent = content.replace(/from\s+['"](\.[^'"]+)(?<!\.js)['"]/g, "from '$1.js'");
    const newContent2 = newContent.replace(/import\s+['"](\.[^'"]+)(?<!\.js)['"]/g, "import '$1.js'");
    
    if (content !== newContent2) {
        fs.writeFileSync(file, newContent2, 'utf8');
        changedCount++;
        console.log(`Updated imports in ${path.basename(file)}`);
    }
}

console.log(`Done. Updated ${changedCount} files.`);
