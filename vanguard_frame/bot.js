
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
    // run_command(search_manifest, 0, ['collectibles', 'Breakneck']);
    // run_command(print_leaderboard, 0, ['collectibles', 'pinnacle_weapons']);
});

async function echo(input)
{
    bot.sendMessage(
	{
        to: input.channel_id,
        message: '<' + input.arguments[0] + '>'
    });

    console.log('echoed <' + input.arguments[0] + '>');
}

async function get_emblems(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

	var character_ids = await bungie.get_character_ids(player);

	for (var index = 0; index < character_ids.length; index++)
	{
		var character = await bungie.get_character(player, character_ids[index]);

        var emblem_url = bungie.root_url + character.emblemPath;

		console.log('emblem = ' + emblem_url);

        var emblem_file_name = character_ids[index] + '_emblem.jpg';

        util.upload_file(bot, input.channel_id, emblem_url, emblem_file_name);
	}
}

async function get_triumph_score(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

	var triumph_score = await bungie.get_triumph_score(player);

	bot.sendMessage(
	{
		to: input.channel_id,
		message: 'Triumph score = ' + triumph_score
	});
}

async function test_manifest(input)
{
    var manifest = await bungie.get_manifest();

    console.log('manifest!');

    var manifest = await bungie.get_manifest();

    console.log('manifest!');
}

async function save_collectibles(input)
{
    var player = await bungie.search_destiny_player(input.arguments);
    var collectibles = await bungie.get_collectibles(player);

    util.write_file('collectibles.json', collectibles);
}

async function inspect_collectible(input)
{
    // var collectibles = util.read_file('collectibles.json');

    bungie.get_collectible_display_properties('24595238');
}

async function get_test(input)
{
    // example showing how to get triumph data

    // var player = await bungie.search_destiny_player(input.arguments);
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

async function get_test_2(input) {
    // example showing how to get triumph data

    var triumph = await bungie.get_triumph_display_properties('11996340');
}

async function add_player_to_roster(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

    roster.add_player(player);
    
	bot.sendMessage(
	{
        to: input.channel_id,
		message: 'Successfully added "' + player.displayName + '" to roster'
	});
}

async function remove_player_from_roster(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

    roster.remove_player(player);
    
	bot.sendMessage(
	{
        to: input.channel_id,
		message: 'Successfully removed "' + player.displayName + '" from roster'
	});
}

async function print_roster(input)
{
	var player_roster = roster.get_roster();

    var roster_output_array = player_roster.players.map(function(value)
    {
        return value.displayName;
    });

    var roster_output = 'Current roster: \r\n' + roster_output_array.join('\r\n');

    console.log(roster_output);
    console.log('');
    
	bot.sendMessage(
	{
		to: input.channel_id,
		message: roster_output
	});
}

async function print_leaderboard(input)
{
    var leaderboard_name = input.arguments[0];
    var leaderboard_parameter = util.try_get_element(input.arguments, 1);

    var leaderboard_data = await leaderboard.get(leaderboard_name, leaderboard_parameter);

    if (leaderboard_data.url)
    {
        util.upload_file(bot, input.channel_id, leaderboard_data.url, 'leaderboard_icon.jpg');
    }

	bot.sendMessage(
	{
		to: input.channel_id,
		message: leaderboard_data.message
	});
}

async function search_manifest(input)
{
    var category = input.arguments[0];
    var search_query = input.arguments[1];

    var search_categories =
    {
        collectibles: 'DestinyCollectibleDefinition',
        triumphs: 'DestinyRecordDefinition',
    };

    if (!(category in search_categories))
    {
        throw new Error('category "' + category + '" does not exist');
    }

    var results = (await bungie.search_manifest(
        search_categories[category],
        search_query));

    console.log(results);
    console.log('');

    var string_results = results.map(function (value)
    {
        return value.key + ' = ' + value.name;
    }).join('\r\n');

    bot.sendMessage(
    {
        to: input.channel_id,
        message: string_results
    });
}

async function mirror_reactions(input)
{
    for (var i = 0; i < input.raw_message.length; i++)
    {
        if (input.raw_message.charCodeAt(i) >= 0x1000)
        {
            var emoji_characters = [];

            while (input.raw_message.charCodeAt(i) >= 0x1000)
            {
                emoji_characters.push(input.raw_message[i]);
                i++;
            }
            i--;

            var emoji = emoji_characters.join('');

            console.log('emoji found: "' + emoji + '"');

            bot.addReaction(
            {
                channelID: input.channel_id,
                messageID: input.message_id,
                reaction: emoji
            });

            await util.sleep(1000);
        }
    }
}

async function process_message(input)
{
	console.log('start command');

    try
    {
        var commands =
        {
            echo: echo,

            get_emblems: get_emblems,

            get_triumph_score: get_triumph_score,

            add_player_to_roster: add_player_to_roster,
            remove_player_from_roster: remove_player_from_roster,
            print_roster: print_roster,

            print_leaderboard: print_leaderboard,

            search_manifest: search_manifest,

            mirror_reactions: mirror_reactions,
        };

        input = util.parse_arguments(input);

        if (!(input.command in commands))
        {
            throw new Error('Unrecognized command "' + input.command + '"');
        }

        console.log(input.command);

        await commands[input.command](input);
    }
	catch (error)
	{
		var error_details = error.name + " : " + error.message;

		console.log(error_details);
		
		bot.sendMessage(
		{
			to: input.channel_id,
			message: error_details
		});
	}

	console.log('end command');
	console.log('');
}

bot.on('message', async function (user_name, user_id, channel_id, raw_message, data)
{
    var wake_command = '!frame.'

    if (raw_message.substring(0, wake_command.length) == wake_command)
    {
        var raw_message = raw_message.substring(wake_command.length);

        process_message({
            user_name: user_name,
            user_id: user_id,
            channel_id: channel_id,
            message_id: data.d.id,
            raw_message: raw_message,
        });
    }
});
