const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'source-code-export.txt';
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Directories to include
const INCLUDE_DIRS = [
  'client/src',
  'client/public',
  'client/netlify/functions',
  'server',
  'scripts',
  'supabase',
  'tests'
];

// File extensions to include
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.json', '.css', '.scss',
  '.html', '.md', '.sql',
  '.env.example', '.yml', '.yaml'
];

// Files/directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.cache',
  'coverage',
  '.env',
  '.env.local',
  'package-lock.json',
  'yarn.lock',
  '*.log',
  '*.min.js',
  '*.min.css',
  'source-code-export.txt'
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
  return INCLUDE_EXTENSIONS.includes(ext) || 
         path.basename(filePath) === '.gitignore' ||
         path.basename(filePath) === 'Procfile' ||
         path.basename(filePath) === 'netlify.toml';
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

function exportSourceCode() {
  console.log('Starting source code export...');
  
  let output = `SOURCE CODE EXPORT - ${new Date().toISOString()}\n`;
  output += `Project: Ukrainian Civil Society Grants Database\n`;
  output += '='.repeat(80) + '\n\n';

  // Add project structure first
  output += 'PROJECT STRUCTURE:\n';
  output += '-'.repeat(40) + '\n';
  
  INCLUDE_DIRS.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullPath)) {
      output += `\n${dir}/\n`;
      const files = getAllFiles(fullPath);
      files.forEach(file => {
        const relativePath = path.relative(fullPath, file);
        output += `  ${relativePath}\n`;
      });
    }
  });

  output += '\n' + '='.repeat(80) + '\n\n';
  output += 'SOURCE CODE:\n';
  output += '='.repeat(80) + '\n\n';

  // Export all files
  let fileCount = 0;
  let totalSize = 0;

  INCLUDE_DIRS.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    const files = getAllFiles(fullPath);

    files.forEach(file => {
      const relativePath = path.relative(PROJECT_ROOT, file);
      const stats = fs.statSync(file);
      const content = fs.readFileSync(file, 'utf8');

      output += `\n${'#'.repeat(80)}\n`;
      output += `# File: ${relativePath}\n`;
      output += `# Size: ${stats.size} bytes\n`;
      output += `# Modified: ${stats.mtime.toISOString()}\n`;
      output += `${'#'.repeat(80)}\n\n`;
      output += content;
      output += '\n\n';

      fileCount++;
      totalSize += stats.size;
    });
  });

  // Add important root files
  const rootFiles = [
    'package.json',
    'netlify.toml',
    '.gitignore',
    'README.md',
    'CLAUDE.md'
  ];

  rootFiles.forEach(fileName => {
    const filePath = path.join(PROJECT_ROOT, fileName);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      output += `\n${'#'.repeat(80)}\n`;
      output += `# File: ${fileName}\n`;
      output += `# Size: ${stats.size} bytes\n`;
      output += `# Modified: ${stats.mtime.toISOString()}\n`;
      output += `${'#'.repeat(80)}\n\n`;
      output += content;
      output += '\n\n';

      fileCount++;
      totalSize += stats.size;
    }
  });

  // Add summary
  output += '\n' + '='.repeat(80) + '\n';
  output += 'EXPORT SUMMARY:\n';
  output += '-'.repeat(40) + '\n';
  output += `Total files exported: ${fileCount}\n`;
  output += `Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`;
  output += `Export completed: ${new Date().toISOString()}\n`;

  // Write to file
  const outputPath = path.join(PROJECT_ROOT, OUTPUT_FILE);
  fs.writeFileSync(outputPath, output, 'utf8');

  console.log(`\n✅ Source code exported successfully!`);
  console.log(`📄 Output file: ${outputPath}`);
  console.log(`📊 Total files: ${fileCount}`);
  console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

// Run export
try {
  exportSourceCode();
} catch (error) {
  console.error('❌ Error exporting source code:', error);
  process.exit(1);
}