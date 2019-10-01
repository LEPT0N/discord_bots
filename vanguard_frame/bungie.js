
var fetch = require('node-fetch');
var auth = require('./auth.json');

var methods = {};

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

methods.search_destiny_player = async function(displayName)
{
    var url = 'Destiny2/SearchDestinyPlayer/-1/' + displayName + '/';

	var players = (await get_request('search_destiny_player', url));

	console.log(players);

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
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Profiles';

    var character_ids = (await get_request('get_character_ids', url)).profile.data.characterIds;

	console.log(character_ids);

	if (character_ids.length == 0)
	{
		throw new Error('found no characters for ' + player.displayName);
	}
    
    return character_ids;
}

methods.get_character = async function (player, character_id)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/Character/' + character_id + '/?components=Characters';
	
    var character = (await get_request('get_character', url)).character.data;

	console.log(character);

    return character;
}

methods.get_triumph_score = async function (player)
{
    var url = 'Destiny2/' + player.membershipType + '/Profile/' + player.membershipId + '/?components=Records';

    var score = (await get_request('get_triumph_score', url)).profileRecords.data.score;

	console.log(score);
    
    return score;
}

module.exports = methods;
