
var util = require('./util.js');
var bungie = require('./bungie.js');
var roster = require('./roster.js');

var public = {};

// Leaderboard for player triumph scores
// parameter: null
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
        format_score: util.add_commas_to_number,
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

    // Seasonal // Activities // Season 8 // Season 8: Power Bonus
    // https://www.light.gg/db/legend/triumphs/1686327621/season-8-power-bonus/
    'season_8_power_bonus': 1686327621,

    // Crucible // Lifetime // Glory Ranks // Season 8: Glory
    // https://www.light.gg/db/legend/triumphs/3155364169/season-8-glory/
    'season_8_glory': 3155364169,

    // Seasonal // Activities // Season 9 // Season 9: Power Bonus
    // https://www.light.gg/db/legend/triumphs/2972583416/season-9-power-bonus/
    'season_9_power_bonus': 2972583416,

    // Crucible // Lifetime // Glory Ranks // Season 9: Glory
    // https://www.light.gg/db/legend/triumphs/859223080/season-9-glory/
    'season_9_glory': 859223080,

    // Seasonal // Activities // Season 10 // Season 10: Power Bonus
    // https://www.light.gg/db/legend/triumphs/230421321/season-10-power-bonus/
    'power_bonus': 230421321,

    // Crucible // Lifetime // Glory Ranks // Season 10: Glory
    // https://www.light.gg/db/legend/triumphs/1397652882/season-10-glory/
    'glory': 1397652882,
}

// Leaderboard for player score on a specific triumph
// parameter: any of the keys in known_triumphs above
async function individual_triumph(player_roster, parameter)
{
    if (!(parameter in known_triumphs))
    {
        throw new Error('Triumph "' + parameter + '" is not in my list');
    }

    var hashIdentifier = known_triumphs[parameter];

    var display_properties = await bungie.get_display_properties(
        hashIdentifier,
        bungie.manifest_sections.record);

    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;

        var triumph_data = (await bungie.get_triumphs(value)).records[hashIdentifier];

        // util.log(triumph_data);

        var score = get_triumph_score(triumph_data);

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
        format_score: util.add_commas_to_number,
    };
}

// Triumphs can have multiple objectives, but the last one seems to track the whole progress.
function get_triumph_score(triumph_data)
{
    var objectives = null;

    if ('intervalObjectives' in triumph_data)
    {
        objectives = triumph_data.intervalObjectives;
    }
    else
    {
        objectives = triumph_data.objectives;
    }

    var score = objectives[objectives.length - 1].progress;

    return score;
}

var known_per_character_triumphs =
{
    // Events // Events // The Guardian Games
    // https://www.light.gg/db/legend/triumphs/3996842932/show-your-colors/
    'show_your_colors':
    {
        id: 3996842932,
        group_by_class: true,
    },
}

