'use strict';

var http = require('http');

var greetings = function (req, res) {
    var options = {
        host: "testapiprovider.mybluemix.net", 
        path: "/userInfo", 
        method: "POST",  
        headers: { "Content-Type": "application/json" } 
    };

    var userInfoReq = http.request(options, function(userInfoRes) {
        userInfoRes.setEncoding('utf8');
        userInfoRes.on('data', function (data) {

            var userInfo = JSON.parse(data);
            var greeting_res_text = "Hello ";

            var nameStr = "";
            for(var i=0;i<userInfo.length;i++){
                nameStr += userInfo[i].name;
                nameStr += ", ";
            }

            greeting_res_text += nameStr;

            greeting_res_text += "Nice to meet you!";

            res.json({"output":{text:greeting_res_text},"context":{"default_counter": 0}});

        });
    });
    // write data to request body
    userInfoReq.write(JSON.stringify(req.body));
    userInfoReq.end();
};

exports.greetings = greetings;