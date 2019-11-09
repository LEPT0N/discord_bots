
var discord = require('discord.io');
var auth = require('./auth.json');
var bungie = require('./bungie.js');
var util = require('./util.js');
var roster = require('./roster.js');
var leaderboard = require('./leaderboard.js');

var bot = new discord.Client(
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
	// run_command(get_triumph_score, 0, ['CoachMcGuirk S8', 'xboxLive']);
	// run_command(print_leaderboard, 0, ['triumph_score']);
    // run_command(print_leaderboard, 0, ['individual_triumph', 'crucible_kills']);
    // run_command(save_collectibles, 0, ['LEPT0N', 'xboxLive']);
    // run_command(inspect_collectible, 0, []);
    // run_command(test_manifest, 0, []);
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
    var player = await bungie.search_destiny_player(arguments);

	var character_ids = await bungie.get_character_ids(player);

	for (var index = 0; index < character_ids.length; index++)
	{
		var character = await bungie.get_character(player, character_ids[index]);

        var emblem_url = bungie.root_url + character.emblemPath;

		console.log('emblem = ' + emblem_url);

        var emblem_file_name = character_ids[index] + '_emblem.jpg';

        util.upload_file(bot, channel_id, emblem_url, emblem_file_name);
	}
}

async function get_triumph_score(channel_id, arguments)
{
    var player = await bungie.search_destiny_player(arguments);

	var triumph_score = await bungie.get_triumph_score(player);

	bot.sendMessage(
	{
		to: channel_id,
		message: 'Triumph score = ' + triumph_score
	});
}

async function test_manifest(channel_id, arguments)
{
    var manifest = await bungie.get_manifest();

    console.log('manifest!');

    var manifest = await bungie.get_manifest();

    console.log('manifest!');
}

async function save_collectibles(channel_id, arguments)
{
    var player = await bungie.search_destiny_player(arguments);
    var collectibles = await bungie.get_collectibles(player);

    util.write_file('collectibles.json', collectibles);
}

async function inspect_collectible(channel_id, arguments)
{
    // var collectibles = util.read_file('collectibles.json');

    bungie.get_collectible_display_properties('24595238');
}

async function get_test(channel_id, arguments)
{
    // example showing how to get triumph data

    // var player = await bungie.search_destiny_player(arguments);
    // var triumphs = await bungie.get_triumphs(player);
    var triumphs = util.read_file('triumphs.json');

    // util.write_file('triumphs.json', triumphs);

    for (var flag = 1; flag < 513; flag = flag * 2)
    {
        var count = 0;

        for (var key in triumphs)
        {
            if (triumphs[key].state & flag)
            {
                count = count + 1;
            }
        }

        console.log('flag = ' + flag + ' count = ' + count);
    }

    /*
    var count = 0;
    for (var hashIdentifier in triumphs)
    {
        await bungie.print_triumph(hashIdentifier, triumphs[hashIdentifier]);
        
        count++;
        if (count > 5)
        {
            break;
        }
    }
    */
    
    // console.log(triumphs[3015941901]);

    // await bungie.print_triumph(3015941901, triumphs[3015941901]);
}

async function get_test_2(channel_id, arguments) {
    // example showing how to get triumph data

    var triumph = await bungie.get_triumph_display_properties('11996340');
}

async function add_player_to_roster(channel_id, arguments)
{
	var displayName = arguments[0];
	
    var player = await bungie.search_destiny_player(arguments);

    roster.add_player(player);
    
	bot.sendMessage(
	{
		to: channel_id,
		message: 'Successfully added "' + player.displayName + '" to roster'
	});
}

async function remove_player_from_roster(channel_id, arguments)
{
	var displayName = arguments[0];
	
    var player = await bungie.search_destiny_player(arguments);

    roster.remove_player(player);
    
	bot.sendMessage(
	{
		to: channel_id,
		message: 'Successfully removed "' + player.displayName + '" from roster'
	});
}

async function print_roster(channel_id, arguments)
{
	var player_roster = roster.get_roster();

    var roster_output_array = player_roster.players.map(function(value, index, array)
    {
        return value.displayName;
    });

    var roster_output = 'Current roster: \r\n' + roster_output_array.join('\r\n');

    console.log(roster_output);
    console.log('');
    
	bot.sendMessage(
	{
		to: channel_id,
		message: roster_output
	});
}

async function print_leaderboard(channel_id, arguments)
{
    var leaderboard_name = arguments[0];
    var leaderboard_parameter = util.try_get_element(arguments, 1);

    var leaderboard_data = await leaderboard.get(leaderboard_name, leaderboard_parameter);

    if (leaderboard_data.url)
    {
        util.upload_file(bot, channel_id, leaderboard_data.url, 'leaderboard_icon.jpg');
    }

	bot.sendMessage(
	{
		to: channel_id,
		message: leaderboard_data.message
	});
}

async function run_command(command, channel_id, arguments)
{
	console.log(command);

	await command(channel_id, arguments);
}

async function parse_message(channel_id, message)
{
	console.log('start command');

    try
    {
        var input = util.parse_arguments(message);

        switch(input.command)
        {
            case 'echo': await run_command(echo, channel_id, input.arguments); break;
            case 'get_emblems': await run_command(get_emblems, channel_id, input.arguments); break;
            case 'get_triumph_score': await run_command(get_triumph_score, channel_id, input.arguments); break;

            case 'add_player_to_roster': await run_command(add_player_to_roster, channel_id, input.arguments); break;
            case 'remove_player_from_roster': await run_command(remove_player_from_roster, channel_id, input.arguments); break;
            case 'print_roster': await run_command(print_roster, channel_id, input.arguments); break;

            case 'print_leaderboard': await run_command(print_leaderboard, channel_id, input.arguments); break;

            default:
                throw new Error('Unrecognized command "' + input.command + '"');
                break;
        }
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
        var message = message.substring(wake_command.length);

	    parse_message(channel_id, message);
    }
});
