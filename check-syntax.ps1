$errors = $null
$tokens = $null
[System.Management.Automation.Language.Parser]::ParseFile(
    'D:\Projects\balaji-real-estate\test-multi-photo.ps1',
    [ref]$tokens,
    [ref]$errors
)
if ($errors.Count -eq 0) {
    Write-Host "No parse errors found." -ForegroundColor Green
} else {
    foreach ($e in $errors) {
        Write-Host "Line $($e.Extent.StartLineNumber) Col $($e.Extent.StartColumnNumber): $($e.Message)" -ForegroundColor Red
    }
}
