$h = Get-Content -Raw -Path "index.html"
$j = Get-Content -Raw -Path "js/app.js"
$c = Get-Content -Raw -Path "css/style.css"

Write-Output "=== 檢查「我的魚缸」建立管家系統整合 ==="
Write-Output "HTML length: $($h.Length)"
Write-Output "JS length: $($j.Length)"
Write-Output "CSS length: $($c.Length)"

$mytankIds = @(
  "my-tank",
  "mytank-tabs-list",
  "btn-create-tank",
  "btn-delete-tank",
  "mytank-form",
  "mt-name",
  "mt-length",
  "mt-width",
  "mt-height",
  "mt-substrate-type",
  "mt-substrate-cm",
  "mt-plants",
  "mt-species-select",
  "mt-species-qty",
  "btn-mt-add-fish",
  "mt-fish-chips-container",
  "mt-total-fish-num",
  "mt-filter",
  "mt-light",
  "mt-heater",
  "mt-disp-type",
  "mt-disp-name",
  "mt-disp-dims",
  "mt-disp-health-badge",
  "mt-out-net-vol",
  "mt-out-fish-count",
  "mt-out-filter-name",
  "mt-out-heater-name",
  "mt-calc-density-status",
  "mt-calc-density-desc",
  "mt-calc-net-water",
  "mt-calc-net-desc",
  "mt-calc-water-change",
  "mt-calc-change-desc",
  "mt-diag-items-list",
  "btn-copy-tank-report"
)

$missing = @()
foreach ($id in $mytankIds) {
  if (-not $h.Contains("id=`"$id`"")) {
    $missing += $id
  }
}

if ($missing.Count -eq 0) {
  Write-Output "SUCCESS: All 36 My Tank HTML IDs are present!"
} else {
  Write-Output "FAILURE: Missing IDs: $($missing -join ', ')"
}

$hasMtFn = $j.Contains('initMyTankManager') -and $j.Contains('recalcCurrentTank') -and $j.Contains('switchMyTank')
Write-Output "JS has My Tank functions: $hasMtFn"

$hasMtCss = $c.Contains('.mytank-section') -and $c.Contains('.mytank-tabs-bar') -and $c.Contains('.mt-tank-visual-card')
Write-Output "CSS has My Tank styles: $hasMtCss"
