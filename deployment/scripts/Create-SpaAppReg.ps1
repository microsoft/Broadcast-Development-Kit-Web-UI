function Create-SPAAppReg {
    param (
        $appName,
        $serviceName,
        $managementApiClientAppId
    )

    if (-not $appName) {
        $appName = "${serviceName}-spa-app"
        Write-Host "INF: App Registration name was not provided, using default: $appName" -ForegroundColor yellow
    }

    $oautPermissionId = az ad app show --id $managementApiClientAppId --query "api.oauth2PermissionScopes[].id" --output tsv
    $requiredResourceAccess = '[{"resourceAppId":"00000003-0000-0000-c000-000000000000","resourceAccess":[{"id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d","type":"Scope"}]},{"resourceAppId":"'+$managementApiClientAppId+'","resourceAccess":[{"id":"'+$oautPermissionId+'","type":"Scope"}]}]' | ConvertTo-Json 

    Write-Host "Creating app registration.." -ForegroundColor green
    $appId = $(az ad app create `
        --display-name $appName `
        --sign-in-audience AzureADMultipleOrgs `
        --enable-access-token-issuance true `
        --enable-id-token-issuance true `
        --required-resource-accesses $requiredResourceAccess `
        --query appId `
        --output tsv)

    $azAppOID = (az ad app show --id $managementApiClientAppId | ConvertFrom-JSON).id
    $accesstoken = (az account get-access-token --resource-type ms-graph --query accessToken --output tsv)
    $header = @{
        'Content-Type' = 'application/json'
        'Authorization' = 'Bearer ' + $accesstoken
    }

    $bodyAPIAccess = @{
        'api' = @{
            'knownClientApplications' = @($appId)
        }
    }|ConvertTo-Json -d 3

    $invokeResult = Invoke-RestMethod -Method PATCH -Uri "https://graph.microsoft.com/v1.0/applications/$azAppOID" -Headers $header -Body $bodyAPIAccess 

    Write-Host "Creating Service Principal.." -ForegroundColor green
    $sp = az ad sp create --id $appId
    
    $spaAppOID = (az ad app show --id $appId | ConvertFrom-JSON).id

    $result = '{"appId":"'+$appId+'", "spaAppOID": "'+$spaAppOID+'"}'
    Write-Output $result
}
