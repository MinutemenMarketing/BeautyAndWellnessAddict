# Resize + re-encode source images to web-ready JPEG.
# Usage: powershell -File tools/optimize.ps1 -Source in.png -Dest out.jpg -MaxWidth 1400 -Quality 82
param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string]$Dest,
  [int]$MaxWidth = 1400,
  [int]$Quality = 82,
  [double]$TrimPct = 0    # percentage trimmed off each edge (removes generated film borders)
)

Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile((Resolve-Path $Source))

$inset = [int]([math]::Min($img.Width, $img.Height) * $TrimPct / 100)
$srcRect = New-Object System.Drawing.Rectangle $inset, $inset, ($img.Width - 2*$inset), ($img.Height - 2*$inset)

$w = $srcRect.Width; $h = $srcRect.Height
if ($w -gt $MaxWidth) {
  $scale = $MaxWidth / $w
  $w = [int]($w * $scale)
  $h = [int]($h * $scale)
}

$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode  = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.SmoothingMode    = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($img, (New-Object System.Drawing.Rectangle 0,0,$w,$h), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([int64]$Quality)

$bmp.Save((Join-Path (Get-Location) $Dest), $codec, $params)
$bmp.Dispose(); $img.Dispose()

$size = [math]::Round((Get-Item $Dest).Length / 1KB)
Write-Output "$Dest  ${w}x${h}  ${size} KB"
