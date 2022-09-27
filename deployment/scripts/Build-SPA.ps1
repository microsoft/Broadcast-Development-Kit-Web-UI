function Build-SPA {
    param(
        $buildPath,
        $spaClientId,
        $managementApiClientAppId,
        $tenantId,
        $redirectUri,
        $appServiceName,
        $managementResourceGroup
    )
    Write-Host "Getting api base url.." -ForegroundColor green
    $defaultHostName = (az webapp show --name $appServiceName --resource-group $managementResourceGroup --query defaultHostName --output tsv)
    $apiBaseUrl = "https://${defaultHostName}/api"
    
    cd..
    npm i
    npm run build
    cd deployment
    
    Write-Host "Setting config.json file.." -ForegroundColor green
    $configSrc = $buildPath + "\\config.json"
    $configObject = Get-Content $configSrc | Out-String | ConvertFrom-Json

    $configObject.apiBaseUrl = $apiBaseUrl
    $configObject.msalConfig.spaClientId = $spaClientId
    $configObject.msalConfig.apiClientId = $managementApiClientAppId
    $configObject.msalConfig.authority = "https://login.microsoftonline.com/${tenantId}"
    $configObject.msalConfig.redirectUrl = $redirectUri
    $configObject.msalConfig.groupId = ""
    $configObject.featureFlags.DISABLE_AUTHENTICATION.isActive = $false

    $configObject | ConvertTo-Json -Depth 100 | Out-File $configSrc
}