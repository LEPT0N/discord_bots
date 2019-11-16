
var util = require('./util.js');
var leaderboard = require('./leaderboard.js');

var public = {};

public.run = async function()
{
    return;

    util.log('test.run');

    try
    {
	    // await save_collectibles({ arguments: ['LEPT0N', 'xboxLive'] });
        await test_leaderboard({ arguments: ['triumph_tree', 'exotic_catalysts'] });
    }
	catch (error)
	{
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

    var data = await leaderboard.get(leaderboard_name, leaderboard_parameter);

    util.log('leaderboard_output', data);
}

module.exports = public;
