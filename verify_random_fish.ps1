$imgDir = Join-Path $PSScriptRoot "images"

$fishImages = @(
    "3d_heckel_discus_cutout.png",
    "3d_gold_angelfish_cutout.png",
    "3d_arowana_cutout.png",
    "3d_guppy_cutout.png",
    "3d_crowntail_betta_cutout.png",
    "3d_corydoras_cutout.png",
    "3d_pleco_cutout.png"
)

Write-Host "=== Checking Fish Cutout PNG Files on Disk ==="
$allFound = $true
foreach ($img in $fishImages) {
    $fullPath = Join-Path $imgDir $img
    if ([System.IO.File]::Exists($fullPath)) {
        $fi = New-Object System.IO.FileInfo($fullPath)
        Write-Host " [PASS] Found $img ($([Math]::Round($fi.Length/1024, 1)) KB)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing $img" -ForegroundColor Red
        $allFound = $false
    }
}

if ($allFound) {
    Write-Host "`n[SUCCESS] All 7 randomizable fish cutouts are verified on disk!" -ForegroundColor Cyan
}
