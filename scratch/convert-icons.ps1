Add-Type -AssemblyName System.Drawing

# Load original image
$img = [System.Drawing.Image]::FromFile('g:\VinayCafe-POS-QR-Ordering\output_pos\icon-512.png')

# Create and save 512x512 PNG
$bmp512 = New-Object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save('g:\VinayCafe-POS-QR-Ordering\output_pos\icon-512.png.tmp', [System.Drawing.Imaging.ImageFormat]::Png)

# Create and save 192x192 PNG
$bmp192 = New-Object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save('g:\VinayCafe-POS-QR-Ordering\output_pos\icon-192.png', [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$g512.Dispose()
$bmp512.Dispose()
$g192.Dispose()
$bmp192.Dispose()
$img.Dispose()

# Rename temp file to replace original
Move-Item -Force 'g:\VinayCafe-POS-QR-Ordering\output_pos\icon-512.png.tmp' 'g:\VinayCafe-POS-QR-Ordering\output_pos\icon-512.png'

Write-Host "Success: Icons successfully converted to PNG formats!"
