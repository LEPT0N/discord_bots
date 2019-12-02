
var util = require('./util.js');
var bungie = require('./bungie.js');
var roster = require('./roster.js');

var public = {};

async function triumph_score(player_roster, parameter)
{
    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;
        var triumphs = await bungie.get_triumphs(value);

        return { name: player_name, score: triumphs.score };
    }));

    return {
        title: 'Triumph Score',
        description: null,
        data: data,
        url: null,
        format_score: null,
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

    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;

        var triumph_data = (await bungie.get_triumphs(value)).records[hashIdentifier];

        // util.log(triumph_data);

        var objectives = triumph_data.intervalObjectives;

        var score = objectives[objectives.length - 1].progress;

        return { name: player_name, score: score };
    }));

    var url = null;

    if (display_properties.hasIcon)
    {
        url = bungie.root_url + display_properties.icon;
    }

    return {
        title: display_properties.name,
        description: display_properties.description,
        data: data,
        url: url,
        format_score: null,
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

    var data = await Promise.all(player_roster.players.map(async function (value)
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

        return { name: player_name, score: node };
    }));

    return {
        title: parameter,
        description: null,
        data: data,
        url: null,
        format_score: null,
    };
}

var collectible_sets =
{
    'pinnacle_weapons': [
        3260604718, // Luna's Howl
        3260604717, // Not Forgotten
        4274523516, // Redrix's Claymore
        1111219481, // Redrix's Broadsword

        1666039008, // Breakneck
        3810740723, // Loaded Question
        4047371119, // The Mountaintop

        543982652, // Oxygen SR3
        1639266456, // 21% Delirium
        2335550020, // The Recluse

        3830703103, // Wendigo GL3
        1670904512, // Hush
        3066162258, // Revoker

        853534062, // Edgewise
        1510655351, // Exit Strategy
        1303705556, // Randy's Throwing Knife
    ]
}

async function collectibles(player_roster, parameter)
{
    if (!(parameter in collectible_sets))
    {
        throw new Error('Set "' + parameter + '" is not in my list');
    }

    var collectible_set = collectible_sets[parameter];

    var manifest = (await bungie.get_manifest());

    var item_names = {};

    collectible_set.forEach(function (collectible_id)
    {
        var display_properties = manifest.DestinyCollectibleDefinition[collectible_id].displayProperties;

        item_names[collectible_id] = display_properties.name;
    });

    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_collectibles = await bungie.get_collectibles(player);

        var count = 0;
        var player_result_details = [];

        collectible_set.forEach(function (collectible_id)
        {
            var state = player_collectibles[collectible_id].state;

            var unlocked = !(state & bungie.collectible_state.NotAcquired);

            if (unlocked)
            {
                count++;
            }

            player_result_details.push(
                {
                    name: item_names[collectible_id],
                    state: state,
                    visible: unlocked
                });
        });

        return { score: count, name: player.displayName, score_detail_list: player_result_details };
    }));

    return {
        title: parameter,
        description: null,
        data: data,
        url: null,
        format_score: null,
    };
}

var triumph_sets =
{
    'exotic_catalysts': {
        dynamic_set_function: generate_exotic_catalysts_triumph_set
    },

    'lore': {
        dynamic_set_function: generate_lore_triumph_set
    },

    'seals': {
        dynamic_set_function: generate_seals_triumph_set
    },

    // https://www.light.gg/db/legend/1024788583/triumphs/1396056784/vanguard/2975760062/raids/
    'raids_completed': {
        show_details: true,
        title_presentation_node: 2975760062,
        triumphs: [
            { id: 3420353827, name: 'Leviathan' },
            { id: 2602370549, name: 'Leviathan, Eater of Worlds' },
            { id: 1742345588, name: 'Leviathan, Spire of Stars' },
            { id: 2195455623, name: 'Last Wish' },
            { id: 4060320345, name: 'Scourge of the Past' },
            { id: 1558682421, name: 'Crown of Sorrow' },
            { id: 1120290476, name: 'Garden of Salvation' },
        ]
    }
}

