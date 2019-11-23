
var fetch = require('node-fetch');
var auth = require('./auth.json');
var util = require('./util.js');

var public = {};

public.root_url = 'https://www.bungie.net';

async function get_request(name, url, raw)
{
    url = public.root_url + url;

    util.log(name, url);

    var response = await fetch(url,
        {
            method: 'get',
            headers:
            {
                'X-API-KEY': auth.bungie_key
            }
        }).then(response => response.json());

    if (raw)
    {
        return response;
    }

    if (response.ErrorCode != 1)
    {
        util.log(response);

        throw new Error(JSON.stringify(response));
    }

    return response.Response;
}

async function download_manifest_directory()
{
    var url = '/Platform/Destiny2/Manifest';

    var manifest_directory = (await get_request('download_manifest_directory', url));

    util.log(manifest_directory);

    return {
        version: manifest_directory.version,
        url: manifest_directory.jsonWorldContentPaths.en
    };
}

async function download_manifest(manifest_directory)
{
    var manifest_data = (await get_request(
        'download_manifest',
        manifest_directory.url,
        true));

    return {
        version: manifest_directory.version,
        date: util.get_date(),
        data: manifest_data
    };
}

var cached_manifest = null;

public.get_manifest = async function ()
{
    var today = util.get_date();

    var manifest_file_name = 'manifest.json';

    if (!cached_manifest)
    {
        cached_manifest = util.try_read_file(manifest_file_name, true);
    }

    if (cached_manifest && cached_manifest.date == today)
    {
        return cached_manifest.data;
    }

    var manifest_directory = await download_manifest_directory();

    if (cached_manifest && cached_manifest.version == manifest_directory.version)
    {
        cached_manifest.date = today;

        util.write_file(manifest_file_name, cached_manifest, true);

        return cached_manifest.data;
    }

    cached_manifest = await download_manifest(manifest_directory);

    util.write_file(manifest_file_name, cached_manifest, true);

    return cached_manifest.data;
}

public.search_destiny_player = async function (arguments)
{
    var displayName = arguments[0];
    var platform = arguments[1];
    var requested_index = util.try_get_element(arguments, 2);

    var url = '/Platform/Destiny2/SearchDestinyPlayer/All/' + displayName + '/';

    var players = (await get_request('search_destiny_player', url));

    util.log(players);

    var matching_players = [];
    for (var index = 0; index < players.length; index++)
    {
        if (players[index].iconPath == '/img/theme/bungienet/icons/' + platform + 'Logo.png')
        {
            matching_players.push(players[index]);
        }
    }

    if (requested_index != null)
    {
        if (requested_index >= matching_players.length)
        {
            throw new Error('requested index ' + requested_index + ' is invalid (only retrieved ' + matching_players.length + ' results)');
        }

        return matching_players[requested_index];
    }
    else
    {
        if (matching_players.length != 1)
        {
            var matching_players_names = [];
            for (var index = 0; index < matching_players.length; index++)
            {
                matching_players_names.push(matching_players[index].displayName);
            }

            matching_players_names = '[' + matching_players_names.join(',') + ']';

            throw new Error('found ' + matching_players.length + ' players for ' + displayName + ' (' + platform + ') ' + matching_players_names);
        }

        return matching_players[0];
    }
}

public.get_character_ids = async function (player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Profiles';

    var character_ids = (await get_request('get_character_ids', url)).profile.data.characterIds;

    util.log(character_ids);

    if (character_ids.length == 0)
    {
        throw new Error('found no characters for ' + player.displayName);
    }

    return character_ids;
}

public.get_character = async function (player, character_id)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/Character/' + character_id + '/?components=Characters';

    var character = (await get_request('get_character', url)).character.data;

    util.log(character);

    return character;
}

// Destiny.DestinyCollectibleState
public.triumph_state =
    {
        RecordRedeemed: 1,
        RewardUnavailable: 2,
        ObjectiveNotCompleted: 4,
        Obscured: 8,
        Invisible: 16,
        EntitlementUnowned: 32,
        CanEquipTitle: 64,
    };

