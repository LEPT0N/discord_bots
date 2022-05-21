
var discord = require('discord.io');
var auth = require('./auth.json');
var bungie = require('./bungie.js');
var util = require('./util.js');
var roster = require('./roster.js');
var leaderboard = require('./leaderboard.js');
var test = require('./test.js');

util.log('Arguments:', process.argv);

var commandline_command = process.argv[2];
var commandline_parameters = process.argv.slice(3);

var bot = new discord.Client(
    {
        token: auth.discord_key,
        autorun: true
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

async function print_all_leaderboards(input)
{
    bot.sendMessage(
        {
            to: input.channel_id,
            message: '__**LEADERBOARDS ' + util.get_date() + '**__\r\n\r\n'
        });

    await util.sleep(2000);

    var all_leaderboards = [

        { arguments: ['triumph_score', 'total'] },
        { arguments: ['triumph_score', 'active'] },

        { arguments: ['individual_triumph', 'crucible_kills'] },
        { arguments: ['individual_triumph', 'clan_xp'] },
        { arguments: ['metrics', 'glory'] },

        { arguments: ['triumphs', 'exotic_catalysts'] },
        { arguments: ['triumphs', 'lore'] },
        { arguments: ['triumphs', 'seals'] },
        { arguments: ['metrics', 'dredgen_gild_count'] },
        { arguments: ['metrics', 'conqueror_gild_count'] },
        { arguments: ['metrics', 'deadeye_gild_count'] },
        { arguments: ['triumphs', 'seasonal_challenges'] },

        { arguments: ['individual_stat', 'killing_spree'] },
        { arguments: ['individual_stat', 'kill_distance'] },
        { arguments: ['individual_stat', 'kills'] },
        { arguments: ['individual_stat', 'orbs_generated'] },

        { arguments: ['collectibles', 'weapons'] },
        { arguments: ['collectibles', 'exotics'] },
        { arguments: ['collectibles', 'mods'] },
        { arguments: ['collectibles', 'shaders'] },

        { arguments: ['activity_history', 'raids_completed'] },
        { arguments: ['activity_history', 'time_raiding'] },

        { arguments: ['weapon_kills', 'any'] },

        { arguments: ['highest_stat', 'favorite_weapon_type'] },
        { arguments: ['highest_stat', 'favorite_primary_weapon_type'] },
        { arguments: ['highest_stat', 'favorite_special_weapon_type'] },
        { arguments: ['highest_stat', 'favorite_heavy_weapon_type'] },
        { arguments: ['highest_stat', 'favorite_non_weapon_type'] },
        { arguments: ['highest_stat', 'favorite_weapon_type', 'pvp'] },

        // Season 15

        { arguments: ['metrics', 'season_16_pass_rank'] },
        { arguments: ['metrics', 'season_16_psi_ops_enemies_defeated'] },
        { arguments: ['metrics', 'season_16_psi_ops_champions_defeated'] },
        { arguments: ['metrics', 'season_16_guardian_games_medallions'] },
        { arguments: ['metrics', 'season_16_guardian_games_top_score'] },
    ];

    for (var index = 0; index < all_leaderboards.length; index++)
    {
        bot.sendMessage({to: input.channel_id, message: '\r\n'});
        await util.sleep(2000);

        input.arguments = all_leaderboards[index].arguments;

        await print_leaderboard(input);
            
        await util.sleep(2000);
    }
}

async function print_leaderboard(input)
{
    var leaderboard_name = input.arguments[0];
    var leaderboard_parameter_1 = util.try_get_element(input.arguments, 1);
    var leaderboard_parameter_2 = util.try_get_element(input.arguments, 2);

    if (leaderboard_name == 'all')
    {
        await print_all_leaderboards(input);

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

                var current_line_length = 0;
                var current_column = 0;

                entry.score_detail_list.forEach(function (detail)
                {
                    var current_line_append = ', ' + detail;
                    var current_line_append_length = current_line_append.length;

                    if (current_line_length == 0
                    || results.one_detail_per_line
                    || current_line_length + current_line_append_length > 60)
                    {
                        // First line, or current line is too long, so start a new line.

                        var current_line = full_spacing + column_divider + '    ' + detail;
                        current_line_length = current_line.length;
                        current_column = 0;

                        entry_output = entry_output + '\r\n' + current_line;
                    }
                    else
                    {
                        // Append to the current line.

                        entry_output = entry_output + current_line_append;
                        current_line_length += current_line_append_length;
                        current_column++;
                    }
                });
            }
        }

        // End the line after each entry
        entry_output = entry_output + '\r\n';

        return entry_output;
    });

    var message = header + entry_border + entry_data.join('') + entry_border;

    if (message.length <= util.max_message_length)
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
        
        var message_batch = header + entry_border;

        for (var index = 0; index < entry_data.length; index++)
        {
            if (message_batch.length + entry_data[index].length + entry_border.length <= util.max_message_length)
            {
                // If the current entry can fit in the batch, then add it.

                message_batch = message_batch + entry_data[index];
            }
            else
            {
                // The current entry doesn't fit in the batch, so print the batch and start a new one.

                bot.sendMessage(
                {
                    to: input.channel_id,
                    message: message_batch + entry_border,
                });

                await util.sleep(2000);
                    
                message_batch = entry_border + entry_data[index];
            }
        }

        // If there's a remaining batch then print it.
        if (message_batch != null)
        {
            bot.sendMessage(
            {
                to: input.channel_id,
                message: message_batch + entry_border,
            });

            await util.sleep(2000);
        }
    }
}