async function triumphs(player_roster, parameter)
{
    if (!(parameter in triumph_sets))
    {
        throw new Error('Set "' + parameter + '" is not in my list');
    }

    var triumph_set = triumph_sets[parameter];

    if (triumph_set.dynamic_set_function)
    {
        triumph_set = await triumph_set.dynamic_set_function();
    }

    var root_display_properties = await bungie.get_presentation_node_display_properties(triumph_set.title_presentation_node);

    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_triumphs = await bungie.get_triumphs(player);

        var count = 0;
        var player_result_details = [];

        triumph_set.triumphs.forEach(function (triumph_set_item)
        {
            if (player_triumphs.records[triumph_set_item.id])
            {
                var state = player_triumphs.records[triumph_set_item.id].state;

                var unlocked = !(state & bungie.triumph_state.ObjectiveNotCompleted);

                if (unlocked)
                {
                    count++;
                }

                if (triumph_set.show_details)
                {
                    player_result_details.push(
                        {
                            name: triumph_set_item.name,
                            state: state,
                            visible: unlocked
                        });
                }
            }
        });

        var result = {
            score: count,
            name: player.displayName
        };

        if (triumph_set.show_details)
        {
            result.score_detail_list = player_result_details;
        }

        return result;
    }));

    var url = null;

    if (root_display_properties.hasIcon)
    {
        url = bungie.root_url + root_display_properties.icon;
    }

    return {
        title: root_display_properties.name,
        description: root_display_properties.description,
        data: data,
        url: url,
        format_score: null,
    };
}

async function generate_seals_triumph_set()
{
    // Legend // Seals
    // https://www.light.gg/db/legend/1652422747/seals/
    var seal_presetation_node_id = 1652422747;

    var manifest = (await bungie.get_manifest());

    var seal_presentation_node = manifest.DestinyPresentationNodeDefinition[seal_presetation_node_id];

    var seals = seal_presentation_node.children.presentationNodes.map(child =>
    {
        var child_id = child.presentationNodeHash;

        var child_presentation_node = manifest.DestinyPresentationNodeDefinition[child_id];

        var completion_record_id = child_presentation_node.completionRecordHash;

        var completion_record_presentation_node = manifest.DestinyRecordDefinition[completion_record_id];

        var seal_name = completion_record_presentation_node.titleInfo.titlesByGender.Male;

        return {
            name: seal_name,
            id: completion_record_id,
        };
    });

    return {
        show_details: true,
        title_presentation_node: seal_presetation_node_id,
        triumphs: seals,
    };
}

async function generate_exotic_catalysts_triumph_set()
{
    // Legend // Triumphs // Account // Exotic Catalysts
    // https://www.light.gg/db/legend/1024788583/triumphs/4230728762/account/1111248994/exotic-catalysts/
    return await generate_triumph_tree_triumph_set(1111248994);
}

async function generate_lore_triumph_set()
{
    // Legend // Triumphs // Lore
    // https://www.light.gg/db/legend/1024788583/triumphs/564676571/lore/
    return await generate_triumph_tree_triumph_set(564676571);
}

async function generate_triumph_tree_triumph_set(root_id)
{
    var manifest = (await bungie.get_manifest());

    var child_triumph_ids = await bungie.get_all_child_triumphs(root_id);

    var triumphs = child_triumph_ids.map(id =>
    {
        var presentation_node = manifest.DestinyRecordDefinition[id];

        return {
            name: presentation_node.name,
            id: id,
        };
    });

    return {
        show_details: false,
        title_presentation_node: root_id,
        triumphs: triumphs,
    };
}

async function lol(player_roster, parameter)
{
    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;

        var score = 0;

        if (player_name == 'CoachMcGuirk S8')
        {
            score = 1;
        }

        return { name: player_name, score: score };
    }));

    return {
        title: 'Best Titan',
        description: null,
        data: data,
        url: null,
        format_score: null,
    };
}