async function download_triumphs(player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Records';

    var triumphs = (await get_request('download_triumphs', url)).profileRecords.data;

    return triumphs;
}

var cached_triumphs = {};

public.get_triumphs = async function (player)
{
    var today = util.get_date();

    var triumphs_file_name = 'player_data_cache/' + player.membershipId + '_triumphs.json';

    if (!(player.membershipId in cached_triumphs))
    {
        cached_triumphs[player.membershipId] = util.try_read_file(triumphs_file_name, true);
    }

    if (cached_triumphs[player.membershipId] && cached_triumphs[player.membershipId].date == today)
    {
        return cached_triumphs[player.membershipId].data;
    }

    var downloaded_triumphs = await download_triumphs(player);

    cached_triumphs[player.membershipId] = {
        date: today,
        data: downloaded_triumphs
    };

    util.write_file(triumphs_file_name, cached_triumphs[player.membershipId], true);

    return cached_triumphs[player.membershipId].data;
}

public.get_triumph_display_properties = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyRecordDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Triumph "' + hashIdentifier + '" is not in the manifest');
    }

    var display_properties = manifest[hashIdentifier].displayProperties;

    display_properties.id = hashIdentifier;

    // util.log('get_triumph_display_properties', display_properties);

    return display_properties;
}

async function download_character_stats(player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Account/' + player.membershipId + '/Stats/';

    var stats = (await get_request('download_character_stats', url));

    return stats;
}

var cached_character_stats = {};

public.get_character_stats = async function (player)
{
    var today = util.get_date();

    var character_stats_file_name = 'player_data_cache/' + player.membershipId + '_character_stats.json';

    if (!(player.membershipId in cached_character_stats))
    {
        cached_character_stats[player.membershipId] = util.try_read_file(character_stats_file_name, true);
    }

    if (cached_character_stats[player.membershipId] && cached_character_stats[player.membershipId].date == today)
    {
        return cached_character_stats[player.membershipId].data;
    }

    var downloaded_character_stats = await download_character_stats(player);

    cached_character_stats[player.membershipId] = {
        date: today,
        data: downloaded_character_stats
    };

    util.write_file(character_stats_file_name, cached_character_stats[player.membershipId], true);

    return cached_character_stats[player.membershipId].data;
}

// Destiny.DestinyCollectibleState
public.collectible_state =
    {
        NotAcquired: 1,
        Obscured: 2,
        Invisible: 4,
        CannotAffordMaterialRequirements: 8,
        InventorySpaceUnavailable: 16,
        UniquenessViolation: 32,
        PurchaseDisabled: 64,
    };

async function download_collectibles(player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Collectibles';

    var collectibles = (await get_request('download_collectibles', url)).profileCollectibles.data.collectibles;

    return collectibles;
}

var cached_collectibles = {};

public.get_collectibles = async function (player)
{
    var today = util.get_date();

    var collectibles_file_name = 'player_data_cache/' + player.membershipId + '_collectibles.json';

    if (!(player.membershipId in cached_collectibles))
    {
        cached_collectibles[player.membershipId] = util.try_read_file(collectibles_file_name, true);
    }

    if (cached_collectibles[player.membershipId] && cached_collectibles[player.membershipId].date == today)
    {
        return cached_collectibles[player.membershipId].data;
    }

    var downloaded_collectibles = await download_collectibles(player);

    cached_collectibles[player.membershipId] = {
        date: today,
        data: downloaded_collectibles
    };

    util.write_file(collectibles_file_name, cached_collectibles[player.membershipId], true);

    return cached_collectibles[player.membershipId].data;
}

public.get_collectible_display_properties = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyCollectibleDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Collectible "' + hashIdentifier + '" is not in the manifest');
    }

    var display_properties = manifest[hashIdentifier].displayProperties;

    // util.log('get_collectible_display_properties', display_properties);

    return display_properties;
}

