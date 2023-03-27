require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const { readdirSync } = require('fs');
const path = require('node:path');
const { Collection, REST, Routes } = require('discord.js');
// const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);


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
    console.log(interaction.data.name)
    if(interaction.data.name == 'yo'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if(interaction.data.name == 'dm'){
      let c = (await discord_api.post(`/users/@me/channels`,{
        recipient_id: interaction.member.user.id
      })).data
      try{
        let res = await discord_api.post(`/channels/${c.id}/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
        console.log(res.data)
      }catch(e){
        console.log(e)
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          content:'👍'
        }
      });
    }
  }

});


app.get('/register_commands', async (req,res) =>{
  const commands = new Collection();

  const landiaCommandPath = path.join(__dirname, './commands/memolia')
  readdirSync(landiaCommandPath).filter(file => file.endsWith('.js')).forEach(file => {
      const filePath = path.join(landiaCommandPath, file);
      const command = require(filePath);
      commands.set(command.name, command)
  });
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${process.env.DISCORD_APP_ID}/guilds/${process.env.DISCORD_SERVER_ID}/commands`,
      commands
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


app.listen(8999, () => {
  console.log("running")
})