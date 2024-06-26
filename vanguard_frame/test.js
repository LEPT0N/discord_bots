
var util = require('./util.js');
var bungie = require('./bungie.js');
var leaderboard = require('./leaderboard.js');

var public = {};

public.run = async function (bot)
{
    return;

    util.log('test.run');

    try
    {
        // await save_collectibles({ arguments: ['LEPT0N', 2721, 'xboxLive'] });

        // await test_leaderboard({ arguments: ['triumph_score', 'active'] });
        // await test_leaderboard({ arguments: ['triumph_score', 'total'] });
        // await test_leaderboard({ arguments: ['triumph_score', 'legacy'] });

        // await test_leaderboard({ arguments: ['individual_triumph', 'crucible_kills'] });
        // await test_leaderboard({ arguments: ['individual_triumph', 'clan_xp'] });
        // await test_leaderboard({ arguments: ['individual_triumph', 'power_bonus'] });
        // await test_leaderboard({ arguments: ['individual_triumph', 'season_pass_rank'] });
        // await test_leaderboard({ arguments: ['individual_triumph', 'glory'] });

        // await test_leaderboard({ arguments: ['per_character_triumph', 'show_your_colors'] });
        // await test_leaderboard({ arguments: ['per_character_triumph', 'show_your_colors', 'class'] });

        // await test_leaderboard({ arguments: ['individual_stat', 'light_level'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'deaths'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'suicides'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'killing_spree'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'kill_distance'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'kills'] });
        // await test_leaderboard({ arguments: ['individual_stat', 'orbs_generated'] });

        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_weapon_type'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_weapon_type', 'pvp'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_weapon_type', 'pve'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_non_weapon_type'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_non_weapon_type', 'pvp'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_non_weapon_type', 'pve'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_primary_weapon_type'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_primary_weapon_type', 'pvp'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_primary_weapon_type', 'pve'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_special_weapon_type'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_special_weapon_type', 'pvp'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_special_weapon_type', 'pve'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_heavy_weapon_type'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_heavy_weapon_type', 'pvp'] });
        // await test_leaderboard({ arguments: ['highest_stat', 'favorite_heavy_weapon_type', 'pve'] });

        // await test_leaderboard({ arguments: ['collectibles', 'weapons'] });
        // await test_leaderboard({ arguments: ['collectibles', 'mods'] });
        // await test_leaderboard({ arguments: ['collectibles', 'exotics'] });
        // await test_leaderboard({ arguments: ['collectibles', 'shaders'] });
        // await test_leaderboard({ arguments: ['collectibles', 'pinnacle_weapons'] });
        // await test_leaderboard({ arguments: ['collectibles', 'oops_all_lunas'] });

        // TODO: double check these numbers. in fact. doublecheck ALL numbers.
        // await test_leaderboard({ arguments: ['triumphs', 'exotic_catalysts'] });
        // await test_leaderboard({ arguments: ['triumphs', 'lore'] });
        // await test_leaderboard({ arguments: ['triumphs', 'seals'] });
        // await test_leaderboard({ arguments: ['triumphs', 'gilded_seals'] });
        // await test_leaderboard({ arguments: ['triumphs', 'seasonal_challenges'] });

        // await test_leaderboard({ arguments: ['true_facts', 'best_titan'] });
        // await test_leaderboard({ arguments: ['true_facts', 'eyes_of_tomorrow'] });

        // await test_leaderboard({ arguments: ['activity_history', 'raids_completed'] });
        // await test_leaderboard({ arguments: ['activity_history', 'raids_failed'] });
        // await test_leaderboard({ arguments: ['activity_history', 'time_raiding'] });

        // await test_leaderboard({ arguments: ['weapon_kills', 'The Huckleberry'] });
        // await test_leaderboard({ arguments: ['weapon_kills', 'Trinity Ghoul'] });
        // await test_leaderboard({ arguments: ['weapon_kills', 'Riskrunner'] });
        // await test_leaderboard({ arguments: ['weapon_kills', 'Anarchy'] });
        // await test_leaderboard({ arguments: ['weapon_kills', 'any'] });

        // await test_leaderboard({ arguments: ['metrics', 'triumph_score'] });
        // await test_leaderboard({ arguments: ['metrics', 'unbroken_gild_count'] });
        // await test_leaderboard({ arguments: ['metrics', 'dredgen_gild_count'] });
        // await test_leaderboard({ arguments: ['metrics', 'conqueror_gild_count'] });
        // await test_leaderboard({ arguments: ['metrics', 'flawless_gild_count'] });
        // await test_leaderboard({ arguments: ['metrics', 'deadeye_gild_count'] });
        // await test_leaderboard({ arguments: ['metrics', 'glory'] });
        // await test_leaderboard({ arguments: ['metrics', '1963785799'] }); // Infamy Rank Resets
        // await test_leaderboard({ arguments: ['metrics', '871184140'] }); // KDA
        // await test_leaderboard({ arguments: ['metrics', 'asdf'] }); // NaN
        // await test_leaderboard({ arguments: ['metrics', '1234'] }); // bad id
        // await test_leaderboard({ arguments: ['metrics', 'glory'] });
        // await test_leaderboard({ arguments: ['metrics', 'season_15_pass_rank'] });
        // await test_leaderboard({ arguments: ['metrics', 'season_15_champ_kills'] });
        // await test_leaderboard({ arguments: ['metrics', 'season_15_enemy_kills'] });

        // await test_leaderboard({ arguments: ['profile_data', 'guardian_rank'] });

        // await test_raids({ arguments: ['LEPT0N', 2721, 'xboxLive'] });
        // await test_weapon_history({ arguments: ['LEPT0N', 2721, 'xboxLive'] });
        // await test_weapon_history({ arguments: ['Sandman', 1220, 'steam'] });

        // await test_find_differing_triumphs({ arguments: ['LEPT0N', 2721, 'xboxLive'] });

        // await compare_user_collectibles({ user_1: ['LEPT0N', 2721, 'xboxLive'], user_2: ['Sandman', 1220, 'steam'], root_node_id: 3509235358 }); // mods

        // await test_metrics({ user: ['LEPT0N', 2721, 'xboxLive']}); // mods

        // test_find_emoji("hi friend <:asdf:12345> is cool 123");
    }
    catch (error)
    {
        util.log('Exception:', error);

        var error_details = error.name + " : " + error.message;

        util.log(error_details);
    }

    process.exit();
}

