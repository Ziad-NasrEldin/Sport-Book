Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$width = 1920
$height = 1080

$screenshot = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($screenshot)
$graphics.CopyFromScreen(0, 0, 0, 0, (New-Object System.Drawing.Size($width, $height)))

$outputPath = "E:\GitHub\Sport-Book\signup-page.png"
$screenshot.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$screenshot.Dispose()

Write-Host "Screenshot saved to $outputPath"