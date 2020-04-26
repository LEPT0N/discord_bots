
var discord = require('discord.io');
var auth = require('./auth.json');
var bungie = require('./bungie.js');
var util = require('./util.js');
var roster = require('./roster.js');
var leaderboard = require('./leaderboard.js');
var test = require('./test.js');

var bot = new discord.Client(
    {
        token: auth.discord_key,
        autorun: true
    });

bot.on('ready', async function (evt)
{
    util.log('Connected', 'Logged in as: ' + bot.username + ' - (' + bot.id + ')');

    await test.run();
});

async function echo(input)
{
    bot.sendMessage(
        {
            to: input.channel_id,
            message: '<' + input.arguments[0] + '>'
        });

    util.log('echoed <' + input.arguments[0] + '>');
}

async function get_emblems(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

    var character_ids = await bungie.get_character_ids(player);

    for (var index = 0; index < character_ids.length; index++)
    {
        var character = await bungie.get_character(player, character_ids[index]);

        var emblem_url = bungie.root_url + character.emblemPath;

        util.log('emblem = ' + emblem_url);

        var emblem_file_name = character_ids[index] + '_emblem.jpg';

        util.upload_file(bot, input.channel_id, emblem_url, emblem_file_name);
    }
}

async function get_triumph_score(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

    var triumphs = await bungie.get_triumphs(player);

    bot.sendMessage(
        {
            to: input.channel_id,
            message: 'Triumph score = ' + triumphs.score
        });
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

    var roster_output_array = player_roster.players.map(function (value)
    {
        return value.displayName;
    });

    var roster_output = 'Current roster: \r\n' + roster_output_array.join('\r\n');

    util.log(roster_output);

    bot.sendMessage(
        {
            to: input.channel_id,
            message: roster_output
        });
}

