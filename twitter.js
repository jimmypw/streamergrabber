var https = require('https');
var url = require('url');
var crypto = require('crypto');
var querystring = require('querystring');

// Set some variables for colours
esc = "\033[";
defaultcolour = esc + process.env.DEFCOLOR;
tweetcolour = esc + process.env.TWTCOLOR;
highlightcolour = esc + process.env.HGHCOLOR;
resetcolour = esc + "0m"

// Init bits
console.log("StreamerGrabber starting up");
var d = new Date();
console.log(d.toLocaleTimeString());
console.log("Search Terms: ");
console.log("Track: " + process.env.TRACK);
console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+")

// Main app starts here

var OAuth = newOauth();
var query = {"track": process.env.TRACK};
var connection = url.parse("https://stream.twitter.com/1.1/statuses/filter.json");
connection.method = 'POST';
connection.headers = {
	"User-Agent":   "StreamerGrabber/0.1b",
	"Content-Type": "application/x-www-form-urlencoded"
};

OAuth["oauth_signature"] = signRequest(OAuth, connection, query);
connection.headers['Authorization'] = oauth_create_header(OAuth);

var postdata = querystring.stringify(query);
connection.headers["Content-Length"] = postdata.length;

var twittercall = https.request(connection, processTweets);
twittercall.write(postdata);


/////////////////////////////////
// Start functions

function newOauth() {
	var hash = crypto.createHash('sha1');
	var nonce = hash.update(crypto.randomBytes(32)).digest('hex');

	var OAuth = {
		"oauth_consumer_key": process.env.APPTOKEN,
		"oauth_nonce": nonce,
		"oauth_timestamp": Math.round(Date.now()/1000),
		"oauth_token": process.env.USRTOKEN,
		"oauth_version": "1.0",
		"oauth_signature_method": "HMAC-SHA1"
	};
	return OAuth;
}

function signRequest(oauth, conn, data) {
	var returnData = "";
	var signString = "";
	var signKey = encodeURIComponent(process.env.APPSECRE) + "&" + encodeURIComponent(process.env.USRSECRE);

	signString += connection.method.toUpperCase();
	signString += "&";
	signString += encodeURIComponent(conn.href);
	signString += "&";
	signString += encodeURIComponent(oauth_serialise_objects([oauth, data]));

	var hmac = crypto.createHmac("sha1", signKey);
	signature = hmac.update(signString).digest('base64');

	return signature;
}

function oauth_serialise_objects (objects) {
	newobj = {};
	for (o in objects){
		for (var d in objects[o]) {
			newobj[encodeURIComponent(d)] = encodeURIComponent(objects[o][d]);
		}
	}
	var keys = []
	for (var k in newobj){
		keys.push(k);
	}
	keys.sort();
	var returnData = "";
	var first = true;
	for(var k in keys) {
		if (!first) {
			returnData += '&';
		}
		key = keys[k];
		returnData += key + "=" + newobj[key];
		first = false;
	}
	return returnData;
} 

function oauth_create_header(oauth) {
	var returnData = "OAuth ";
	var first = true;

	for (o in oauth) {
		if (!first) {
			returnData += ", ";
		}
		returnData += encodeURIComponent(o) + "=" + encodeURIComponent(oauth[o]);
		first = false;
	}
	
	return returnData;
}

function processTweets(res) {
	if (process.env.DEBUG == "true") {
		console.log(res);
	}
	if (res.statusCode == '200'){
		res.on('data', function(chunk) {
			try {
				var tweet = JSON.parse(chunk.toString());
				var re = /\n|\r/g;
				var message = tweet.text.replace(re, " ")
				var d = new Date()
				console.log(defaultcolour + 
					d.toLocaleTimeString() + 
					" @" + normaliseText(tweet.user.screen_name, 23) + 
					tweetcolour + highlightKeywords(message, query.track) + resetcolour);
			} catch (e) {
				//unable to parse json, we don't care we just don't deal with it
			}
		});
	} else {
		res.on('data', function(chunk) {
			console.log(chunk.toString());
		});
	}
}

function normaliseText(user, length) {
	var returnData = user;
	for (var i = length - user.length; i > 0; i--) {
		returnData += " ";
	}
	return returnData;
}

function highlightKeywords(tweet, keywords){
	var words = keywords.split(',');
	var returnData = tweet;
	for (w in words) {
		var regex = new RegExp("(" + words[w]  + ")", "i");
		returnData = returnData.replace(regex, highlightcolour + "$1" + tweetcolour);
	}
	return returnData;
}
