var prompt = require('prompt');
var request = require('request');
var schedule = require('node-schedule');

var credentials = { username : '', password : '' };

var lastIp;

var getIp = function (callback) {
    request(
        'http://fugal.net/ip.cgi',
        function (error, response, body) {

            if (!error && response.statusCode == 200) {
                var ipAddress = body.trim();
                console.log('Current IP Address: ' + ipAddress);
                callback(ipAddress);
                return;            
            }
            
            console.log(error);

            if (!!body) console.log('Response: ' + body);
        });
}

var unblockUs = function (ipAddress) {

    if (lastIp == ipAddress) {
        console.log('No update.');
        return;
    }

    console.log('Updating unblock-us...');

    request(
        'https://api.unblock-us.com/login?' + credentials.username + ':' + credentials.password,
        function (error, response, body) {

            if (!error && response.statusCode == 200) {
                console.log('Response: ' + body);
                lastIp = ipAddress;
                return;
            }

            console.log(error);

            if (!!body) console.log('Response: ' + body);
        });
}

var job = function() {
    console.log('Running at ' + new Date() + '...');
    getIp(unblockUs); 
};

var scheduleJob = function () {
    var j = schedule.scheduleJob('10 * * * *', job);
    console.log('Job scheduled to run every 10 minutes');
};

var promptProperties = [{ name: 'username' }, { name: 'password', hidden: true }];
prompt.start();
prompt.get(promptProperties, function (err, result) {

    if (err) { throw err; }

    credentials.username = result.username;
    credentials.password = result.password;

    scheduleJob();
});
