
var fs = require('fs');
var http = require('http-request');

var root_folder = './.data';

var public = {};

public.file_exists = function(file_name)
{
	var file_path = root_folder + '/' + file_name;

    return fs.existsSync(file_path);
}

public.write_file = function(file_name, contents)
{
	var file_path = root_folder + '/' + file_name;

	console.log('writing to file ' + file_path);
	console.log('contents:');
	console.log(contents);
    console.log('');

	fs.mkdirSync(root_folder, {recursive: true});

	var contents_serialized = JSON.stringify(contents);

	fs.writeFileSync(file_path, contents_serialized, (error) =>
	{
		if (error)
		{
			throw error;
		}
	});
}

public.read_file = function(file_name)
{
	var file_path = root_folder + '/' + file_name;

	console.log('reading from file ' + file_path);

	var contents = fs.readFileSync(file_path);

	var contents_deserialized = JSON.parse(contents);

	console.log('contents:');
	console.log(contents_deserialized);
	console.log('');

	return contents_deserialized;
}

public.download_file = async function(url, file_name)
{
	var file_path = root_folder + '/' + file_name;

	console.log('downloading file ' + url);

	fs.mkdirSync(root_folder, {recursive: true});

    return new Promise((resolve, reject) =>
    {
        http.get( { url: url }, file_path, function (error, result)
        {
		    if (error)
		    {
			    throw error;
		    }
            else
            {
                console.log('download complete to ' + file_path);
                console.log('');

                resolve(file_path);
            }
        });
    });
}

public.upload_file = async function(bot, channel_id, url, file_name)
{
    var file_path = await public.download_file(url, file_name);

    console.log('uploading ' + file_path);
    console.log('');

    bot.uploadFile(
    {
        to: channel_id,
        file: file_path
    });

    fs.unlinkSync(file_path);
}

public.parse_arguments = function(arguments_string)
{
    console.log('parsing arguments:');
    console.log(arguments_string);

    var arguments_raw = arguments_string.split(' ');
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

    console.log('parsed arguments:');
    console.log(arguments);

    return arguments;
}

module.exports = public;
