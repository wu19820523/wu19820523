# Verify Guestbook Implementation
$htmlPath = Join-Path $PSScriptRoot "index.html"
$jsPath = Join-Path $PSScriptRoot "js\app.js"
$cssPath = Join-Path $PSScriptRoot "css\style.css"

$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)

Write-Host "=== 1. Checking HTML Elements ==="
$requiredIds = @(
    "guestbook",
    "gb-avg-score",
    "gb-avg-stars",
    "gb-total-reviews-count",
    "gb-recommend-rate",
    "gb-bar-5",
    "gb-count-5star",
    "gb-bar-4",
    "gb-count-4star",
    "guestbook-form",
    "gb-name",
    "gb-badge",
    "gb-avatar-picker",
    "gb-selected-avatar",
    "gb-star-picker",
    "gb-rating-desc",
    "gb-selected-rating",
    "gb-tag",
    "gb-species",
    "gb-message",
    "gb-char-now",
    "gb-submit-btn",
    "gb-reset-btn",
    "gb-filter-chips",
    "gb-search-input",
    "gb-sort-select",
    "gb-comments-container"
)

$missing = 0
foreach ($id in $requiredIds) {
    if ($html -match "id=['`"]$id['`"]") {
        Write-Host " [PASS] Found ID: $id" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing ID: $id" -ForegroundColor Red
        $missing++
    }
}

Write-Host "`n=== 2. Checking CSS Rules ==="
$requiredClasses = @(
    ".guestbook-section",
    ".gb-stats-banner",
    ".gb-stat-overall",
    ".gb-score-num",
    ".gb-stat-bars",
    ".gb-bar-row",
    ".guestbook-main-layout",
    ".gb-form-card",
    ".gb-avatar-picker",
    ".gb-star-picker",
    ".gb-comment-card",
    ".gb-species-pill",
    ".gb-reply-item"
)

foreach ($cls in $requiredClasses) {
    if ($css.Contains($cls)) {
        Write-Host " [PASS] Found CSS Class: $cls" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing CSS Class: $cls" -ForegroundColor Red
        $missing++
    }
}

Write-Host "`n=== 3. Checking JS Functions ==="
$requiredJsFns = @(
    "initGuestbookReviews",
    "loadGuestbookReviews",
    "saveGuestbookReviews",
    "renderGuestbook",
    "updateGuestbookStats",
    "renderGuestbookList",
    "toggleReviewLike",
    "toggleReplyBox",
    "submitReviewReply",
    "deleteCustomReview"
)

foreach ($fn in $requiredJsFns) {
    if ($js -match "function $fn\b") {
        Write-Host " [PASS] Found JS function: $fn" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Missing JS function: $fn" -ForegroundColor Red
        $missing++
    }
}

if ($missing -eq 0) {
    Write-Host "`n>>> All verification checks passed perfectly! <<<" -ForegroundColor Cyan
} else {
    Write-Host "`n>>> Found $missing issues! <<<" -ForegroundColor Yellow
}
