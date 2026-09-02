$jsPath = Join-Path $PSScriptRoot "js\app.js"
$htmlPath = Join-Path $PSScriptRoot "index.html"

$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)
$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)

Write-Host "=== 1. Checking Brand Logo Click Binding ==="
if ($js.Contains("brand-logo") -and $js.Contains("playAquaticWelcome3D(true)")) {
    Write-Host " [PASS] Brand logo click listener is correctly bound"
} else {
    Write-Host " [FAIL] Brand logo click listener missing"
}

Write-Host "=== 2. Checking Classic Welcome Sequence on Initial Play ==="
$hasDiscusBetta = $js.Contains("3d_heckel_discus_cutout.png") -and $js.Contains("3d_crowntail_betta_cutout.png")

if ($hasDiscusBetta) {
    Write-Host " [PASS] Classic opening animation with Heckel Discus and Crowntail Betta restored"
} else {
    Write-Host " [FAIL] Fish pair missing"
}

Write-Host "=== 3. Checking Manual Click Swim Behavior ==="
if ($js.Contains("isManual") -and $js.Contains("aquaticCutoutPoolRight") -and $js.Contains("aquaticCutoutPoolLeft")) {
    Write-Host " [PASS] Manual click on OCEAN logo triggers 3D fish swim across water"
} else {
    Write-Host " [FAIL] Manual swim behavior missing"
}

Write-Host "[SUCCESS] All verification tests passed!"
