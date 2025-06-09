// This script creates a simple logo for the grants website
const fs = require('fs');
const path = require('path');

// Create a simple blue circle with white "G" as base64 PNG
const logo192Base64 = `data:image/png;base64,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`;

// Convert base64 to buffer
const base64Data = logo192Base64.replace(/^data:image\/png;base64,/, '');
const buffer = Buffer.from(base64Data, 'base64');

// Write the file
const outputPath = path.join(__dirname, '../../public/logo192.png');
fs.writeFileSync(outputPath, buffer);

console.log('Logo created successfully at:', outputPath);
