# How to run the solution in Azure (with scripts)

## Prerequisites

* [Install Azure CLI v 2.40](https://docs.microsoft.com/en-us/cli/azure/)
* [Install NodeJs](https://nodejs.org/en/)

## Running the scripts

1. Create a config.json file with the following values in the deployment folder.
    ```json
    {
        "name": "{{name}}",
        "managementResourceGroup":"{{managementResourceGroup}}",
        "spaAppName": "{{spaAppName}}",
        "managementApiClientAppId": "{{managementApiClientAppId}}",
        "appServiceName": "{{appServiceName}}"
    }
    ```
    Placeholder | Value |
    ---------|----------|
    {{name}} | Used to create the resources, should not exceed 15 characters length eg: `projectName`. |
    {{managementResourceGroup}} | Name of the resource group where the management resources will be deployed. |
    {{spaAppName}} | Name of the app registration that will be created for the SPA. |
    {{managementApiClientAppId}} | Client Id of `Management Api App Registration` created previously in the backend solution deployment. |
    {{appServiceName}} | Name of `App Service` created previously in the backend solution deployment. |

>Note: if you have deployed the backend with the scripts, you can simply fill the `name` parameter with the same `name` used in the `config.json` of the backend and leave the rest of the properties empty.

2. Open a powershell console in the `deployment` path of the solution and [sign in](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli) using `az login`. Select the same subscription where you deploy the backend resources.

3. Run the Deploy-WebUI.ps1 script