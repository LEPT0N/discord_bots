
var util = require('./util.js');

var public = {};

var player_not_found = -1;
var roster_file_name = 'roster.json';

var cached_roster = null;

function load_roster()
{
    if (cached_roster)
    {
        return cached_roster;
    }

    var roster = {};

    if (util.file_exists(roster_file_name))
    {
        roster = util.read_file(roster_file_name);
    }
    else
    {
        roster = { players: [] };

        util.log('created empty roster:', roster);
    }

    cached_roster = roster;

    return roster;
}

function save_roster(roster)
{
    cached_roster = roster;

    util.write_file(roster_file_name, roster);
}

function get_player_index(roster, player)
{
    for (var index = 0; index < roster.players.length; index++)
    {
        if (roster.players[index].membershipId == player.membershipId)
        {
            return index;
        }
    }

    return player_not_found;
}

public.add_player = function (player)
{
    var roster = load_roster();

    if (get_player_index(roster, player) != player_not_found)
    {
        throw new Error('player "' + player.displayName + '" is already on the roster');
    }

    roster.players.push(player);

    save_roster(roster);
}

public.remove_player = function (player)
{
    var roster = load_roster();

    var player_index = get_player_index(roster, player);

    if (player_index == player_not_found)
    {
        throw new Error('player "' + player.displayName + '" not found in roster');
    }

    roster.players.splice(player_index, 1);

    save_roster(roster);
}

public.get_roster = function ()
{
    return load_roster();
}

module.exports = public;