public.search_manifest = async function (category, search_query)
{
    var manifest = (await public.get_manifest())[category];

    var results = [];

    Object.keys(manifest).forEach(function (key)
    {
        if (manifest[key] &&
            manifest[key].displayProperties &&
            manifest[key].displayProperties.name)
        {
            var item_name = manifest[key].displayProperties.name;

            if (item_name.includes(search_query))
            {
                results.push({
                    category: category,
                    key: key,
                    name: item_name
                });

                util.log(manifest[key]);
            }
        }
    });

    return results;
}

public.get_all_child_triumphs = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyPresentationNodeDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Presentation Node "' + hashIdentifier + '" is not in the manifest');
    }

    var results = [];

    var child_nodes = manifest[hashIdentifier].children.presentationNodes;

    var child_node_results = await Promise.all(child_nodes.map(
        async function (child)
        {
            return await public.get_all_child_triumphs(child.presentationNodeHash);
        }));

    child_node_results.forEach(child => results = results.concat(child));

    var child_triumphs = manifest[hashIdentifier].children.records;

    results = results.concat(child_triumphs.map(item => item.recordHash));

    return results;
}

public.get_presentation_node_display_properties = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyPresentationNodeDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Presentation Node "' + hashIdentifier + '" is not in the manifest');
    }

    var display_properties = manifest[hashIdentifier].displayProperties;

    display_properties.id = hashIdentifier;

    // util.log('get_presentation_node_display_properties', display_properties);

    return display_properties;
}

// Destiny.HistoricalStats.Definitions.DestinyActivityModeType
public.activity_mode_type =
    {
        None: 0,
        Story: 2,
        Strike: 3,
        Raid: 4,
        AllPvP: 5,
        Patrol: 6,
        AllPvE: 7,
        Reserved9: 9,
        Control: 10,
        Reserved11: 11,
        Clash: 12,
        Reserved13: 13,
        CrimsonDoubles: 15,
        Nightfall: 16,
        HeroicNightfall: 17,
        AllStrikes: 18,
        IronBanner: 19,
        Reserved20: 20,
        Reserved21: 21,
        Reserved22: 22,
        Reserved24: 24,
        AllMayhem: 25,
        Reserved26: 26,
        Reserved27: 27,
        Reserved28: 28,
        Reserved29: 29,
        Reserved30: 30,
        Supremacy: 31,
        PrivateMatchesAll: 32,
        Survival: 37,
        Countdown: 38,
        TrialsOfTheNine: 39,
        Social: 40,
        TrialsCountdown: 41,
        TrialsSurvival: 42,
        IronBannerControl: 43,
        IronBannerClash: 44,
        IronBannerSupremacy: 45,
        ScoredNightfall: 46,
        ScoredHeroicNightfall: 47,
        Rumble: 48,
        AllDoubles: 49,
        Doubles: 50,
        PrivateMatchesClash: 51,
        PrivateMatchesControl: 52,
        PrivateMatchesSupremacy: 53,
        PrivateMatchesCountdown: 54,
        PrivateMatchesSurvival: 55,
        PrivateMatchesMayhem: 56,
        PrivateMatchesRumble: 57,
        HeroicAdventure: 58,
        Showdown: 59,
        Lockdown: 60,
        Scorched: 61,
        ScorchedTeam: 62,
        Gambit: 63,
        AllPvECompetitive: 64,
        Breakthrough: 65,
        BlackArmoryRun: 66,
        Salvage: 67,
        IronBannerSalvage: 68,
        PvPCompetitive: 69,
        PvPQuickplay: 70,
        ClashQuickplay: 71,
        ClashCompetitive: 72,
        ControlQuickplay: 73,
        ControlCompetitive: 74,
        GambitPrime: 75,
        Reckoning: 76,
        Menagerie: 77,
        VexOffensive: 78,
        NightmareHunt: 79,
        Elimination: 80,
        Momentum: 81,
    };

