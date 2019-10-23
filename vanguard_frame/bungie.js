
var fetch = require('node-fetch');
var auth = require('./auth.json');

var public = {};

async function get_request(name, url)
{
	url = 'https://www.bungie.net/Platform/' + url;

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

    if (response.ErrorCode != 1)
    {
		console.log(response);

		throw new Error(JSON.stringify(response));
    }

    return response.Response;
}

public.search_destiny_player = async function(displayName, platform)
{
    var url = 'Destiny2/SearchDestinyPlayer/-1/' + displayName + '/';

	var players = (await get_request('search_destiny_player', url));

	console.log(players);

    var matching_players = [];
	for (var index = 0; index < players.length; index++)
	{
        if (players[index].iconPath == '/img/theme/destiny/icons/icon_' + platform + '.png')
		{
            matching_players.push(players[index]);
        }
	}

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

public.get_character_ids = async function (player)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Profiles';

    var character_ids = (await get_request('get_character_ids', url)).profile.data.characterIds;

	console.log(character_ids);

	if (character_ids.length == 0)
	{
		throw new Error('found no characters for ' + player.displayName);
	}
    
    return character_ids;
}

public.get_character = async function (player, character_id)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/Character/' + character_id + '/?components=Characters';
	
    var character = (await get_request('get_character', url)).character.data;

	console.log(character);

    return character;
}

public.get_triumph_score = async function (player)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Records';

    var score = (await get_request('get_triumph_score', url)).profileRecords.data.score;

	console.log(score);
    
    return score;
}

public.get_triumphs = async function (player)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Records';

    var triumphs = (await get_request('get_triumphs', url)).profileRecords.data.records;

	console.log(triumphs);
    
    return triumphs;
}

// NOTE: the documentation says not to do this for huge lists (use the manifest instead)
public.get_triumph_name = async function (hashIdentifier)
{
    var url = 'Destiny2/Manifest/DestinyRecordDefinition/' + hashIdentifier + '/';

    var triumph_display_properties = (await get_request('get_triumphs', url)).displayProperties;

	console.log(triumph_display_properties);
    
    return triumph_display_properties.name;
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

public.print_triumph = async function (hashIdentifier, triumph)
{
    var name = (await public.get_triumph_name(hashIdentifier));

    console.log('name = ' + name);
    console.log('state = ' + public.get_triumph_state(triumph));
}

module.exports = public;
