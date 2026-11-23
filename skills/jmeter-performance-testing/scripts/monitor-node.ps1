# Ghi CPU/RAM của tiến trình backend (node) mỗi khoảng thời gian ra CSV. Windows PowerShell 5.1+ / PowerShell 7.
# Dùng: powershell -NoProfile -ExecutionPolicy Bypass -File monitor-node.ps1 -Match server.js -Out node-usage.csv [-IntervalMs 1000] [-DurationSec 0]
# Dừng: tạo file "<Out>.stop" (run-scenario.mjs tự làm), hoặc Ctrl+C, hoặc hết DurationSec.
# cpu_percent đã chia cho số lõi logic (100 = dùng hết mọi lõi), khác cột CPU của Task Manager tab Details chỉ ở cách làm tròn.
param(
  [string]$Match = 'server.js',
  [string]$Out = 'node-usage.csv',
  [int]$IntervalMs = 1000,
  [int]$DurationSec = 0
)
$ErrorActionPreference = 'Stop'
$cands = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like "*$Match*" }
if (-not $cands) { Write-Error "Không tìm thấy node.exe có '$Match' trong dòng lệnh"; exit 1 }
if (@($cands).Count -gt 1) { Write-Warning ("Có nhiều tiến trình khớp, lấy PID nhỏ nhất: " + (($cands | ForEach-Object { $_.ProcessId }) -join ', ')) }
$targetPid = (@($cands) | Sort-Object ProcessId | Select-Object -First 1).ProcessId
$cores = [Environment]::ProcessorCount
$stopFile = "$Out.stop"
[System.IO.File]::WriteAllText($Out, "timestamp_iso,pid,cpu_percent,working_set_mb,private_mb,threads,handles`r`n")
$p = Get-Process -Id $targetPid
$prevCpu = $p.TotalProcessorTime.TotalMilliseconds
$prevT = [DateTime]::UtcNow
$start = [DateTime]::UtcNow
Write-Host "Giám sát PID $targetPid ($cores lõi) → $Out"
while ($true) {
  Start-Sleep -Milliseconds $IntervalMs
  try { $p = Get-Process -Id $targetPid -ErrorAction Stop } catch { Write-Warning "Tiến trình $targetPid đã dừng"; break }
  $now = [DateTime]::UtcNow
  $cpu = $p.TotalProcessorTime.TotalMilliseconds
  $dt = ($now - $prevT).TotalMilliseconds
  $pct = if ($dt -gt 0) { [math]::Round((($cpu - $prevCpu) / ($dt * $cores)) * 100, 1) } else { 0 }
  $prevCpu = $cpu; $prevT = $now
  $line = "{0},{1},{2},{3},{4},{5},{6}`r`n" -f $now.ToString('o'), $targetPid, $pct.ToString([Globalization.CultureInfo]::InvariantCulture), `
    ([math]::Round($p.WorkingSet64 / 1MB, 1)).ToString([Globalization.CultureInfo]::InvariantCulture), `
    ([math]::Round($p.PrivateMemorySize64 / 1MB, 1)).ToString([Globalization.CultureInfo]::InvariantCulture), $p.Threads.Count, $p.HandleCount
  [System.IO.File]::AppendAllText($Out, $line)
  if (Test-Path $stopFile) { Remove-Item $stopFile -ErrorAction SilentlyContinue; break }
  if ($DurationSec -gt 0 -and ($now - $start).TotalSeconds -ge $DurationSec) { break }
}
Write-Host "Dừng giám sát lúc $([DateTime]::UtcNow.ToString('o'))"
