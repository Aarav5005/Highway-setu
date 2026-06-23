const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/modules/mechanic-requests/controller.ts',
  'src/modules/orders/controller.ts',
  'src/modules/sos/controller.ts',
  'src/modules/trips/controller.ts',
];

for (const file of filesToFix) {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // Fix string | undefined assignability for id
  content = content.replace(/\(id, /g, '(id as string, ');
  content = content.replace(/\(id as string as string, /g, '(id as string, ');
  content = content.replace(/\(id\)/g, '(id as string)');

  fs.writeFileSync(fp, content);
}

console.log("Syntax errors fixed part 3.");
