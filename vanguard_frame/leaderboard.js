
var util = require('./util.js');
var bungie = require('./bungie.js');
var roster = require('./roster.js');

var public = {};

var triumph_score_types =
{
    'active':
    {
        node: 'activeScore',
        title: 'Active Triumph Score',
        description: null,
    },

    'total':
    {
        node: 'lifetimeScore',
        title: 'Total Triumph Score',
        description: null,
    },

    'legacy':
    {
        node: 'legacyScore',
        title: 'Legacy Triumph Score',
        description: null,
    },
};

// Leaderboard for player triumph scores
// parameter: any of the keys in triumph_score_types above
async function triumph_score(player_roster, parameter)
{
    if (!(parameter in triumph_score_types))
    {
        throw new Error('Triumph score type "' + parameter_1 + '" is not in my list');
    }

    var triumph_score_type = triumph_score_types[parameter];

    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;
        var triumphs = await bungie.get_triumphs(value);

        return { name: player_name, score: triumphs[triumph_score_type.node] };
    }));

    return {
        title: triumph_score_type.title,
        description: triumph_score_type.description,
        data: data,
        url: null,
        format_score: util.add_commas_to_number,
    };
}

var known_triumphs =
{
    // Lifetime // Competitive // Crucible // Fierce Competitor
    // https://www.light.gg/db/legend/triumphs/1897223897/fierce-competitor/
    'crucible_kills':
    {
        triumph_for_title: 1897223897,
        triumphs_for_data: [ 1897223897 ],
    },

    // Lifetime // Social // Clans // Major Contributor
    // https://www.light.gg/db/legend/triumphs/2505589392/major-contributor/
    'clan_xp':
    {
        triumph_for_title: 2505589392,
        triumphs_for_data: [ 2505589392 ],
    },

    /*'nightfall_ordeal_high_score': deprecated. Keeping it around to show how you would define a triumph set like this
    {
        triumph_for_title: 4020709858,
        show_details: true,
        triumphs_for_data:
        [
            // Vanguard // Strikes // Nightfall: The Ordeal // Lightbearer
            // https://www.light.gg/db/legend/triumphs/4020709858/lightbearer/
            4020709858,

            // Vanguard // Strikes // Nightfall // Lake of Shadows
            // https://www.light.gg/db/legend/triumphs/1329556468/lake-of-shadows/
            1329556468,

            // Vanguard // Strikes // Nightfall // The Insight Terminus
            // https://www.light.gg/db/legend/triumphs/3399168111/the-insight-terminus/
            3399168111,

            // Vanguard // Strikes // Nightfall // The Hollowed Lair
            // https://www.light.gg/db/legend/triumphs/3450793480/the-hollowed-lair/
            3450793480,

            // Vanguard // Strikes // Nightfall // Warden of Nothing
            // https://www.light.gg/db/legend/triumphs/2836924866/warden-of-nothing/
            2836924866,
            
            // Vanguard // Strikes // Nightfall // The Pyramidion
            // https://www.light.gg/db/legend/triumphs/1060780635/the-pyramidion/
            1060780635,
            
            // Vanguard // Strikes // Nightfall // The Inverted Spire
            // https://www.light.gg/db/legend/triumphs/3973165904/the-inverted-spire/
            3973165904,
            
            // Vanguard // Strikes // Nightfall // Exodus Crash
            // https://www.light.gg/db/legend/triumphs/1526865549/exodus-crash/
            1526865549,

            // Vanguard // Strikes // Nightfall // The Arms Dealer
            // https://www.light.gg/db/legend/triumphs/3340846443/the-arms-dealer/
            3340846443,

            // Vanguard // Strikes // Nightfall // Savath�n's Song
            // https://www.light.gg/db/legend/triumphs/2099501667/savath%C3%BBns-song/
            2099501667,

            // Vanguard // Strikes // Nightfall // A Garden World
            // https://www.light.gg/db/legend/triumphs/2692332187/a-garden-world//
            2692332187,
            
            // Vanguard // Strikes // Nightfall // Tree of Probabilities
            // https://www.light.gg/db/legend/triumphs/2282894388/tree-of-probabilities/
            2282894388,
            
            // Vanguard // Strikes // Nightfall // Strange Terrain
            // https://www.light.gg/db/legend/triumphs/165166474/strange-terrain/
            165166474,
            
            // Vanguard // Strikes // Nightfall // Will of the Thousands
            // https://www.light.gg/db/legend/triumphs/1039797865/will-of-the-thousands/
            1039797865,
        ],
        per_character_triumphs_for_data:
        [
            // Vanguard // Strikes // Nightfall // The Corrupted
            // https://www.light.gg/db/legend/triumphs/3951275509/the-corrupted/
            3951275509,
        ],
    },*/

    // Season of the Hunt // General // General // Season of the Hunt: Power Bonus
    // https://www.light.gg/db/legend/triumphs/997318734/season-of-the-hunt-power-bonus/
    'power_bonus_season_12':
    {
        triumph_for_title: 997318734,
        triumphs_for_data: [ 997318734 ],
    },

    // Season of the Hunt // General // Crucible // Season 12: Glory
    // https://www.light.gg/db/legend/triumphs/3369065397/season-12-glory/
    'glory_season_12':
    {
        triumph_for_title: 3369065397,
        triumphs_for_data: [ 3369065397 ],
    },

    // Season of the Hunt // General // General // Season of the Hunt: Season Pass Rank
    // https://www.light.gg/db/legend/triumphs/2805259041/season-of-the-hunt-season-pass-rank/
    'season_pass_rank_season_12':
    {
        triumph_for_title: 2805259041,
        triumphs_for_data: [ 2805259041 ],
    },

    // Season of the Chosen // General // General // Artifact Power
    // https://www.light.gg/db/legend/triumphs/1113384427/artifact-power/
    'power_bonus_season_13':
    {
        triumph_for_title: 1113384427,
        triumphs_for_data: [ 1113384427 ],
    },

    // Season of the Chosen // General // Crucible // Glory in Battle
    // https://www.light.gg/db/legend/triumphs/3898902024/glory-in-battle/
    'glory_season_13':
    {
        triumph_for_title: 3898902024,
        triumphs_for_data: [ 3898902024 ],
    },

    // Season of the Splicer // General // General // Paradromic Power
    // https://www.light.gg/db/legend/triumphs/1046620632/paradromic-power/
    'power_bonus_14':
    {
        triumph_for_title: 1046620632,
        triumphs_for_data: [1046620632],
    },

    // Season of the Chosen // General // General // Season Pass
    // https://www.light.gg/db/legend/triumphs/1661195512/season-pass/
    'season_pass_rank_14':
    {
        triumph_for_title: 1661195512,
        triumphs_for_data: [ 1661195512 ],
    },

    // Season 18

    'season_18_candy_earned':
    {
        triumph_for_title: 1276598420,
        triumphs_for_data: [1276598420],
    },

    'season_18_headless_ones':
    {
        triumph_for_title: 3907371284,
        triumphs_for_data: [3907371284],
    },

    'season_18_haunted_sectors':
    {
        triumph_for_title: 3951338722,
        triumphs_for_data: [3951338722],
    },

    // Season 19

    'season_19_cookies_baked':
    {
        triumph_for_title: 2658408999,
        triumphs_for_data: [2658408999],
    },

    'season_19_snowball_kills':
    {
        triumph_for_title: 1194967970,
        triumphs_for_data: [1194967970],
    },

    'season_19_gifts_given':
    {
        triumph_for_title: 3617221705,
        triumphs_for_data: [3617221705],
    },

    // Season 20

    'season_20_weapon_kills':
    {
        triumph_for_title: 3721430389,
        triumphs_for_data: [3721430389],
    },

    'season_20_power':
    {
        triumph_for_title: 3422656786,
        triumphs_for_data: [3422656786],
    },

    'season_20_platinum_tiers':
    {
        triumph_for_title: 3447671362,
        triumphs_for_data: [3447671362],
    },

    // Season 21

    'season_21_weapon_kills':
    {
        triumph_for_title: 419976902,
        triumphs_for_data: [419976902],
    },

    'season_21_power':
    {
        triumph_for_title: 70662163,
        triumphs_for_data: [70662163],
    },

    'season_21_exotic_fish':
    {
        triumph_for_title: 2662869859,
        triumphs_for_data: [2662869859],
    },

    // Season 22

    'season_22_weapon_kills':
    {
        triumph_for_title: 1409334489,
        triumphs_for_data: [1409334489],
    },

    'season_22_power':
    {
        triumph_for_title: 1274445136,
        triumphs_for_data: [1274445136],
    },

    // Season 23

    'season_23_weapon_kills':
    {
        triumph_for_title: 55366574,
        triumphs_for_data: [55366574],
    },

    'season_23_power':
    {
        triumph_for_title: 833065345,
        triumphs_for_data: [833065345],
    },

    'season_brave_weapon_kills':
    {
        triumph_for_title: 3604410081,
        triumphs_for_data: [3604410081],
    },

    'season_brave_adu_repairs':
    {
        triumph_for_title: 589502473,
        triumphs_for_data: [589502473],
    },

    // Season 24

    'season_24_pathfinder_nodes':
    {
        triumph_for_title: 3198419395,
        triumphs_for_data: [3198419395],
    },

    'season_24_dual_destiny_completions':
    {
        triumph_for_title: 3225424862,
        triumphs_for_data: [3225424862],
    },

    // Season 25

    'season_25_contest_of_elders':
    {
        triumph_for_title: 3465625646,
        triumphs_for_data: [3465625646],
    },

    'season_25_onslaught_saboteurs':
    {
        triumph_for_title: 186572265,
        triumphs_for_data: [186572265],
    },

    // Season 26

    'season_26_enhancement_upgrades_unlocked':
    {
        triumph_for_title: 3219466009,
        triumphs_for_data: [3219466009],
    },

    'season_26_dreadnaught_collectibles_found':
    {
        triumph_for_title: 2025564389,
        triumphs_for_data: [2025564389],
    },

    // !frame.search_manifest record %search_string%
    // !frame.print_leaderboard individual_triumph %id%
}