// Leaderboard for player score on a specific triumph, data split by character and then grouped by player class.
// parameter: any of the keys in known_triumphs above
async function per_character_triumph(player_roster, parameter)
{
    // Get input
    if (!(parameter in known_per_character_triumphs))
    {
        throw new Error('Triumph "' + parameter + '" is not in my list');
    }

    var known_triumph = known_per_character_triumphs[parameter];

    // Loop through all players in the roster
    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_name = player.displayName;

        // Grab per-character info for this player.
        var characters = (await bungie.get_characters(player));

        var player_all_triumph_data = (await bungie.get_per_character_triumphs(player));

        // Loop through all character's triumph data.
        var data = await Promise.all(player_all_triumph_data.map(async function(character_all_triumph_data)
        {
            // Get the class for this character and their triumph score, adding it to the list.

            var class_hash = characters[character_all_triumph_data.character_id].classHash;

            var character_triumph_data = character_all_triumph_data.triumphs[known_triumph.id];

            var score = get_triumph_score(character_triumph_data);

            return {
                player_name: player_name,
                class_hash: class_hash,
                score: score,
            };
        }));

        // Return the array of entries from each character for this player.
        return data;
    }));

    // We have an array of arrays of data, so flatten it into one array.
    data = data.flat();

    var longest_score = 0;

    // Group the data by player class
    if (known_triumph.group_by_class)
    {
        var grouped_data = {};

        for(var index = 0; index < data.length; index++)
        {
            var entry = data[index];

            // Only include entries with a non-zero score in the groups.
            if (entry.score > 0)
            {
                longest_score = Math.max(longest_score, entry.score.toString().length);

                var detail_list_entry = {
                    name: entry.player_name,
                    score: entry.score,
                    visible: true,
                };

                if (!(entry.class_hash in grouped_data))
                {
                    // The first entry in a group, so make a new group.

                    var class_display_properties = (await bungie.get_display_properties(entry.class_hash, bungie.manifest_sections.class));

                    var class_name = class_display_properties.name;

                    grouped_data[entry.class_hash] = {
                        name: class_name,
                        score: entry.score,
                        score_detail_list: [detail_list_entry]
                        };
                }
                else
                {
                    // Add this entry to an existing group.

                    grouped_data[entry.class_hash].score += entry.score;

                    grouped_data[entry.class_hash].score_detail_list.push(detail_list_entry);
                }
            }
        }

        // Convert the data from a map to an array
        data = [];

        Object.keys(grouped_data).forEach(function (group_id)
        {
            var group = grouped_data[group_id];

            // Order the details by score within a group.
            group.score_detail_list.sort(function (a, b)
            {
                return b.score - a.score;
            });

            // Format the output lines for the detail list.
            group.score_detail_list = group.score_detail_list.map(function (detail_list_entry)
            {                
                // Build a string of extra space padding so all the scores line up
                var score_spacing = util.create_string(' ', longest_score - detail_list_entry.score.toString().length);

                return {
                    name: score_spacing + detail_list_entry.score + ' | ' + detail_list_entry.name,
                    visible: true,
                };
            });

            data.push({
                name: group.name,
                score: group.score,
                score_detail_list: group.score_detail_list,
            })
        });
    }

    // Grab display information about the triumph

    var triumph_display_properties = await bungie.get_display_properties(
        known_triumph.id,
        bungie.manifest_sections.record);

    var url = null;

    if (triumph_display_properties.hasIcon)
    {
        url = bungie.root_url + triumph_display_properties.icon;
    }

    // Return the final result

    return {
        title: triumph_display_properties.name,
        description: triumph_display_properties.description,
        data: data,
        url: url,
        format_score: util.add_commas_to_number,
        one_detail_per_line: true,
    };
}

// Look at the output from get_character_stats to see what's available
var known_stats =
{
    'light_level':
    {
        title: 'Light Level',
        description: 'Highest Currently-Equipped Light Level',
        tree: 'mergedAllCharacters merged allTime highestLightLevel basic displayValue',
    },

    'deaths':
    {
        title: 'Total Deaths',
        description: null,
        tree: 'mergedAllCharacters merged allTime deaths basic displayValue',
    },

    'suicides':
    {
        title: 'Total Misadventures',
        description: null,
        tree: 'mergedAllCharacters merged allTime suicides basic displayValue',
    },

    'killing_spree':
    {
        title: 'Longest Killing Spree',
        description: null,
        tree: 'mergedAllCharacters merged allTime longestKillSpree basic displayValue',
    },

    'kill_distance':
    {
        title: 'Longest Kill Distance',
        description: null,
        tree: 'mergedAllCharacters merged allTime longestKillDistance basic displayValue',
    },

    'kills':
    {
        title: 'Total Kills',
        description: null,
        tree: 'mergedAllCharacters merged allTime opponentsDefeated basic displayValue',
    },

    'orbs_generated':
    {
        title: 'Total Orbs Created',
        description: null,
        tree: 'mergedAllCharacters merged allTime orbsDropped basic displayValue',
    },
}

