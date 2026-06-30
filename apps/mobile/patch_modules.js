const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) {return;}
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const RNGH_DIR = 'C:/aarav/Highway Setu/apps/mobile/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react';
const RNS_DIR = 'C:/aarav/Highway Setu/apps/mobile/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens';

function patchFile(filePath) {
    if (!filePath.endsWith('.kt') && !filePath.endsWith('.java')) {return;}
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Use positive replacement: find "override fun setX(" and replace with "fun setX("
    // [a-zA-Z0-9_] ensures we capture the property name (like DefaultScale)
    content = content.replace(/override fun set([a-zA-Z0-9_]*?)\(/g, 'fun set$1(');

    // Also remove override from exact 'override fun set('
    content = content.replace(/override fun set\(/g, 'fun set(');

    // Fix RNScreens PointerEvents
    content = content.replace(/override var pointerEvents/g, 'var pointerEvents');
    content = content.replace(/override val pointerEvents/g, 'val pointerEvents');
    content = content.replace(/PointerEvents\?/g, 'PointerEvents');
    content = content.replace(/(?<!override\s)fun getPointerEvents\(\)/g, 'override fun getPointerEvents()');

    // Fix getName and invalidate
    content = content.replace(/(?<!override\s)fun getName\(\)/g, 'override fun getName()');
    content = content.replace(/public String getName\(\)/g, '@Override\n  public String getName()');
    content = content.replace(/(?<!override\s)fun invalidate\(\)/g, 'override fun invalidate()');

    // RNGestureHandlerModule specific fixes
    if (filePath.endsWith('RNGestureHandlerModule.kt')) {
        content = content.replace(/NativeRNGestureHandlerModuleSpec/g, 'ReactContextBaseJavaModule');
        content = content.replace(/reactContext: ReactApplicationContext\?/g, 'reactContext: ReactApplicationContext');
        // Add import if missing
        if (!content.includes('import com.facebook.react.bridge.ReactContextBaseJavaModule')) {
            content = content.replace('import com.facebook.react.bridge.ReactApplicationContext', 'import com.facebook.react.bridge.ReactApplicationContext\nimport com.facebook.react.bridge.ReactContextBaseJavaModule');
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Patched: ' + filePath);
    }
}

walkDir(RNGH_DIR, patchFile);
walkDir(RNS_DIR, patchFile);
