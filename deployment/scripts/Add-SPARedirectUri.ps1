function Add-SPARedirecUri {
    param(
        $storageAccountName,
        $managementResourceGroup,
        $spaAppOID
    )

    Write-Host "Getting primary endpoint.." -ForegroundColor green
    $primaryEndpoint = az storage account show -n $storageAccountName -g $managementResourceGroup --query primaryEndpoints.web

    Write-Host "Setting the primary endpoint in the redirect uri.." -ForegroundColor green
    $accesstoken = (az account get-access-token --resource-type ms-graph --query accessToken --output tsv)
    $header = @{
        'Content-Type' = 'application/json'
        'Authorization' = 'Bearer ' + $accesstoken
    }

    $redirectUri = $primaryEndpoint.replace('"', '')

    $bodyAPIAccess = @{
        'spa' = @{
            'redirectUris' = @($redirectUri)
        }
    }|ConvertTo-Json -d 3

    $invoeResult = Invoke-RestMethod -Method PATCH -Uri "https://graph.microsoft.com/v1.0/applications/$spaAppOID" -Headers $header -Body $bodyAPIAccess 
    Write-Output $redirectUri
}