// Leaderboard for player score on a specific triumph
// parameter: any of the keys in known_triumphs above
async function individual_triumph(player_roster, parameter)
{
    var known_triumph;

    if (!(parameter in known_triumphs))
    {
        if (isNaN(parameter))
        {
            throw new Error('Triumph "' + parameter + '" must either be one of the known values, or an id number.');
        }

        known_triumph =
        {
            triumph_for_title: parameter,
            triumphs_for_data: [ parameter ],
        };
    }
    else
    {
        known_triumph = known_triumphs[parameter];
    }

    var display_properties = await bungie.get_display_properties(
        known_triumph.triumph_for_title,
        bungie.manifest_sections.record);

    // Loop through all players in the roster.
    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_name = player.displayName;

        var result_details = [];

        // Loop through all triumphs for this set.
        await Promise.all(known_triumph.triumphs_for_data.map(async function (triumph_id)
        {
            var triumph_data = (await bungie.get_triumphs(player)).records[triumph_id];
        
            var score = bungie.get_triumph_score(triumph_data);

            var triumph_name = (await bungie.get_display_properties(
                triumph_id,
                bungie.manifest_sections.record)).name;

            result_details.push(
            {
                name: triumph_name,
                score: score,
            });
        }));

        if (known_triumph.per_character_triumphs_for_data)
        {
            // Loop through all per-character triumphs for this set.
            await Promise.all(known_triumph.per_character_triumphs_for_data.map(async function (triumph_id)
            {
                var player_triumph_data = (await bungie.get_per_character_triumphs(player));

                // Loop through all characters for this player.
                var data = await Promise.all(player_triumph_data.map(async function(character_triumph_data)
                {
                    var triumph_data = character_triumph_data.records[triumph_id];
                
                    var score = bungie.get_triumph_score(triumph_data);

                    var triumph_name = (await bungie.get_display_properties(
                        triumph_id,
                        bungie.manifest_sections.record)).name;

                    result_details.push(
                    {
                        name: triumph_name,
                        score: score,
                    });
                }));
            }));
        }

        result_details.sort(function (a, b)
        {
            return b.score - a.score;
        });

        var detail_list = null;

        if (known_triumph.show_details)
        {
            detail_list = [{
                name: result_details[0].name,
                visible: true,
            }];
        }

        return {
            name: player_name,
            score: result_details[0].score,
            score_detail_list: detail_list,
        };
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

// These don't exist any more. TODO: find more interesting per-character triumphs so this can live on.
var known_per_character_triumphs =
{
    // Events // Events // The Guardian Games
    // https://www.light.gg/db/legend/triumphs/3996842932/show-your-colors/
    'show_your_colors':
    {
        id: 3996842932,
    },

    // ???
    // https://www.light.gg/???
    'the_vault':
    {
        id: 1567884322,
    },
}

var grouping_types =
{
    'class':
    {
        character_property: 'classHash',
        manifest_section: bungie.manifest_sections.class,
    },

    'race':
    {
        character_property: 'raceHash',
        manifest_section: bungie.manifest_sections.race,
    },

    'gender':
    {
        character_property: 'genderHash',
        manifest_section: bungie.manifest_sections.gender,
    },
};

// Leaderboard for player score on a specific triumph, data split by character and then grouped by player class.
// parameter_1: any of the keys in known_triumphs above
// parameter_2: optiona. Any of the groupings in grouping_types above
async function per_character_triumph(player_roster, parameter_1, parameter_2)
{
    // Get input
    if (!(parameter_1 in known_per_character_triumphs))
    {
        throw new Error('Triumph "' + parameter_1 + '" is not in my list');
    }

    var known_triumph = known_per_character_triumphs[parameter_1];
    
    var grouping = grouping_types.class;

    if (parameter_2)
    {
        grouping = grouping_types[parameter_2];
        
        if (!grouping)
        {
            throw new Error('Grouping "' + parameter_2 + '" is not in my list');
        }
    }

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

            var character = characters[character_all_triumph_data.character_id];
            var group_id = character[grouping.character_property];

            var character_triumph_data = character_all_triumph_data.records[known_triumph.id];

            var score = bungie.get_triumph_score(character_triumph_data);

            return {
                player_name: player_name,
                group_id: group_id,
                score: score,
            };
        }));

        // Return the array of entries from each character for this player.
        return data;
    }));

    // We have an array of arrays of data, so flatten it into one array.
    data = data.flat();

    var longest_score = 0;

    // Group the data by some character statistic

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

            if (!(entry.group_id in grouped_data))
            {
                // The first entry in a group, so make a new group.

                var class_display_properties = (await bungie.get_display_properties(entry.group_id, grouping.manifest_section));

                var class_name = class_display_properties.name;

                grouped_data[entry.group_id] = {
                    name: class_name,
                    score: entry.score,
                    score_detail_list: [detail_list_entry]
                    };
            }
            else
            {
                // Add this entry to an existing group.

                grouped_data[entry.group_id].score += entry.score;

                grouped_data[entry.group_id].score_detail_list.push(detail_list_entry);
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
        description: 'Weapon type',
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
        description: 'Non-weapon type',
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
        description: 'Primary weapon type',
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
        description: 'Special weapon type',
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
        description: 'Heavy weapon type',
        stats:
        {
            weaponKillsBeamRifle: 'Linear Fusion Rifles',
            weaponKillsMachineGun: 'Machine Guns',
            weaponKillsRocketLauncher: 'Rocket Launchers',
            weaponKillsSword: 'Swords',
            // Excluding these now since Salvager's Salvo is so popular it's overshadowing any heavy weapon type.
            // weaponKillsGrenadeLauncher: 'Grenade Launchers',
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

    var description_detail = '';

    if (parameter_2 && parameter_2 != 'all')
    {
        title = title + " (" + parameter_2 + ")";

        description_detail = ' (in ' + parameter_2 + ')';
    }

    var description = stat_collection.description + ' with the most kills' + description_detail + ' for that player'

    return {
        title: title,
        description: description,
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
            3371544734, // Felwinter's Lie
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

        if (collectible_set.exclude_character_specific_data)
        {
            // The first entry in the array is from 'profileCollectibles.data.collectibles'
            // All others are from 'characterCollectibles.data[character_id].collectibles'
            player_collectibles = [ player_collectibles[0] ];
        }

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
    // Legend // Collections // Weapons // Primary
    // https://www.light.gg/db/legend/3790247699/collections/1528930164/weapons/1731162900/primary/
    // Legend // Collections // Weapons // Special
    // https://www.light.gg/db/legend/3790247699/collections/1528930164/weapons/638914517/special/
    // Legend // Collections // Weapons // Heavy
    // https://www.light.gg/db/legend/3790247699/collections/1528930164/weapons/3686962409/heavy/
    return await generate_collectible_tree_collectible_set(
        1528930164,
        'Total Count of Weapons Unlocked',
        [1731162900, 638914517, 3686962409]);
}

async function generate_mods_collectible_set()
{
    // Legend // Collections // Mods
    // https://www.light.gg/db/legend/3790247699/collections/3509235358/mods/
    var result = await generate_collectible_tree_collectible_set(3509235358, 'Total Count of Mods Unlocked');

    // The only character-specific mods are from the artifact. I don't want the amount of overlap between artifact
    // mods between your characters to affect your leaderboard position.
    result.exclude_character_specific_data = true;

    return result;
}

async function generate_exotics_collectible_set()
{
    // I want to explicitly exclude ornaments

    // Legend // Collections // Exotic
    // https://www.light.gg/db/legend/3790247699/collections/1068557105/exotic/
    // Legend // Collections // Exotic // Weapons
    // https://www.light.gg/db/legend/3790247699/collections/1068557105/exotic/2214408526/weapons/
    // Legend // Collections // Exotic // Armor
    // https://www.light.gg/db/legend/3790247699/collections/1068557105/exotic/1789205056/armor/
    return await generate_collectible_tree_collectible_set(
        1068557105,
        'Total Count of Exotics Unlocked',
        [2214408526, 1789205056]);
}

async function generate_shaders_collectible_set()
{
    // Legend // Collections // Flair // Shaders
    // https://www.light.gg/db/legend/3790247699/collections/3066887728/flair/1516796296/shaders/
    return await generate_collectible_tree_collectible_set(1516796296, 'Total Count of Shaders Unlocked');
}

async function generate_collectible_tree_collectible_set(root_id, description, source_ids)
{
    var collectible_ids = [];

    // source_ids is an optoinal array of ids to use. Default to root_id.
    if (!source_ids)
    {
        source_ids = [ root_id ];
    }

    var data = await Promise.all(source_ids.map(async function (source_id)
    {
        var ids = await bungie.get_all_child_items(source_id, 'collectibles');

        collectible_ids = collectible_ids.concat(ids);
    }));

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

    'gilded_seals': {
        dynamic_set_function: generate_gilded_seals_triumph_set
    },

    'seasonal_challenges': {
        dynamic_set_function: generate_seasonal_challenges_triumph_set
    },

    'season_20_guardian_games_medals': {
        dynamic_set_function: generate_season_20_guardian_games_medals_triumph_set
    },

    // https://www.light.gg/db/legend/1024788583/triumphs/1396056784/vanguard/2975760062/raids/
    /* Unfortunately this can no longer be tracked via triumphs.
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
    }*/
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
        var player_triumphs;

        if (triumph_set.use_per_character_data)
        {
            // This data only enumerates in the per-character triumphs,
            // but all characters have the same data, so just use the first one.
            player_triumphs = (await bungie.get_per_character_triumphs(player))[0];
        }
        else
        {
            var player_triumphs = await bungie.get_triumphs(player);
        }

        var count = 0;
        var player_result_details = [];

        triumph_set.triumphs.forEach(function (triumph_set_item)
        {
            if (player_triumphs.records[triumph_set_item.id])
            {
                var triumph_name = triumph_set_item.name;
                var unlocked = false;

                if (player_triumphs.records[triumph_set_item.id].completedCount)
                {
                    var completed_count = player_triumphs.records[triumph_set_item.id].completedCount;

                    unlocked = (completed_count > 0);

                    triumph_name += " " + completed_count;
                    count += completed_count;
				}
                else if (player_triumphs.records[triumph_set_item.id].objectives)
                {
                    var objectives = player_triumphs.records[triumph_set_item.id].objectives[0];

                    unlocked = objectives.complete;

                    if (unlocked)
                    {
                        count++;
                    }
                 }
                else
                {
                    var state = player_triumphs.records[triumph_set_item.id].state;
                    unlocked = state & bungie.triumph_state.RecordRedeemed;

                    if (unlocked)
                    {
                        count++;
                    }
                }

                if (triumph_set.show_details)
                {
                    player_result_details.push(
                        {
                            name: triumph_name,
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
    return generate_seals_triumph_set_worker(false);
}

async function generate_gilded_seals_triumph_set()
{
    return generate_seals_triumph_set_worker(true);
}

async function generate_seals_triumph_set_worker(get_gilded_seals)
{
    // found these by looking at the seals in light.gg and looking ath 'parentNodeHashes':
    // https://www.light.gg/db/legend/616318467/seals/1486062207/last-wish/
    // https://www.light.gg/db/legend/1881970629/legacy-seals/1321008461/almighty/

    var seal_presentation_node_ids =
    [
        // seals
        616318467,

        // legacy seals
        1881970629,
    ];

    var manifest = (await bungie.get_manifest());

    var seals = seal_presentation_node_ids.map(function (seal_presentation_node_id)
    {
        var seal_presentation_node = manifest.DestinyPresentationNodeDefinition[seal_presentation_node_id];

        var seals = seal_presentation_node.children.presentationNodes.map(child =>
        {
            var child_id = child.presentationNodeHash;

            var child_presentation_node = manifest.DestinyPresentationNodeDefinition[child_id];

            var completion_record_id = child_presentation_node.completionRecordHash;

            var completion_record_presentation_node = manifest.DestinyRecordDefinition[completion_record_id];

            var seal_name = completion_record_presentation_node.titleInfo.titlesByGender.Male;

            var gilding_record_id = completion_record_presentation_node.titleInfo.gildingTrackingRecordHash;

            if (get_gilded_seals)
            {
                return {
                    name: seal_name,
                    id: gilding_record_id,
                };
            }
            else
            {
                return {
                    name: seal_name,
                    id: completion_record_id,
                };
            }
        });

        return seals;
    });

    // We have an array of arrays of data, so flatten it into one array.
    seals = seals.flat();

    var description;
    if (get_gilded_seals)
    {
        description = 'Total Count of Gilded Seals Unlocked';
    }
    else
    {
        description = 'Total Count of Seals Unlocked';
    }


    return {
        description: description,
        show_details: true,
        title_presentation_node: seal_presentation_node_ids[0],
        triumphs: seals,
    };
}

async function generate_exotic_catalysts_triumph_set()
{
    // Legend // Triumphs // Exotic Catalysts // Exotic Catalysts
    // https://www.light.gg/db/legend/1163735237/triumphs/511607103/exotic-catalysts/2744330515/exotic-catalysts/
    return await generate_triumph_tree_triumph_set(2744330515, 'Total Count of Exotic Catalysts Unlocked');
}

async function generate_lore_triumph_set()
{
    // Legend // Triumphs // Lore // Lore
    // https://www.light.gg/db/legend/1163735237/triumphs/1993337477/lore/4077680549/lore/
    return await generate_triumph_tree_triumph_set(4077680549, 'Total Count of Lore Triumphs Unlocked');
}

async function generate_seasonal_challenges_triumph_set()
{
    // Legend // Seasonal Challenges // Weekly
    // https://www.light.gg/db/legend/3443694067/seasonal-challenges/3109663559/weekly/
    // For some reason this character-agnostic data is only enumerated in the character-specific profile record...
    return await generate_triumph_tree_triumph_set(3109663559, 'Total Count of Seasonal Challenges Unlocked', true);
}

async function generate_season_20_guardian_games_medals_triumph_set()
{
    // Legend // Triumphs // Triumphs // Season of Defiance // Vanguard Medals
    // https://www.light.gg/db/legend/1163735237/triumphs/1866538467/triumphs/2566909062/season-of-defiance/3147052745/vanguard-medals/
    return await generate_triumph_tree_triumph_set(3147052745, 'Count of how many unique Guardian Games medals earned (Virtuoso, Jack of All Trades, Insult to Injury, etc)');
}

async function generate_triumph_tree_triumph_set(root_id, description, use_per_character_data)
{
    var manifest = (await bungie.get_manifest());

    var child_triumph_ids = await bungie.get_all_child_items(root_id, 'triumphs');

    var triumphs = child_triumph_ids.map(id =>
    {
        var presentation_node = manifest.DestinyRecordDefinition[id];

        return {
            name: presentation_node.displayProperties.name,
            id: id,
        };
    });

    return {
        description: description,
        show_details: false,
        title_presentation_node: root_id,
        triumphs: triumphs,
        use_per_character_data: use_per_character_data,
    };
}

var known_metrics =
{
    'triumph_score':
    {
        id: 3329916678,
    },

    // !frame.search_manifest metric Gild

    'unbroken_gild_count':
    {
        id: 1250683514,
    },

    'dredgen_gild_count':
    {
        id: 2365336843,
    },

    'conqueror_gild_count':
    {
        id: 3266682176,
    },

    'deadeye_gild_count':
    {
        id: 3103683778,
    },

    'flawless_gild_count':
    {
        id: 4112712479,
    },

    'glory':
    {
        id: 268448617,
    },

    // Season 15

    'season_15_pass_rank':
    {
        id: 2262629303,
    },

    'season_15_champ_kills':
    {
        id: 3523358957,
    },

    'season_15_enemy_kills':
    {
        id: 4017051991,
    },

    // Season 16

    'season_16_pass_rank':
    {
        id: 2262629300,
    },

    'season_16_psi_ops_enemies_defeated':
    {
        id: 3095956376,
    },

    'season_16_psi_ops_champions_defeated':
    {
        id: 444039684 ,
    },
    'season_16_guardian_games_medallions':
    {
        id: 4017597957,
    },

    'season_16_guardian_games_top_score':
    {
        id: 2539150057,
    },

    // Season 17

    'season_17_pass_rank':
    {
        id: 2262629301,
    },

    'season_17_containment_tier_completions':
    {
        id: 1864866268,
    },

    'season_17_nightmares_defeated':
    {
        id: 412897948,
    },

    // Season 18

    'season_18_pass_rank':
    {
        id: 2262629306,
    },

    'season_18_enemies_defeated':
    {
        id: 266594914 ,
    },

    'season_18_treasure_chests_opened':
    {
        id: 3858757059,
    },

    'season_18_umbral_energy_collected':
    {
        id: 2389736825,
    },

    'season_18_bosses_defeated':
    {
        id: 731645490,
    },

    // Season 19

    'season_19_pass_rank':
    {
        id: 2262629307,
    },

    'season_19_enemies_defeated':
    {
        id: 3475018909,
    },

    'season_19_bunkers_cleared':
    {
        id: 1461985859,
    },

    'season_19_spire_completions':
    {
        id: 3702217360,
    },

    'season_19_pet_the_dog':
    {
        id: 1430225690,
    },

    // Season 20

    'season_20_pass_rank':
    {
        id: 2245851615,
    },

    'season_20_activity_completions':
    {
        id: 279504192,
    },

    'season_20_favors_gathered':
    {
        id: 326202600,
    },

    'season_20_activity_kills':
    {
        id: 4055734702,
    },

    'season_20_guardian_games_medallions':
    {
        id: 3412338256,
    },

    'season_20_guardian_games_high_score':
    {
        id: 4196647092,
    },

    // Season 21

    'season_21_pass_rank':
    {
        id: 2245851614,
    },

    'season_21_tier_7_deep_dives':
    {
        id: 1547568560,
    },

    'season_21_gotd_completions':
    {
        id: 3846201365,
    },

    'season_21_largest_fish':
    {
        id: 600253797,
    },

    'season_21_total_fish':
    {
        id: 1629825403,
    },

    // Season 22

    'season_22_pass_rank':
    {
        id: 2245851613,
    },

    'season_22_crotas_end':
    {
        id: 2552956848,
    },

    // Season 23

    'season_23_pass_rank':
    {
        id: 2245851612,
    },

    'season_23_warlords_ruin_completions':
    {
        id: 3932004679,
    },

    'season_23_coil_pots_broken':
    {
        id: 4239089094,
    },

    'season_23_whisper_thrall':
    {
        id: 3875151813,
    },

    'season_23_trevor_deaths':
    {
        id: 3548965745,
    },

    // Season 24

    'season_24_pass_rank':
    {
        id: 2245851611,
    },

    'season_24_power':
    {
        id: 4016327807,
    },

    'season_24_salvations_edge_completions':
    {
        id: 31271381,
    },

    'season_24_red_death_kills':
    {
        id: 831493503,
    },

    // Season 25

    'season_25_pass_rank':
    {
        id: 2245851610,
    },

    'season_25_onslaught_salvation_runs':
    {
        id: 2298421656,
    },

    'season_25_tomb_of_elders_runs':
    {
        id: 2336204551,
    },

    'season_25_vespers_host_runs':
    {
        id: 2695240656,
    },

    'season_25_tonics_brewed':
    {
        id: 1749076525,
    },

    'season_25_enemies_defeated':
    {
        id: 740118638,
    },

    // Season 26

    'season_26_pass_rank':
    {
        id: 2245851609,
    },

    'season_26_boons_collected':
    {
        id: 1517766727,
    },

    'season_26_court_challengers_defeated':
    {
        id: 3160852135,
    },

    'season_26_sundered_doctrine_completions':
    {
        id: 2781975991,
    },

    // !frame.search_manifest metric %search_string%
    // !frame.print_leaderboard metrics %id%
}
/*
to do:
    triumphs > pale heart > world > pursuits > meticulous pathfinder
    triumphs > pale heart > world > secrets > fool me once...
    stat trackers > seasons > red and rehabilitated
    */

// Leaderboard for player score on a player metric (stat tracker)
// parameter: any of the keys in known_metrics above
async function metrics(player_roster, parameter)
{
    var known_metric;

    if (!(parameter in known_metrics))
    {
        if (isNaN(parameter))
        {
            throw new Error('Metric "' + parameter + '" must either be one of the known values, or an id number.');
        }

        known_metric = { id: parameter };
    }
    else
    {
        known_metric = known_metrics[parameter];
    }

    var display_properties = await bungie.get_display_properties(
        known_metric.id,
        bungie.manifest_sections.metric);

    var data = await Promise.all(player_roster.players.map(async function (player)
    {
        var player_metrics = await bungie.get_metrics(player);

        var score = 0;

        if (player_metrics[known_metric.id])
        {
            score = await bungie.get_objective_progress_value(player_metrics[known_metric.id].objectiveProgress);
        }

        return {
            score: score,
            name: player.displayName,
        };
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

// Leaderboard for player score on whether the player is the best titan
// parameter: null
async function true_facts(player_roster, parameter)
{
    if (parameter == 'best_titan')
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
    else if (parameter == 'eyes_of_tomorrow')
    {
        var data = await Promise.all(player_roster.players.map(async function (value)
        {
            var player_name = value.displayName;

            var score = 0;

            if (player_name == 'AmeliaGimli')
            {
                score = 5;
            }

            return { name: player_name, score: score };
        }));

        return {
            title: 'Number of Eyes of Tomorrow owned',
            description: null,
            data: data,
            url: null,
            format_score: null,
        };
    }
    else
    {
        throw new Error('true fact "' + name + '" does not exist');
    }
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

var profile_data_sets =
{
    'guardian_rank':
    {
        title: 'Guardian Rank',
        description: null,
        field_name: 'currentGuardianRank',
    },

    'highest_guardian_rank':
    {
        title: 'Lifetime Highest Guardian Rank',
        description: null,
        field_name: 'lifetimeHighestGuardianRank',
    },
}

// Leaderboard for player profile data
// parameter: any of the keys in profile_data_fields above
async function profile_data(player_roster, parameter)
{
    if (!(parameter in profile_data_sets))
    {
        throw new Error('Profile data field "' + parameter + '" is not in my list');
    }

    var profile_data_set = profile_data_sets[parameter];

    var data = await Promise.all(player_roster.players.map(async function (value)
    {
        var player_name = value.displayName;

        var profile_data = await bungie.get_profile_data(value);

        return {
            name: player_name,
            score: profile_data[profile_data_set.field_name],
        };
    }));

    return {
        title: profile_data_set.title,
        description: profile_data_set.description,
        data: data,
        url: null,
        format_score: null,
    };
}

var leaderboards =
{
    true_facts: true_facts,
    triumph_score: triumph_score,
    individual_triumph: individual_triumph,
    per_character_triumph: per_character_triumph,
    individual_stat: individual_stat,
    highest_stat: highest_stat,
    collectibles: collectibles,
    triumphs: triumphs,
    metrics: metrics,
    activity_history: activity_history,
    weapon_kills: weapon_kills,
    profile_data: profile_data,
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
