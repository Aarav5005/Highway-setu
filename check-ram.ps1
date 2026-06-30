$os = Get-CimInstance Win32_OperatingSystem
$freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
Write-Host "Free RAM: $freeGB GB / Total: $totalGB GB"

$pf = Get-CimInstance Win32_PageFileUsage -ErrorAction SilentlyContinue
if ($pf) {
    Write-Host "Paging file: $($pf.CurrentUsage) MB used / $($pf.AllocatedBaseSize) MB allocated"
} else {
    Write-Host "WARNING: No paging file found!"
}

Write-Host ""
Write-Host "Top memory consumers:"
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, @{N='RAM_MB';E={[math]::Round($_.WorkingSet64/1MB)}} | Format-Table -AutoSize
