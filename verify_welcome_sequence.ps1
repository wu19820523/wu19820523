$htmlPath = Join-Path $PSScriptRoot "index.html"
$jsPath = Join-Path $PSScriptRoot "js\app.js"
$cssPath = Join-Path $PSScriptRoot "css\style.css"

$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)

Write-Host "=== 1. Checking Welcome Banner HTML Elements ==="
$requiredHtml = @(
    "aquatic-welcome-banner",
    "welcome-banner-box",
    "welcome-banner-text",
    "welcome-banner-scroll"
)

$missing = 0
foreach ($elem in $requiredHtml) {
    if ($html.Contains($elem)) {
        Write-Host " [PASS] Found HTML element: $elem" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing HTML element: $elem" -ForegroundColor Red
        $missing++
    }
}

Write-Host "`n=== 2. Checking CSS Rules ==="
$requiredCss = @(
    ".aquatic-welcome-banner",
    ".welcome-banner-box",
    ".welcome-banner-title",
    ".welcome-banner-scroll"
)

foreach ($cls in $requiredCss) {
    if ($css.Contains($cls)) {
        Write-Host " [PASS] Found CSS Class: $cls" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing CSS Class: $cls" -ForegroundColor Red
        $missing++
    }
}

Write-Host "`n=== 3. Checking JS Welcome Sequence ==="
$requiredJsSnippets = @(
    "clearWelcomeTimeouts",
    "welcomeBanner.classList.add('visible')",
    "welcomeScroll.classList.add('visible')",
    "window.scrollBy",
    "4800",
    "6800",
    "7800",
    "8300"
)

foreach ($snip in $requiredJsSnippets) {
    if ($js.Contains($snip)) {
        Write-Host " [PASS] Found JS logic: $snip" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing JS logic: $snip" -ForegroundColor Red
        $missing++
    }
}

if ($missing -eq 0) {
    Write-Host "`n[SUCCESS] All checks passed successfully!" -ForegroundColor Cyan
} else {
    Write-Host "`n[WARNING] Found issues!" -ForegroundColor Yellow
}
