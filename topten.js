var argv = require('optimist') 
		.usage('Usage: $0 <string> [option] [option...]\n\n' +
			   'Search options:\n' +
 				'--category <string>              Narrow search to matched categories (regex or comma separated values)\n' +
				'--channel <string>               Narrow search to matched channel(s) (regex or comma separated values)\n' +
				'--exclude <string>               Narrow search to exclude matched programme names (regex or comma separated values)\n' +
				'--exclude-category <string>      Narrow search to exclude matched categories (regex or comma separated values)\n' +
				'--exclude-channel <string>       Narrow search to exclude matched channel(s) (regex or comma separated values)')
		.demand(1)
		.argv,
	bbsub = require("./lib/main.js"),
	_ = require("underscore");

bbsub.search({ 'fullText': argv._[0], 
		 'channel': argv['channel'],
		 'category': argv['category'],
		 'exclude': argv['exclude'],
		 'exclude-category': argv['exclude-category'],
		 'exclude-channel': argv['exclude-channel'], }, 
	function (err, results) {
		console.log("Analysing '" + results[0].title + "'");
		bbsub.getSubtitles(results[0].id, function (err, subtitles) {
			var words = bbsub.getKeywordsFromSubtitles(subtitles);
			console.log("The top ten words are:");
			var sortedWords = _.keys(words).sort(function (a, b) { return words[b].length - words[a].length; });
			for(var i = 0; i < 10; i++) {
				console.log("  " + (i + 1) + ": " + sortedWords[i] + " (" + words[sortedWords[i]].length + " occurrences at " + _.first(words[sortedWords[i]], 3).concat("...").join(", ") + ")");
			}
		});
	}
);	