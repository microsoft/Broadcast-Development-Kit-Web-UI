param(
    $config = "config.json"
)

$error.clear()

if(-not (Test-Path -Path $config)){
    Write-Host "'${config}' configuration file must be specified." -ForegroundColor red
    Exit
}

$configuration = Get-Content $config | ConvertFrom-Json
$serviceName = $configuration.name
if (-not $serviceName){
    Write-Host "Error: A name must be specified in the configuration settings." -ForegroundColor red
    Exit
}

$managementResourceGroup = $configuration.managementResourceGroup
if ( -not $managementResourceGroup){
    $managementResourceGroup = "${serviceName}-rg"
    Write-Host "INF: A name for the management resource group was not provided, using default: $managementResourceGroup" -ForegroundColor yellow
}

$appServiceName = $configuration.appServiceName
if ( -not $appServiceName ) {
    $appServiceName = "${serviceName}-api"
    Write-Host "INF: A name for the app service was not provided, using default: $appServiceName" -ForegroundColor yellow
}

$storageAccountName = $serviceName.replace('-', '') + "portal"

$managementApiClientAppId = $configuration.managementApiClientAppId
if ( -not $managementApiClientAppId ) {
    $managementApiClientAppName = "${serviceName}-management-api"  
    $appReg=az ad app list --display-name $managementApiClientAppName | ConvertFrom-Json
    if($appReg[0].displayName -eq $managementApiClientAppName ){
        $managementApiClientAppId = $appReg[0].appId
    }else{
        Stop-OnPowershellError
        Exit
}
}

. ".\scripts\Stop-OnPowershellError.ps1"
. ".\scripts\Create-SPAAppReg.ps1"
. ".\scripts\Enable-StaticWebsite.ps1"
. ".\scripts\Add-SPARedirectUri.ps1"
. ".\scripts\Build-SPA.ps1"
. ".\scripts\Upload-Build.ps1"
. ".\scripts\ConFigure-CORS.ps1"

Write-Host "`n1/7 Deploying SPA Resources.." -ForegroundColor white -BackgroundColor black
$spaResourcesCreated = az deployment group create --resource-group $managementResourceGroup `
    --template-file "bicep\SPAStorageAccount.bicep" `
    --parameters storageAccountName=$storageAccountName

if(-not $spaResourcesCreated){
    Write-Host "The creation of the resoures failed" -ForegroundColor red
    Exit
}

Write-Host "Completed`n" -ForegroundColor green

$storageConnectionString = az storage account show-connection-string --name $storageAccountName --resource-group $managementResourceGroup --query connectionString

Write-Host "`n2/7 Creating SPA App Regisstration.." -ForegroundColor white -BackgroundColor black
$spaAppRegResult = Create-SPAAppReg -serviceName $serviceName -appName $configuration.spaAppName -managementApiClientAppId $managementApiClientAppId | ConvertFrom-Json

Stop-OnPowershellError
Write-Host "Completed`n" -ForegroundColor green

Write-Host "`n3/7 Enabling Static Website.." -ForegroundColor white -BackgroundColor black
$enableStaticWebiteReult = Enable-StaticWebsite -storageAccountName $storageAccountName

Stop-OnPowershellError
Write-Host "Completed`n" -ForegroundColor green

Write-Host "`n4/7 Adding SPA Redirect URI.." -ForegroundColor white -BackgroundColor black
$addSpaRedirectUriResult = Add-SPARedirecUri -storageAccountName $storageAccountName -managementResourceGroup $managementResourceGroup -spaAppOID $spaAppRegResult.spaAppOID

Stop-OnPowershellError
Write-Host "Completed`n" -ForegroundColor green

Write-Host "`n5/7 Building Spa Solution.." -ForegroundColor white -BackgroundColor black
$tenantId = az account show --query homeTenantId | ConvertFrom-Json
$buildResult = Build-SPA -buildPath "..\build" `
        -apiBaseUrl $apiBaseUrl `
        -spaClientId $spaAppRegResult.appId `
        -managementApiClientAppId $configuration.managementApiClientAppId `
        -tenantId $tenantId `
        -redirectUri $addSpaRedirectUriResult `
        -managementResourceGroup $managementResourceGroup `
        -appServiceName $appServiceName

Stop-OnPowershellError
Write-Host "Completed`n" -ForegroundColor green

Write-Host "`n6/7 Uploading Spa Solution to Storage.." -ForegroundColor white -BackgroundColor black
$uploadResult = Upload-Build -source "..\build" `
        -connectionString $storageConnectionString

Stop-OnPowershellError
Write-Host "Completed`n" -ForegroundColor green

Write-Host "`n7/7 Configuring CORS.." -ForegroundColor white -BackgroundColor black
$configureCORSRessult = ConFigure-CORS -managementResourceGroup $managementResourceGroup -redirectUri $addSpaRedirectUriResult -appName $appServiceName

Stop-OnPowershellError
Write-Host "Completed`n" -ForegroundColor green

Start-Process "${addSpaRedirectUriResult}"