# [WIP] How to run the solution locally

>**This is a draft and its format and content may change in future updates.**

>todo
>link the app registration of the configuration to how to run in azure appregistraiton

## Getting Started
The objective of this document is to explain the necessary steps to configure and run the Web Portal solution in a local environment. This includes:

  - [Install the Solution](#install-the-solution)
  - [Configure the Solution](#configure-the-solution)
  - [Run the Solution](#run-the-solution)
  - [Test the solution](#test-the-solution)

### Install the Solution

Go to the main directory of the solution open a command console in that directory and enter the command `npm i`. It will start the installation of the packages used by the solution which may take a few seconds.

|![npm i running](../common/images/installing.png)|
|:--:|
|*`npm i` command is running*|

Once finished you will notice that a directory called node_modules and a package-lock.json file have been created.

### Configure the Solution
To configure the solution open the `config.json` file located in the `public` folder of the solution's root directory and edit the following parameters:

```json
{
  "buildNumber": "0.0.0",
  "apiBaseUrl": "https://{{apiBaseUrl}}/api",
  "releaseDummyVariable": "empty",
  "msalConfig": {
    "spaClientId": "{{spaClientId}}",
    "apiClientId": "{{apiClientId}}",
    "groupId": "{{groupId}}",
    "authority": "https://login.microsoftonline.com/{{tenantId}}",
    "redirectUrl": "http://localhost:{{port}}"
  },
  "featureFlags": {
    "DISABLE_AUTHENTICATION": {
      "description": "Disable authentication flow when true",
      "isActive": {{isActive}}
    }
  }
}

```


Placeholder | Description 
---------|----------
 apiBaseUrl | Url on which the ManagementApi of the backend solution is listening (e.g: `localhost:8442` if the backend is running locally and the ManagementApi is listening on port 8442)
 isActive | `false` if authentication flow is required, `true` if authentication flow is not required. If the backend is running locally, the value must be `true`.

 If the backend is running on Azure and you want to enable authentication, you need to create the respective [App Registrations]() and complete the following in the configuration file, otherwise, leave the field empty `""`


Placeholder | Description 
---------|----------
 spaClientId | Client Id of the App Registration of this frontend solution.
 apiClientId | Client Id of the App Registration of the ManagementApi. 
 groupId | ObjectId of the group created on Azure. 
 tenantId | Azure account Tenant Id.
 port | Port on which the frontend solution is running, usually `3000`

### Run the Solution
Once the solution is configured to run, go to the root directory of the solution, open a command console and type the following command `npm run start`, a message like the following will appear and a new tab will open in the browser:

|![npm run start](images/starting_webportal.png)|
|:--:|
|*After entering the command `npm run start` the solution will start to run.*|

> Having the solution already configured, it will only be necessary to run the start command every time you want to use it.

Once the web portal finishes launching, the view of the opened tab in the browser will be refreshed showing the following:

|![Web Portal](images/webportal_running.png)|
|:--:|
|*Web Portal after startup is complete*|

### Test the solution

[Create](https://support.microsoft.com/en-us/office/schedule-a-meeting-in-teams-943507a9-8583-4c58-b5d2-8ec8265e04e5) a new microsoft teams meeting and join it.

|![Microsoft Teams Invite Link](../common/images/invite_link.png)|
|:--:|
|*Steps to copy the invite Link from Microsoft Teams*|

Once you have joined the meeting copy the invitation link from the meeting, we will use it to join the bot to that meeting.

In the Web Portal solution click on the `Join a Call` tab in the top menu, copy the Microsoft Teams Meeting Invitation Link to the `Invite URL` field and click on the `Join Call` button below.

|![Join call menu](../common/images/join_call.png)|
|:--:|
|*Complete the "Invitation Url" field with the Microsoft Teams meeting invitation link.*|

After a few seconds the bot will join the Microsoft Teams meeting and the call details will be displayed on the web portal.

|![Call details view](../common/images/call_details.png)|
|:--:|
|*When the bot joins, the call details will be displayed.*|