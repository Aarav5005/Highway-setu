const fs = require('fs');
const path = require('path');

const dir = 'C:/aarav/Highway Setu/apps/mobile/node_modules/react-native-maps/android/src/main/java/com/facebook/react/viewmanagers';

if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.java')) {
            const filePath = path.join(dir, file);
            let code = fs.readFileSync(filePath, 'utf8');
            code = code.replace(/import com\.facebook\.react\.uimanager\.ViewManagerWithGeneratedInterface;/g, '');
            code = code.replace(/extends ViewManagerWithGeneratedInterface\s*/g, '');
            fs.writeFileSync(filePath, code);
            console.log('Patched ' + file);
        }
    }
} else {
    console.log('Directory not found: ' + dir);
}
