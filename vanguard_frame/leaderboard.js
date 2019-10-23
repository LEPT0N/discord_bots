
var bungie = require('./bungie.js');
var roster = require('./roster.js');

var public = {};

async function triumph_score()
{
	var player_roster = roster.get_roster();

    var triumph_score_array = await Promise.all(player_roster.players.map(async function(value)
    {
        var player_name = value.displayName;
        var triumph_score = await bungie.get_triumph_score(value);

        return { name: player_name, score: triumph_score };
    }));

    triumph_score_array.sort(function(a, b)
    {
        return b.score - a.score;
    });

    var output_array = triumph_score_array.map(function(value)
    {
        return value.score + '\t : ' + value.name
    });
    
    return output_array.join('\r\n');
}

var leaderboards =
{
    triumph_score: triumph_score,
};

public.get = async function(leaderboard_name)
{
    if (!(leaderboard_name in leaderboards))
    {
	    throw new Error('leaderboard "' + leaderboard_name + '" does not exist');
    }

    var leaderboard_data = await leaderboards[leaderboard_name]();

    console.log(leaderboard_data);
    console.log('');

    return leaderboard_data;
}

module.exports = public;
