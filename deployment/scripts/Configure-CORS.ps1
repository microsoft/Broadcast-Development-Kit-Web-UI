function Configure-CORS {
    param(
        $managementResourceGroup,
        $appName,
        $redirectUri
    )

    if($redirectUri.substring($redirectUri.length - 1 ) -eq '/'){
        $redirectUri = $addSpaRedirectUriResult -replace ".$"
    }

    $allowedOriginsRessult = az webapp cors add -g $managementResourceGroup -n $appName --allowed-origins $redirectUri
}
