## Attention

If you're landing on this for the first time without previously setting up the module for your azerothcore this is becomes irrelavant.

Please check: [mod-chat-transmitter](https://github.com/azerothcore/mod-chat-transmitter)

## Introduction

This is the backbone of the previous setup of the module, this what makes the Discord Bot and the Websocket work all together.

This guide was made for and tested on a Windows 10 machine.

## Requirements

You will need to install [Node.js](https://nodejs.org/) If you don't know which one, LTS should do the job for you.

Note: After installing to check if you have Node JS installed just run the following command in your CMD (you shouldnt need to execute as admin) `node -v` if this shoots a message with number like `v20.17.0` it means it's installed correctly. If you get any errors please search for error given in google and you should be all good.

## Setup

1) Download this repo that we are in.

2) Extract it / place it in a folder that's not a system folder. (Not Users, Documents, Programs etc...) 

3) Open your CMD and navigate to the folder you just extracted or placed.

Example: `C:\Users\<User>\Desktop\chat-transmitter-bot`

Note: If you go to the folder and copy the Directory on top (like it was a link on your browser) makes i easier to use CMD for navigation if you're not used to.

Following command into your CMD `cd <paste whatever you copied here>` than enter and it should say that folder now.

4) Type the following commands:
    - `npm i` This will install the necessary despendencies.
    - `npm run build` This will build the project.
    
After tihs keep the CMD window opened!

5) Make a copy of your `config.default.json` and renamed it to `config.json`

| Name | Description 
| --- | --- |
| wsPort | Port used by the Websocket should this should match the same value in the config module.
| secretKey | Discord Bot token |
| discordClientId | Discord Bot's ID | |
| discordToken | Discord Bot token |

6) When you're done enditing the file, back to the CMD and run the following `npm run migration:run` and your sqlite databse should be intialised. 

7) Now that the db is intialised we will add / register the commands to our bot by running the following command `npm run registercommands`

All of the above are 1 time setup. Only if there would be any changes than you need to repeat the steps above.

8) `npm start` is the command you will run everytime you want to start this bot.

If everything went alright it show something similiar like this
```
WebSocket server is listening on <IPv4:Port>.
HTTP Server is listening on <IPv4:Port>.
Discord bot ready! Logged in as <Discord Bot Name>
Invite link: <Discord oauth2 bot Link>
```

If the bot you've created previously is in any Discord Server he should be right now online (if you didn't changed their visibility status). This is the main program that keeps the bot "online" and allow it to do multiple amount of functionalities.

9) Run your worldserver

You should get a message in the end when is done saying the following `[ModChatTransmitter] Connected to WebSocket server.`

10) Try the bot command in your discord server!

Note: that you may need to screw around with the settings, permissions and intregation of the bot in your server.

## Commands

Commands are yet not documenated here

They will be eventually added here or another tab like the readme up there.

Until then try the commands around in your server!

## Show some love

If you appreciate this Module buy the author a [coffee](https://ko-fi.com/roboto).

Thanks Roboto for this!
-Ryan