// Leaderboard for player score on a specific stat
// parameter: any of the keys in known_stats above
async function individual_stat(player_roster, parameter)
{
    if (!(parameter in known_stats))
    {
        throw new Error('Stat "' + parameter + '" is not in my list');
    }

    var known_stat = known_stats[parameter];

    var property_tree = known_stat.tree.split(' ');

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
        title: known_stat.title,
        description: known_stat.description,
        data: data,
        url: null,
        format_score: util.add_commas_to_number,
    };
}

var stat_collections =
{
    'favorite_weapon_type':
    {
        title: 'Favorite Weapon Type',
        description: null,
        stats:
        {
            weaponKillsAutoRifle: 'Auto Rifles',
            weaponKillsBeamRifle: 'Linear Fusion Rifles',
            weaponKillsBow: 'Bows',
            weaponKillsFusionRifle: 'Fusion Rifles',
            weaponKillsHandCannon: 'Hand Cannons',
            weaponKillsTraceRifle: 'Trace Rifles',
            weaponKillsMachineGun: 'Machine Guns',
            weaponKillsPulseRifle: 'Pulse Rifles',
            weaponKillsRocketLauncher: 'Rocket Launchers',
            weaponKillsScoutRifle: 'Scout Rifles',
            weaponKillsShotgun: 'Shotguns',
            weaponKillsSniper: 'Snipers',
            weaponKillsSubmachinegun: 'Submachineguns',
            weaponKillsRelic: 'Relics',
            weaponKillsSideArm: 'Sidearms',
            weaponKillsSword: 'Swords',
            weaponKillsAbility: 'Abilities',
            weaponKillsGrenade: 'Grenades',
            weaponKillsGrenadeLauncher: 'Grenade Launchers',
            weaponKillsSuper: 'Supers',
            weaponKillsMelee: 'Melees',
        }
    },
    
    'favorite_non_weapon_type':
    {
        title: 'Favorite Non-Weapon Type',
        description: null,
        stats:
        {
            weaponKillsRelic: 'Relics',
            weaponKillsAbility: 'Abilities',
            weaponKillsGrenade: 'Grenades',
            weaponKillsSuper: 'Supers',
            weaponKillsMelee: 'Melees',
        }
    },

    'favorite_primary_weapon_type':
    {
        title: 'Favorite Primary Weapon Type',
        description: null,
        stats:
        {
            weaponKillsAutoRifle: 'Auto Rifles',
            weaponKillsBow: 'Bows',
            weaponKillsHandCannon: 'Hand Cannons',
            weaponKillsPulseRifle: 'Pulse Rifles',
            weaponKillsScoutRifle: 'Scout Rifles',
            weaponKillsSubmachinegun: 'Submachineguns',
            weaponKillsSideArm: 'Sidearms',
        }
    },

    'favorite_special_weapon_type':
    {
        title: 'Favorite Special Weapon Type',
        description: null,
        stats:
        {
            weaponKillsFusionRifle: 'Fusion Rifles',
            weaponKillsTraceRifle: 'Trace Rifles',
            weaponKillsShotgun: 'Shotguns',
            weaponKillsSniper: 'Snipers',
            weaponKillsGrenadeLauncher: 'Grenade Launchers',
        }
    },

    'favorite_heavy_weapon_type':
    {
        title: 'Favorite Heavy Weapon Type',
        description: null,
        stats:
        {
            weaponKillsBeamRifle: 'Linear Fusion Rifles',
            weaponKillsMachineGun: 'Machine Guns',
            weaponKillsRocketLauncher: 'Rocket Launchers',
            weaponKillsSword: 'Swords',
            weaponKillsGrenadeLauncher: 'Grenade Launchers',
        }
    },
}

var stat_types=
    {
        'all': ['mergedAllCharacters', 'merged', 'allTime'],
        'pve': ['mergedAllCharacters', 'results', 'allPvE', 'allTime'],
        'pvp': ['mergedAllCharacters', 'results', 'allPvP', 'allTime'],
    };