public.completed =
    {
        No: 0,
        Yes: 1,
    };

public.completion_reason =
    {
        ObjectiveCompleted: 0,
        Failed: 2,
        Unknown: 255,
    };

async function download_activity_history(player, mode)
{
    var activities = [];

    var character_ids = await public.get_character_ids(player);

    await Promise.all(character_ids.map(async function (character_id)
    {
        var count = 128;
        var done = false;

        for (var page = 0; !done; page++)
        {
            var url = '/Platform/Destiny2/' + player.membershipType +
                '/Account/' + player.membershipId +
                '/Character/' + character_id +
                '/Stats/Activities/?page=' + page +
                '&count=' + count +
                '&mode=' + mode;

            var activities_page = (await get_request('download_activity_history', url)).activities;

            if (!activities_page)
            {
                util.log('download_activity_history page count', 'null');

                done = true;
            }
            else
            {
                util.log('download_activity_history page count', activities_page.length);

                activities = activities.concat(activities_page);

                done = (activities_page.length < count);
            }
        }
    }));

    util.log('download_activity_history total count', activities.length);

    return activities;
}

var cached_activity_history = {};

public.get_activity_history = async function (player, mode)
{
    var today = util.get_date();

    var activity_history_file_name = 'player_data_cache/' + player.membershipId +
        '_' + mode +
        '_activity_history.json';

    if (!(player.membershipId in cached_activity_history))
    {
        cached_activity_history[player.membershipId] = {};
    }

    if (!(mode in cached_activity_history[player.membershipId]))
    {
        cached_activity_history[player.membershipId][mode] = util.try_read_file(activity_history_file_name, true);
    }

    if (cached_activity_history[player.membershipId][mode] &&
        cached_activity_history[player.membershipId][mode].date == today)
    {
        return cached_activity_history[player.membershipId][mode].data;
    }

    var downloaded_activity_history = await download_activity_history(player, mode);

    cached_activity_history[player.membershipId][mode] = {
        date: today,
        data: downloaded_activity_history
    };

    util.write_file(activity_history_file_name, cached_activity_history[player.membershipId][mode], true);

    return cached_activity_history[player.membershipId][mode].data;
}

public.get_activity_display_properties = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyActivityDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Presentation Node "' + hashIdentifier + '" is not in the manifest');
    }

    var display_properties = manifest[hashIdentifier].displayProperties;

    display_properties.id = hashIdentifier;

    // util.log('get_presentation_node_display_properties', display_properties);

    return display_properties;
}

async function download_weapon_history(player)
{
    var character_ids = await public.get_character_ids(player);

    var weapon_history = await Promise.all(character_ids.map(async function (character_id)
    {
        var url = '/Platform/Destiny2/' + player.membershipType +
            '/Account/' + player.membershipId +
            '/Character/' + character_id +
            '/Stats/UniqueWeapons/';

        var character_weapon_history = (await get_request('download_weapon_history', url)).weapons;

        return {
            character_id: character_id,
            weapon_history: character_weapon_history,
        };
    }));

    return weapon_history;
}

var cached_weapon_history = {};

public.get_weapon_history = async function (player)
{
    var today = util.get_date();

    var weapon_history_file_name = 'player_data_cache/' + player.membershipId + '_weapon_history.json';

    if (!(player.membershipId in cached_weapon_history))
    {
        cached_weapon_history[player.membershipId] = util.try_read_file(weapon_history_file_name, true);
    }

    if (cached_weapon_history[player.membershipId] && cached_weapon_history[player.membershipId].date == today)
    {
        return cached_weapon_history[player.membershipId].data;
    }

    var downloaded_weapon_history = await download_weapon_history(player);

    cached_weapon_history[player.membershipId] = {
        date: today,
        data: downloaded_weapon_history
    };

    util.write_file(weapon_history_file_name, cached_weapon_history[player.membershipId], true);

    return cached_weapon_history[player.membershipId].data;
}

module.exports = public;
