$backendRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\aptigen-backend"))
$yamlPath = Join-Path $backendRoot "src\main\resources\application.yaml"
$yaml = [System.IO.File]::ReadAllText($yamlPath)

if ($yaml -notmatch '(?m)^\s*max-file-size:') {
    $springHeader = [regex]::new('(?m)^spring:[ \t\r]*$')
    if (-not $springHeader.IsMatch($yaml)) {
        throw "Could not find the spring section in application.yaml."
    }
    $replacement = "spring:`r`n  servlet:`r`n    multipart:`r`n      max-file-size: 100MB`r`n      max-request-size: 1GB`r`n      file-size-threshold: 2MB"
    $yaml = $springHeader.Replace($yaml, $replacement, 1)
    [System.IO.File]::WriteAllText($yamlPath, $yaml, [System.Text.UTF8Encoding]::new($false))
}
