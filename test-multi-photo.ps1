# Balaji Real Estate - Multi-Photo Upload Test Suite
# Target: listing id = 1   |   Worker: http://localhost:8787
# Uses curl.exe for multipart POSTs (avoids PowerShell byte-array encoding bug)

$BASE        = "http://localhost:8787"
$ID          = 1
$script:pass = 0
$script:fail = 0
$TMPDIR      = "$env:TEMP\bre-test-$PID"
New-Item -ItemType Directory -Path $TMPDIR -Force | Out-Null

function ok  { param($msg) Write-Host "  [PASS] $msg" -ForegroundColor Green;  $script:pass++ }
function bad { param($msg,$detail="") Write-Host "  [FAIL] $msg  $detail" -ForegroundColor Red; $script:fail++ }
function hdr { param($msg) Write-Host "`n--- $msg ---" -ForegroundColor Cyan }
function chk { param([string]$label,[bool]$cond,[string]$detail="") if ($cond) { ok $label } else { bad $label $detail } }

# Write a minimal valid 1x1 JPEG file to disk
function make-test-jpg { param([string]$Path)
    [byte[]]$bytes = @(
        0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,
        0x01,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0xFF,0xDB,0x00,0x43,
        0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,0x07,0x07,0x07,0x09,
        0x09,0x08,0x0A,0x0C,0x14,0x0D,0x0C,0x0B,0x0B,0x0C,0x19,0x12,
        0x13,0x0F,0x14,0x1D,0x1A,0x1F,0x1E,0x1D,0x1A,0x1C,0x1C,0x20,
        0x24,0x2E,0x27,0x20,0x22,0x2C,0x23,0x1C,0x1C,0x28,0x37,0x29,
        0x2C,0x30,0x31,0x34,0x34,0x34,0x1F,0x27,0x39,0x3D,0x38,0x32,
        0x3C,0x2E,0x33,0x34,0x32,0xFF,0xC0,0x00,0x0B,0x08,0x00,0x01,
        0x00,0x01,0x01,0x01,0x11,0x00,0xFF,0xC4,0x00,0x1F,0x00,0x00,
        0x01,0x05,0x01,0x01,0x01,0x01,0x01,0x01,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,
        0x09,0x0A,0x0B,0xFF,0xC4,0x00,0xB5,0x10,0x00,0x02,0x01,0x03,
        0x03,0x02,0x04,0x03,0x05,0x05,0x04,0x04,0x00,0x00,0x01,0x7D,
        0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,
        0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xA1,0x08,
        0x23,0x42,0xB1,0xC1,0x15,0x52,0xD1,0xF0,0x24,0x33,0x62,0x72,
        0x82,0x09,0x0A,0x16,0x17,0x18,0x19,0x1A,0x25,0x26,0x27,0x28,
        0x29,0x2A,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x43,0x44,0x45,
        0x46,0x47,0x48,0x49,0x4A,0x53,0x54,0x55,0x56,0x57,0x58,0x59,
        0x5A,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6A,0x73,0x74,0x75,
        0x76,0x77,0x78,0x79,0x7A,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
        0x8A,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9A,0xA2,0xA3,0xA4,
        0xA5,0xA6,0xA7,0xA8,0xA9,0xAA,0xB2,0xB3,0xB4,0xB5,0xB6,0xB7,
        0xB8,0xB9,0xBA,0xC2,0xC3,0xC4,0xC5,0xC6,0xC7,0xC8,0xC9,0xCA,
        0xD2,0xD3,0xD4,0xD5,0xD6,0xD7,0xD8,0xD9,0xDA,0xE1,0xE2,0xE3,
        0xE4,0xE5,0xE6,0xE7,0xE8,0xE9,0xEA,0xF1,0xF2,0xF3,0xF4,0xF5,
        0xF6,0xF7,0xF8,0xF9,0xFA,0xFF,0xDA,0x00,0x08,0x01,0x01,0x00,
        0x00,0x3F,0x00,0xFB,0xD4,0xFF,0xD9
    )
    [System.IO.File]::WriteAllBytes($Path, $bytes)
}

# Upload photos via curl.exe (handles binary multipart correctly)
# Returns the parsed JSON array of keys, or throws on failure
function curl-upload {
    param([int]$ListingId, [string[]]$FilePaths)
    $formArgs = @()
    foreach ($fp in $FilePaths) { $formArgs += @('-F', "files=@$fp;type=image/jpeg") }
    $raw = curl.exe -s -w "`n__STATUS__%{http_code}" `
        -X POST "$BASE/api/listings/$ListingId/photos" `
        $formArgs 2>&1
    $parts    = $raw -split '__STATUS__'
    $body     = $parts[0].Trim()
    $httpCode = [int]($parts[1].Trim())
    if ($httpCode -ge 400) { throw "HTTP $httpCode : $body" }
    return ($body | ConvertFrom-Json)
}

