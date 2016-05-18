function parse(html){
	var $ = require('cheerio').load(html)
	var repositories = [];
	$('.repo-list-item').each(function(index, element){
		var title = $(element).find('.repo-list-name').children()[0].attribs.href.trim().split('/');
		var description = $(element).find('.repo-list-description').text().trim();
		var meta = $(element).find('.repo-list-meta').text().split('•');

		var item = {
			author: title[1],
			title: title[2],
			description: description,
			language: meta[0].trim(),
			stars: meta[1].trim()
		};
		repositories.push(item);
	});

	if(outputType === 'text'){
		repositories.forEach(function(repo, index){
			console.log(`${index+1}. ${repo.title} (${repo.author}) - ${repo.language} - ${repo.stars}`);
			console.log(`\t${repo.description}`);
		});
	}
	else if(outputType === 'json'){
		console.log(JSON.stringify(repositories));
	}
	else if(outputType === 'csv'){
		console.log('Author,Title,Description,Language,Stars');
		repositories.forEach(repo => {
			console.log(Object.keys(repo).map(key => repo[key]).join(','))
		});
	}

}

function fetch(url){
	require('https').get(url, res => {
		var data = '';
		res.on('data', chunk => data+=chunk);
		res.on('end', () => parse(data));
	});
}

function printHelp(){
	console.log(` _____ _ _   _____     _      _____              _     `);
	console.log(`|   __|_| |_|  |  |_ _| |_   |_   ____ ___ ___ _| |___ `);
	console.log(`|  |  | |  _|     | | | . |    | ||  _| -_|   | . |_ -|`);
	console.log(`|_____|_|_| |__|__|___|___|    |_||_| |___|_|_|___|___|  CLI v1\n`);
	console.log(`/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/\n`)
	console.log('Usage:\n')

	console.log('- Default (all languages, daily, text)')
	console.log('node trending.js\n')

	console.log('- Specific language (too many to write sorry :))')
	console.log('node trending.js --language=javascript\n')

	console.log('- Specific Time Range (d=daily, w=weekly, m=monthly)')
	console.log('node trending.js --time=m\n')

	console.log('- Specific Output Type (text, json, csv)')
	console.log('node trending.js --output=csv\n')

	console.log('- Combo!')
	console.log('node trending.js --time=m --language=go --type=csv')
}

var url = 'https://github.com/trending';
var outputType = 'text';
if(process.argv.length > 2){
	process.argv.shift() & process.argv.shift();
	var i;

	for (i = 0; i < process.argv.length; i++) {
		if(['--help', '-h'].indexOf(process.argv[i]) !== -1){
			printHelp()
			process.exit(0);
		}
	}

	for (i = 0; i < process.argv.length; i++) {
		if(process.argv[i].indexOf('--language') === 0){
			url += `/${process.argv[i].split('=')[1]}`;
			process.argv.splice(i, 1);
			break;
		}
	}

	for (i = 0; i < process.argv.length; i++) {
		if(process.argv[i].indexOf('--time') === 0){
			var timeOptions = {
				'd': 'daily',
				'w': 'weekly',
				'm': 'monthly'
			};
			url += `?since=${timeOptions[process.argv[i].split('=')[1]]}`;
			process.argv.splice(i, 1);
			break;
		}
	}

	for (i = 0; i < process.argv.length; i++) {
		if(process.argv[i].indexOf('--type') === 0){
			outputType = process.argv[i].split('=')[1];
			process.argv.splice(i, 1);
			break;
		}
	}
}
fetch(url);
