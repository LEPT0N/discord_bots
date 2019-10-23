
var fs = require('fs');
var http = require('http-request');

var root_folder = './.data';

var public = {};

public.write_file = function(file_name, contents)
{
	var file_path = root_folder + '/' + file_name;

	console.log('writing to file ' + file_path);
	console.log('contents:');
	console.log(contents);

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

                resolve(file_path);
            }
        });
    });
}

public.upload_file = async function(bot, channel_id, url, file_name)
{
    var file_path = await public.download_file(url, file_name);

    console.log('uploading ' + file_path);

    bot.uploadFile(
    {
        to: channel_id,
        file: file_path
    });

    fs.unlinkSync(file_path);
}

module.exports = public;
