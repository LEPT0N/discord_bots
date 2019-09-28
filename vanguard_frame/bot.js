
var Discord = require('discord.io');
var auth = require('./auth.json');
var bungie = require('./bungie.js');

var bot = new Discord.Client(
{
   token: auth.discord_key,
   autorun: true
});

bot.on('ready', function (evt)
{
    console.log('Connected');
    console.log('Logged in as: ' + bot.username + ' - (' + bot.id + ')');
    console.log('');
});

async function echo(channel_id, arguments)
{
    bot.sendMessage(
	{
        to: channel_id,
        message: '<' + arguments[0] + '>'
    });

    console.log('echoed <' + arguments[0] + '>');
}

async function get_last_played(channel_id, arguments)
{
	var displayName = arguments[0];

    var membershipId = await bungie.get_membership_id(displayName);

    console.log('membership ID for ' + displayName + ' is ' + membershipId);

    var dateLastPlayed = await bungie.get_date_last_played(membershipId);
    
    console.log('last played on ' + dateLastPlayed);

    bot.sendMessage(
	{
        to: channel_id,
        message: displayName + ' last played on ' + dateLastPlayed
    });
}

async function run_command(command, channel_id, arguments)
{
	console.log('start command');
	console.log(command);

	try
	{
		await command(channel_id, arguments);
	}
	catch (error)
	{
		var error_details = error.name + " : " + error.message;

		console.log(error_details);
		
		bot.sendMessage(
		{
			to: channel_id,
			message: error_details
		});
	}
	
	console.log('end command');
	console.log('');
}

bot.on('message', function (user, userID, channel_id, message, evt)
{
	var wake_command = '!frame.'

    if (message.substring(0, wake_command.length) == wake_command)
	{
        var arguments = message.substring(wake_command.length).split(' ');
        var command_string = arguments[0];
        arguments = arguments.splice(1);

        switch(command_string)
		{
            case 'echo': run_command(echo, channel_id, arguments); break;
			case 'get_last_played': run_command(get_last_played, channel_id, arguments); break;
         }
     }
});
