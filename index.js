require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');


global.client = new Client({ 
    intents: [
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates, 
      GatewayIntentBits.GuildMembers
    ],
});


require('./commands/loader')

client.on("interactionCreate", async (interaction) => {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;
  try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.DISCORD_TOKEN);