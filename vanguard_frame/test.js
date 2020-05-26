
var util = require('./util.js');
var bungie = require('./bungie.js');
var leaderboard = require('./leaderboard.js');

var public = {};

public.run = async function ()
{
    return;

    util.log('test.run');

    try
    {
        // await save_collectibles({ arguments: ['LEPT0N', 'xboxLive'] });
        // await test_leaderboard({ arguments: ['triumph_score'] });
        // await test_leaderboard({ arguments: ['individual_triumph', 'clan_xp'] });
        await test_leaderboard({ arguments: ['individual_triumph', 'nightfall_ordeal_high_score'] });
        // await test_leaderboard({ arguments: ['triumphs', 'exotic_catalysts'] });
        // await test_leaderboard({ arguments: ['collectibles', 'pinnacle_weapons'] });
        // await test_leaderboard({ arguments: ['collectibles', 'weapons'] });
        // await test_leaderboard({ arguments: ['collectibles', 'mods'] });
        // await test_leaderboard({ arguments: ['collectibles', 'exotics'] });
        // await test_leaderboard({ arguments: ['collectibles', 'shaders'] });
        // await test_leaderboard({ arguments: ['triumphs', 'lore'] });
        // await test_leaderboard({ arguments: ['triumphs', 'seals'] });
        // await test_leaderboard({ arguments: ['triumphs', 'raids_completed'] });
        // await test_leaderboard({ arguments: ['weapon_kills', 'The Huckleberry'] });
        // await test_leaderboard({ arguments: ['weapon_kills', 'any'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'kills'] });
        // await test_raids({ arguments: ['LEPT0N', 'xboxLive'] });
        // await test_leaderboard({ arguments: ['activity_history', 'raids_failed'] });
        // await test_leaderboard({ arguments: ['activity_history', 'time_raiding'] });
        // await test_weapon_history({ arguments: ['LEPT0N', 'xboxLive'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_weapon_type'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_weapon_type', 'pvp'] });
        // await test_leaderboard({ arguments: ['per_character_triumph', 'show_your_colors'] });
        // await test_leaderboard({ arguments: ['per_character_triumph', 'show_your_colors', 'class'] });

        // await test_find_differing_triumphs({ arguments: ['LEPT0N', 'xboxLive'] });
    }
    catch (error)
    {
        util.log('Exception:', error);

        var error_details = error.name + " : " + error.message;

        util.log(error_details);
    }

    process.exit();
}

// Find triumphs that differ between characters.
async function test_find_differing_triumphs(input)
{
    // var display_properties = await bungie.get_display_properties(
    //     '378857807',
    //     bungie.manifest_sections.record);

    var player = await bungie.search_destiny_player(input.arguments);

    var all_character_data = await bungie.get_per_character_triumphs(player);

    for (var character_index = 0; character_index < all_character_data.length - 1; character_index++)
    {
        first_character_triumphs = all_character_data[character_index].triumphs;

        await Object.keys(first_character_triumphs).map(async function (triumph_id)
        {
            var score = bungie.get_triumph_score(first_character_triumphs[triumph_id]);

            for (var other_character_index = character_index + 1; other_character_index < all_character_data.length; other_character_index++)
            {
                var other_character_triumphs = all_character_data[other_character_index].triumphs;

                var other_character_triumph = other_character_triumphs[triumph_id];

                if (!other_character_triumph)
                {
                    util.log('triumph missing on other character: ' + triumph_id);
                }
                else
                {
                    var other_score = bungie.get_triumph_score(other_character_triumph);

                    if (score != other_score)
                    {
                        var display_properties = await bungie.get_display_properties(
                            triumph_id,
                            bungie.manifest_sections.record);

                        util.log('triumph "' + display_properties.name + '" (' + display_properties.description + ') (' + triumph_id + ') has mismatched scores (' + score + ') (' + other_score + ')');
                    }
                }
            }
        });
    }
}

async function save_collectibles(input)
{
    var player = await bungie.search_destiny_player(input.arguments);
    var collectibles = await bungie.get_collectibles(player);

    util.write_file(player.membershipId + '_collectibles.json', collectibles);
}

async function test_leaderboard(input)
{
    var leaderboard_name = input.arguments[0];
    var leaderboard_parameter_1 = util.try_get_element(input.arguments, 1);
    var leaderboard_parameter_2 = util.try_get_element(input.arguments, 2);

    await leaderboard.get(leaderboard_name, leaderboard_parameter_1, leaderboard_parameter_2);
}

async function test_raids(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

    var activities = await bungie.get_activity_history(player, bungie.activity_mode_type.Raid);

    var completed_activities = activities.filter(function (activity)
    {
        return activity.values.completed.basic.value == bungie.completed.Yes
            && activity.values.completionReason.basic.value == bungie.completion_reason.Failed;
    });

    util.log('activities returned', completed_activities.length);

    var buckets = {};

    completed_activities.forEach(function (activity)
    {
        var bucket_id = activity.activityDetails.referenceId;

        if (!(bucket_id in buckets))
        {
            buckets[bucket_id] = 0;
        }

        buckets[bucket_id]++;
    });

    var output = [];

    await Promise.all(Object.keys(buckets).map(async function (bucket_id)
    {
        var display_properties = await bungie.get_display_properties(bucket_id, bungie.manifest_sections.activity);

        var name = display_properties.name;
        var count = buckets[bucket_id];

        if (name in output)
        {
            output[name] += count;
        }
        else
        {
            output[name] = count;
        }
    }));

    util.log('output', output);
}

async function test_weapon_history(input)
{
    var manifest = (await bungie.get_manifest()).DestinyInventoryItemDefinition;

    var player = await bungie.search_destiny_player(input.arguments);

    var weapon_history = await bungie.get_weapon_history(player);

    var weapon_data = {};

    weapon_history.forEach(function (weapons)
    {
        if (weapons.weapon_history)
        {
            weapons.weapon_history.map(function (weapon)
            {
                var name = manifest[weapon.referenceId].displayProperties.name;

                var kills = weapon.values.uniqueWeaponKills.basic.value;

                if (name in weapon_data)
                {
                    weapon_data[name] += kills;
                }
                else
                {
                    weapon_data[name] = kills;
                }
            });
        }
    });

    util.log('weapon_data', weapon_data);
}

module.exports = public;
