
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
    
    return {
        message: output_array.join('\r\n'),
        url: null
    };
}

var known_triumphs =
{
    // Crucible // Lifetime // Combat Record // Fierce Competitor
    // https://www.light.gg/db/legend/triumphs/3015941901/fierce-competitor/
    'crucible_kills': 3015941901,
    
    // Account // Clan // Clan // Major Contributor
    // https://www.light.gg/db/legend/triumphs/1738299320/major-contributor/
    'clan_xp': 1738299320,
    
    // Vanguard // Strikes // Nightfall: The Ordeal
    // https://www.light.gg/db/legend/triumphs/4020709858/lightbearer/
    'nightfall_ordeal_high_score': 4020709858,
}

async function individual_triumph(player_roster, parameter)
{
    if (!(parameter in known_triumphs))
    {
	    throw new Error('Triumph "' + parameter + '" is not in my list');
    }

    var hashIdentifier = known_triumphs[parameter];
    
    var display_properties = await bungie.get_triumph_display_properties(hashIdentifier);

    var result_array = await Promise.all(player_roster.players.map(async function(value)
    {
        var player_name = value.displayName;

        var triumph_data = (await bungie.get_triumphs(value))[hashIdentifier];

        // console.log(triumph_data);
        // console.log('');

        var objectives = triumph_data.intervalObjectives;

        var progress = objectives[objectives.length - 1].progress;

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

    var message = display_properties.name + "\r\n" +
        display_properties.description + "\r\n" +
        output_array.join('\r\n');

    var url = null;

    if (display_properties.hasIcon)
    {
        url = bungie.root_url + display_properties.icon;
    }

    return {
        message: message,
        url: url
    };
}

// Look at the output from get_character_stats to see what's available
var known_stats =
{
    'light_level': 'mergedAllCharacters results allPvE allTime highestLightLevel basic displayValue',
    'deaths': 'mergedAllCharacters results allPvE allTime deaths basic displayValue',
    'suicides': 'mergedAllCharacters results allPvE allTime suicides basic displayValue',
    'killing_spree': 'mergedAllCharacters results allPvE allTime longestKillSpree basic displayValue',
    'kill_distance': 'mergedAllCharacters results allPvE allTime longestKillDistance basic displayValue',
    'kills': 'mergedAllCharacters results allPvE allTime opponentsDefeated basic displayValue',
}

async function individual_stat(player_roster, parameter)
{
    if (!(parameter in known_stats))
    {
	    throw new Error('Stat "' + parameter + '" is not in my list');
    }

    var property_tree = known_stats[parameter].split(' ');

    var result_array = await Promise.all(player_roster.players.map(async function(value)
    {
        var player_name = value.displayName;

        var stats = await bungie.get_character_stats(value);

        var node = stats;
        for (var index = 0; index < property_tree.length; index++)
        {
            //console.log('--------------------------');
            //console.log(node);
            //console.log('tree value');
            //console.log(property_tree[index]);

            node = node[property_tree[index]];
        }
        
        //console.log(node);

        return { name: player_name, stat: node };
    }));

    result_array.sort(function(a, b)
    {
        return b.stat - a.stat;
    });

    var output_array = result_array.map(function(value)
    {
        return value.stat + '\t : ' + value.name
    });

    return {
        message: output_array.join('\r\n'),
        url: null
    };
}

var leaderboards =
{
    triumph_score: triumph_score,
    individual_triumph: individual_triumph,
    individual_stat: individual_stat,
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
