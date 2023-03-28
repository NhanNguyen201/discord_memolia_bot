require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const { readdirSync } = require('fs');
const path = require('node:path');

const { Collection, REST, Routes } = require('discord.js');
// const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const repathCommand = require('./commands/memolia/repath')
const collectCommand = require('./commands/memolia/collect')

// global.client = new Client({ 
//     intents: [
//       GatewayIntentBits.GuildMessages, 
//       GatewayIntentBits.Guilds, 
//       GatewayIntentBits.MessageContent,
//       GatewayIntentBits.GuildVoiceStates, 
//       GatewayIntentBits.GuildMembers
//     ],
// });
const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const { description } = require('./commands/memolia/collect');

const app = express();

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${process.env.DISCORD_TOKEN}`
  }
});

// require('./commands/loader')

// client.on("interactionCreate", async (interaction) => {
//   const command = interaction.client.commands.get(interaction.commandName);
//   if (!command) return;
//   try {
// 		await command.execute(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// });
app.post('/interactions', verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const cmds = [collectCommand, repathCommand]
    const cmd = cmds.find(c => c.name == interaction.data.name)
    if(cmd) {
      await cmd.execute(interaction)
    }
  }

});


app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    collectCommand,
    repathCommand
  ].map(cmd => ({name: cmd.name,type: cmd.type, description: cmd.description }))
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${process.env.DISCORD_APP_ID}/guilds/${process.env.DISCORD_SERVER_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e)
    console.error(e.response?.data)
    return res.send(`${e.code} error from discord`)
  }
})
app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})


app.listen(process.env.PORT || 8999, () => {
  console.log("running")
})