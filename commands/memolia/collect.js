const { createCanvas, loadImage } = require('canvas')
const { v4: uuidv4 } = require('uuid')
const { AttachmentBuilder } = require('discord.js')
const { postClient } = require('../../sanityClient')
// const axios = require('axios')
// const FormData = require('form-data')

const imageConfig = {
    width: 500,
    height: 500,
    borderWidth: 10,
    strokeWidth: 3,
    maxD: 490
}

const converedImage = img => {
    if(img.width > img.height){
        return {height: imageConfig.maxD * ( img.height / img.width ), width: imageConfig.maxD}
    } else {
        return {height: imageConfig.maxD, width: imageConfig.maxD / ( img.height / img.width )}
    }
}

module.exports= {
    name: "collect",
    description: "Add an image to memolia",    
    options: [
        {
            name: "image",
            type: 11,
            description: "The image you want to add to Landia",
        }
    ],
    async execute(interaction){
        await interaction.deferReply();
        
        const image = interaction.options.get("image")
        // console.log("interaction: ", interaction.user)
        
        try {
            const imageCanvas = createCanvas(imageConfig.width, imageConfig.height)
            const img = await loadImage(image.attachment.attachment)
            const converd = converedImage(img)
    
            const ctx = imageCanvas.getContext('2d')
            ctx.beginPath();
    
            ctx.rect(0, 0, 500, 500);
            ctx.fillStyle = "#ccddff";
            ctx.fill()
            
            ctx.lineWidth = imageConfig.borderWidth;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(0, 0, 500, 500);
            ctx.stroke()
            
            ctx.lineWidth = imageConfig.strokeWidth;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(
                imageConfig.width / 2 - converd.width / 2 - imageConfig.strokeWidth * 4, 
                imageConfig.height / 2 - converd.height / 2 - imageConfig.strokeWidth * 4, 
                converd.width + imageConfig.strokeWidth * 8 , 
                converd.height + imageConfig.strokeWidth * 8 
            );
            ctx.stroke()
    
            ctx.drawImage(img, imageConfig.width / 2 - converd.width / 2 , imageConfig.height / 2 - converd.height / 2, converd.width, converd.height)
            
      
            const userDoc = await postClient.fetch(`*[_type == "user" && id == "${interaction.user.id}"]`)
            if(userDoc[0]) {
                const post = await postClient.assets.upload('image', imageCanvas.toBuffer()).then(img=> {
                    const doc = postClient.patch(userDoc[0]._id).setIfMissing({images: []})
                        .insert('after', 'images[-1]',[{ 
                            _type: 'image',
                            _key: uuidv4(),
                            asset: {
                                _type: 'reference',
                                _ref: img._id,
                            }
                        }])
                        .commit()        
                })
                return void interaction.followUp({
                    content: `✅ Done !!. [https://we-three-world.cyclic.app/m?_id=${interaction.user.id}](https://we-three-world.cyclic.app/m?_id=${interaction.user.id})`,
                    files: [new AttachmentBuilder(imageCanvas.toBuffer())]
                });
            } else {
                const post = await postClient.assets.upload('image', imageCanvas.toBuffer()).then(img => postClient.create({
                    _type: "user",
                    id: `${interaction.user.id}`,
                    userName: `${interaction.user.username}`,
                    images: [{ 
                        _type: 'image',
                        _key: uuidv4(),
                        asset: {
                            _type: 'reference',
                            _ref: img._id,
                        }
                    }]
                }))

                return void interaction.followUp({
                    content: `✅ Done !!. [https://we-three-world.cyclic.app/m?_id=${interaction.user.id}](https://we-three-world.cyclic.app/m?_id=${interaction.user.id})`,
                    files: [new AttachmentBuilder(imageCanvas.toBuffer())]
                });
            }


        } catch (error) {
            console.log("error: " , error)
            return void interaction.followUp({content: "something is wrong"})
        }
       
    }
}