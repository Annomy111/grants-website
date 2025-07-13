const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'website-code-export.txt';
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Only include actual source code directories
const INCLUDE_DIRS = [
  'client/src',
  'client/netlify/functions'
];

// Only include code file extensions
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.css'
];

// Essential root files for context
const ROOT_FILES = [
  'package.json',
  'netlify.toml',
  'CLAUDE.md'
];

// Files/directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.cache',
  '*.test.js',
  '*.spec.js',
  '*.min.js',
  '*.min.css'
];

function shouldExclude(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(relativePath);
    }
    return relativePath.includes(pattern);
  });
}

function shouldInclude(filePath) {
  const ext = path.extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (shouldExclude(filePath)) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (shouldInclude(filePath)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function exportWebsiteCode() {
  console.log('Starting focused website code export...');
  
  let output = `WEBSITE SOURCE CODE EXPORT - ${new Date().toISOString()}\n`;
  output += `Project: Ukrainian Civil Society Grants Database\n`;
  output += `Export Type: Core Application Code Only\n`;
  output += '='.repeat(80) + '\n\n';

  // Add file structure
  output += 'FILE STRUCTURE:\n';
  output += '-'.repeat(40) + '\n';
  
  let allFiles = [];
  
  INCLUDE_DIRS.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullPath)) {
      const files = getAllFiles(fullPath);
      output += `\n${dir}/ (${files.length} files)\n`;
      files.forEach(file => {
        const relativePath = path.relative(fullPath, file);
        output += `  ${relativePath}\n`;
        allFiles.push(file);
      });
    }
  });

  output += '\n' + '='.repeat(80) + '\n\n';
  output += 'SOURCE CODE:\n';
  output += '='.repeat(80) + '\n';

  // Export root files first for context
  let fileCount = 0;
  let totalSize = 0;

  ROOT_FILES.forEach(fileName => {
    const filePath = path.join(PROJECT_ROOT, fileName);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      output += `\n${'='.repeat(80)}\n`;
      output += `FILE: ${fileName}\n`;
      output += `SIZE: ${stats.size} bytes\n`;
      output += `${'='.repeat(80)}\n\n`;
      output += content;
      output += '\n\n';

      fileCount++;
      totalSize += stats.size;
    }
  });

  // Export all source files
  allFiles.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const stats = fs.statSync(file);
    const content = fs.readFileSync(file, 'utf8');

    output += `\n${'='.repeat(80)}\n`;
    output += `FILE: ${relativePath}\n`;
    output += `SIZE: ${stats.size} bytes\n`;
    output += `${'='.repeat(80)}\n\n`;
    output += content;
    output += '\n\n';

    fileCount++;
    totalSize += stats.size;
  });

  // Add summary
  output += '\n' + '='.repeat(80) + '\n';
  output += 'EXPORT SUMMARY:\n';
  output += '-'.repeat(40) + '\n';
  output += `Files exported: ${fileCount}\n`;
  output += `Total size: ${(totalSize / 1024).toFixed(2)} KB\n`;
  output += `Export completed: ${new Date().toISOString()}\n`;
  output += '\nThis export contains only the core application source code.\n';
  output += 'Static assets, data files, and auxiliary scripts have been excluded.\n';

  // Write to file
  const outputPath = path.join(PROJECT_ROOT, OUTPUT_FILE);
  fs.writeFileSync(outputPath, output, 'utf8');

  console.log(`\n✅ Focused website code exported successfully!`);
  console.log(`📄 Output file: ${outputPath}`);
  console.log(`📊 Total files: ${fileCount}`);
  console.log(`💾 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`\nThis export includes only:`);
  console.log(`  - React application code (client/src)`);
  console.log(`  - Netlify serverless functions`);
  console.log(`  - Essential config files`);
}

// Run export
try {
  exportWebsiteCode();
} catch (error) {
  console.error('❌ Error exporting website code:', error);
  process.exit(1);
}