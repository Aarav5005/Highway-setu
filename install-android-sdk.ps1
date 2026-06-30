$ErrorActionPreference = 'Stop'

$SdkDir = "$env:LOCALAPPDATA\Android\Sdk"
Write-Host "Creating SDK directory at $SdkDir"
New-Item -ItemType Directory -Force -Path "$SdkDir\cmdline-tools" | Out-Null

Write-Host "Downloading Android Command Line Tools with curl.exe..."
cmd.exe /c "curl.exe -fsSL https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip -o `"%TEMP%\cmdline-tools.zip`""

if (-not (Test-Path "$SdkDir\cmdline-tools\latest")) {
    Write-Host "Extracting..."
    Expand-Archive -Path "$env:TEMP\cmdline-tools.zip" -DestinationPath "$SdkDir\cmdline-tools" -Force
    if (Test-Path "$SdkDir\cmdline-tools\cmdline-tools") {
        Rename-Item -Path "$SdkDir\cmdline-tools\cmdline-tools" -NewName "latest" -Force
    }
}

$env:ANDROID_HOME = $SdkDir
$env:PATH += ";$SdkDir\cmdline-tools\latest\bin"

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH += ";$env:JAVA_HOME\bin"

Write-Host "Installing SDK Packages..."
# The --licenses flag automatically accepts all licenses, but we can also pipe 'y' just in case
cmd.exe /c "echo y | `"$SdkDir\cmdline-tools\latest\bin\sdkmanager.bat`" --licenses"
cmd.exe /c "`"$SdkDir\cmdline-tools\latest\bin\sdkmanager.bat`" `"platform-tools`" `"platforms;android-34`" `"build-tools;34.0.0`""

# Set user environment variables so they persist
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $SdkDir, "User")
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPaths = "$SdkDir\platform-tools;$SdkDir\emulator"
if ($userPath -notmatch "Android\\Sdk") {
    [Environment]::SetEnvironmentVariable("PATH", "$userPath;$newPaths", "User")
}

Write-Host "Done!"
