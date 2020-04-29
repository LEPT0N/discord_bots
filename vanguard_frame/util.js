
var fs = require('fs');
var http = require('http-request');

var root_folder = './.data';

var public = {};

public.max_message_length = 2000;

public.file_exists = function (file_name)
{
    var file_path = root_folder + '/' + file_name;

    return fs.existsSync(file_path);
}

public.write_file = function (file_name, contents, suppress_contents_log)
{
    var file_path = root_folder + '/' + file_name;

    public.log('writing to file ' + file_path);

    if (!suppress_contents_log)
    {
        public.log('contents:', contents);
    }

    fs.mkdirSync(
        file_path.substring(0, file_path.lastIndexOf('/')),
        { recursive: true });

    var contents_serialized = JSON.stringify(contents);

    fs.writeFileSync(file_path, contents_serialized, (error) =>
    {
        if (error)
        {
            throw error;
        }
    });
}

public.read_file = function (file_name, suppress_contents_log)
{
    var file_path = root_folder + '/' + file_name;

    public.log('reading from file ' + file_path);

    var contents = fs.readFileSync(file_path);

    var contents_deserialized = JSON.parse(contents);

    if (!suppress_contents_log)
    {
        public.log('contents:', contents_deserialized);
    }

    return contents_deserialized;
}

public.try_read_file = function (file_name, suppress_contents_log)
{
    if (public.file_exists(file_name))
    {
        return public.read_file(file_name, suppress_contents_log);
    }
    else
    {
        return null;
    }
}

public.download_file = async function (url, file_name)
{
    var file_path = root_folder + '/' + file_name;

    public.log('downloading file ' + url);

    fs.mkdirSync(root_folder, { recursive: true });

    return new Promise((resolve, reject) =>
    {
        http.get({ url: url }, file_path, function (error, result)
        {
            if (error)
            {
                throw error;
            }
            else
            {
                public.log('download complete to: ' + file_path);

                resolve(file_path);
            }
        });
    });
}

public.upload_file = async function (bot, channel_id, url, file_name)
{
    var file_path = await public.download_file(url, file_name);

    public.log('uploading:', file_path);

    bot.uploadFile(
        {
            to: channel_id,
            file: file_path
        });

    fs.unlinkSync(file_path);
}

public.parse_arguments = function (input)
{
    public.log('parsing arguments:', input.raw_message);

    var arguments_raw = input.raw_message.split(' ');

    if (arguments_raw.length < 1 || arguments_raw[0].length < 1)
    {
        throw new Error('Must provide a command');
    }

    input.command = arguments_raw[0];

    arguments_raw = arguments_raw.splice(1);

    var arguments = [];

    // Loop through each argument
    for (var index = 0; index < arguments_raw.length; index++)
    {
        var raw_value = arguments_raw[index];

        var value = raw_value;

        // Look for one that starts with a quote
        if (value.slice(0, 1) == '"')
        {
            // Remove the quote
            value = value.slice(1);

            var found_end = false;

            // Loop through the rest of the arguments
            for (index++; !found_end && index < arguments_raw.length; index++)
            {
                var added_value = arguments_raw[index];

                // Look for one that ends with a quote
                if (added_value.slice(-1) == '"')
                {
                    // Remove the quote
                    added_value = added_value.slice(0, -1);

                    found_end = true;
                }

                // Append the current argument to all that we've found since the opening quote
                value = value + ' ' + added_value;
            }

            // HACK: go back one so that the outer loop's index++ won't skip an argument
            index--;

            if (!found_end)
            {
                throw new Error('Unable to find closing quote for argument "' + raw_value + '"');
            }
        }

        // Add the argument to the list
        arguments.push(value);
    }

    input.arguments = arguments;

    public.log('parsed arguments:', input);

    return input;
}

public.try_get_element = function (array, index)
{
    if (index < array.length)
    {
        return array[index];
    }
    else
    {
        return null;
    }
}

public.get_date = function ()
{
    return new Date().toJSON().slice(0, 10);
}

public.sleep = async function (milliseconds)
{
    return new Promise(x => setTimeout(x, milliseconds));
}

public.log = function (message, data)
{
    console.log(message);
    if (data)
    {
        console.log(data);
    }
    console.log('');
}

public.format_seconds = function (seconds)
{
    var minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;

    var hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    var days = Math.floor(hours / 24);
    hours = hours - days * 24;

    var result = [];

    if (days > 0)
    {
        result.push(days + 'd');
    }

    if (hours > 0)
    {
        result.push(hours + 'h');
    }

    if (minutes > 0)
    {
        result.push(minutes + 'm');
    }

    if (seconds > 0)
    {
        result.push(seconds + 's');
    }

    return result.join(' ');
}

public.create_string = function (fill, length)
{
    return Array(length + 1).join(fill);
}

public.add_commas_to_number = function (number)
{
    number = number.toString();

    var result = '';
    var group_count = 0;
    var start_index = number.length - 1;

    var index_of_dot = number.indexOf('.');
    if (index_of_dot != -1)
    {
        start_index = index_of_dot - 1;
    }

    for (var index = start_index; index >= 0; index--, group_count++)
    {
        if (group_count == 3)
        {
            result = ',' + result;
            group_count = 0;
        }

        result = number[index] + result;
    }

    if (index_of_dot != -1)
    {
        result = result + number.substring(index_of_dot);
    }

    return result;
}

module.exports = public;
