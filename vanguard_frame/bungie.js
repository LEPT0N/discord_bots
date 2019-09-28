
var fetch = require('node-fetch');
var auth = require('./auth.json');

var methods = {};

async function get_request(url)
{
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
		throw new Error(JSON.stringify(response));
    }

    return response;
}

methods.get_membership_id = async function(displayName)
{
    var url = 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/' + displayName + '/';

    var response = await get_request(url);

    return response.Response[0].membershipId;
}

methods.get_date_last_played = async function (membershipId)
{
    var url = 'https://www.bungie.net/Platform/Destiny2/1/Profile/' + membershipId + '/?components=100';

    var response = await get_request(url);

    var dateLastPlayed = response.Response.profile.data.dateLastPlayed;
    
    return dateLastPlayed;
}

module.exports = methods;
