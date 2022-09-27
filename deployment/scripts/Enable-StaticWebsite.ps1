function Enable-StaticWebsite {
    param (
        $storageAccountName
    )

    az storage blob service-properties update --404-document error.html `
        --account-name $storageAccountName `
        --index-document index.html `
        --static-website true `
        --auth-mode login
}