# ============================================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "  Balaji Real Estate - Multi-Photo Upload Test Suite" -ForegroundColor Magenta
Write-Host "  Listing $ID  |  $BASE" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta

$uploadedKeys = @()

# Create test JPEGs on disk
$jpg1 = "$TMPDIR\photo1.jpg"
$jpg2 = "$TMPDIR\photo2.jpg"
$jpg3 = "$TMPDIR\photo3.jpg"
$jpg4 = "$TMPDIR\photo4.jpg"
foreach ($f in $jpg1,$jpg2,$jpg3,$jpg4) { make-test-jpg $f }
Write-Host "  Test images written to: $TMPDIR"

# ----------------------------------------------------------------
hdr "0. Worker health check"
try {
    $all = Invoke-RestMethod -Method GET -Uri "$BASE/api/listings" -ErrorAction Stop
    chk "GET /api/listings reachable" ($null -ne $all)
} catch { bad "Worker not reachable at $BASE" "$_"; exit 1 }

# ----------------------------------------------------------------
hdr "1. GET /api/listings/$ID (baseline)"
try {
    $r1 = Invoke-RestMethod -Method GET -Uri "$BASE/api/listings/$ID" -ErrorAction Stop
    Write-Host "  title   : $($r1.title)"
    Write-Host "  status  : $($r1.status)"
    Write-Host "  price   : $($r1.price)"
    Write-Host "  photos  : $($r1.photos.Count) existing"
    chk "Listing $ID exists"    ($null -ne $r1)
    chk "Has photos array"      ($r1.photos -is [array])
    chk "Has documents array"   ($r1.documents -is [array])
} catch { bad "GET listing $ID failed" "$_" }

