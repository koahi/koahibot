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


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Fills color roles array
  let colorRolesArray = [];

  let colorNamesArray = [ 'coral',
                          'cyan',
                          'green',
                          'lime',
                          'maroon',
                          'magenta',
                          'orange',
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
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "test1") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

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