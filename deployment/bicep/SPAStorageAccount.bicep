@description('Location for all resources.')
param location string = resourceGroup().location

@description('The base name of the web app.')
param storageAccountName string

var commonTags = {
  Service: storageAccountName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2019-04-01' = {
  name: storageAccountName
  location: location
  tags: commonTags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
}
