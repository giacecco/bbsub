# bbsub

![love to nibble anything that comes into the shed, like our willies.](loveToNibble.jpg)

bbsub is a wrapper to the [get_iplayer](http://www.infradead.org/get_iplayer/html/get_iplayer.html) tool, mainly aimed at downloading the programmes' subtitles and playing with _corpus linguistics_. 

## Usage

First search what programmes you are interested in by using get_iplayer, e.g.

	$ get_iplayer "have i got news for you"
	get_iplayer 2.85.0.0, Copyright (C) 2008-2010 Phil Lewis
	  This program comes with ABSOLUTELY NO WARRANTY; for details use --warranty.
	  This is free software, and you are welcome to redistribute it under certain
	  conditions; use --conditions for details.

	Matches:
	373:	Have I Got News for You: Series 46 - Episode 6, BBC One, Comedy,Guidance,Satire,TV, default

	INFO: 1 Matching Programmes
	$ 

... then get the programme's words and word frequency:

	$ node example.js 373
	{"programme":2,"contains":2,"strong":3,"language":2,"good":9,"evening":1,"welcome":3,"news":8,"alexander":2,"armstrong":1, ... }
