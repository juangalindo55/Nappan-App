$port = 8080
$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Servidor iniciado en http://localhost:$port/"
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        $localPath = $req.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        $filePath = Join-Path $root ($localPath.TrimStart("/"))
        try {
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $res.ContentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css" }
                    ".js"   { "application/javascript" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    default { "application/octet-stream" }
                }
                $res.ContentLength64 = $bytes.Length
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $res.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $res.ContentLength64 = $msg.Length
                $res.OutputStream.Write($msg, 0, $msg.Length)
            }
        } catch {
            # Client disconnected or write error - ignore and continue
        } finally {
            try { $res.OutputStream.Close() } catch {}
        }
    } catch {
        # Listener error - ignore and continue
    }
}
