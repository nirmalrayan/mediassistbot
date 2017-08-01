// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder');
var appId = process.env.MY_APP_ID;
var appPassword = process.env.MY_APP_PASSWORD; 

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || process.env.port || 3978 || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector
({ appId: '021235f4-edd2-4ad6-8ac6-d38076e4cfa0', appPassword: 'aSt0XQJAbRAkfVEoWdMsfEG' }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("You said: %s", session.message.text);
});