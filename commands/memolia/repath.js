const { postClient } = require('../../sanityClient')
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports= {
    name: "repath",
    description: "The path you want to replace your _id to",    
    options: [
        {
            name: "path",
            type: 3,
            description: "The path you want to replace your _id to",
        }
    ],
    async execute(interaction){
        await interaction.deferReply();
        
        const pathname = interaction.options.get("path").value
        try {
            const userDoc = await postClient.fetch(`*[_type == "user" && id == "${interaction.user.id}"]`)
            if(userDoc[0]) {
                const otherdoc = await postClient.fetch(`*[_type == "user" && id != "${interaction.user.id}" && path == "${pathname}"]`)
                if(otherdoc[0]) {
                    return void interaction.followUp({
                        content: `Can't change to that path, it has been used`,
                    });
                } else {
                    postClient.patch(userDoc[0]._id).set({path: pathname}).commit().then(() => {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setLabel(`https://we-three-world.cyclic.app/m?_id=${pathname}`)
                                .setStyle('Link')
                                .setURL(`https://we-three-world.cyclic.app/m?_id=${pathname}`)
                                
                            );
                        return void interaction.followUp({
                            content: `✅ Done !!. You can vist this link below`,
                            components: [row] 
                        });
                    }) 
                }
            } else {
                return void interaction.followUp({
                    content: `You have no doc to change :((`,
                });
            }


        } catch (error) {
            console.log("error: " , error)
            return void interaction.followUp({content: "something is wrong"})
        }
       
    }
}