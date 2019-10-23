
var bungie = require('./bungie.js');
var roster = require('./roster.js');

var public = {};

async function triumph_score(player_roster, parameter)
{
    var result_array = await Promise.all(player_roster.players.map(async function(value)
    {
        var player_name = value.displayName;
        var triumph_score = await bungie.get_triumph_score(value);

        return { name: player_name, score: triumph_score };
    }));

    result_array.sort(function(a, b)
    {
        return b.score - a.score;
    });

    var output_array = result_array.map(function(value)
    {
        return value.score + '\t : ' + value.name
    });
    
    return output_array.join('\r\n');
}

var known_triumphs =
{
    // Crucible // Lifetime // Combat Record // Fierce Competitor
    // https://www.light.gg/db/legend/triumphs/3015941901/fierce-competitor/
    'crucible_kills': 3015941901,
}

async function individual_triumph(player_roster, parameter)
{
    if (!(parameter in known_triumphs))
    {
	    throw new Error('Triumph "' + parameter + '" is not in my list');
    }

    hashIdentifier = known_triumphs[parameter];
    
    var display_properties = await bungie.get_triumph_display_properties(hashIdentifier);

    var result_array = await Promise.all(player_roster.players.map(async function(value)
    {
        var player_name = value.displayName;

        var triumph_data = (await bungie.get_triumphs(value))[hashIdentifier];

        var progress = triumph_data.intervalObjectives[0].progress;

        return { name: player_name, progress: progress };
    }));

    result_array.sort(function(a, b)
    {
        return b.progress - a.progress;
    });

    var output_array = result_array.map(function(value)
    {
        return value.progress + '\t : ' + value.name
    });

    return display_properties.name + "\r\n" +
        display_properties.description + "\r\n" +
        output_array.join('\r\n');
}

var leaderboards =
{
    triumph_score: triumph_score,
    individual_triumph: individual_triumph,
};

public.get = async function(name, parameter)
{
    if (!(name in leaderboards))
    {
	    throw new Error('leaderboard "' + name + '" does not exist');
    }
    
	var player_roster = roster.get_roster();

    var leaderboard_data = await leaderboards[name](player_roster, parameter);

    console.log(leaderboard_data);
    console.log('');

    return leaderboard_data;
}

module.exports = public;
