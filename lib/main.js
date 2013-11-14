// thr stopwords are courtesy of package 'tm' in R
var STOPWORDS = [ "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "would", "should", "could", "ought", "i'm", "you're", "he's", "she's", "it's", "we're", "they're", "i've", "you've", "we've", "they've", "i'd", "you'd", "he'd", "she'd", "we'd", "they'd", "i'll", "you'll", "he'll", "she'll", "we'll", "they'll", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't", "doesn't", "don't", "didn't", "won't", "wouldn't", "shan't", "shouldn't", "can't", "cannot", "couldn't", "mustn't", "let's", "that's", "who's", "what's", "here's", "there's", "when's", "where's", "why's", "how's", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very" ],
	MIN_WORD_LENGTH = 4;

var async = require("async"),
	exec = require('child_process').exec,
	fs = require("fs"),
	_ = require("underscore");

exports.search = function (parameters, callback) {

	var searchTitles = function (parameters, callback) {
		parameters.fullText = '"' + parameters.fullText + '"' || "";
		parameters.channel = parameters.channel ? "--channel '" + parameters.channel + "' " : "";
		parameters.category = parameters.category ? "--category '" + parameters.category + "' " : "";
		parameters.exclude = parameters.exclude ? "--exclude '" + parameters.exclude + "' " : "";
		parameters['exclude-category'] = parameters['exclude-category'] ? "--exclude-category '" + parameters['exclude-category'] + "' " : "";
		parameters['exclude-channel'] = parameters['exclude-channel'] ? "--exclude-channel '" + parameters['exclude-channel'] + "' " : "";
		exec('get_iplayer ' + parameters.channel + parameters.category + parameters.fullText, 
		 	function(err, stdout, stderr) {
				stdout = (stdout.split("Matches:")[1] || "").split("INFO: ")[0] || ""; 
				var results = _.reduce(stdout.split("\n"), function (memo, row) { 
					if (row != "") {
						memo = memo.concat({ 
							id: row.split(":")[0], 
							title: row.split("\t")[1].split(",")[0],
						});
					}
					return memo;
				}, [ ]);
				callback(null, results);
			});
	}

	searchTitles(parameters, function (err, results) {
		async.map(results, function (item, callback) {
			exec('get_iplayer --info ' + item.id, function(err, stdout, stderr) {
				stdout = ((stdout.split("INFO: ")[1] || "").split("INFO: ")[0] || "").split("\n");
				stdout = _.rest(stdout, 2);
				stdout = _.first(stdout, stdout.length - 3);				
				_.each(stdout, function (row) {
					item[row.split(":")[0]] = row.substring(16, row.length);
				})
				callback(null, item);
			});
		}, function (err, results) {
			callback (err, results);
		})
	});

}

// getSubtitles takes as an input one programme id and retuns a set of subtitles
exports.getSubtitles = function (id, callback) {
	exec('get_iplayer --subsonly --get ' + id, function(err, stdout, stderr) {
		var filename = stdout.split("INFO: Downloading Subtitles to '")[1] || undefined;
		if (!filename) {
			callback (new Error("Could not read the subtitles file."), null);
		} else {
			filename = filename.split("'")[0];
			fs.readFile(filename, 'utf8', function (err, data) {
				fs.unlink(filename, function (err) {
					data = _.reduce(data.split("\n\n"), function (memo, item) {
						item = item.split("\n");
						if (item.length > 2) {
							memo = memo.concat({
								number: parseInt(item[0]),
								startTimecode: item[1].split(" ")[0],
								endTimecode: item[1].split("> ")[1],
								text: _.rest(item, 2).join("\n"),
							});						
						}
						return memo;
					}, [ ]);
					callback (err, data);
				});
			});
		}
	});
}

exports.getMoreSubtitles = function (ids, callback) {
	async.reduce(ids, [ ], function (memo, id, callback) {
		exports.getSubtitles(id, function (err, subtitles) {
			callback(err, memo.concat([ subtitles ]));
		});	
	}, callback);
}

// getKeywordsFromSubtitles takes a subtitles set as an input and returns a 
// hash of its words and their occurrency timecodes
exports.getKeywordsFromSubtitles = function (subtitles) {
	return _.reduce(subtitles, function (memo, s) { 
		_.each(s.text
				.toLowerCase()
				.replace(/[^a-z\s]/g, " ")
				.replace(/\s{2,}/, " ")
				.split(" "),
			function (word) {
				if ((word.length >= MIN_WORD_LENGTH) && !_.contains(STOPWORDS, word)) {
					memo[word] = (memo[word] || [ ]).concat(s.startTimecode);  				
				}
			});
		return memo; }, { });
} 

exports.getKeywordsFromMoreSubtitles = function (subtitlesArray) {
	return _.reduce(subtitlesArray, function (memo, subtitles) {
		var words = exports.getKeywordsFromSubtitles(subtitles);
		_.each(_.keys(words), function (word) {
			memo[word] = (memo[word] || 0) + words[word].length;
		});
		return memo;
	}, { });	
}