async function test_metrics(input)
{
    var player = await bungie.search_destiny_player(input.user);

    var player_metrics = (await bungie.get_metrics(player));

    util.log('player_metrics', player_metrics['3329916678']);

    var root_display_properties = await bungie.get_display_properties(
        '3329916678',
        bungie.manifest_sections.metric);

    util.log('root_display_properties', root_display_properties);

    // 1250683514 = Crucible Seal Gildings
    // 2365336843 = Gambit Seal Gildings
    // 3266682176 = Conqueror Seal Gildings
    // 4112712479 = Flawless Seal Gildings
}

// Compare collections of two different accounts
async function compare_user_collectibles(input)
{
    var player_1 = await bungie.search_destiny_player(input.user_1);
    var player_2 = await bungie.search_destiny_player(input.user_2);
    
    var collectibles = await bungie.get_all_child_items(input.root_node_id, 'collectibles');

    var player_1_collectibles = await bungie.get_collectibles(player_1);
    var player_2_collectibles = await bungie.get_collectibles(player_2);

    var player_1_unlocked_count = 0;
    var player_2_unlocked_count = 0;

    // The first element of the array are character-agnostic mods. The rest are character-specific mods.
    // The only character-specific mods are from the artifact, which I don't care about.
    player_1_collectibles = [ player_1_collectibles[0] ];
    player_2_collectibles = [ player_2_collectibles[0] ];

    await Promise.all(collectibles.map(async function (collectible_id)
    {
        var player_1_unlocked = false;
        var player_2_unlocked = false;

        player_1_collectibles.forEach(function (character_collectibles)
        {
            if (character_collectibles[collectible_id])
            {
                var state = character_collectibles[collectible_id].state;

                if (!(state & bungie.collectible_state.NotAcquired))
                {
                    player_1_unlocked = true;
                }
            }
        });

        player_2_collectibles.forEach(function (character_collectibles)
        {
            if (character_collectibles[collectible_id])
            {
                var state = character_collectibles[collectible_id].state;

                if (!(state & bungie.collectible_state.NotAcquired))
                {
                    player_2_unlocked = true;
                }
            }
        });

        if (player_1_unlocked)
        {
            player_1_unlocked_count++;
        }

        if (player_2_unlocked)
        {
            player_2_unlocked_count++;
        }

        if (player_1_unlocked != player_2_unlocked)
        {
            var player_with;
            var player_without;

            if (player_1_unlocked)
            {
                player_with = player_1;
                player_without = player_2;
            }
            else
            {
                player_with = player_2;
                player_without = player_1;
            }

            var display_properties = await bungie.get_display_properties(
                collectible_id,
                bungie.manifest_sections.collectible);

            util.log(player_with.displayName + ' has "' + display_properties.name + '" (' + collectible_id + ') but ' + player_without.displayName + ' does not');
        }
    }));

    util.log(player_1.displayName + ' unlocked ' + player_1_unlocked_count + ' collectibles');
    util.log(player_2.displayName + ' unlocked ' + player_2_unlocked_count + ' collectibles');
}

