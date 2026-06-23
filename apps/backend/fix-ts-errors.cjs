const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/modules/dhabas/controller.ts',
  'src/modules/menu/controller.ts',
  'src/modules/mechanics/controller.ts',
  'src/modules/location/controller.ts',
];

for (const file of filesToFix) {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // Fix AppError import
  content = content.replace(
    /import \{ ApiError \} from '\.\.\/\.\.\/utils\/api-error';/g,
    `import { AppError } from '../../errors/app-error';`
  );

  // Fix new ApiError -> new AppError({ statusCode: ..., code: 'ERR', message: ... })
  content = content.replace(
    /throw new ApiError\((\d+),\s*'([^']+)'\);/g,
    `throw new AppError({ statusCode: $1, code: 'FORBIDDEN', message: '$2' });`
  );

  // Fix req.user -> req.auth
  content = content.replace(/req\.user\?/g, 'req.auth?');
  content = content.replace(/req\.auth\?\.id/g, 'req.auth?.userId');
  content = content.replace(/req\.user\.id/g, 'req.auth?.userId');
  
  // Fix id parameter casting
  content = content.replace(/req\.params\.id/g, '(req.params.id as string)');
  // Fix duplicate casts if any
  content = content.replace(/\(req\.params\.id as string\) as string/g, '(req.params.id as string)');

  fs.writeFileSync(fp, content);
}

const validatorsToFix = [
  'src/modules/dhabas/validator.ts',
  'src/modules/menu/validator.ts',
  'src/modules/mechanics/validator.ts',
];

for (const file of validatorsToFix) {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // Remove the wrapping z.object({ body: z.object(...) }) -> { body: z.object(...) }
  // Since ZodSchemas were wrapped like: export const schema = z.object({ \n  body: z.object({
  
  content = content.replace(/z\.object\(\{\n  body:/g, '{\n  body:');
  content = content.replace(/z\.object\(\{\n    body:/g, '{\n    body:');
  content = content.replace(/z\.object\(\{\n  params:/g, '{\n  params:');

  // And we need to remove the closing parenthesis of z.object({})
  // We can do this by regex or simply doing string replacements for specific parts.
  // Actually, we can just replace '});' with '};' at the end of schemas.
  content = content.replace(/\}\);\n/g, '};\n');
  
  // The mechanic schema had a .refine() on the body which is a bit more tricky.
  // Let's just fix it via simple replace.
  
  fs.writeFileSync(fp, content);
}

console.log("Done fixing.");
