
var util = require('./util.js');
var bungie = require('./bungie.js');
var roster = require('./roster.js');

var public = {};

async function triumph_score(player_roster, parameter)
{
    var result_array = await Promise.all(player_roster.players.map(async function(value)
    {
        var player_name = value.displayName;
        var triumphs = await bungie.get_triumphs(value);

        return { name: player_name, score: triumphs.score };
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

        var triumph_data = (await bungie.get_triumphs(value)).records[hashIdentifier];

        // util.log(triumph_data);

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

var known_triumph_trees =
{
    // Legend // Triumphs // Account // Exotic Catalysts
    // https://www.light.gg/db/legend/1024788583/triumphs/4230728762/account/1111248994/exotic-catalysts/
    'exotic_catalysts': 1111248994,
}

async function triumph_tree(player_roster, parameter)
{
    if (!(parameter in known_triumph_trees))
    {
        throw new Error('Triumph tree "' + parameter + '" is not in my list');
    }

    var triumph_tree_id = known_triumph_trees[parameter];

    var child_triumph_ids = await bungie.get_all_child_triumphs(triumph_tree_id);

    var child_triumphs = await Promise.all(
        child_triumph_ids.map(async function (item)
    {
        return await bungie.get_triumph_display_properties(item);
        }));

    var result_array = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_triumphs = await bungie.get_triumphs(player);

        var count = 0;
        var player_result_details = [];

        child_triumphs.forEach(function (child_triumph)
        {
            var state = player_triumphs.records[child_triumph.id].state;

            var unlocked = !(state & bungie.triumph_state.ObjectiveNotCompleted);

            if (unlocked)
            {
                count++;
            }

            player_result_details.push(
            {
                name: child_triumph.name,
                state: state,
                unlocked: unlocked
            });
        });

        return {
            count: count,
            player_name: player.displayName,
            details: player_result_details
        };
    }));

    result_array.sort(function (a, b)
    {
        return b.count - a.count;
    });

    var output_array = result_array.map(function (value)
    {
        return value.count + '\t : ' + value.player_name;
    });

    return {
        message: output_array.join('\r\n'),
        url: null
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
            // util.log('--------------------------');
            // util.log(node);
            // util.log('tree value');
            // util.log(property_tree[index]);

            node = node[property_tree[index]];
        }
        
        // util.log(node);

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

var collectible_sets =
{
    'pinnacle_weapons': [
        { id: 3260604718, name: 'Luna\'s Howl' },
        { id: 3260604717, name: 'Not Forgotten' },
        { id: 4274523516, name: 'Redrix\'s Claymore' },
        { id: 1111219481, name: 'Redrix\'s Broadsword' },

        { id: 1666039008, name: 'Breakneck' },
        { id: 3810740723, name: 'Loaded Question' },
        { id: 4047371119, name: 'The Mountaintop' },

        { id: 543982652, name: 'Oxygen SR3' },
        { id: 1639266456, name: '21% Delirium' },
        { id: 2335550020, name: 'The Recluse' },

        { id: 3830703103, name: 'Wendigo GL3' },
        { id: 1670904512, name: 'Hush' },
        { id: 3066162258, name: 'Revoker' },

        { id: 853534062, name: 'Edgewise' },
        { id: 1510655351, name: 'Exit Strategy' },
        { id: 1303705556, name: 'Randy\'s Throwing Knife' },
    ]
}

async function collectibles(player_roster, parameter)
{
    if (!(parameter in collectible_sets))
    {
	    throw new Error('Set "' + parameter + '" is not in my list');
    }

    var collectible_set = collectible_sets[parameter];

    var result_array = await Promise.all(player_roster.players.map(async function(player)
    {
        var player_collectibles = await bungie.get_collectibles(player);

        var count = 0;
        var player_result_details = [];

        collectible_set.forEach(function(collectible_set_item)
        {
            var state = player_collectibles[collectible_set_item.id].state;

            var unlocked = !(state & bungie.collectible_state.NotAcquired);

            if (unlocked)
            {
                count++;
            }

            player_result_details.push(
            {
                name: collectible_set_item.name,
                state: state,
                unlocked: unlocked
            });
        });

        return { count: count, player_name: player.displayName, details: player_result_details };
    }));

    result_array.sort(function(a, b)
    {
        return b.count - a.count;
    });

    var output_array = result_array.map(function(value)
    {
        var player_collectible_list = value.details.filter(detail => detail.unlocked);

        player_collectible_list = player_collectible_list.map(function(detail)
        {
            return detail.name;
        });

        player_collectible_list = player_collectible_list.join(', ');

        return value.count + '\t : ' + value.player_name + ' (' + player_collectible_list + ')';
    });

    return {
        message: output_array.join('\r\n'),
        url: null
    };
}

// NOTE: scan the set of children in 'Seals' (1652422747)
// https://www.light.gg/db/legend/1652422747/seals/
// which takes you here:
// https://www.light.gg/db/legend/1652422747/seals/1002334440/moments-of-triumph-mmxix/
// And then 'completionRecordHash' should take you to the list below.
//
// should probably just be wrapped in 'bungie.get_seals'
//
// So remove 'seals' from this list (comment it out) but leave the leaderboard for later use
var triumph_sets =
{
    // https://www.light.gg/db/legend/1652422747/seals/
    'seals': [
        { id: 2707428411, name: 'Undying' },
        { id: 3387213440, name: 'Enlightened' },
        { id: 3793754396, name: 'Harbinger' },
        { id: 2254764897, name: 'MMXIX' },
        { id: 1883929036, name: 'Shadow' },
        { id: 1313291220, name: 'Reckoner' },
        { id: 2053985130, name: 'Blacksmith' },
        { id: 2757681677, name: 'Wayfarer' },
        { id: 3798931976, name: 'Dredgen' },
        { id: 3369119720, name: 'Unbroken' },
        { id: 1754983323, name: 'Chronicler' },
        { id: 1693645129, name: 'Cursebreaker' },
        { id: 2182090828, name: 'Rivensbane' },
    ]
}

async function triumphs(player_roster, parameter)
{
    if (!(parameter in triumph_sets))
    {
        throw new Error('Set "' + parameter + '" is not in my list');
    }

    var triumph_set = triumph_sets[parameter];

    var result_array = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_triumphs = await bungie.get_triumphs(player);

        var count = 0;
        var player_result_details = [];

        triumph_set.forEach(function (triumph_set_item)
        {
            var state = player_triumphs.records[triumph_set_item.id].state;

            var unlocked = !(state & bungie.triumph_state.ObjectiveNotCompleted);

            if (unlocked)
            {
                count++;
            }

            player_result_details.push(
                {
                    name: triumph_set_item.name,
                    state: state,
                    unlocked: unlocked
                });
        });

        return { count: count, player_name: player.displayName, details: player_result_details };
    }));

    result_array.sort(function (a, b)
    {
        return b.count - a.count;
    });

    var output_array = result_array.map(function (value)
    {
        var player_triumph_list = value.details.filter(detail => detail.unlocked);

        player_triumph_list = player_triumph_list.map(function (detail)
        {
            return detail.name;
        });

        player_triumph_list = player_triumph_list.join(', ');

        return value.count + '\t : ' + value.player_name + ' (' + player_triumph_list + ')';
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
    triumph_tree: triumph_tree,
    individual_stat: individual_stat,
    collectibles: collectibles,
    triumphs: triumphs,
};

public.get = async function(name, parameter)
{
    if (!(name in leaderboards))
    {
	    throw new Error('leaderboard "' + name + '" does not exist');
    }
    
	var player_roster = roster.get_roster();

    var leaderboard_data = await leaderboards[name](player_roster, parameter);

    util.log(leaderboard_data);

    return leaderboard_data;
}

module.exports = public;
