$BASE = "http://localhost:8787"

# Build a minimal multipart body with a 4-byte JPEG stub
$jpeg = [byte[]]@(0xFF,0xD8,0xFF,0xD9)
$bnd = "TestBnd123"
$enc = [System.Text.Encoding]::UTF8
$ms = [System.IO.MemoryStream]::new()

$hdr = "--$bnd`r`nContent-Disposition: form-data; name=`"files`"; filename=`"test.jpg`"`r`nContent-Type: image/jpeg`r`n`r`n"
$hb = $enc.GetBytes($hdr)
$ms.Write($hb, 0, $hb.Length)
$ms.Write($jpeg, 0, $jpeg.Length)
$crlf = $enc.GetBytes("`r`n")
$ms.Write($crlf, 0, $crlf.Length)
$tail = $enc.GetBytes("--$bnd--`r`n")
$ms.Write($tail, 0, $tail.Length)
$bytes = $ms.ToArray()

Write-Host "=== Multipart body (as text) ==="
Write-Host ([System.Text.Encoding]::UTF8.GetString($bytes))
Write-Host "=== Body length: $($bytes.Length) bytes ==="
Write-Host ""

Write-Host "=== Sending to worker ==="
try {
    $r = Invoke-WebRequest -Method POST `
        -Uri "$BASE/api/listings/1/photos" `
        -ContentType "multipart/form-data; boundary=$bnd" `
        -Body $bytes `
        -ErrorAction Stop
    Write-Host "Status : $($r.StatusCode)"
    Write-Host "Body   : $($r.Content)"
} catch {
    Write-Host "HTTP Error: $($_.Exception.Response.StatusCode.value__)"
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Response body: $($reader.ReadToEnd())"
}
