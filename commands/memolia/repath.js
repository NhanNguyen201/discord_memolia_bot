const { postClient } = require('../../sanityClient')

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
                        return void interaction.followUp({
                            content: `✅ Done !!. [https://we-three-world.cyclic.app/m?_id=${pathname}](https://we-three-world.cyclic.app/m?_id=${pathname}) .You can also use the old link`
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