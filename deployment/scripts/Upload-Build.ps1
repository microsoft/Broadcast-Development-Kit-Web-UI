function Upload-Build {
    param(
        $source,
        $connectionString
    )

    az storage blob upload-batch --destination '$web' --source $source --connection-string $connectionString --overwrite true
}