async function search_manifest(input)
{
    var section = input.arguments[0];
    var search_query = input.arguments[1];

    var results = [];

    if (section == 'all')
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
        if (!(section in bungie.manifest_sections))
        {
            throw new Error('section "' + section + '" does not exist');
        }

        results = (await bungie.search_manifest(
            bungie.manifest_sections[section],
            search_query));
    }
    
    for (var index = 0; index < results.length; index++)
    {
        var result = results[index];

        util.log(result);

        var result_message = result.key + ' = ' + result.name + ' [' + result.description + ']';

        if (section == 'all')
        {
            result_message += ' (' + result.section + ')';
        }

        bot.sendMessage(
        {
            to: input.channel_id,
            message: result_message,
        });
        
        await util.sleep(1000);
    }
}

async function mirror_reactions(input)
{
    var emojis = util.find_emojis(input.raw_message);
    
    for (var index = 0; index < emojis.length; index++)
    {
        util.log('emoji found: "' + emojis[index] + '"');

        bot.addReaction(
        {
            channelID: input.channel_id,
            messageID: input.message_id,
            reaction: emojis[index]
        });

        await util.sleep(500);
    }
}

var stored_message_prefix = 'stored_messages/message_';
var stored_message_suffix = '.txt';

async function store_message(input)
{
    var message_name = input.arguments[0];

    // Trim the command, and leading whitespace, from the message contents
    var message_contents = input.raw_message;

    // Trim off the command
    var message_contents = message_contents.substring(input.command.length + 1);

    // Trim off the message name
    var message_contents = message_contents.substring(message_name.length + 1);

    // Trim off leading whitespace
    while (util.is_whitespace(message_contents[0]))
    {
        message_contents = message_contents.substring(1);
    }

    var file_name = stored_message_prefix + message_name + stored_message_suffix;

    util.write_file(file_name, message_contents, false, true);

    bot.sendMessage(
    {
        to: input.channel_id,
        message: 'Saved message "' + message_name + '"',
    });
}

async function admin_tools(input)
{
    bot.sendMessage(
    {
        to: input.channel_id,
        message: 'Inbox deleted.',
    });
}

async function print_message(parameters)
{
    var channel_name = parameters[0];
    var message_name = parameters[1];
    
    var file_name = stored_message_prefix + message_name + stored_message_suffix;

    var message = util.read_file(file_name, false, true);

    var reacting_to_message = false;
    var reacted_to_message = false;

    bot.on('message', async function (user_name, user_id, channel_id, raw_message, data)
    {
        if (user_id == bot.id && !reacting_to_message)
        {
            reacting_to_message = true;

            await mirror_reactions({
                user_name: user_name,
                user_id: user_id,
                channel_id: channel_id,
                message_id: data.d.id,
                raw_message: raw_message,
            });

            reacted_to_message = true;
        }
    });

    await util.sleep(500);

    bot.sendMessage(
        {
            to: util.get_channel_id(bot, channel_name),
            message: message
        });

    for (var waits = 0; waits < 7 && !reacting_to_message; waits++)
    {
        util.log('waiting to react to the message...');

        await util.sleep(500);
    }

    if (!reacting_to_message)
    {
        throw new Error('Timeout waiting to react to message.');
    }

    while (!reacted_to_message)
    {
        util.log('waiting to finish reacting to the message...');

        await util.sleep(500);
    }

    util.log('done printing message');
}

async function process_commandline()
{
    util.log('start commandline command');

    try
    {
        var commandline_commands =
        {
            print_message: print_message,
        };

        if (!(commandline_command in commandline_commands))
        {
            throw new Error('Unrecognized commandline command "' + commandline_command + '"');
        }

        util.log('Running ' + commandline_command);

        await commandline_commands[commandline_command](commandline_parameters);
    }
    catch (error)
    {
        util.log('Exception:', error);

        var error_details = error.name + " : " + error.message;

        bot.sendMessage(
            {
                to: util.get_channel_id(bot, 'test'),
                message: error_details
            });
    }

    util.log('end commandline command');
}

bot.on('ready', async function (evt)
{
    Object.keys(bot.servers).forEach(function (server_id)
    {
        util.log('Connected to Server:', bot.servers[server_id].name + ' - (' + server_id + ')');
    });
    util.log('Logged in as:', bot.username + ' - (' + bot.id + ')');

    await test.run(bot);

    if (commandline_command != null)
    {
        await process_commandline();

        await util.sleep(500);

        process.exit();
    }
});

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

            store_message: store_message,

            admin_tools: admin_tools,
        };

        input = util.parse_arguments(input);

        if (!(input.command in commands))
        {
            throw new Error('Unrecognized command "' + input.command + '"');
        }

        util.log('Running ' + input.command);

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

if (commandline_command == null)
{
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
}
