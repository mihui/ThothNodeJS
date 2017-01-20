
/*eslint-env node */
'use strict';
var helloworldControl = {
    test: function helloworldControl(req, res) {
        var result = { text: 'Hello World' }
        res.send(result);
    }
};

module.exports = helloworldControl;