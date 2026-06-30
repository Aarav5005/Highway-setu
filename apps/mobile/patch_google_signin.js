const fs = require('fs');

const file = 'C:/aarav/Highway Setu/apps/mobile/node_modules/@react-native-google-signin/google-signin/android/src/main/java/com/reactnativegooglesignin/RNGoogleSigninModule.java';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('extends NativeGoogleSigninSpec', 'extends com.facebook.react.bridge.ReactContextBaseJavaModule');
code = code.replace(/NativeGoogleSigninSpec\.NAME/g, '"RNGoogleSignin"');
code = code.replace(/@Override\s+public void signIn/g, 'public void signIn');
code = code.replace(/@Override\s+public void configure/g, 'public void configure');
code = code.replace(/@Override\s+public void addScopes/g, 'public void addScopes');
code = code.replace(/@Override\s+public void playServicesAvailable/g, 'public void playServicesAvailable');
code = code.replace(/@Override\s+public void signInSilently/g, 'public void signInSilently');
code = code.replace(/@Override\s+public void signOut/g, 'public void signOut');
code = code.replace(/@Override\s+public void revokeAccess/g, 'public void revokeAccess');
code = code.replace(/@Override\s+public void clearCachedAccessToken/g, 'public void clearCachedAccessToken');
code = code.replace(/@Override\s+public boolean hasPreviousSignIn/g, 'public boolean hasPreviousSignIn');
code = code.replace(/@Override\s+public WritableMap getCurrentUser/g, 'public WritableMap getCurrentUser');
code = code.replace(/@Override\s+public void getTokens/g, 'public void getTokens');
code = code.replace(/@Override\s+protected Map<String, Object> getTypedExportedConstants/g, 'protected Map<String, Object> getTypedExportedConstants');
code = code.replace(/getReactApplicationContext\(\)/g, 'getReactApplicationContextIfActiveOrWarn()');
code = code.replace(/@Override\s+public String getName/g, 'public String getName');

fs.writeFileSync(file, code);
console.log('Patched RNGoogleSigninModule');

const pkgFile = 'C:/aarav/Highway Setu/apps/mobile/node_modules/@react-native-google-signin/google-signin/android/src/main/java/com/reactnativegooglesignin/RNGoogleSigninPackage.java';
let pkgCode = fs.readFileSync(pkgFile, 'utf8');
pkgCode = pkgCode.replace(/RNGoogleSigninModule\.NAME/g, '"RNGoogleSignin"');
fs.writeFileSync(pkgFile, pkgCode);
console.log('Patched RNGoogleSigninPackage');

const bmFile = 'C:/aarav/Highway Setu/apps/mobile/node_modules/@react-native-google-signin/google-signin/android/src/main/java/com/reactnativegooglesignin/RNGoogleSigninButtonViewManager.java';
let bmCode = fs.readFileSync(bmFile, 'utf8');
bmCode = bmCode.replace('implements RNGoogleSigninButtonManagerInterface<SignInButton>', '');
bmCode = bmCode.replace(/mDelegate = new RNGoogleSigninButtonManagerDelegate\(this\);/g, 'mDelegate = null;');
bmCode = bmCode.replace(/@Override\s+public void setSize/g, 'public void setSize');
bmCode = bmCode.replace(/@Override\s+public void setColor/g, 'public void setColor');
bmCode = bmCode.replace(/@Override\s+public void setDisabled/g, 'public void setDisabled');
fs.writeFileSync(bmFile, bmCode);
console.log('Patched RNGoogleSigninButtonViewManager');
