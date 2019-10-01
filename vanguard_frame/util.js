
var fs = require('fs');

var root_folder = './.data';

var methods = {};

methods.write_file = function(file_name, contents)
{
	var file_path = root_folder + '/' + file_name;

	fs.mkdirSync(root_folder, {recursive: true});

	console.log('writing to file ' + file_path);
	console.log('contents:');
	console.log(contents);
	console.log('');

	var contents_serialized = JSON.stringify(contents);

	fs.writeFileSync(file_path, contents_serialized, (error) =>
	{
		if (error)
		{
			throw error;
		}
	});
}

methods.read_file = function(file_name)
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

module.exports = methods;
