// Discord JS 
const Discord = require('discord.js');
const {MessageEmbed } = require('discord.js')
const client = new Discord.Client();
const randomEmoji = require('random-emoji');
const emojies = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]
const webScrape = require("./WebScrape")
let status = false




const request = require("request")
let fs = require(`fs`);
function download(url , name){
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream("mashgha/" + name));
}

const profileModel = require("./models/profilesSchema")

const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://yazdan:yazdan2014@discordbot.s3u0u.mongodb.net/Discord?retryWrites=true&w=majority" ,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
}).then(()=>{ 
    console.log("connected to the data base")
}).catch( err => console.log(err))


let worker = {
    "username": "",
    "password": "",
    "user_id": "",
    "name": "",
    "file_name": "",
    "home_work_set": "",
    "userid": ""
  }

client.once('ready', () => {
    console.log('Ready ');
})

let homeworkAndEmoji = []
let emojiesUsed = []

let counter = 0

let animatorStatus = true



client.on('message' , (message) => {
    // if(message.content == "base" || message.content == "base dige"){
    //     animatorStatus = false
    // }
    // if(message.content == "$joftak"){
    //     function animator(msg){
    //         if(animatorStatus){
    //             msg.edit("⏳")
        
    //             setTimeout(function(){msg.edit("⌛");setTimeout(animator , 1000)} ,1000)
                
    //         }else{
    //             animatorStatus = false
    //         }
    //     }
    //     message.channel.send("⌛").then(msg =>{
    //         animator(msg)            
    //     })
    // }

    if(message.content == "$who"){
        var model = profileModel

        model.find({userId:message.author.id}).then(( obj , err)=> {    
            if (!err){
                message.channel.send(obj[0].name )
            }else{
                message.channel.send("you haven't signed up yet")
            }
        }) 
    }

    if(message.content == "$help"){
        message.channel.send("Use the following piece of command to signup: \n ```html\n$singup\n<username>\n<password>\n<name>```")
    }

    if(message.content.includes("$signup")){
        let info = message.content.split("\n")
        let username_str = info[1]
        let password_str = info[2]
        let name_str = info[3]

        if(username_str && password_str && name_str){
            var model = profileModel()
            model.userId = message.author.id
            model.username = username_str
            model.password = password_str
            model.name = name_str
            model.save((err, doc )=> {
                if(!err){
                    message.channel.send(`You just Signed Up as "${name_str}" , with username of "${username_str}" and password of "${password_str}"`)
                }else{
                    message.channel.send("You have already signed up")
                }
            })
        }else{
            message.channel.send("You didn't use a correct input form please try again")
        }
    }

    if(message.content == "$uploadsts"){
        message.channel.send(worker.home_work_set)
    }

    if(message.content == "$on"){
        if(status == false){
            status = true
            message.channel.send("hajit oomad hame shalvara payin vaselin amadas")
        }
        else{
            message.channel.send(" roshane")
        }
    }

    if(message.content == "$off"){
        if(status == true){
            status = false
            message.channel.send("base dige lasho looshetoono jam konid dokme konid man raftam khaab felan bye")
        }
        else{
            message.channel.send("kooni man khaabam das namal")
        }
    }


    if(message.content.toLowerCase() == "$set"){
        message.channel.send("Please wait while mashgha is being fetched...").then(msg => {
            let random_emoji = randomEmoji.random({count:1})
            let finalMashghaMsg = ""
            webScrape.getMashgha(msg).catch(err => console.log("mame" + err)).then(mashgha => {
                if(mashgha){
                    mashgha.forEach(r => {
                        finalMashghaMsg += "\n"+ random_emoji[0].character + r.topic + "\n" ;
        
                        r.homework.forEach(r=>{
                            finalMashghaMsg += `${emojies[counter]}` + r.toString() + "\n\n";
                            let masghAndEmoji =[emojies[counter] , r.toString()]
                            homeworkAndEmoji.push(masghAndEmoji)
                            counter++;
                        });
                    })

                    let embed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setTitle("چربش کن که اومد 🧼")
                    .setDescription(finalMashghaMsg)
                    .setImage("attachment://screenshot_set.png")

                    message.channel.send({embed , files : ["screenshot_set.png"]})
                    .then(msgToReact=>{
                        for(let i=0 ; i<=counter-1;i++){
                            msgToReact.react(emojies[i])
                            emojiesUsed.push(emojies[i])
                        }
                        counter = 0
                
                        const filter = (reaction, user) => {
                            return emojiesUsed.includes(reaction.emoji.name) && user.id !== "740834714604142675";
                        };
                        
                        msgToReact.awaitReactions(filter,{  max: 1, time: 60000, errors: ['time'] })
                            .then(collected => {
                                const reaction = collected.first();
                                homeworkAndEmoji.forEach(r =>{
                                    if(r[0] == reaction.emoji.name){
                                        worker.home_work_set = r[1]
                                        msgToReact.channel.send(`\nHomework uploading is now set on: \n\n ${r[0]} \n ${r[1]}`)
                                        homeworkAndEmoji = []
                                    }
                                })
                                
                            })
                            .catch(collected => {
                                message.reply('you ran out of time');
                            });
                    })
                }else{
                    message.channel.send("ye margish shod dobare emtehan kon")
                }
            })
        })        
    }

    if (message.attachments.first() && status){

        var model = profileModel

        model.find({userId:message.author.id}).then((obj ,err) => {    
            if (!err){
                let username 
                let password 
                let name
                let homework_text = worker.home_work_set
                username = obj[0].username
                password = obj[0].password
                name = obj[0].name

                message.channel.send(`hello ${name}! ${username}`)

                let file_name = `${name}.${message.createdAt.getUTCMonth().toString()}${message.createdAt.getUTCDay().toString()}${message.createdAt.getUTCHours().toString()}${message.createdAt.getUTCMinutes().toString()}${message.createdAt.getUTCSeconds().toString()}.pdf`
                console.log(name + " just used the bot")

                message.react("✅")
                message.react("⛔")
                const filter = (reaction, user) => {
                    return ["✅","⛔"].includes(reaction.emoji.name) && user.id === message.author.id;
                };
                
                message.awaitReactions(filter,{ max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
                        if(reaction.emoji.name == "✅"){
                            download(message.attachments.first().url , file_name)
                            message.channel.send("please wait while the file is being uploaded... ( HAJIT DARE CHOSI MIAD MASALN MAN YE BOTE KHAFANAM) bia boro to koonam baba sab kon alan file kirito upload mikonam")
                            .then( msg => {
                                webScrape.uploadMasgha(username , password , name, homework_text, file_name , msg)
                                .then(r=>{
                                    if(r){
                                        let embed = new MessageEmbed()
                                        .setColor('#00FF00')
                                        .setTitle("Done ✅")
                                        .setDescription("vazeline malide shod")
                                        .setImage("attachment://screenshot_upload.png")
                                        msg.delete()
                                        message.channel.send({embed , files : ["screenshot_upload.png"]})
                                    }else{
                                        message.channel.send("ye margish shod dobare emtehan kon")
                                    }
                                })
                            })
                        }
                        if (reaction.emoji.name == "⛔") {
                            message.channel.send("KOONKESH ISGA KARDI ??")
                        }
                    })
                    .catch(collected => {
                        message.reply('you ran out of time');
                    });
            }else{
                message.channel.send("you haven't signed up yet")
            }
        })
    }
})
client.login("NzQwODM0NzE0NjA0MTQyNjc1.XyuyGA.YU-yPGlWcRi6lTOCM0qKWuv1LpI");