async function print_leaderboard(input)
{
    var leaderboard_name = input.arguments[0];
    var leaderboard_parameter_1 = util.try_get_element(input.arguments, 1);
    var leaderboard_parameter_2 = util.try_get_element(input.arguments, 2);

    if (leaderboard_name == 'all')
    {
        bot.sendMessage(
        {
            to: input.channel_id,
            message: '__**LEADERBOARDS ' + util.get_date() + '**__\r\n\r\n'
        });

        await util.sleep(2000);

        var all_leaderboards = [
            { arguments: ['triumph_score'] },
            { arguments: ['individual_triumph', 'crucible_kills'] },
            { arguments: ['individual_triumph', 'clan_xp'] },
            { arguments: ['individual_triumph', 'nightfall_ordeal_high_score'] },
            { arguments: ['individual_triumph', 'power_bonus'] },
            { arguments: ['individual_triumph', 'glory'] },
            { arguments: ['triumphs', 'exotic_catalysts'] },
            { arguments: ['triumphs', 'lore'] },
            { arguments: ['individual_stat', 'killing_spree'] },
            { arguments: ['individual_stat', 'kill_distance'] },
            { arguments: ['individual_stat', 'kills'] },
            { arguments: ['individual_stat', 'orbs_generated'] },
            { arguments: ['collectibles', 'pinnacle_weapons'] },
            { arguments: ['collectibles', 'weapons'] },
            { arguments: ['collectibles', 'exotics'] },
            { arguments: ['collectibles', 'mods'] },
            { arguments: ['collectibles', 'shaders'] },
            { arguments: ['triumphs', 'seals'] },
            { arguments: ['triumphs', 'raids_completed'] },
            { arguments: ['activity_history', 'raids_completed'] },
            { arguments: ['activity_history', 'time_raiding'] },
            { arguments: ['weapon_kills', 'any'] },
            { arguments: ['highest_stat', 'favorite_weapon_type'] },
            { arguments: ['highest_stat', 'favorite_special_weapon_type'] },
            { arguments: ['highest_stat', 'favorite_heavy_weapon_type'] },
            { arguments: ['highest_stat', 'favorite_non_weapon_type'] },
            { arguments: ['highest_stat', 'favorite_weapon_type', 'pvp'] },
        ];

        for (var index = 0; index < all_leaderboards.length; index++)
        {
            bot.sendMessage({to: input.channel_id, message: '\r\n'});
            await util.sleep(2000);

            input.arguments = all_leaderboards[index].arguments;

            print_leaderboard(input);
            
            await util.sleep(2000);
        }

        return;
    }

    // Get the data
    var results = await leaderboard.get(leaderboard_name, leaderboard_parameter_1, leaderboard_parameter_2);

    // Upload the icon
    if (results.url)
    {
        util.upload_file(bot, input.channel_id, results.url, 'leaderboard_icon.jpg');

        await util.sleep(2000);
    }

    // Print the title
    var header = '__**' + results.title + '**__\r\n';
    
    // Everything after the title should have a quote line
    // message = message + '>>> '

    // Print the optional description
    if (results.description)
    {
        header = header + results.description + '\r\n';
    }

    // Begin the preformatted block for the data
    var entry_border = '```';

    // Compute the max length of all of the scores
    var longest_score = 0;
    results.entries.forEach(function (entry)
    {
        longest_score = Math.max(longest_score, entry.score.length)
    });

    var column_divider = ' | ';

    // Print the data for all the leaderboard entries
    var entry_data = results.entries.map(function (entry)
    {
        // Build a string of extra space padding so all the scores line up
        var score_spacing = util.create_string(' ', longest_score - entry.score.length);
        
        // print 'score = name' properly spaced
        var entry_output = score_spacing + entry.score + column_divider + entry.name;

        // if there is a detail list, print it
        if (entry.score_detail_list)
        {
            if (entry.score_detail_list.length == 1)
            {
                // If there's only one detail, just print it after the entry's name.

                entry_output = entry_output + " ( " + entry.score_detail_list[0] + " )";
            }
            else
            {
                // If there are multiple details, put them on their own line(s), three at a time.

                var full_spacing = util.create_string(' ', longest_score);

                var column = 0;

                entry.score_detail_list.forEach(function (detail)
                {
                    if (column == 0)
                    {
                        entry_output = entry_output + '\r\n' + full_spacing + column_divider + '    ' + detail;
                    }
                    else
                    {
                        entry_output = entry_output + ', ' + detail;
                    }

                    column = (column + 1) % 3;
                });
            }
        }

        // End the line after each entry
        entry_output = entry_output + '\r\n';

        return entry_output;
    });

    var message = header + entry_border + entry_data.join('') + entry_border;

    if (message.length <= 2000)
    {
        // Send the result as one message
        bot.sendMessage(
            {
                to: input.channel_id,
                message: message
            });
    }
    else
    {
        // The message is too big, so must be broken up first.
        
        bot.sendMessage(
            {
                to: input.channel_id,
                message: header
            });
            
        await util.sleep(2000);

        for (var index = 0; index < entry_data.length; index++)
        {
            bot.sendMessage(
            {
                to: input.channel_id,
                message: entry_border + entry_data[index] + entry_border,
            });

            await util.sleep(2000);
        }
    }
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

    var results = [];

    if (category == 'all')
    {
        var manifest = await bungie.get_manifest();

        await Promise.all(Object.keys(manifest).map(async function (key)
        {
            (await bungie.search_manifest(key, search_query)).forEach(
                value => results.push(value));
        }));
    }
    else
    {
        if (!(category in search_categories))
        {
            throw new Error('category "' + category + '" does not exist');
        }

        results = (await bungie.search_manifest(
            search_categories[category],
            search_query));
    }

    util.log(results);

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

            util.log('emoji found: "' + emoji + '"');

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
    util.log('start command');

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

        util.log(commands[input.command]);

        await commands[input.command](input);
    }
    catch (error)
    {
        util.log('Exception:', error);

        var error_details = error.name + " : " + error.message;

        bot.sendMessage(
            {
                to: input.channel_id,
                message: error_details
            });
    }

    util.log('end command');
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
