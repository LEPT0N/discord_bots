
var fetch = require('node-fetch');
var auth = require('./auth.json');
var util = require('./util.js');

var public = {};

public.root_url = 'https://www.bungie.net';

async function get_request(name, url, raw)
{
	url = public.root_url + url;

	console.log('');
	console.log(name);
	console.log(url);

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
		console.log(response);

        throw new Error(JSON.stringify(response));
    }

    return response.Response;
}

async function download_manifest_directory()
{
    var url = '/Platform/Destiny2/Manifest';

    var manifest_directory = (await get_request('download_manifest_directory', url));

    console.log(manifest_directory);
    console.log('');

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

public.search_destiny_player = async function(arguments)
{
	var displayName = arguments[0];
	var platform = arguments[1];
    var requested_index = util.try_get_element(arguments, 2);

    var url = '/Platform/Destiny2/SearchDestinyPlayer/All/' + displayName + '/';

	var players = (await get_request('search_destiny_player', url));

	console.log(players);
    console.log('');

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

	console.log(character_ids);
    console.log('');

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

	console.log(character);
    console.log('');

    return character;
}

public.get_triumph_score = async function (player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Records';

    var score = (await get_request('get_triumph_score', url)).profileRecords.data.score;

	console.log(score);
    console.log('');
    
    return score;
}

public.get_triumphs = async function (player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Records';

    var triumphs = (await get_request('get_triumphs', url)).profileRecords.data.records;

    // This is too huge to print
    // console.log(triumphs);
    // console.log('');
    
    return triumphs;
}

public.get_triumph_display_properties = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyRecordDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Triumph "' + hashIdentifier + '" is not in the manifest');
    }

    var display_properties = manifest[hashIdentifier].displayProperties;

    console.log('get_triumph_display_properties');
    console.log(display_properties);
    console.log('');

    return display_properties;
}

public.get_character_stats = async function (player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Account/' + player.membershipId + '/Stats/';

    var stats = (await get_request('get_character_stats', url));

    // This is too huge to print
    // console.log(stats);
    // console.log('');

    return stats;
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

public.get_collectibles = async function (player)
{
    var url = '/Platform/Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Collectibles';

    var collectibles = (await get_request('get_collectibles', url)).profileCollectibles.data.collectibles;

    // This is too huge to print
    // console.log(collectibles);
    // console.log('');
    
    return collectibles;
}

public.get_collectible_display_properties = async function (hashIdentifier)
{
    var manifest = (await public.get_manifest()).DestinyCollectibleDefinition;

    if (!hashIdentifier in manifest)
    {
        throw new Error('Collectible "' + hashIdentifier + '" is not in the manifest');
    }

    var display_properties = manifest[hashIdentifier].displayProperties;

    console.log('get_collectible_display_properties');
    console.log(display_properties);
    console.log('');

    return display_properties;
}

public.triumph_state =
[
    { value: 1, name: 'RecordRedeemed' },
    { value: 2, name: 'RewardUnavailable' },
    { value: 4, name: 'ObjectiveNotCompleted' },
    { value: 8, name: 'Obscured' },
    { value: 16, name: 'Invisible' },
    { value: 32, name: 'EntitlementUnowned' },
    { value: 64, name: 'CanEquipTitle' },
];

public.get_triumph_state = function (triumph)
{
    var combined_triumph_state = [];

	for (var index = 0; index < public.triumph_state.length; index++)
	{
        if (triumph.state & public.triumph_state[index].value)
        {
		    combined_triumph_state.push(public.triumph_state[index].name);
        }
	}

	return '[' + combined_triumph_state.join(' ') + ']';
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
            }
        }
    });

    return results;
}

module.exports = public;