var activity_history_sets =
{
    'raids_completed': {
        mode: bungie.activity_mode_type.Raid,
        name: 'Raids Completed',
        filter: function (activity)
        {
            return activity.values.completed.basic.value == bungie.completed.Yes
                && activity.values.completionReason.basic.value == bungie.completion_reason.ObjectiveCompleted;
        },
        compute_score: history => history.length,
        format_score: null,
    },
    'raids_failed': {
        mode: bungie.activity_mode_type.Raid,
        name: 'Raids Failed',
        filter: function (activity)
        {
            return activity.values.completed.basic.value == bungie.completed.Yes
                && activity.values.completionReason.basic.value == bungie.completion_reason.Failed;
        },
        compute_score: history => history.length,
        format_score: null,
    },
    'time_raiding': {
        mode: bungie.activity_mode_type.Raid,
        name: 'Time Spent Raiding',
        filter: activity => true,
        compute_score: function (history)
        {
            var total_seconds = 0;

            history.forEach(function (entry)
            {
                total_seconds += entry.values.timePlayedSeconds.basic.value;
            });

            return total_seconds;
        },
        format_score: util.format_seconds,
    },
}

async function activity_history(player_roster, parameter)
{
    if (!(parameter in activity_history_sets))
    {
        throw new Error('Set "' + parameter + '" is not in my list');
    }

    var activity_history_set = activity_history_sets[parameter];

    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_activity_history = await bungie.get_activity_history(player, activity_history_set.mode);

        player_activity_history = player_activity_history.filter(activity_history_set.filter);

        score = activity_history_set.compute_score(player_activity_history);

        return {
            score: score,
            name: player.displayName
        };
    }));

    return {
        title: activity_history_set.name,
        description: null,
        data: data,
        url: null,
        format_score: activity_history_set.format_score,
    };
}

async function weapon_kills(player_roster, parameter)
{
    var weapon_name = parameter;

    var manifest = (await bungie.get_manifest()).DestinyInventoryItemDefinition;

    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var weapon_history = await bungie.get_weapon_history(player);

        var weapon_data = {};

        weapon_history.forEach(function (character_weapon_history)
        {
            if (character_weapon_history.weapon_history)
            {
                character_weapon_history.weapon_history.forEach(function (weapon)
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

        var kills = 0;

        if (weapon_name in weapon_data)
        {
            kills = weapon_data[weapon_name];
        }

        return {
            name: player.displayName,
            score: kills,
        };
    }));

    return {
        title: 'Total kills with ' + weapon_name,
        description: null,
        data: data,
        url: null,
        format_score: null,
    };
}

var leaderboards =
{
    best_titan: lol,
    triumph_score: triumph_score,
    individual_triumph: individual_triumph,
    individual_stat: individual_stat,
    collectibles: collectibles,
    triumphs: triumphs,
    activity_history: activity_history,
    weapon_kills: weapon_kills,
};

public.get = async function (name, parameter)
{
    if (!(name in leaderboards))
    {
        throw new Error('leaderboard "' + name + '" does not exist');
    }

    var player_roster = roster.get_roster();

    var results = await leaderboards[name](player_roster, parameter);

    results.data.sort(function (a, b)
    {
        return b.score - a.score;
    });

    results.entries = results.data.map(function (value)
    {
        var score = value.score;

        if (results.format_score)
        {
            score = results.format_score(score);
        }

        var entry = score + '\t : ' + value.name;

        if (value.score_detail_list)
        {
            var detail_list = value.score_detail_list.filter(detail => detail.visible);

            detail_list = detail_list.map(function (detail)
            {
                return detail.name;
            });

            detail_list = detail_list.join(', ');

            entry = entry + ' (' + detail_list + ')';
        }

        return entry;
    });

    util.log(results);

    return results;
}

module.exports = public;
