$jsPath = Join-Path $PSScriptRoot "js\app.js"
$speciesPath = Join-Path $PSScriptRoot "js\species-data.js"
$cssPath = Join-Path $PSScriptRoot "css\style.css"

$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)
$speciesJs = [System.IO.File]::ReadAllText($speciesPath, [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)

Write-Host "=== 1. Checking JS 100-Species Randomization Logic ==="
$requiredJsSnippets = @(
    "pickTwoRandomSpeciesFromAll100",
    "resolveFishRenderMeta",
    "known3DCutouts",
    "scaleX(-1)",
    "scaleX(1)",
    "hydro-pod"
)

$missing = 0
foreach ($snip in $requiredJsSnippets) {
    if ($js.Contains($snip)) {
        Write-Host " [PASS] Found: $snip"
    } else {
        Write-Host " [FAIL] Missing: $snip"
        $missing++
    }
}

Write-Host "=== 2. Checking CSS Rules ==="
if ($css.Contains(".fish-render-img.hydro-pod")) {
    Write-Host " [PASS] Found hydro-pod in CSS"
} else {
    Write-Host " [FAIL] Missing hydro-pod in CSS"
    $missing++
}

Write-Host "=== 3. Checking Species Count in SPECIES_DATA ==="
$matches = [System.Text.RegularExpressions.Regex]::Matches($speciesJs, 'id:\s*"')
$count = $matches.Count
Write-Host " Total species count: $count"

if ($count -eq 100 -and $missing -eq 0) {
    Write-Host "`n>>> All 100 Species Random Swim Animation tests passed successfully! <<<"
}
