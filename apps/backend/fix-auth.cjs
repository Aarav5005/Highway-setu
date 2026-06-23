const fs = require('fs');
const path = require('path');

const authRepoPath = path.join(__dirname, 'src/modules/auth/repository.ts');
if (fs.existsSync(authRepoPath)) {
  let content = fs.readFileSync(authRepoPath, 'utf8');
  content = content.replace(/preferred_language/g, 'language_pref');
  content = content.replace(/'mechanic_owner'/g, "'mechanic'");
  fs.writeFileSync(authRepoPath, content);
}

const authServicePath = path.join(__dirname, 'src/modules/auth/service.ts');
if (fs.existsSync(authServicePath)) {
  let content = fs.readFileSync(authServicePath, 'utf8');
  content = content.replace(/preferred_language/g, 'language_pref');
  fs.writeFileSync(authServicePath, content);
}

console.log("Auth errors fixed.");
