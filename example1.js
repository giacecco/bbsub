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
		bbsub.getMoreSubtitles(_.map(results, function (r) { return r.id; }), function (err, subtitles) {
			console.log(JSON.stringify(bbsub.getKeywordsFromMoreSubtitles(subtitles)));	
		});
	}
);	