// Find triumphs that differ between characters.
async function test_find_differing_triumphs(input)
{
    // var display_properties = await bungie.get_display_properties(
    //     '378857807',
    //     bungie.manifest_sections.record);

    var player = await bungie.search_destiny_player(input.arguments);

    var all_character_data = await bungie.get_per_character_triumphs(player);

    for (var character_index = 0; character_index < all_character_data.length - 1; character_index++)
    {
        first_character_triumphs = all_character_data[character_index].records;

        await Object.keys(first_character_triumphs).map(async function (triumph_id)
        {
            var score = bungie.get_triumph_score(first_character_triumphs[triumph_id]);

            for (var other_character_index = character_index + 1; other_character_index < all_character_data.length; other_character_index++)
            {
                var other_character_triumphs = all_character_data[other_character_index].records;

                var other_character_triumph = other_character_triumphs[triumph_id];

                if (!other_character_triumph)
                {
                    util.log('triumph missing on other character: ' + triumph_id);
                }
                else
                {
                    var other_score = bungie.get_triumph_score(other_character_triumph);

                    if (score != other_score)
                    {
                        var display_properties = await bungie.get_display_properties(
                            triumph_id,
                            bungie.manifest_sections.record);

                        util.log('triumph "' + display_properties.name + '" (' + display_properties.description + ') (' + triumph_id + ') has mismatched scores (' + score + ') (' + other_score + ')');
                    }
                }
            }
        });
    }
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
    var leaderboard_parameter_1 = util.try_get_element(input.arguments, 1);
    var leaderboard_parameter_2 = util.try_get_element(input.arguments, 2);

    await leaderboard.get(leaderboard_name, leaderboard_parameter_1, leaderboard_parameter_2);
}

async function test_find_emoji(input)
{
    var emojis = util.find_emojis(input);

    emojis.forEach(function(emoji)
    {
        util.log('emoji found: "' + emoji + '"');
    });
}

async function test_raids(input)
{
    var player = await bungie.search_destiny_player(input.arguments);

    var activities = await bungie.get_activity_history(player, bungie.activity_mode_type.Raid);

    var completed_activities = activities.filter(function (activity)
    {
        return activity.values.completed.basic.value == bungie.completed.Yes
            && activity.values.completionReason.basic.value == bungie.completion_reason.Failed;
    });

    util.log('activities returned', completed_activities.length);

    var buckets = {};

    completed_activities.forEach(function (activity)
    {
        var bucket_id = activity.activityDetails.referenceId;

        if (!(bucket_id in buckets))
        {
            buckets[bucket_id] = 0;
        }

        buckets[bucket_id]++;
    });

    var output = [];

    await Promise.all(Object.keys(buckets).map(async function (bucket_id)
    {
        var display_properties = await bungie.get_display_properties(bucket_id, bungie.manifest_sections.activity);

        var name = display_properties.name;
        var count = buckets[bucket_id];

        if (name in output)
        {
            output[name] += count;
        }
        else
        {
            output[name] = count;
        }
    }));

    util.log('output', output);
}

// TODO: promote this exotic weapon list to a real command!

async function test_weapon_history(input)
{
    var manifest = (await bungie.get_manifest()).DestinyInventoryItemDefinition;

    var player = await bungie.search_destiny_player(input.arguments);

    var weapon_history = await bungie.get_weapon_history(player);

    var weapon_data = {};

    weapon_history.forEach(function (weapons)
    {
        if (weapons.weapon_history)
        {
            weapons.weapon_history.map(function (weapon)
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

    var weapon_totals = [];
    Object.entries(weapon_data).forEach(([key, value]) =>
    {
        weapon_totals.push({ name: key, kills: value });
    });
    weapon_totals.sort(function (a, b)
    {
        return b.kills - a.kills;
    });

    util.log('weapon_data', weapon_totals);
}

module.exports = public;
