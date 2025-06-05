const fs = require('fs');

const content = fs.readFileSync('./client/src/pages/GrantsPage.js', 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let openParens = 0;
let openBrackets = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const char of line) {
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
    if (char === '(') openParens++;
    if (char === ')') openParens--;
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
  }
  
  if (i > 740 && i < 760) {
    console.log(`Line ${i + 1}: ${line.trim()} | Braces: ${openBraces}, Parens: ${openParens}, Brackets: ${openBrackets}`);
  }
}

console.log('\nFinal counts:');
console.log('Braces:', openBraces);
console.log('Parentheses:', openParens);
console.log('Brackets:', openBrackets);