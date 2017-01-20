
/*eslint-env node */
'use strict';

var mc = require("./control/messagecontrol");
var greeting = require("./control/greetingControl");
var gr = require("./control/graphiccontrol");
var helloworld = require("./control/helloworldControl");

var router = function(app, logmessages) {
    app.post('/api/greeting', greeting.greeting);
    app.post('/api/message', mc.message);
    app.get('/api/graphic', gr.graphic);
    app.get('/api/test', helloworld.test);
};

module.exports = router;