// Leaderboard for player score on the top stat of a given stat collection
// parameter_1: any of the keys in stat_collections above
// parameter_2: optional. any of the keys in stat_types above
// score_detail_list: always exactly one entry: the stat name of stat used for the player's score
async function highest_stat(player_roster, parameter_1, parameter_2)
{
    if (!(parameter_1 in stat_collections))
    {
        throw new Error('Set "' + parameter_1 + '" is not in my list');
    }

    var stat_type = stat_types.all;

    if (parameter_2)
    {
        stat_type = stat_types[parameter_2];
        
        if (!stat_type)
        {
            throw new Error('Stat type "' + parameter_2 + '" is not in my list');
        }
    }

    var stat_collection = stat_collections[parameter_1];

    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;

        var stats = await bungie.get_character_stats(value);

        for (var index = 0; index < stat_type.length; index++)
        {
            stats = stats[stat_type[index]];
        }

        var top_name = "";
        var top_kills = 0;

        Object.keys(stat_collection.stats).forEach(function (stat_node)
        {
            var name = stat_collection.stats[stat_node];

            var kills = stats[stat_node].basic.value;

            if (kills > top_kills)
            {
                top_name = name;
                top_kills = kills;
            }
        });

        return {
            name: player_name,
            score: top_kills,
            score_detail_list: [{
                name: top_name,
                visible: true,
            }]
        };
    }));

    var title = stat_collection.title;

    if (parameter_2 && parameter_2 != 'all')
    {
        title = title + " (" + parameter_2 + ")";
    }

    return {
        title: title,
        description: stat_collection.description,
        data: data,
        url: null,
        format_score: util.add_commas_to_number,
    };
}

var collectible_sets =
{
    'weapons': {
        dynamic_set_function: generate_weapons_collectible_set
    },

    'mods': {
        dynamic_set_function: generate_mods_collectible_set
    },

    'exotics': {
        dynamic_set_function: generate_exotics_collectible_set
    },

    'shaders': {
        dynamic_set_function: generate_shaders_collectible_set
    },

    // !frame.search_manifest collectibles Blah
    'pinnacle_weapons': {
        show_details: true,
        title: 'Pinnacle and Ritual Weapons',
        collectibles: [
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

            2011258732, // Buzzard
            3972149937, // Python
            4116184726, // Komodo-4FR

            1135136071, // Point of the Stag
        ]
    },

    // !frame.search_manifest collectibles Blah
    'oops_all_lunas': {
        show_details: true,
        title: 'All Lunas All The Time',
        collectibles: [
            3260604718, // Luna's Howl
        ]
    },
}

