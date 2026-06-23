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

  // Fix string | undefined assignability
  content = content.replace(/req\.auth\?\.role/g, '(req.auth?.role as string)');
  content = content.replace(/\(req\.auth\?\.role as string\) as string/g, '(req.auth?.role as string)');

  fs.writeFileSync(fp, content);
}

// Ensure location/service.ts has node fetch type fixed if needed, but wait it only errored on `role`.
console.log("Syntax errors fixed part 2.");
