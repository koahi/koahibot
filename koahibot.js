// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

let recentList = [];
let userList = [];

//let chanceToWin = 90; //% chance to gain koahibux
let rateLimit = 3; //Minutes before user can gain koahibux again

setInterval(reduceTime, 60*1000); //1 minute interval

function reduceTime(){
  for(var key in recentList){
    if(recentList[key] > 0){
      recentList[key] -= 1;
    }
  }
  console.log("TIMER ACTIVATED RECENT LIST: ");
  console.log(recentList);
}

function readWallet(){
  var fs = require('fs');
  fs.readFile('../koahibot/koahibux/wallet.json', function(err,content){
    if(err){
      throw err;
    }
    return JSON.parse(content);
  });
}

function writeWallet(userID, money){

  var fs = require('fs');
  fs.readFile('../koahibot/koahibux/wallet.json', function(err,content){
    if(err){
      throw err;
    }
    wallet = JSON.parse(content);

    if(userID in wallet){
      wallet[userID] += money;
    }
    else{
      wallet[userID] = money;
    }

    fs.writeFile('../koahibot/koahibux/wallet.json', JSON.stringify(wallet), function(err){
      if(err){
        throw err;
      }
    });
  });
}

//var fs = require("fs");
//var walletFile = '/koahibux/wallet.txt';


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  //if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  //
  //KOAHIBUX
  //  

  let userID = message.member.user.id;
  let userName = message.member.user.username;

  //console.log(message.member.user);
  //console.log("MESSAGE: " + message.content);

  if(message.content.length >= 5 && message.content.substring(0,1) != "!") {

    console.log("USER: " + userID);
    if (!(userID in recentList) || recentList[userID] == 0){


      let chance = Math.floor((Math.random() * 1000) + 1);
      console.log("CHANCE: " + chance);
      if (chance <= 10){
        let money = Math.floor((Math.random() * 5) + 1);
        recentList[userID] = rateLimit;
        writeWallet(userID, money);
        message.channel.send("```" + userName + " has earned " + money + " koahibux!```");
      }
      else if (chance <= 40){
        let money = Math.floor((Math.random() * 2) + 1);
        recentList[userID] = rateLimit;
        writeWallet(userID, money);
        message.channel.send("```" + userName + " has earned " + money + " koahibux!```");
      }
      else if (chance <= 200){
        let money = Math.floor((Math.random() * 10) + 1)/100;
        recentList[userID] = rateLimit;
        writeWallet(userID, money);
        message.channel.send("```" + userName + " has earned " + money + " koahibux!```");
      }
    }
  }

  if(command === "wallet") {
    let userBalance = 0;
    var fs = require('fs');
    fs.readFile('../koahibot/koahibux/wallet.json', function(err,content){
      if(err){
        throw err;
      }
      let wallet = JSON.parse(content);
      if (userID in wallet){
        userBalance = wallet[userID].toFixed(2);
      }
      message.channel.send("```" + userName + " currently has " + userBalance + " koahibux!```");
    });
  }


  if(command === "tip") {
    let senderID = userID;
    let senderName = message.member.user.username;

    let receiver = message.mentions.members.first();
    if ( receiver ){
      let receiverID = receiver.user.id;
      let receiverName = receiver.user.username;

      let balance = parseFloat(args[1]).toFixed(2);
      let transferBalance = parseFloat(balance);
      console.log(senderID + " is transferring " + transferBalance + " koahibux to " + receiverID);
      console.log(typeof transferBalance);
      if (senderID && receiverID && (typeof transferBalance == 'number')){
        console.log("Passes all checks!");
        var fs = require('fs');
        fs.readFile('../koahibot/koahibux/wallet.json', function(err,content){
          if(err){
            throw err;
          }
          let wallet = JSON.parse(content);
          senderBalance = wallet[senderID];
          receiverBalance = wallet[receiverID];

          if (senderBalance < transferBalance){
            message.channel.send("```" + userName + " does not have enough koahibux to complete this transaction!```");
          }
          else if (senderBalance >= transferBalance){
            wallet[senderID] -= transferBalance;
            if (receiverID in wallet){
              wallet[receiverID] += transferBalance;
            }
            else if (!(receiverID in wallet)){
              wallet[receiverID] = transferBalance;
            }
              fs.writeFile('../koahibot/koahibux/wallet.json', JSON.stringify(wallet), function(err){
                if(err){
                  throw err;
                }
              });
            message.channel.send(senderName + " has given " + receiverName + " " + transferBalance + " koahibux!");
          }
        });
      }
    }
    else if ( !receiver ){
      message.channel.send("```Please enter a valid user. (Use tab complete)```");
    }

  }



  //
  //PRESTIGE COLOR
  //BOT COMMANDS
  //

  // Fills color roles array
  let colorRolesArray = [];

  let colorNamesArray = [ 'aquamarine',
                          'blue',
                          'coral',
                          'crimson',
                          'cyan',
                          'deeppink',
                          'green',
                          'ivory',
                          'khaki',
                          'lime',
                          'maroon',
                          'magenta',
                          'mistyrose',
                          'orange',
                          'purple',
                          'red',
                          'salmon',
                          'seagreen',
                          'teal',
                          'turquoise',
                          'violet',
                          'yellow'];

  let colorNames = colorNamesArray.join(", ");

  colorNamesArray.forEach(function(color){
    tempRole = message.guild.roles.find(role => role.name === color);
    colorRolesArray.push(tempRole);
  });

  function getRoleByName(temp){
    tempRole = message.guild.roles.find(role => role.name === temp);
    return tempRole;
  };
  
  if(command === "prestige") {
    let testUser = message.member;

    var userRoles = testUser.roles;
    var temp1 = userRoles.map(r => `${r.name}`).join(', ');
    userRoleNames = temp1.split(', ');
    console.log(userRoleNames);

    //console.log(args);

    if(!args[0]){
      message.channel.send("```Please pick from: " + colorNames + ".```");
    }

    if(colorNamesArray.includes(args[0])){

      var rolesToAdd = [];

      //removes all colors from user roles
      userRoleNames = userRoleNames.filter(function(item){
        return !colorNamesArray.includes(item);
      });

      userRoleNames.push(args[0]);

      console.log("NEW ROLES Names " + userRoleNames);

      userRoleNames.forEach(function(roleName){
        rolesToAdd.push(getRoleByName(roleName));
      });

      console.log("NEW ROLES Names " + userRoleNames);
      //console.log("NEW ROLES " + rolesToAdd);

      //adds array of roles to user
      testUser.setRoles(rolesToAdd).catch(console.error);;


      message.channel.send("```You have been reborn as "+ args[0] + "!```");
    }

    if(!colorNamesArray.includes(args[0]) && args[0]){
      message.channel.send("```You have chosen an incorrect color. Please pick from: " + colorNames + ".```");
    }


    //var allRoles = testUser.roles.map(r => `${r}`).join(' | ');
    var userRoles = testUser.roles;
    let userRolesNoColors = userRoles.filter(function(item){
      return !colorRolesArray.includes(item);
    });
    //message.channel.send("You are user "+ testUser);
    //message.channel.send("Leftover Roles: " + userRolesBW.map(r => `${r}`).join(' | ')).catch(console.error);
    //testUser.setRoles([testRole]).catch(console.error);;
  }
  
});

client.login(config.token);