const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/modules/trips/service.ts',
  'src/modules/orders/service.ts',
  'src/modules/mechanic-requests/service.ts',
  'src/modules/sos/service.ts',
];

for (const file of filesToFix) {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // Fix escaped backticks
  content = content.replace(/\\`/g, '`');
  // Fix escaped dollar signs
  content = content.replace(/\\\$/g, '$');

  fs.writeFileSync(fp, content);
}

console.log("Syntax errors fixed.");
