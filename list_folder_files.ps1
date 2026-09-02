$folders = @("images", "images2", "images_backup")
foreach ($f in $folders) {
    Write-Host "`n=== Folder: $f/ ($((Get-ChildItem $f -File).Count) files) ==="
    Get-ChildItem $f -File | Select-Object Name, Length | Format-Table -AutoSize
}
