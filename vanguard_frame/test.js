
var util = require('./util.js');
var bungie = require('./bungie.js');
var leaderboard = require('./leaderboard.js');

var public = {};

public.run = async function ()
{
    // return;

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
        await test_raids({ arguments: ['LEPT0N', 'xboxLive'] });
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

    var activities = await bungie.download_activity_history(player, bungie.activity_mode_type.Raid);

    var completed_activities = activities.filter(function (activity)
    {
        return activity.values.completed.basic.value == bungie.completed.Yes
            && activity.values.completionReason.basic.value == bungie.completion_reason.ObjectiveCompleted;
    });

    util.log('activities returned', completed_activities.length);

    util.write_file(player.membershipId + '_raids.json', activities, true);

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

    await Promise.all(Object.keys(buckets).map(async function (bucket_id)
    {
        var display_properties = await bungie.get_activity_display_properties(bucket_id);

        console.log(display_properties.name + ' = ' + buckets[bucket_id]);
    }));
}

module.exports = public;