// Leaderboard for player score on the number of collectibles unlocked in a given collectible set
// parameter: any of the keys in collectible_sets above
// score_detail_list: list of the collectibles unlocked
async function collectibles(player_roster, parameter)
{
    if (!(parameter in collectible_sets))
    {
        throw new Error('Set "' + parameter + '" is not in my list');
    }

    var collectible_set = collectible_sets[parameter];

    if (collectible_set.dynamic_set_function)
    {
        collectible_set = await collectible_set.dynamic_set_function();
    }

    var manifest = (await bungie.get_manifest());

    var item_names = {};

    collectible_set.collectibles.forEach(function (collectible_id)
    {
        var display_properties = manifest.DestinyCollectibleDefinition[collectible_id].displayProperties;

        item_names[collectible_id] = display_properties.name;
    });

    var root_display_properties = null;

    if (collectible_set.title_presentation_node)
    {
        root_display_properties = await bungie.get_display_properties(
            collectible_set.title_presentation_node,
            bungie.manifest_sections.presentation_node);
    }

    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_collectibles = await bungie.get_collectibles(player);

        var count = 0;
        var player_result_details = [];

        collectible_set.collectibles.forEach(function (collectible_id)
        {
            var unlocked = false;

            player_collectibles.forEach(function (character_collectibles)
            {
                if (character_collectibles[collectible_id])
                {
                    var state = character_collectibles[collectible_id].state;

                    if (!(state & bungie.collectible_state.NotAcquired))
                    {
                        unlocked = true;
                    }
                }
            });

            if (unlocked)
            {
                count++;
            }

            if (collectible_set.show_details)
            {
                player_result_details.push(
                    {
                        name: item_names[collectible_id],
                        visible: unlocked
                    });
            }
        });

        var result = {
            score: count,
            name: player.displayName,
        };

        if (collectible_set.show_details)
        {
            result.score_detail_list = player_result_details;
        }

        return result;
    }));

    var title = parameter;

    if (collectible_set.title)
    {
        title = collectible_set.title;
    }

    if (root_display_properties && root_display_properties.name)
    {
        title = root_display_properties.name;
    }

    var description = null;

    if (collectible_set.description)
    {
        description = collectible_set.description;
    }
    else if (root_display_properties && root_display_properties.description)
    {
        description = root_display_properties.description;
    }

    var url = null;

    if (root_display_properties && root_display_properties.hasIcon)
    {
        url = bungie.root_url + root_display_properties.icon;
    }

    return {
        title: title,
        description: description,
        data: data,
        url: url,
        format_score: util.add_commas_to_number,
    };
}

async function generate_weapons_collectible_set()
{
    // Legend // Collections // Weapons
    // https://www.light.gg/db/legend/3790247699/collections/1528930164/weapons/
    return await generate_collectible_tree_collectible_set(1528930164, 'Total Count of Weapons Unlocked');
}

async function generate_mods_collectible_set()
{
    // Legend // Collections // Mods
    // https://www.light.gg/db/legend/3790247699/collections/3509235358/mods/
    return await generate_collectible_tree_collectible_set(3509235358, 'Total Count of Mods Unlocked');
}

async function generate_exotics_collectible_set()
{
    // Legend // Collections // Exotic
    // https://www.light.gg/db/legend/3790247699/collections/1068557105/exotic/
    return await generate_collectible_tree_collectible_set(1068557105, 'Total Count of Exotics Unlocked');
}

async function generate_shaders_collectible_set()
{
    // Legend // Collections // Flair // Shaders
    // https://www.light.gg/db/legend/3790247699/collections/3066887728/flair/1516796296/shaders/
    return await generate_collectible_tree_collectible_set(1516796296, 'Total Count of Shaders Unlocked');
}

