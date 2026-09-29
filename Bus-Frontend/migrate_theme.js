const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      let newContent = content.replace(/className=(["`])([^"`]+)(["`])/g, (match, q1, classes, q2) => {
        let newClasses = classes;
        
        // Backgrounds
        newClasses = newClasses.replace(/(?<!dark:)bg-\[\#11111a\]/g, 'bg-white dark:bg-[#11111a]');
        newClasses = newClasses.replace(/(?<!dark:)bg-\[\#0a0a0a\]/g, 'bg-gray-50 dark:bg-[#0a0a0a]');
        newClasses = newClasses.replace(/(?<!dark:)bg-\[\#0a0a0f\]/g, 'bg-gray-50 dark:bg-[#0a0a0f]');
        newClasses = newClasses.replace(/(?<!dark:)bg-\[\#141414\]/g, 'bg-white dark:bg-[#141414]');
        
        // Borders
        newClasses = newClasses.replace(/(?<!dark:)border-white\/5/g, 'border-gray-200 dark:border-white/5');
        newClasses = newClasses.replace(/(?<!dark:)border-white\/10/g, 'border-gray-200 dark:border-white/10');
        newClasses = newClasses.replace(/(?<!dark:)border-white\/20/g, 'border-gray-200 dark:border-white/20');
        newClasses = newClasses.replace(/(?<!dark:)border-gray-800/g, 'border-gray-200 dark:border-gray-800');
        
        // Text Colors
        newClasses = newClasses.replace(/(?<!dark:)text-gray-400/g, 'text-gray-600 dark:text-gray-400');
        newClasses = newClasses.replace(/(?<!dark:)text-gray-500/g, 'text-gray-500 dark:text-gray-400');
        
        // text-white is tricky, only replace if not in a colored background
        if (!newClasses.includes('bg-blue-') && 
            !newClasses.includes('bg-red-') && 
            !newClasses.includes('bg-orange-') && 
            !newClasses.includes('bg-green-') && 
            !newClasses.includes('bg-indigo-') && 
            !newClasses.includes('bg-violet-') &&
            !newClasses.includes('bg-emerald-')) {
          newClasses = newClasses.replace(/(?<!dark:)text-white/g, 'text-gray-900 dark:text-white');
        }

        if (newClasses !== classes) {
          modified = true;
        }

        return `className=${q1}${newClasses}${q2}`;
      });

      if (modified) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Theme migration complete!');
