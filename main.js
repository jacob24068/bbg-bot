//discord.js Initialization
const Discord = require("discord.js")
DiscordClient = new Discord.Client()
DiscordClient.login(process.env.BOT_TOKEN);

//pgSQL Initialization
const { Client } = require('pg');
const pgClient = new Client({connectionString: process.env.DATABASE_URL, ssl: true});

pgClient.connect();

pgClient.query(`SELECT * FROM userdata`, null, (err, res) => {
    if (!err) {
        saveData = JSON.parse(res.rows[0].info)
    }
})

//Config
const prefix = "!"
let saveData = {}

client.on("ready", () => {
    client.user.setPresence({ game: { name: `over Brice's server`, type: 3 } });
    const guild = client.guilds.get(`459074666137649162`)
    const notifications = client.channels.get(`459078238283497472`)
    const log = client.channels.get(`459077897525788692`)
    const welcome = client.channels.get(`459076914691309609`)
    const role = guild.roles.get(`460105041563615234`)
});

let progress
const alphabet = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"]

client.on("message", message => {
    progress++
    if (progress == 5) {
        progress = 0
        save()
    }
    if (message.channel.id == `459081091240689670`) {
        message.delete()
    }
    if (!saveData[message.author.id]) {
        saveData[message.author.id] = 0
    }
    saveData[message.author.id] = saveData[message.author.id] + 1
    if (saveData[message.author.id] > 2000 && !message.member.roles.some(r=>["Regular"].includes(r.name))){
        message.member.addRole(message.guild.roles.find('name', 'Regular'))
    }
    if (!message.guild) return
    if (message.author.bot) return
    if (config.responses[message.content.toLowerCase()]) return message.channel.send(config.responses[message.content.toLowerCase()])
    if (message.content.substr(0,prefix.length) != prefix) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    if (aliases[command]) return aliases[command](message, args)
})

const aliases = {
    "verify": verify,
    "points": points,
    "score": points,
    "savedata": forceSave,
    "forcesave": forceSave,
    "setpoints": setPoints,
    "notifications": streamnotifications,
    "streamnotifications": streamnotifications,
    "startpoll": poll,
    "poll": poll,
    "leaderboard": leaderboard,
    "top": leaderboard

}

function isElevated(guildMember){
    return guildMember.roles.some(r=>["Bot", "Moderator", "Adminstrator", "Brice"].includes(r.name))
}

function randomColor(){
    return Number("0x"+Math.floor(Math.random()*16777215).toString(16))
}

const save = function() {
    pgClient.query(`DELETE FROM userdata`, null, (err, res) => {
      if (err) {console.log(err.stack)}
    })
    pgClient.query(`INSERT INTO userdata(info) VALUES($1)`, [JSON.stringify(saveData)], (err, res) => {
      if (err) {console.log(err.stack)}
    })
}

