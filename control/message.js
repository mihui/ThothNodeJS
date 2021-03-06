
'use strict';

var CONVERSATION_SERVICE = 'conversation';
var CONVERSATION_VERSION_DATE = '2016-09-20';
var CONVERSATION_VERSION = 'v1';
var CONVERSATION_ACCESS_ERROR = 'Invalid token';

var watson = require( 'watson-developer-cloud' );  // watson sdk
var request = require('request');

var getConversationConfiguration = function () {
    if(process.env.CONVERSATION_TOKEN){
        return {
            watson: {
                url: process.env.CONVERSATION_ENDPOINT,
                username: process.env.CONVERSATION_USERNAME,
                password: process.env.CONVERSATION_PASSWORD,
                version_date:CONVERSATION_VERSION_DATE,
                version: CONVERSATION_VERSION
            },
            workspace: process.env.CONVERSATION_WORKSPACE_ID,
            token: process.env.CONVERSATION_TOKEN
        };
    }
    if (process.env.VCAP_SERVICES) {
        var services = JSON.parse(process.env.VCAP_SERVICES);
        for (var service_name in services) {
            if (service_name.indexOf(CONVERSATION_SERVICE) === 0) {
                var service = services[service_name][0];
                return {
                    url: service.credentials.url,
                    username: service.credentials.username,
                    password: service.credentials.password,
                    version_date:CONVERSATION_VERSION_DATE,
                    version: CONVERSATION_VERSION
                };
            }
        }
    }
    console.log("The runtime app has not bound conversation service yet!");
    return {
        version_date: CONVERSATION_VERSION_DATE,
        version: CONVERSATION_VERSION
    };
};
/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
var updateMessage = function (payload, res, response) {
    var intentInfo = null;

    if ( !response.output ) {
        response.output = {};
    } else {
        if ( response.intents && response.intents[0] ) {
            var intent = response.intents[0];
            if ( intent.confidence >= 0.75 ) {
                intentInfo = 'I understood your intent was ' + intent.intent;
            } else if ( intent.confidence >= 0.5 ) {
                intentInfo = 'I think your intent was ' + intent.intent;
            } else {
                intentInfo = 'I did not understand your intent';
            }
        }
        response.output.intentInfo = intentInfo;

        if (!response.output.api) {
            return response;
        }
        request(response.output.api, function (error, apiResponse, body) {
                if (!error && apiResponse.statusCode === 200) {
                    response.output.specialContent = JSON.parse(body).specialContent;
                } else{
                    console.log("Got error on calling api: " + response.output.api);
                }
                return res.json(response);
            });
    }
};
console.log("Calling getConversationConfiguration");
var config = getConversationConfiguration();

console.log("Initializing conversation");
// Create the service wrapper
var conversation = watson.conversation(config.watson);
//
var message = function (req, res) {
    if ( !config.workspace || config.workspace === '' ) {
        return res.json( {
            'output': {
                'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
                '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' +
                'Once a workspace has been defined the intents may be imported from ' +
                '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
            }
        } );
    }
    var payload = {
        workspace_id: config.workspace,
        context: {},
        input: {},
        api_param:{}
    };
    if ( req.body ) {
        if ( req.body.accessKey!== config.token) {
            return res.status( 403 ).json( { error: CONVERSATION_ACCESS_ERROR } );
        }
        if ( req.body.input ) {
            payload.input = req.body.input;
        }
        if ( req.body.context ) {
            // The client must maintain context/state
            payload.context = req.body.context;
        }
        if ( req.body.api_param ) {
            payload.api_param = req.body.api_param;
        }
    }
    // Send the input to the conversation service
    conversation.message(payload, function(err, response) {
        if ( err ) {
            return res.status( err.code || 500 ).json( err );
        }
        var m = updateMessage( payload, res, response );
        console.log("!!!!!!!!!!Before send back...");
        if (!response.output.api) {
            return res.json(m);
        }
    });
};

exports.message = message;