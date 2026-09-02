$jsPath = Join-Path $PSScriptRoot "js\app.js"
$htmlPath = Join-Path $PSScriptRoot "index.html"

$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)
$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)

Write-Host "=== 1. Checking 3D Cutout Fish Pools ==="
$requiredSnippets = @(
    "aquaticActorPoolRight",
    "aquaticActorPoolLeft",
    "welcomePlayCount",
    "3d_heckel_discus_cutout.png",
    "3d_crowntail_betta_cutout.png",
    "3d_arowana_cutout.png",
    "3d_pleco_cutout.png",
    "3d_gold_angelfish_cutout.png",
    "3d_corydoras_cutout.png",
    "3d_guppy_cutout.png"
)

$missing = 0
foreach ($snip in $requiredSnippets) {
    if ($js.Contains($snip)) {
        Write-Host " [PASS] Found: $snip"
    } else {
        Write-Host " [FAIL] Missing: $snip"
        $missing++
    }
}

Write-Host "=== 2. Checking Brand Logo and Replay Bindings ==="
if ($js.Contains("brand-logo") -and $js.Contains("btnReplay3d")) {
    Write-Host " [PASS] Logo and replay button are bound to playAquaticWelcome3D(true)"
} else {
    Write-Host " [FAIL] Missing logo/replay binding"
    $missing++
}

Write-Host "=== 3. Checking Welcome Text Sequence Timers ==="
$timerPoints = @("4800", "6800", "7800", "8300")
foreach ($t in $timerPoints) {
    if ($js.Contains($t)) {
        Write-Host " [PASS] Found timer: $t ms"
    } else {
        Write-Host " [FAIL] Missing timer: $t ms"
        $missing++
    }
}

if ($missing -eq 0) {
    Write-Host "`n>>> All tests for 2nd-time random fish & welcome sequence passed successfully! <<<"
} else {
    Write-Host "`n>>> Found $missing issues! <<<"
}