function getUser(message, match){
    message.guild.members.array.forEach(user => {
        if (user.displayName.match(match)) {
            return user
        }
    });    
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function verify(message){
    if (message.channel.id != `459081091240689670`) return
    log.send(`${message.author} has verified at ${Date()}`)
    message.delete()
    welcome.send({
      "embed": {
        "title": `${message.member.displayName} joined.`,        
        "description": `${ordinal_suffix_of(message.guild.memberCount)} member.`,
        "color": 1542474,
        "fields": [{
            "name": "Joined BBG's Server",
            "value": new Date()
        },
        {
            "name": "Joined Discord",
            "value": message.author.createdAt
        }
    ],
        "thumbnail": {
          "url": message.author.displayAvatarURL
        }
      }
    })
    message.member.addRole(message.guild.roles.find("name", "Fan")).catch(console.error);
}

function points(message, args){
    if (args[0]) {
        let member = getUser(message, args[0])
        if (member) return message.channel.send({
            "embed": {
              "title": `${user.displayName} has ${saveData[user.id]} points.`,        
              "color": randomColor()
            }
          })
    }
    else if (message.mentions.members.first()) {
        message.channel.send({
            "embed": {
              "title": `${message.mentions.members.first().displayName}, you have ${saveData[message.mentions.members.first().id]} points.`,        
              "color": randomColor()
            }
          })
    }
    else{
        message.channel.send({
            "embed": {
              "title": `${message.member.displayName}, you have ${saveData[message.author.id]} points.`,        
              "color": randomColor()
            }
          })
    }
}

function forceSave(message){
    if (!isElevated(message.author)) return
    save()
    message.channel.send({
        "embed": {
          "title": `Finished.`,        
          "color": 1542474
        }
      })
}

function setPoints(message, args){
    if (!isElevated(message.author)) return
    let user
    if (args[1]) {
        user = getUser(message, args[0])
    }
    else if (message.mentions.members.first()) {
        user = message.mentions.members.first()
    }
    if (!user) return
    saveData[user.id] = args[1]
    message.channel.send({
        "embed": {
          "title": `Finished.`,        
          "color": 1542474
        }
      })
}

function streamnotifications(message){
    if (message.member.roles.some(r => ["StreamNotifications"].includes(r.name))) {
        message.member.removeRole(message.guild.roles.find('name', 'StreamNotifications'))
        message.channel.send({
            "embed": {
              "title": 'You will no longer be mentioned when Brice streams.',        
              "color": 12451840
            }
        })
    }else {
        message.member.addRole(message.guild.roles.find('name', 'StreamNotifications'))
        message.channel.send({
            "embed": {
              "title": 'You will now be mentioned when Brice streams.',        
              "color": 12451840
            }
        })
    }
}

function leaderboard(message, args){
    const keys = Object.keys(saveData);
    let newT = {}
    for(let i=0;i<keys.length;i++){
      let key = keys[i];
      newT[saveData[key]] = key
    }
    var arr = [];
    for (var prop in newT) {
        arr.push(newT[prop]);
    }
    const Length = arr.length - 1
    for(var i = 0; i <= 9; i++) {
    if (!message.guild.members.get(arr[a-i])) {
     delete saveData[arr[a-i]]
      }
    }
    const member = message.mentions.members.first()
    let number = args.slice(0).join(' ');
    if (member) {
      for (var i = 0, row; row = arr[i]; i++) {
        if (row == member.id) return message.channel.send(`${member.displayName} is in ${ordinal_suffix_of(arr.length-i)} place, with ${saveData[member.id].toLocaleString()} points.`)
      }
    }else if (number) {
      let b = arr.length
      if (arr[b - number]) {
        let mem = message.guild.members.get(arr[b-number])
        message.channel.send(` ${mem.displayName} is in ${ordinal_suffix_of(number)} place is, with ${saveData[mem.id].toLocaleString()} points.`)
      }else return message.channel.send(`There is no person in ${ordinal_suffix_of(number)} place.`)
    }else{
        let fields = []
        for (let i = 0; i <= 9; i++){
            if (arr[a-i]){
                fields.push({
                    "name": `${i+1} - ${String(message.guild.members.get(arr[a-i]).displayName)}`,
                    "value": `${saveData[arr[a-i]].toLocaleString()} points ${arr[i-1] && (`(Ahead ${(saveData[arr[a-i]] - saveData[arr[a-i-1]]).toLocaleString()} points)`)}`
                  })
            }
        }
    message.channel.send({
      "embed": {
        "title": "BBG Leaderboard",
        "color": randomColor(),
        "fields": fields
      }
    })}
}

function poll(message, args){
    if (!isElevated(message.author)) return
    let split = message.content.split('"')
    let items = []
    for (i = 1; i < split.length; i + 2) {
        items.push(split[i])
    }
    let fields = []
    message.delete()
    items.forEach(function(text, index){
      if (!index == 0) {
        fields.push({"name": "Option " + alphabet[index-1], "value": text.replace(`"`, "").replace(`"`, "")})
      }
    })
    message.channel.send({
      "embed": {
          "title": `${message.member.displayName} has started a poll.`,
          "description": `${items[1]}`,
          "color": randomColor(),
          "fields": fields
      }
    }).then(function(message){
      fields.forEach(function(a, index){
        message.react(alphabet[index])
      })
    })
}


//

client.on("presenceUpdate", (old, user) => {
    if (!user.roles.some(r => ["Brice"].includes(r.name))) return
    console.log(user.presence)
    let game = user.presence.game
    if (!game && streaming[user.id]) return delete streaming[user.id]
    if (!game) return
    if (!game.streaming && streaming[user.id]) return delete streaming[user.id]
    if (!game.streaming) return
    streaming[user.id] = true
    let username = game.url.split("/")[3]
    request(`https://api.twitch.tv/kraken/channels/${username}?client_id=${twitchid}`, function(err, res, body) {
        if (body) {
            if (!body) return
            let gamename = String(game.name)
            body = JSON.parse(body)
            role.setMentionable(true).then(function(){
              notifications.send('<@&460105041563615234>')
              role.setMentionable(false)
              notifications.send({
                  "embed": {
                      "title": `${user.displayName} has started streaming!`,
                      "description": `You can watch the stream [here](${game.url})`,
                      "color": Number("0x"+Math.floor(Math.random()*16777215).toString(16)),
                      "footer": {
                          "text": "*Information based on twitch and user settings."
                      },
                      "thumbnail": {
                          "url": body["logo"]
                      },
                      "fields": [{
                          "name": `Streaming "${game.name}"`,
                          "value": `Playing ${body["game"]}`
                      }]
                  }
              })
            })
        }
    })
})
client.on('guildMemberAdd', member => {
    log.send(`${member} has joined at ${new Date()}`)
});
client.on('guildMemberRemove', member => {
    log.send(`${member} has left at ${new Date()}`)
});
client.on('messageDelete', message => {
  log.send({
    "embed": {
      "title": `Message deleted`,
      "color": Number("0x"+Math.floor(Math.random()*16777215).toString(16)),
      "timestamp": new Date(),
      "fields": [{
        "name": `Message posted by ${message.author} in ${message.channel} deleted.`,
        "value": message.content
      }]
    }
  })
})
