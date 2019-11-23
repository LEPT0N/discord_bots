
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
        // await test_leaderboard({ arguments: ['triumphs', 'exotic_catalysts'] });
        // await test_leaderboard({ arguments: ['collectibles', 'pinnacle_weapons'] });
        // await test_leaderboard({ arguments: ['triumphs', 'lore'] });
        // await test_leaderboard({ arguments: ['triumphs', 'seals'] });
        // await test_leaderboard({ arguments: ['triumphs', 'raids_completed'] });
        // await test_raids({ arguments: ['LEPT0N', 'xboxLive'] });
        // await test_leaderboard({ arguments: ['activity_history', 'raids_failed'] });
        // await test_weapon_history({ arguments: ['LEPT0N', 'xboxLive'] });
    }
    catch (error)
    {
        util.log('Exception:', error);

        var error_details = error.name + " : " + error.message;

        util.log(error_details);
    }

    process.exit();
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
    var leaderboard_parameter = util.try_get_element(input.arguments, 1);

    await leaderboard.get(leaderboard_name, leaderboard_parameter);
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
        var display_properties = await bungie.get_activity_display_properties(bucket_id);

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

    var character_ids = await bungie.get_character_ids(player);

    await Promise.all(character_ids.map(async function (character_id)
    {
        var weapons = await bungie.get_weapon_history(player, character_id);

        util.log('weapons count', weapons.length);

        var file_name = player.membershipId +
            '_' + character_id +
            '_weapon_history.json';

        util.write_file(file_name, weapons, true);

        var weapon_usage = weapons.map(function (weapon)
        {
            var name = manifest[weapon.referenceId].displayProperties.name;

            var kills = weapon.values.uniqueWeaponKills.basic.displayValue;

            return {
                name: name,
                kills: kills
            };
        });

        weapon_usage.sort(function (a, b)
        {
            return b.kills - a.kills;
        });

        util.log('weapon_usage', weapon_usage);
    }));
}

module.exports = public;
