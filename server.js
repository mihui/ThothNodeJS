'use strict';

var express = require( 'express' );  // app server
var bodyParser = require( 'body-parser' );  // parser for post requests

var g = require("./control/greetings");
var m = require("./control/message");

var app = express();

// Bootstrap application settings
app.use( express.static( './public' ) ); // load UI from public folder
app.use( bodyParser.json() );

	app.get("/", function (request, response) {
	    response.writeHead(200, {"Content-Type": "text/plain"})
	    response.end("This is Thoth application!\n");
	});

    app.post('/api/greeting', g.greetings);
    app.post('/api/message', m.message);

var port = process.env.PORT || process.env.VCAP_APP_PORT || 8080;

app.listen(port, function() {
  console.log('Server running on port: %d', port);
});