# Automatisk upload af Trøjborg-appen til One.com
$ftpHost = "ftp.trojborgappen.dk"
$username = "trojborgappen.dk"

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  AUTOMATISK UPLOAD TIL ONE.COM (trojborgappen.dk)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

$password = Read-Host -Prompt "Indtast din One.com FTP adgangskode"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "Ingen adgangskode indtastet. Annullerer." -ForegroundColor Red
    exit
}

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$files = @("index.html", "app.js", "notifications.css", "push-notifications.js")
$localDir = "C:\Users\hpj82\.openclaw\workspace\trojborg-appen"

foreach ($file in $files) {
    $localPath = Join-Path $localDir $file
    if (-not (Test-Path $localPath)) {
        Write-Host "Fejl: Kunne ikke finde $localPath" -ForegroundColor Red
        continue
    }

    $uri = "ftp://$ftpHost/$file"
    Write-Host "Uploader $file -> $ftpHost ..." -ForegroundColor Yellow
    try {
        $ftp = [System.Net.FtpWebRequest]::Create($uri)
        $ftp.Credentials = New-Object System.Net.NetworkCredential($username, $password)
        $ftp.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftp.UseBinary = $true
        $ftp.UsePassive = $true

        $content = [System.IO.File]::ReadAllBytes($localPath)
        $ftp.ContentLength = $content.Length
        $requestStream = $ftp.GetRequestStream()
        $requestStream.Write($content, 0, $content.Length)
        $requestStream.Close()

        $response = $ftp.GetResponse()
        Write-Host "  -> Succes: $file blev overført!" -ForegroundColor Green
        $response.Close()
    } catch {
        Write-Host "  -> Fejl ved upload af $file: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "FERDIG! Genindlæs nu trojborgappen.dk i din browser." -ForegroundColor Green
