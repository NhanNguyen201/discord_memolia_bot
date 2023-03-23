const { readdirSync } = require('fs');
const path = require('node:path');
const { Collection, REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.commands = new Collection();

const landiaCommandPath = path.join(__dirname, './memolia')
readdirSync(landiaCommandPath).filter(file => file.endsWith('.js')).forEach(file => {
    const filePath = path.join(landiaCommandPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command)
});

client.on('ready', async(client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    // client.application.commands.set(allCommandFiles)
    await rest.put( Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, process.env.DISCORD_SERVER_ID), { body: client.commands });
})