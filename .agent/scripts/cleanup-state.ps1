param(
    [int]$DaysOld = 7,
    [ValidateSet("agent", "prebuild", "all")]
    [string]$Mode = "agent",
    [switch]$WhatIf
)

# --- Mode: Agent (default) ---
# Cleans stale spawn logs, debug reports, benchmark artifacts
$agentDirs = @(
    ".agent\spawn_agent_tasks",
    ".hc\debug",
    ".hc\benchmarks",
    ".hc\perf-audit",
    ".hc\logs"
)

# --- Mode: Prebuild ---
# Cleans build output, bundler/framework caches, TS incremental, test output
$prebuildTargets = @(
    @{ Path = "dist";                   Recurse = $true },
    @{ Path = "build";                  Recurse = $true },
    @{ Path = "out";                    Recurse = $true },
    @{ Path = "node_modules\.cache";    Recurse = $true },
    @{ Path = "node_modules\.vite";     Recurse = $true },
    @{ Path = ".vite";                  Recurse = $true },
    @{ Path = ".turbo";                 Recurse = $true },
    @{ Path = ".next\cache";            Recurse = $true },
    @{ Path = "coverage";               Recurse = $true },
    @{ Path = "src-tauri\target\debug"; Recurse = $true }
)
$prebuildFiles = @(
    "tsconfig.tsbuildinfo",
    "*.tsbuildinfo"
)

$deletedCount = 0
$deletedSize = 0

function Remove-Tracked {
    param([string]$ItemPath, [bool]$IsDir)
    $item = Get-Item -LiteralPath $ItemPath -ErrorAction SilentlyContinue
    if (-not $item) { return }

    if ($IsDir) {
        $size = (Get-ChildItem -LiteralPath $ItemPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    } else {
        $size = $item.Length
    }
    $script:deletedSize += $size

    if ($WhatIf) {
        Write-Host "WhatIf: Removing $ItemPath" -ForegroundColor Cyan
    } else {
        Remove-Item -LiteralPath $ItemPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Removed $ItemPath" -ForegroundColor DarkGray
    }
    $script:deletedCount++
}

# --- Agent cleanup (age-based) ---
if ($Mode -eq "agent" -or $Mode -eq "all") {
    Write-Host "--- Agent cleanup (files older than $DaysOld days) ---" -ForegroundColor Yellow
    $cutoffDate = (Get-Date).AddDays(-$DaysOld)

    foreach ($dir in $agentDirs) {
        if (Test-Path -LiteralPath $dir) {
            $files = Get-ChildItem -Path $dir -File -Recurse | Where-Object { $_.LastWriteTime -lt $cutoffDate }
            foreach ($file in $files) {
                $script:deletedSize += $file.Length
                if ($WhatIf) {
                    Write-Host "WhatIf: Removing $($file.FullName)" -ForegroundColor Cyan
                } else {
                    Remove-Item -LiteralPath $file.FullName -Force
                    Write-Host "Removed $($file.FullName)" -ForegroundColor DarkGray
                }
                $script:deletedCount++
            }
        }
    }
}

# --- Prebuild cleanup (full wipe) ---
if ($Mode -eq "prebuild" -or $Mode -eq "all") {
    Write-Host "--- Pre-build cleanup (cache + build artifacts) ---" -ForegroundColor Yellow

    foreach ($target in $prebuildTargets) {
        $p = $target.Path
        if (Test-Path -LiteralPath $p) {
            Remove-Tracked -ItemPath $p -IsDir $true
        }
    }

    foreach ($pattern in $prebuildFiles) {
        $matches = Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue
        foreach ($file in $matches) {
            Remove-Tracked -ItemPath $file.FullName -IsDir $false
        }
    }
}

$sizeMB = [math]::Round($deletedSize / 1MB, 2)
Write-Host ""
Write-Host "Cleanup completed ($Mode mode)." -ForegroundColor Green
Write-Host "$deletedCount items removed ($sizeMB MB freed)" -ForegroundColor Green
