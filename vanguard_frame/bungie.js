
var fetch = require('node-fetch');
var auth = require('./auth.json');
var util = require('./util.js');

var public = {};

public.root_url = 'https://www.bungie.net';

async function http_request(name, url, http_method, body, raw)
{
    url = public.root_url + url;

    util.log(name, url);

    var response = await fetch(url,
        {
            method: http_method,
            headers:
            {
                'X-API-KEY': auth.bungie_key
            },
            body: body
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

async function get_request(name, url, raw)
{
    return http_request(name, url, 'get', null, raw);
}

async function post_request(name, url, body, raw)
{
    return http_request(name, url, 'post', JSON.stringify(body), raw);
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
    var displayNameCode = arguments[1];
    var platform = arguments[2];
    var requested_index = util.try_get_element(arguments,3);

    var url = '/Platform/Destiny2/SearchDestinyPlayerByBungieName/All/';

    var body = {
        "displayName": displayName,
        "displayNameCode": displayNameCode
    };

    var players = (await post_request('search_destiny_player', url, body));

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

public.beta_get_player_from_hl_cred = async function (arguments)
{
    var credential = arguments[0];

    var url = '/User/GetMembershipFromHardLinkedCredential/12/' + credential + '/';

    // var players = (await get_request('derp', url));

    // util.log(players);

    url = public.root_url + url;

    util.log('derp', url);

    var response = await fetch(url,
        {
            method: 'get',
            headers:
            {
                'X-API-KEY': auth.bungie_key
            }
        });

    util.log(response);
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

async function download_per_character_triumphs(player)
{
    var character_ids = await public.get_character_ids(player);

    var all_character_triumps = await Promise.all(character_ids.map(async function (character_id)
    {
        var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/Character/' + character_id + '?components=Records';

        var character_triumps = (await get_request('download_per_character_triumphs', url)).records.data;

        return {
            character_id: character_id,
            records: character_triumps.records,
        };
    }));

    return all_character_triumps;
}

var cached_per_character_triumphs = {};

public.get_per_character_triumphs = async function (player)
{
    var today = util.get_date();

    var per_character_triumphs_file_name = 'player_data_cache/' + player.membershipId + '_per_character_triumphs.json';

    if (!(player.membershipId in cached_per_character_triumphs))
    {
        cached_per_character_triumphs[player.membershipId] = util.try_read_file(per_character_triumphs_file_name, true);
    }

    if (cached_per_character_triumphs[player.membershipId] && cached_per_character_triumphs[player.membershipId].date == today)
    {
        return cached_per_character_triumphs[player.membershipId].data;
    }

    var downloaded_per_character_triumphs = await download_per_character_triumphs(player);

    cached_per_character_triumphs[player.membershipId] = {
        date: today,
        data: downloaded_per_character_triumphs
    };

    util.write_file(per_character_triumphs_file_name, cached_per_character_triumphs[player.membershipId], true);

    return cached_per_character_triumphs[player.membershipId].data;
}

// Triumphs can have multiple objectives, but the last one seems to track the whole progress.
public.get_triumph_score = function (triumph_data)
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

async function download_metrics(player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Metrics';

    var metrics = (await get_request('download_metrics', url)).metrics.data.metrics;

    return metrics;
}

var cached_metrics = {};

public.get_metrics = async function (player)
{
    var today = util.get_date();

    var metrics_file_name = 'player_data_cache/' + player.membershipId + '_metrics.json';

    if (!(player.membershipId in cached_metrics))
    {
        cached_metrics[player.membershipId] = util.try_read_file(metrics_file_name, true);
    }

    if (cached_metrics[player.membershipId] && cached_metrics[player.membershipId].date == today)
    {
        return cached_metrics[player.membershipId].data;
    }

    var downloaded_metrics = await download_metrics(player);

    cached_metrics[player.membershipId] = {
        date: today,
        data: downloaded_metrics
    };

    util.write_file(metrics_file_name, cached_metrics[player.membershipId], true);

    return cached_metrics[player.membershipId].data;
}

async function download_characters(player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Characters';

    var characters = (await get_request('download_characters', url)).characters.data;

    return characters;
}

var cached_characters = {};

public.get_characters = async function (player)
{
    var today = util.get_date();

    var characters_file_name = 'player_data_cache/' + player.membershipId + '_characters.json';

    if (!(player.membershipId in cached_characters))
    {
        cached_characters[player.membershipId] = util.try_read_file(characters_file_name, true);
    }

    if (cached_characters[player.membershipId] && cached_characters[player.membershipId].date == today)
    {
        return cached_characters[player.membershipId].data;
    }

    var downloaded_characters = await download_characters(player);

    cached_characters[player.membershipId] = {
        date: today,
        data: downloaded_characters
    };

    util.write_file(characters_file_name, cached_characters[player.membershipId], true);

    return cached_characters[player.membershipId].data;
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
    var collectibles = [];

    // Destiny2.GetProfile
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Collectibles';

    var result = await get_request('download_collectibles', url);

    collectibles.push(result.profileCollectibles.data.collectibles);

    for (var character_id in result.characterCollectibles.data)
    {
        collectibles.push(result.characterCollectibles.data[character_id].collectibles);
    }

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

public.search_manifest = async function (section, search_query)
{
    var manifest = (await public.get_manifest())[section];

    if (!manifest)
    {
        throw new Error ('section "' + section + '" is not in the manifest');
    }

    var results = [];

    Object.keys(manifest).forEach(function (key)
    {
        if (manifest[key] &&
            manifest[key].displayProperties &&
            manifest[key].displayProperties.name)
        {
            var item_name = manifest[key].displayProperties.name;
            var item_description = manifest[key].displayProperties.description;

            if (item_name.includes(search_query))
            {
                results.push({
                    section: section,
                    key: key,
                    name: item_name,
                    description: item_description,
                });

                util.log(manifest[key]);
            }
        }
    });

    return results;
}

public.presentation_node_child_type =
{
    triumphs:
    {
        category_name: 'records',
        item_name: 'recordHash',
    },
    collectibles:
    {
        category_name: 'collectibles',
        item_name: 'collectibleHash',
    },
};

public.get_all_child_items = async function (hashIdentifier, child_type)
{
    var manifest = (await public.get_manifest()).DestinyPresentationNodeDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Presentation Node "' + hashIdentifier + '" is not in the manifest');
    }

    if (!child_type in public.presentation_node_child_type)
    {
        throw new Error('Child Type "' + child_type + '" is not supported');
    }

    var results = [];

    var child_nodes = manifest[hashIdentifier].children.presentationNodes;

    var child_node_results = await Promise.all(child_nodes.map(
        async function (child)
        {
            return await public.get_all_child_items(
                child.presentationNodeHash,
                child_type);
        }));

    child_node_results.forEach(child => results = results.concat(child));

    child_type = public.presentation_node_child_type[child_type];

    var child_items = manifest[hashIdentifier].children[child_type.category_name];

    results = results.concat(child_items.map(item => item[child_type.item_name]));

    return results;
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

// Destiny.DestinyUnlockValueUIStyle
public.unlock_value_ui_style =
{
    automatic: 0,
    fraction: 1,
    checkbox: 2,
    percentage: 3,
    date_time: 4,
    fraction_float: 5,
    integer: 6,
    time_duration: 7,
    hidden: 8,
    multiplier: 9,
    green_pips: 10,
    red_pips: 11,
    explicit_percentage: 12,
    raw_float: 13,
};

public.get_objective_progress_value = async function (objective)
{
    var objective_definition = await public.get_manifest_entry(
        objective.objectiveHash,
        public.manifest_sections.objective);

    var objective_value_style;

    if (objective.complete)
    {
        objective_value_style = objective_definition.completedValueStyle;
    }
    else
    {
        objective_value_style = objective_definition.inProgressValueStyle;
    }

    var value;

    if (objective_value_style == public.unlock_value_ui_style.integer)
    {
        value = objective.progress;
    }
    else if (objective_value_style == public.unlock_value_ui_style.raw_float)
    {
        value = objective.progress / 100;
    }
    else
    {
        throw new Error('Update get_objective_progress to handle DestinyUnlockValueUIStyle == ' + objective_value_style);
    }

    return value;
}

public.manifest_sections = 
{
    enemy_race: 'DestinyEnemyRaceDefinition',
    node_step_summary: 'DestinyNodeStepSummaryDefinition',
    art_dye_channel: 'DestinyArtDyeChannelDefinition',
    art_dye_reference: 'DestinyArtDyeReferenceDefinition',
    place: 'DestinyPlaceDefinition',
    activity: 'DestinyActivityDefinition',
    activity_type: 'DestinyActivityTypeDefinition',
    class: 'DestinyClassDefinition',
    gender: 'DestinyGenderDefinition',
    inventory_bucket: 'DestinyInventoryBucketDefinition',
    race: 'DestinyRaceDefinition',
    talent_grid: 'DestinyTalentGridDefinition',
    unlock: 'DestinyUnlockDefinition',
    material_requirement_set: 'DestinyMaterialRequirementSetDefinition',
    sandbox_perk: 'DestinySandboxPerkDefinition',
    stat_group: 'DestinyStatGroupDefinition',
    progression_mapping: 'DestinyProgressionMappingDefinition',
    faction: 'DestinyFactionDefinition',
    vendor_group: 'DestinyVendorGroupDefinition',
    reward_source: 'DestinyRewardSourceDefinition',
    unlock_value: 'DestinyUnlockValueDefinition',
    reward_mapping: 'DestinyRewardMappingDefinition',
    reward_sheet: 'DestinyRewardSheetDefinition',
    item_category: 'DestinyItemCategoryDefinition',
    damage_type: 'DestinyDamageTypeDefinition',
    activity_mode: 'DestinyActivityModeDefinition',
    medal_tier: 'DestinyMedalTierDefinition',
    achievement: 'DestinyAchievementDefinition',
    activity_graph: 'DestinyActivityGraphDefinition',
    activity_interactable: 'DestinyActivityInteractableDefinition',
    collectible: 'DestinyCollectibleDefinition',
    entitlement_offer: 'DestinyEntitlementOfferDefinition',
    destiny_stat: 'DestinyStatDefinition',
    item_tier_type: 'DestinyItemTierTypeDefinition',
    metric: 'DestinyMetricDefinition',
    platform_bucket_mapping: 'DestinyPlatformBucketMappingDefinition',
    plug_set: 'DestinyPlugSetDefinition',
    presentation_node_base: 'DestinyPresentationNodeBaseDefinition',
    presentation_node: 'DestinyPresentationNodeDefinition',
    record: 'DestinyRecordDefinition',
    bond: 'DestinyBondDefinition',
    character_customization_category: 'DestinyCharacterCustomizationCategoryDefinition',
    character_customization_option: 'DestinyCharacterCustomizationOptionDefinition',
    destination: 'DestinyDestinationDefinition',
    equipment_slot: 'DestinyEquipmentSlotDefinition',
    inventory_item: 'DestinyInventoryItemDefinition',
    inventory_item_lite: 'DestinyInventoryItemLiteDefinition',
    location: 'DestinyLocationDefinition',
    lore: 'DestinyLoreDefinition',
    objective: 'DestinyObjectiveDefinition',
    progression: 'DestinyProgressionDefinition',
    progression_level_requirement: 'DestinyProgressionLevelRequirementDefinition',
    reward_adjuster_progression_map: 'DestinyRewardAdjusterProgressionMapDefinition',
    reward_item_list: 'DestinyRewardItemListDefinition',
    sack_reward_item_list: 'DestinySackRewardItemListDefinition',
    sandbox_pattern: 'DestinySandboxPatternDefinition',
    season: 'DestinySeasonDefinition',
    season_pass: 'DestinySeasonPassDefinition',
    socket_category: 'DestinySocketCategoryDefinition',
    socket_type: 'DestinySocketTypeDefinition',
    trait: 'DestinyTraitDefinition',
    trait_category: 'DestinyTraitCategoryDefinition',
    unlock_count_mapping: 'DestinyUnlockCountMappingDefinition',
    unlock_event: 'DestinyUnlockEventDefinition',
    unlock_expression_mapping: 'DestinyUnlockExpressionMappingDefinition',
    vendor: 'DestinyVendorDefinition',
    reward_adjuster_pointer: 'DestinyRewardAdjusterPointerDefinition',
    milestone: 'DestinyMilestoneDefinition',
    activity_modifier: 'DestinyActivityModifierDefinition',
    report_reason_category: 'DestinyReportReasonCategoryDefinition',
    artifact: 'DestinyArtifactDefinition',
    breaker_type: 'DestinyBreakerTypeDefinition',
    checklist: 'DestinyChecklistDefinition',
    energy_type: 'DestinyEnergyTypeDefinition',
};

public.get_manifest_entry = async function (hash_identifier, section)
{
    var manifest = (await public.get_manifest())[section];

    if (!manifest)
    {
        throw new Error('section "' + section + '" is not in the manifest');
    }

    if (!(hash_identifier in manifest))
    {
        throw new Error('Presentation Node "' + hash_identifier + '" is not in section "' + section + '" in the manifest');
    }

    var manifest_entry = manifest[hash_identifier];

    // util.log('get_manifest_entry(' + hash_identifier + ', ' + section + ')', manifest_entry);

    return manifest_entry;
}

public.get_display_properties = async function (hash_identifier, section)
{
    var manifest_entry = await public.get_manifest_entry(hash_identifier, section);

    var display_properties = manifest_entry.displayProperties;

    display_properties.id = hash_identifier;

    return display_properties;
}

module.exports = public;