# ----------------------------------------------------------------
hdr "2. PUT /api/listings/$ID  status=sold price=2800000"
try {
    $r2 = Invoke-RestMethod -Method PUT -Uri "$BASE/api/listings/$ID" `
        -ContentType 'application/json' `
        -Body '{"status":"sold","price":"2800000"}' `
        -ErrorAction Stop
    Write-Host "  status : $($r2.status)   price : $($r2.price)"
    chk "status = sold"        ($r2.status -eq 'sold')
    chk "price = 2800000"      ($r2.price  -eq '2800000')
    chk "photos preserved"     ($r2.photos -is [array])
    chk "id in response"       ($r2.id -eq $ID)
} catch { bad "PUT failed" "$_" }

# ----------------------------------------------------------------
hdr "3. POST /api/listings/$ID/photos  (1 file via curl.exe)"
try {
    $k3 = curl-upload -ListingId $ID -FilePaths @($jpg1)
    Write-Host "  returned key(s): $($k3 -join ', ')"
    chk "Returns 1 key"          ($k3.Count -eq 1)
    chk "Key is non-empty"       ($k3[0].Length -gt 0)
    chk "Key ends with .jpg"     ($k3[0] -match '\.jpg$')
    $uploadedKeys += $k3
} catch { bad "Single photo upload failed" "$_" }

# ----------------------------------------------------------------
hdr "4. POST /api/listings/$ID/photos  (3 files in one request via curl.exe)"
try {
    $k4 = curl-upload -ListingId $ID -FilePaths @($jpg2, $jpg3, $jpg4)
    Write-Host "  returned key(s): $($k4 -join ', ')"
    chk "Returns 3 keys"         ($k4.Count -eq 3)
    chk "All keys non-empty"     (($k4 | Where-Object { $_.Length -gt 0 }).Count -eq 3)
    chk "All keys end in .jpg"   (($k4 | Where-Object { $_ -match '\.jpg$' }).Count -eq 3)
    $uploadedKeys += $k4
} catch { bad "Multi photo upload failed" "$_" }

Write-Host "  Total uploaded: $($uploadedKeys.Count) keys"

# ----------------------------------------------------------------
hdr "5. GET /api/listings/$ID  (verify photos persisted in DB)"
try {
    $r5 = Invoke-RestMethod -Method GET -Uri "$BASE/api/listings/$ID" -ErrorAction Stop
    Write-Host "  photos in DB: $($r5.photos.Count)"
    Write-Host "  keys: $($r5.photos -join ', ')"
    chk "photos is array"          ($r5.photos -is [array])
    chk "At least 4 photos stored" ($r5.photos.Count -ge 4)
    foreach ($k in $uploadedKeys) {
        chk "Key '$k' present in listing" ($r5.photos -contains $k)
    }
} catch { bad "GET after upload failed" "$_" }

# ----------------------------------------------------------------
hdr "6. GET /api/listings/media/:key  (serve each photo from R2)"
foreach ($k in $uploadedKeys) {
    $url = "$BASE/api/listings/media/$k"
    $raw6 = curl.exe -s -o "$TMPDIR\dl-$k" -w "__STATUS__%{http_code}|CT:%{content_type}" "$url" 2>&1
    $parts6    = $raw6 -split '__STATUS__'
    $meta6     = $parts6[1].Trim()
    $http6     = [int](($meta6 -split '\|')[0])
    $ct6       = ($meta6 -split 'CT:')[1]
    $size6     = (Get-Item "$TMPDIR\dl-$k" -ErrorAction SilentlyContinue).Length
    chk "200 for '$k'"                ($http6 -eq 200)        "Got: $http6"
    chk "image Content-Type for '$k'" ($ct6 -match 'image/')   "Got: $ct6"
    chk "Non-zero download for '$k'"  ($size6 -gt 0)           "Got: $size6 bytes"
}

# ----------------------------------------------------------------
hdr "7a. Upload to non-existent listing 99999 (expect 404)"
$raw7a = curl.exe -s -w "`n__STATUS__%{http_code}" -X POST "$BASE/api/listings/99999/photos" `
    -F "files=@$jpg1;type=image/jpeg" 2>&1
$code7a = [int](($raw7a -split '__STATUS__')[1].Trim())
chk "404 for listing 99999" ($code7a -eq 404) "Got: $code7a"

# ----------------------------------------------------------------
hdr "7b. Upload with wrong field name 'photo' (expect 400)"
$raw7b = curl.exe -s -w "`n__STATUS__%{http_code}" -X POST "$BASE/api/listings/$ID/photos" `
    -F "photo=@$jpg1;type=image/jpeg" 2>&1
$parts7b  = $raw7b -split '__STATUS__'
$body7b   = $parts7b[0].Trim()
$code7b   = [int]($parts7b[1].Trim())
if ($code7b -eq 400) {
    chk "400 for wrong field name" $true
} else {
    # Worker may return 200 with empty array - that's also acceptable
    $arr7b = try { $body7b | ConvertFrom-Json } catch { @() }
    chk "400 or empty array for wrong field" ($code7b -eq 400 -or $arr7b.Count -eq 0) "status=$code7b body=$body7b"
}

# ----------------------------------------------------------------
hdr "7c. GET non-existent media key (expect 404)"
$raw7c  = curl.exe -s -w "`n__STATUS__%{http_code}" "$BASE/api/listings/media/does-not-exist-xyz-abc.jpg" 2>&1
$code7c = [int](($raw7c -split '__STATUS__')[1].Trim())
chk "404 for missing media key" ($code7c -eq 404) "Got: $code7c"

# ----------------------------------------------------------------
hdr "7d. Path traversal blocked (expect 400)"
$raw7d  = curl.exe -s -w "`n__STATUS__%{http_code}" "$BASE/api/listings/media/../secret" 2>&1
$code7d = [int](($raw7d -split '__STATUS__')[1].Trim())
chk "Path traversal blocked (non-200)" ($code7d -ne 200) "Got: $code7d"

# ----------------------------------------------------------------
hdr "8. PUT /api/listings/$ID  restore status=available price=2500000"
try {
    $r8 = Invoke-RestMethod -Method PUT -Uri "$BASE/api/listings/$ID" `
        -ContentType 'application/json' `
        -Body '{"status":"available","price":"2500000"}' `
        -ErrorAction Stop
    Write-Host "  status : $($r8.status)  price : $($r8.price)  photos : $($r8.photos.Count)"
    chk "status = available"    ($r8.status -eq 'available')
    chk "price = 2500000"       ($r8.price  -eq '2500000')
    chk "photos still present"  ($r8.photos.Count -ge 4)
} catch { bad "Restore PUT failed" "$_" }

# ----------------------------------------------------------------
# Cleanup temp files
Remove-Item -Recurse -Force $TMPDIR -ErrorAction SilentlyContinue

# ----------------------------------------------------------------
Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "  TEST SUMMARY" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "  PASS: $($script:pass)" -ForegroundColor Green
if ($script:fail -gt 0) {
    Write-Host "  FAIL: $($script:fail)" -ForegroundColor Red
    Write-Host "  Some tests FAILED - see above for details." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "  FAIL: 0" -ForegroundColor Green
    Write-Host "  All tests passed!" -ForegroundColor Green
}
