function Stop-OnPowershellError {
    if ($error.count -gt 0) {
        Write-Host "Error: Something Wrong happened" -ForegroundColor red
        Exit
    }
}