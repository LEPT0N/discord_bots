
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

	// easy testing
	// run_command(get_emblems, 0, ['LEPT0N']);
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

async function get_emblems(channel_id, arguments)
{
	var displayName = arguments[0];

    var player = await bungie.search_destiny_player(displayName);

	var character_ids = await bungie.get_character_ids(player);

	for (var index = 0; index < character_ids.length; index++)
	{
		var character = await bungie.get_character(player, character_ids[index]);

		var emblem = 'https://www.bungie.net' + character.emblemPath;

		console.log('emblem = ' + emblem);

		bot.sendMessage(
		{
			to: channel_id,
			message: emblem
		});
	}
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
			case 'get_emblems': run_command(get_emblems, channel_id, arguments); break;
         }
     }
});
