
var fetch = require('node-fetch');
var auth = require('./auth.json');

var methods = {};

async function get_request(url)
{
    var response = await fetch('https://www.bungie.net/Platform/' + url,
	{
        method: 'get',
        headers:
		{
            'X-API-KEY': auth.bungie_key
        }
    }).then(response => response.json());

    if (response.ErrorCode != 1)
    {
		throw new Error(JSON.stringify(response));
    }

    return response;
}

methods.search_destiny_player = async function(displayName)
{
    var url = 'Destiny2/SearchDestinyPlayer/-1/' + displayName + '/';

	var players = (await get_request(url)).Response;

	if (players.length != 1)
	{
		var players_found = [];
		for (var index = 0; index < players.length; index++)
		{
			players_found.push(players[index].displayName);
		}

		players_found = '[' + players_found.join(',') + ']'

		throw new Error('found ' + players.length + ' players for ' + displayName + ' ' + players_found);
	}

	return players[0];
}

methods.get_character_ids = async function (player)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=100';

    var character_ids = (await get_request(url)).Response.profile.data.characterIds;

	if (character_ids.length == 0)
	{
		throw new Error('found no characters for ' + player.displayName);
	}
    
    return character_ids;
}

methods.get_character = async function (player, character_id)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/Character/' + character_id + '/?components=200';
	
    var character = (await get_request(url)).Response.character.data;

    return character;
}

module.exports = methods;