async function generate_collectible_tree_collectible_set(root_id, description)
{
    var collectible_ids = await bungie.get_all_child_items(root_id, 'collectibles');

    return {
        description: description,
        show_details: false,
        title_presentation_node: root_id,
        collectibles: collectible_ids,
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
        description: 'Count of Unique Raids Completed',
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

// Leaderboard for player score on the number of triumphs unlocked in a given triumph set
// parameter: any of the keys in triumph_sets above
// score_detail_list: optional. the list of triumphs unlocked
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

    var root_display_properties = await bungie.get_display_properties(
        triumph_set.title_presentation_node,
        bungie.manifest_sections.presentation_node);

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

    var description = null;

    if (triumph_set.description)
    {
        description = triumph_set.description;
    }
    else if (root_display_properties.description)
    {
        description = root_display_properties.description;
    }

    return {
        title: root_display_properties.name,
        description: description,
        data: data,
        url: url,
        format_score: util.add_commas_to_number,
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
        description: 'Total Count of Seals Unlocked',
        show_details: true,
        title_presentation_node: seal_presetation_node_id,
        triumphs: seals,
    };
}

async function generate_exotic_catalysts_triumph_set()
{
    // Legend // Triumphs // Account // Exotic Catalysts
    // https://www.light.gg/db/legend/1024788583/triumphs/4230728762/account/1111248994/exotic-catalysts/
    return await generate_triumph_tree_triumph_set(1111248994, 'Total Count of Exotic Catalysts Unlocked');
}

async function generate_lore_triumph_set()
{
    // Legend // Triumphs // Lore
    // https://www.light.gg/db/legend/1024788583/triumphs/564676571/lore/
    return await generate_triumph_tree_triumph_set(564676571, 'Total Count of Lore Triumphs Unlocked');
}

async function generate_triumph_tree_triumph_set(root_id, description)
{
    var manifest = (await bungie.get_manifest());

    var child_triumph_ids = await bungie.get_all_child_items(root_id, 'triumphs');

    var triumphs = child_triumph_ids.map(id =>
    {
        var presentation_node = manifest.DestinyRecordDefinition[id];

        return {
            name: presentation_node.name,
            id: id,
        };
    });

    return {
        description: description,
        show_details: false,
        title_presentation_node: root_id,
        triumphs: triumphs,
    };
}

// Leaderboard for player score on whether the player is the best titan
// parameter: null
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
        format_score: util.add_commas_to_number,
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
        format_score: util.add_commas_to_number,
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

// Leaderboard for player score on some function of activity history in a given activity history set
// parameter: any of the keys in activity_history_sets above
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

// Leaderboard for player score on either kills with a specific exotic weapon, or highest kill count or any exotic weapon
// parameter: either the name of an exotic weapon (ex: Telesto), or 'any'
// score_detail_list: if parameter is 'any', then this always contains one item; the name of the weapon.
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

        if (weapon_name == 'any')
        {
            var top_name = "";
            var top_kills = 0;

            Object.keys(weapon_data).forEach(function (name)
            {
                if (weapon_data[name] > top_kills)
                {
                    top_name = name;
                    top_kills = weapon_data[name];
                }
            });

            return {
                name: player.displayName,
                score: top_kills,
                score_detail_list: [{
                    name: top_name,
                    visible: true,
                }]
            };
        }
        else
        {
            var kills = 0;

            if (weapon_name in weapon_data)
            {
                kills = weapon_data[weapon_name];
            }

            return {
                name: player.displayName,
                score: kills,
            };
        }
    }));

    var title;
    var description = null;

    if (weapon_name == 'any')
    {
        title = 'Favorite Exotic';
        description = 'Exotic With the Most Kills For That Player';
    }
    else
    {
        title = 'Total kills with ' + weapon_name;
    }

    return {
        title: title,
        description: description,
        data: data,
        url: null,
        format_score: util.add_commas_to_number,
    };
}

var leaderboards =
{
    best_titan: lol,
    triumph_score: triumph_score,
    individual_triumph: individual_triumph,
    per_character_triumph: per_character_triumph,
    individual_stat: individual_stat,
    highest_stat: highest_stat,
    collectibles: collectibles,
    triumphs: triumphs,
    activity_history: activity_history,
    weapon_kills: weapon_kills,
};

public.get = async function (name, parameter_1, parameter_2)
{
    if (!(name in leaderboards))
    {
        throw new Error('leaderboard "' + name + '" does not exist');
    }

    var player_roster = roster.get_roster();

    var results = await leaderboards[name](player_roster, parameter_1, parameter_2);

    // Sort the result list
    results.data.sort(function (a, b)
    {
        return b.score - a.score;
    });
    
    results.entries = results.data.map(function (value)
    {
        // Format the score
        var score = value.score;

        if (results.format_score)
        {
            score = results.format_score(score);
        }

        score = score.toString()

        // Filter the details
        var score_detail_list = null;

        if (value.score_detail_list)
        {
            score_detail_list = value.score_detail_list.filter(detail => detail.visible);

            score_detail_list = score_detail_list.map(detail => detail.name);
        }

        return {
            score: score,
            name: value.name,
            score_detail_list: score_detail_list,
        };
    });

    util.log(results);

    return results;
}

module.exports = public;
