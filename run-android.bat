@echo off
set ANDROID_HOME=C:\Users\sk749\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%
cd /d "c:\aarav\Highway Setu\apps\mobile"
npx react-native run-android --port 8082
