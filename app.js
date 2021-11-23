//Author: Nirmal Rayan
//Version: 1.1
//Application: MediBuddy (Microsoft Bot Framework)

// Add your requirements
var http = require('http');
var https = require('https');
var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var cognitiveservices = require('botbuilder-cognitiveservices');
var handoff = require('botbuilder-handoff');


//Speech Recognition
var fs = require('fs');
var needle = require('needle');
var speechService = require('./speech-service.js');

const {Wit, log} = require('node-wit');
require('env2')('.env'); // loads all entries into process.env

//Azure SQL Server
var Request = require('tedious').Request;
var Connection = require('tedious').Connection;
var NodeGeocoder = require('node-geocoder');

// Create connection to database
var config = 
   {
     userName: process.env.AzureSQLUserName, 
     password: process.env.AzureSQLPassword, 
     server: process.env.AzureSQLServer,
     options: 
        {
           database: process.env.AzureSQLDatabase 
		   , encrypt: true
        }
   }

var connection = new Connection(config);

function storeFeedback(userid, servicename, helpful, feedback, timestamp, source)
   {
	   var requestString = "INSERT INTO ["+process.env.AzureSQLDatabase+"].[dbo].[Feedback] (UserID, ServiceName, Helpful, Feedback, FeedbackDate, FeedbackSource) values ("+userid+","+servicename+","+helpful+","+feedback+","+timestamp+","+source+")";
	   // Read all rows from table

		var Request = require('tedious').Request;
    	request = new Request(
          requestString,
             function(err, rowCount, rows) 
                {
                    console.log(rowCount + ' row(s) inserted successfully!');
                }
            );

	 	connection.execSql(request);
	 return;
   }


function storeFB(userid, servicename, helpful, feedback, timestamp, source, userName, userEmail, userPhone, convSource)
   { 
	
	var requestString = "INSERT INTO ["+process.env.AzureSQLDatabase+"].[dbo].[Feedback] (UserID, ServiceName, Helpful, Feedback, FeedbackDate, FeedbackSource, UserName, UserEmail, UserPhone, ConversationSource) values ("+userid+","+servicename+","+helpful+","+feedback+","+timestamp+","+source+","+userName+","+userEmail+","+userPhone+","+convSource  +")";
	// Read all rows from table
		
	var Request = require('tedious').Request;
     request = new Request(
          requestString,
             function(err, rowCount, rows) 
                {
                    console.log(rowCount + ' row(s) inserted successfully!');
                }
            );

	 connection.execSql(request);
	 return;
   }

var sqlConfig = {
    userName: process.env.AzureSQLUserName,
    password: process.env.AzureSQLPassword,
    server: process.env.AzureSQLServer,
    enforceTable: true, // If this property is not set to true it defaults to false. When false if the specified table is not found, the bot will throw an error.
    options: {
        database: process.env.AzureSQLDatabase,
        table: process.env.AzureSQLDBTable,
        encrypt: true,
        rowCollectionOnRequestCompletion: true
    }
}


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || process.env.port || 65535, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser({ mapParams: true }));

//Create new instance of in-memory storage
var inMemoryStorage = new builder.MemoryBotStorage(); 

server.pre(restify.pre.sanitizePath()); // Add this line

//Direct to index.html web page
 server.get('/', restify.plugins.serveStatic({
 directory: __dirname,
 default: '/index.html'	
}));

// Create chat bot
var connector = new builder.ChatConnector
({  appId: process.env.MicrosoftAppId, 
	appPassword: process.env.MicrosoftAppPassword  }); 

//MAIN.
var bot = new builder.UniversalBot(connector,[

    function (session) {

		if(session.message.address.channelId === 'facebook'){
 			var welcomeCard = new builder.HeroCard(session)
				.title("Hi "+session.message.address.user.name+"! Nice to see you. I am MediBuddy")
				.subtitle("I will be your personal healthcare assistant. \n\nℹ️ Type \"show menu\" or \"#\" at any time to see the menu.")
				.images([
					new builder.CardImage(session)
						.url('https://i.imgur.com/k4eN1Bc.png')
						.alt('MediBuddy')
				])
				.buttons([
					builder.CardAction.imBack(session, "Show Menu", "Show Menu")
				]); 
		}
/*		else{
			if(session.userData.masterName){
				var welcomeCard = new builder.ThumbnailCard(session)
				.title("Hi " + session.userData.masterName + "! Nice to see you again")
				.subtitle("I will be your personal healthcare assistant. \n\n💡 Type \"`show menu`\" or \"`#`\" at any time to see the menu.")
				.images([
					new builder.CardImage(session)
						.url('https://i.imgur.com/sQFiqkI.png')
						.alt('MediBuddy')
				])
				.buttons([
					builder.CardAction.imBack(session, "Show Menu", "Show Menu")
				]);
				
			}
*/			else{
				var welcomeCard = new builder.ThumbnailCard(session)
				.title("Greetings! I'm MediBuddy")
				.subtitle("I will be your personal healthcare assistant. \n\n💡 Type \"`show menu`\" or \"`#`\" at any time to see the menu.")
				.images([
					new builder.CardImage(session)
						.url('https://i.imgur.com/sQFiqkI.png')
						.alt('MediBuddy')
				])
				.buttons([
					builder.CardAction.imBack(session, "Show Menu", "Show Menu")
				]);
			
			}
//		}	
			session.send(new builder.Message(session)
				.speak("Greetings! I'm MediBuddy. I will be your healthcare assistant. Type Show Menu or # at any time to see the menu.")
				.addAttachment(welcomeCard));

session.beginDialog("/refer");
	}
]).set('storage', inMemoryStorage); // Register in-memory storage 

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {

				bot.send(new builder.Message()
                    .address(message.address)
					.text("Greetings!"));	

				setTimeout(function () {
						bot.send(new builder.Message()
						.address(message.address)
						.text("I answer all your healthcare queries related to claims (and their status)!"));
				},2000);

				setTimeout(function () {
					bot.send(new builder.Message()
                    .address(message.address)
					.text("Example questions are \"Show menu\" or \"Show me network hospitals in Mumbai\" or \"What is my claim status?\""));
				},4000);							
            }
        });
    }
});	

server.post('/api/messages', connector.listen());

function sentimentAnalyzer(session, userResponse){
	console.log("Passed userResonse: "+ userResponse);
	let accessKey = '075f655482d04cf297756c551ea650af';
	let uri = 'westus.api.cognitive.microsoft.com';
	let path = '/text/analytics/v2.0/sentiment';

	let response_handler = function (response) {
		let body = '';
		response.on ('data', function (d) {
			body += d;
		});
		response.on ('end', function () {
			let body_ = JSON.parse (body);
			let body__ = JSON.stringify (body_, null, '  ');
			console.log(body__);
//			console.log("Sentiment Score: "+body_.documents[0].score);
			if(body_.documents[0].score > 0.80){
				session.send("You seem to be happy! How can we make your day even better?");
			}else if(body_.documents[0].score > 0.1){
				session.send("You seem to be stressed out! What can I do to make your day better?");
			}else{
				session.send("You seem to be in crisis! Is there someway I can help you?");
			}

			session.userData.sentimentScore = body_.documents[0].score;
			return body_;
		});
		response.on ('error', function (e) {
			console.log ('Error: ' + e.message);
		});
	};

	let get_sentiments = function (documents) {
		let body = JSON.stringify (documents);

		let request_params = {
			method : 'POST',
			hostname : uri,
			path : path,
			headers : {
				'Ocp-Apim-Subscription-Key' : accessKey,
			}
		};

		let req = https.request (request_params, response_handler);
		req.write (body);
		req.end ();
	}

	let documents = { 'documents': [
		{ 'id': '1', 'language': 'en', 'text': userResponse }
	//	{ 'id': '2', 'language': 'es', 'text': 'Este ha sido un dia terrible, llegué tarde al trabajo debido a un accidente automobilistico.' },
	]};

	get_sentiments (documents);
//	return session.userData.sentimentScore;
}

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.

// Create connection to database
var config2 = 
   {
     userName: process.env.AzureSQLUserName, 
     password: process.env.AzureSQLPassword, 
     server: process.env.AzureSQLServer,
     options: 
        {
           database: process.env.AzureSQLDatabase 
        }
   }

var post_connection = new Connection(config2);

const logUserConversation = (event) => {
	if(event.text == ''){
		event.text = "No Input";
	}
	console.log('message: ' + event.text + ', user: ' + event.user.name);

};

// Localization Support
bot.dialog('/localePicker', [
    function (session) {
        // Prompt the user to select their preferred locale
        builder.Prompts.choice(session, "What's your preferred language?", 'English|Hindi|Tamil|Bengali|Urdu');
    },
    function (session, results) {
        // Update preferred locale
        var locale;
        switch (results.response.entity) {
            case 'English':
                locale = 'en';
                break;
            case 'Hindi':
                locale = 'hi';
                break;
            case 'Tamil':
                locale = 'ta';
                break;
			case 'Bengali':
				locale = 'bn';
				break;
            case 'Urdu':
                locale = 'ur';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                // Locale files loaded
                session.endDialog(`Your preferred language is now ${results.response.entity}`);
            } else {
                // Problem loading the selected locale
                session.error(err);
            }
        });
    }
]);

//=========================================================
// Bot Translation Middleware
//=========================================================

// Middleware for logging
bot.use({
    receive: function (event, next) {
        logUserConversation(event);
        next();
    },
    send: function (event, next) {
        logUserConversation(event);
        next();
    }
});

//QnA Maker Configuration
var qnarecognizer  = new cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: process.env.QnAknowledgeBaseId, 
	authKey: process.env.QnAAuthKey,
	endpointHostName: process.env.QnAEndpointHostName,
	top: 5
});

var qnaMakerTools = new cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

//LUIS Configuration
var model = process.env.LUISURI;
var recognizer = new builder.LuisRecognizer(model);

//	.matches("Abuse","askforAbuse")
//	.matches("TechIssue",)
 //  .matches("Logout", "logout")
bot.dialog('/refer', new builder.IntentDialog({ 
		recognizers : [recognizer, qnarecognizer],
		qnaThreshold: 0.5,
		feedbackLib: qnaMakerTools
	})
	.matches("showMenu","showMenu")
	.matches("SayHello", "hello")
	.matches("GetName", "setName")
	.matches("CustomerCare", "askforCallCenter")
	.matches("HR", "askforHR")
//	.matches("Grievance", "askforGrievance")
	.matches("GeneralQuery", "askforGeneralQuery")
	.matches("Investigation","askforInvestigation")
	.matches("track claim","trackClaim")
//	.matches("HomeHealthCare","homehealthcare")
//	.matches("healthCheck","healthCheck")
	.matches("sayThanks","getCompliment")
	.matches("searchNetwork","searchNetwork")
	.matches("sayGoodbye","sayGoodbye")
	.matches("TechIssue","techIssue")
//	.matches("Medicine","medicine")
//	.matches("TeleConsultation","teleconsultation")
//	.matches("Consultation","consultation")
	.matches("downloadECard","downloadEcard")
	.matches("Offshore","askforOffshore")
//	.matches("labTest","labtest")
	.matches("serviceOP","serviceOP")
	.matches("Claims - Coverage","Coverage")
	.matches("NotTrained","idontknow")
	.matches("contact","contact")
	.matches("Abuse","askforAbuse")
	.matches("qna", [
    function (session, args, next) {
		var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'answer');
        session.send(answerEntity.entity);
    }
])
    .onDefault((session, args) => {
		var wasHelpful = 0;
		session.userData.serviceName = "Not Trained";
		storeFeedback(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(session.message.text).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"));
        session.endDialog("Sorry, I did not understand \"\`%s\`\".  Try saying `show menu` or `#` to go back to the main menu or `help` if you need assistance.", session.message.text);
    })
);


bot.dialog("hello", (session, args) => {
		session.endDialog("Hello. I'm MediBuddy. I will be your healthcare assistant. You can type `\"show menu\"` or `\"#\"` at any time of the conversation to go back to the main menu.");
}).triggerAction({
    matches: ['SayHello', '👍']
});


bot.dialog("idontknow", (session, args) => {
		session.endDialog("I'm sorry. I'm not yet trained to respond to this query but I'm getting smarter everyday!");
}).triggerAction({
    matches: 'NotTrained'
});
	
// Dialog to ask for Master Name
bot.dialog('setName',[
	function (session, args, next){
			var nameEntity = builder.EntityRecognizer.findEntity(args.entities, 'setName');
			if(nameEntity){
				session.userData.masterName = nameEntity.entity;
//				next({ response: nameEntity.entity });
				
				var msg = new builder.Message(session)
				.speak("Hi "+ session.userData.masterName+"! I like your name, but I can help you better if you can give me your Medi Assist ID OR Claim Number ")
				.text("Hi "+ session.userData.masterName+"! I like your name, but I can help you better if you can give me your ")
				.suggestedActions(
					builder.SuggestedActions.create(
						session, [
							builder.CardAction.imBack(session, "Get Claim ID", "Claim ID"),
							builder.CardAction.imBack(session, "Get Medi Assist ID", "Medi Assist ID")
						])
				);
			session.send(msg);	
			}
			else{
				builder.Prompts.text(session, 'Please enter your full name');
			}
	},
	function(session, results){
		session.userData.masterName = results.response;
		var msg = new builder.Message(session)
		.speak("Hi "+ session.userData.masterName+"! I like your name, but I can help you better if you can give me your Medi Assist ID OR Claim Number ")
		.text("Hi "+ session.userData.masterName+"! I like your name, but I can help you better if you can give me your ")
		.suggestedActions(
			builder.SuggestedActions.create(
				session, [
					builder.CardAction.imBack(session, "Get Claim ID", "Claim ID"),
					builder.CardAction.imBack(session, "Get Medi Assist ID", "Medi Assist ID")
				])
		);
	session.send(msg);	
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]).triggerAction({
    matches: 'GetName'
});

// Dialog to ask for MAID
bot.dialog('setMAID',[
	function (session){
			session.beginDialog('askforMAID');
	},	
	function (session, results) {
		
		session.userData.MAID = results.response;
		
		var clmMAIDChecker = /^\d{10}$/.test(results.response);
		if(JSON.stringify(clmMAIDChecker) == "true"){
			session.beginDialog('askforOperation2');
			session.dialogData.MAID = results.response;
		}
		else{
			session.send("⚠️ The Medi Assist ID should only be numeric and ten digits long.");
			session.beginDialog('askforDownloadwMAIDConfirmationStandAlone');
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]).triggerAction({
    matches: [/Medi Assist ID/i]
});


// Dialog to ask for ClaimID
bot.dialog('setClaimID',[
	function (session){
			session.beginDialog('askforClaimNumber');

	},	
	function (session, results) {
		var clmNoChecker = /^\d{8}$/.test(results.response);
		if(JSON.stringify(clmNoChecker) == "true"){
			session.userData.claimNumber = results.response;
			session.beginDialog('askforOperation');
		}
		else{
			session.send("⚠️ The claim number should only be `numeric` and `eight digits` long.");
			session.beginDialog('askforTrackClaimwIDConfirmationStandAlone');
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]).triggerAction({
    matches: [/Claim ID/i]
});

// Dialog for displaying menu after completing requested tasks
bot.dialog('askforOperation2',[
	function (session){

		session.sendTyping();
		setTimeout(function () {
			
		var msg = new builder.Message(session)
			.speak("Great! Would you want me to display your E-Card, Network Hospitals or Policy Details?")
			.text("Great! Would you want me to display")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Download E-Card", "Your eCard"),
						builder.CardAction.imBack(session, "Search Network Hospitals", "Network Hospitals"),
						builder.CardAction.imBack(session, "Policy Details", "Policy Details"),
					])
			);
		session.send(msg);	
		}, 5000);		

	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog for displaying menu after completing requested tasks
bot.dialog('askforOperation',[
	function (session){

		session.sendTyping();
		setTimeout(function () {
			
		var msg = new builder.Message(session)
			.speak("Great! Would you want me to display your claim status or your eCard?")
			.text("Great! Would you want me to display your claim status or your ecard?")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Track Claim with ID", "Claim Status"),
						builder.CardAction.imBack(session, "Download E-Card", "Your eCard")
					])
			);
		session.send(msg);	
		}, 5000);		

	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to show main menu
bot.dialog('showMenu',[
	function (session){	
			var menucards = [];
			session.userData.claimNumber = "";
			trackClaimCard = new builder.HeroCard(session)
									.title("Track Claim")
									.subtitle("Tracking your claim can help you understand where you are in the claims process.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/7Fc2dgp.png')
											.alt('Track Claim')
									])
									.buttons([
										builder.CardAction.imBack(session, "Track Claim", "Track Claim")
										]);
			
			menucards.push(trackClaimCard);
			
			downloadCard = new builder.HeroCard(session)
									.title("Download E-Card")
									.subtitle("Getting your Medi Assist E-Card is much simpler and at your finger tips. Download your E-Card now.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/01QMBJe.png')
											.alt('Download E-Card')
									])
									.buttons([
										builder.CardAction.imBack(session, "Download E-Card", "Download E-Card")
										]);
			
			menucards.push(downloadCard);
			
			searchNetworkCard = new builder.HeroCard(session)
									.title("Search Network")
									.subtitle("Search Medi Assist to find the nearest network hospitals and avail e-cashless benefits.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/5XFqXU7.png')
											.alt('Search Network')
									])
									.buttons([
										builder.CardAction.imBack(session, "Locate Network Hospital", "Locate Network Hospital")
										]);
			
			menucards.push(searchNetworkCard);

		if(session.message.address.channelId !== 'facebook'){
			helpCard = new builder.HeroCard(session)
									.title("Help Desk")
									.subtitle("I can help you plan your hospitalization, book eCashless or help you understand how claims work.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/shdopAW.png')
											.alt('Help')
									])
									.buttons([
										builder.CardAction.imBack(session, "Help", "Help")
										]);
			
			menucards.push(helpCard);
		}
			var msg = new builder.Message(session)
			.speak("My abilities are still growing. In a nutshell, here's what I can do: ")
			.text("My abilities are still growing. In a nutshell, here's what I can do: ")
			.attachmentLayout(builder.AttachmentLayout.carousel)
			.attachments(menucards);
		session.send(msg);
	},
	function(session, results) {
		session.endDialogWithResult(results);	
	}
])
.triggerAction({
	matches: [/^show menu$/i, /#/i, /^Show Menu$/i, 'showMenu']
});


// Dialog to start tracking claims
bot.dialog('trackClaim', [
	function (session, args, next){
		session.beginDialog('askforTrackBy');
//		session.send("Welcome to Claim Tracking System ✨💫🌟");
/*		var intent = args.intent;
		var trackBy = builder.EntityRecognizer.findEntity(intent.entities, 'Trackby.Type::Claim ID');
		var clmID = builder.EntityRecognizer.findEntity(intent.entities, 'TrackbyClaim.ID');
		var DOA = builder.EntityRecognizer.findEntity(intent.entities, 'Trackby.DOA');

		//Prompt for Track By
		if(!trackBy){
			session.beginDialog('askforTrackBy');
		}else{
			if(trackBy.type === "Trackby.Type::Claim ID"){
				session.send("YOU HAVE CHOSEN TO TRACK WITH CLAIM DETAILS");
				session.beginDialog('trackClaimwID');
			}else if (trackBy.type === "Trackby.Type::Medi Assist ID"){
				session.send("YOU HAVE CHOSEN TO TRACK WITH MEDI ASSIST DETAILS");
				session.beginDialog('trackClaimwMAID');
			
			}else if (trackBy.type === "Trackby.Type::Employee ID"){
				session.send("YOU HAVE CHOSEN TO TRACK WITH EMPLOYEE DETAILS");
				session.beginDialog('trackClaimwEmpID');
			}
//			next();
		}		
		if(!clmID){
			next();
			console.log("clmID.entity: "+ clmID.entity);
		}else{
			
		}

		console.log("TRACKBY DATA IS :"+JSON.stringify(trackBy));
		console.log("Claim ID you've entered is: "+JSON.stringify(session.userData.claimNumber));*/

	},
	function(session, results, next) {
		session.endDialogWithResult(results);	
	}
])
.triggerAction({
	matches: [/track claim/i, /track/i, /tracking/i, /claim tracking/i, /claim status/i, /pending claim/i, /claim details/i, 'track claim'], 
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)",
	listStyle: builder.ListStyle["button"]
	
});

// Dialog for displaying menu after completing requested tasks
bot.dialog('askforMore',[
	function (session){
		session.sendTyping();
		setTimeout(function () {
			
		var msg = new builder.Message(session)
			.speak("How else can I help you? To go back to the main menu, say Show Menu. To go to help desk, say Help. You can choose to end this conversation by saying End Conversation.")
			.text("How else can I help you?")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Show Menu", "Show Menu"),
						builder.CardAction.imBack(session, "Help", "Help Desk"),
						builder.CardAction.imBack(session, "End Conversation", "End Conversation"),
					])
			);
		session.send(msg);	
		}, 5000);		
	}
]);

// Dialog for displaying menu after completing requested tasks
bot.dialog('askforMore2',[
	function (session){
		session.send('Thanks, a lot!');
		session.send("");
		session.sendTyping();
		setTimeout(function () {
			
		var msg = new builder.Message(session)
			.speak("How else can I help you? To go back to the main menu, say Show Menu. To go to help desk, say Help. You can choose to end this conversation by saying End Conversation.")
			.text("How else can I help you?")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Show Menu", "Show Menu"),
						builder.CardAction.imBack(session, "Help", "Help Desk"),
						builder.CardAction.imBack(session, "End Conversation", "End Conversation"),
					])
			);
		session.send(msg);	
		}, 5000);		

	}
]);

// Dialog to ask for Track By
bot.dialog('askforTrackBy',[
	function (session){
		var msg = new builder.Message(session)
			.speak("Alright, let's get started. Choose from any of these three ways to track your claim. You can track with your Claim ID, MediAssist ID or Employee ID")
			.text("Alright, let's get started 🚀. Choose from any of these three ways to track your claim: ")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Track with Claim ID", "Claim ID"),
						builder.CardAction.imBack(session, "Track with Medi Assist ID", "Medi Assist ID"),
						builder.CardAction.imBack(session, "Track with Employee ID", "Employee ID"),
					])
			);
		session.send(msg);	
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

//Custom redirect to Track with Claim ID
bot.customAction({
	matches: [/^Track with Claim ID$/gi, 'Trackby.Type::Claim ID', 'trackbyClaim.ID'],
	onSelectAction: (session, args, next) => {
		session.beginDialog('trackClaimwID');
		
	}
});

//Custom redirect to Track with Medi Assist ID
bot.customAction({
	matches: [/^Track with Medi Assist ID$/gi, 'Trackby.Type::Medi Assist ID', 'trackbyMAID.ID'],
	onSelectAction: (session, args, next) => {
		session.beginDialog('trackClaimwMAID');
		
	}
});

//Custom redirect to Track with Employee ID
bot.customAction({
	matches: [/^Track with Employee ID$/gi, 'Trackby.Type::Employee ID', 'trackbyEmp.ID'],
	onSelectAction: (session, args, next) => {
		session.beginDialog('trackClaimwEmpID');	
	}
});

//Custom redirect to Ask for MAID
bot.customAction({
	matches: [/^Get Medi Assist ID$/gi],
	onSelectAction: (session, args, next) => {
		session.beginDialog('setMAID');	
	}
});

//Custom redirect to Ask for Claim ID
bot.customAction({
	matches: [/^Get Claim ID$/gi],
	onSelectAction: (session, args, next) => {
		session.beginDialog('setClaimID');	
	}
});

//Custom redirect to Ask for Policy Coverage
bot.customAction({
	matches: [/^Policy Details$/gi],
	onSelectAction: (session, args, next) => {
		session.beginDialog('Coverage');	
	}
});


// Dialog to ask for Confirmation - Track with Claim Number
bot.dialog('askforTrackClaimwIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('trackClaimwID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
	}
]);

// Dialog to ask for Confirmation - Track with Claim Number
bot.dialog('askforTrackClaimwIDConfirmationStandAlone',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('setClaimID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
	}
]);

// Dialog to ask for Confirmation - Feedback
bot.dialog('askforFeedbackConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
			{
				speak: "Let's try again? yes or no",
				listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('askforFeedbackReason', {reprompt: true});
			return;
		}
		else {
			session.beginDialog('askforMore');
			return;
		}
	}
]);

// Dialog to ask for Claim Number
bot.dialog('askforFeedbackReason',[
	function (session){
		
		if(session.message && session.message.value){

			processSubmitAction9(session, session.message.value);
			if(session.userData.resetFeedback === 1){
				session.userData.resetFeedback = 0;
				session.beginDialog('askforFeedbackConfirmation');
				return;
			}else{
			session.endDialog();
				session.endConversation();
			return;
			}
		}

		var card = 
		{
			"contentType": "application/vnd.microsoft.card.adaptive",
			"content": {
				
			"type": "AdaptiveCard",
			"body": [
				{
				"type": "TextBlock",
				"size": "medium",
				"weight": "bolder",
				"text": "Feedback Form",
				"horizontalAlignment": "left"
				},
				{
				"type": "TextBlock",
				"text": "Please share your thoughts about me or your experience in general and I'll forward them to my masters.",
				"isSubtle": true,
				"wrap": true
				},
				{
					"type": "TextBlock",
					"text": "Name",
					"weight": "bolder"
				},				
				{
				"type": "Input.Text",
				"placeholder": "Enter your name",
				"style": "text",
				"maxLength": 0,
				"id": "UserName"
				},
				{
					"type": "TextBlock",
					"text": "E-mail Address",
					"weight": "bolder"
				},
				{
				"type": "Input.Text",
				"placeholder": "Enter your e-mail address",
				"style": "email",
				"maxLength": 0,
				"id": "UserEmail"
				},
				{
					"type": "TextBlock",
					"text": "Contact Number",
					"weight": "bolder"
				},
				{
				"type": "Input.Text",
				"placeholder": "Enter your phone number",
				"style": "tel",
				"maxLength": 0,
				"id": "UserPhone"
				},
    {
      "type": "TextBlock",
      "text": "Category",
	  "weight": "bolder"
    },
    {
      "type": "Input.ChoiceSet",
      "id": "UserService",
      "style": "compact",
      "value": "General Feedback",
      "choices": [
        {
          "title": "General Feedback",
          "value": "General Feedback"
        },
        {
          "title": "Track Claim",
          "value": "Track Claim"
        },
        {
          "title": "Download E-Card",
          "value": "Download E-Card"
        },
        {
          "title": "Search Network",
          "value": "Search Network"
        },
/*        {
          "title": "Health Check",
          "value": "Health Check"
        },
        {
          "title": "Medicine",
          "value": "Medicine"
        },
        {
          "title": "Consultation",
          "value": "Consultation"
        },
        {
          "title": "Home Health Care",
          "value": "Home Health Care"
        },
        {
          "title": "Dental",
          "value": "Dental"
        },
        {
          "title": "Hospitalization",
          "value": "Hospitalization"
        },
        {
          "title": "Tele Consultation",
          "value": "Tele Consultation"
        },
        {
          "title": "Lab Test",
          "value": "Lab Test"
        },
        {
          "title": "Second Opinion",
          "value": "Second Opinion"
        },
        {
          "title": "Genome Study",
          "value": "Genome Study"
        },
*/        {
          "title": "Help Desk",
          "value": "Help Desk"
        },
        {
          "title": "Other (please specify)",
          "value": "Other"
        }
      ]
	},
	{
      "type": "TextBlock",
      "text": "Comments",
	  "weight": "bolder"
    },
	{
	"type": "Input.Text",
	"placeholder": "Enter your comments",
	"style": "text",
	"isMultiline": true,
	"maxLength": 0,
	"id": "UserComment"
	}
			],
			"actions": [
				{
				"type": "Action.Submit",
				"title": "Submit Feedback"
				}
			]
			}
		};
		session.send(new builder.Message(session)
			.speak("Your feedback is valuable to us! Please share your thoughts about me or your experience in general and I'll forward them to my masters.")
			.addAttachment(card));

	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction9(session, message){
		var defaultErrorMessage = '**Please fill all the parameters:** \r\r\r\r';
		session.userData.resetFeedback = 0;
		var PhoneRegex = new RegExp(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
		var EmailRegex = new RegExp(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);

		//Name Validation
		if(!message["UserName"]){
			defaultErrorMessage += "* Name field cannot be empty. \r\r";
			session.userData.resetFeedback = 1;
		}else{
			session.userData.userName = message["UserName"];
		}

		//Email Validation
		if(EmailRegex.test(message["UserEmail"])){
			session.userData.userEmail = message["UserEmail"];
		}else{
			defaultErrorMessage += "* Invalid Email Address. \r\r";
			session.userData.resetFeedback = 1;
//			return false;
		}

		//Phone Validation
		if(PhoneRegex.test(message["UserPhone"])){
			session.userData.userPhone = message["UserPhone"];
		}else{
			defaultErrorMessage += "* Invalid Phone Number. \r\r";
			session.userData.resetFeedback = 1;
//			return false;
		}

		if(session.userData.serviceName){
			session.userData.conversationSource = session.userData.serviceName;
		}else{
			session.userData.conversationSource = "Generic";
		}
		session.userData.serviceName = message["UserService"];
		session.userData.FeedbackResponse = message["UserComment"];

		if(session.userData.resetFeedback === 1){
			session.send(defaultErrorMessage);
			return false;
		}else{
			
		
		var wasHelpful = 0;
		var connection = new Connection(config);
		// Attempt to connect and execute queries if connection goes through
		connection.on('connect', function(err) 
		{
			if (err) 
			{
				console.log(err);
				return;
			}
			else
			{
				console.log('session.userData.serviceName: '+ session.userData.serviceName);
				console.log('session.userData.FeedbackResponse: '+ session.userData.FeedbackResponse);
				console.log('session.message.timestamp: '+ session.message.timestamp);
				console.log('session.message.source: '+ session.message.source);
				console.log('session.userData.userName: '+ session.userData.userName);
				console.log('session.userData.userEmail: '+ session.userData.userEmail);
				console.log('session.userData.userPhone: '+ session.userData.userPhone);
				console.log('session.userData.conversationSource: '+ session.userData.conversationSource);
				storeFB(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(session.userData.FeedbackResponse).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"), JSON.stringify(session.userData.userName).replace(/"/g, "'"), JSON.stringify(session.userData.userEmail).replace(/"/g, "'"), JSON.stringify(session.userData.userPhone).replace(/"/g, "'"), JSON.stringify(session.userData.conversationSource).replace(/"/g, "'"));
			}
		}
		);
	}
			// proceed to compliment
			session.beginDialog('askforMore2');
			session.endDialog();
		
}

//Validate User Feedback
function validateFeedback(feedback) {
    if (!feedback) {
        return false;
    }
//	console.log(feedback);
	var hasName = typeof feedback["UserName"] === 'string' && feedback["UserName"].length > 3;
	
	var validEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(feedback["UserEmail"]);

	var validPhone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(feedback["userPhone"]);

	var hasComments = typeof feedback["UserName"] === 'string' && feedback["UserName"].length > 3;
    return hasName && validEmail && validPhone && hasComments;

}

// Dialog to ask for Claim Number
bot.dialog('askforFeedbackReasonFB',[
	function (session){
		session.userData.userName = session.message.address.user.name;
//		console.log('FACEBOOK ID IS: '+session.message.address.user.name);
		builder.Prompts.text(session, "Your feedback is valuable to us! Please enter your `E-mail address`:");		
	},
	function(session, results) {
		if(results.response){
			session.userData.userEmail = results.response;
//			console.log('USER ENTERED EMAIL ID: '+ results.response);
		}
		builder.Prompts.text(session, "Please enter your `Phone number`: ");
	/*	if(results.response){
			var validEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(results.response);
			if(validEmail){
				session.userData.userEmail = results.response;
				session.send("Please enter your `Phone number`: ");
			}else{
				session.send("The Email address you have entered is invalid.");
				session.send("Please enter your `Phone number`: ");
			}
		}*/
	},
	function(session, results){
		if(results.response){
			session.userData.userPhone = results.response;	
			if(session.userData.serviceName){
				session.userData.conversationSource = session.userData.serviceName;
			}else{
				session.userData.conversationSource = "Generic";
			}
		}
		session.userData.serviceName = "Not Taken";
		builder.Prompts.text(session, "Please enter your `Feedback` or `Comments`:");
	},
	function(session, results){
		if(results.response){
			session.userData.FeedbackResponse = results.response;
			var wasHelpful = 0;
			var connection = new Connection(config);
			// Attempt to connect and execute queries if connection goes through
			connection.on('connect', function(err) 
			{
				if (err) 
				{
					console.log(err);
					return;
				}
				else
				{
//					console.log('This is session.message data' + JSON.stringify(session.message));
					storeFB(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(session.userData.FeedbackResponse).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"), JSON.stringify(session.userData.userName).replace(/"/g, "'"), JSON.stringify(session.userData.userEmail).replace(/"/g, "'"), JSON.stringify(session.userData.userPhone).replace(/"/g, "'"), JSON.stringify(session.userData.conversationSource).replace(/"/g, "'"));
				}
			}
			);
		
				// proceed to compliment
				session.beginDialog('askforMore2');
				session.endDialog();
		}
	},
	function(session, results){
		session.endDialogWithResult(results);
	}
]);

// Dialog to ask for Feedback
bot.dialog('askforFeedback',[
	function (session){
		builder.Prompts.confirm(session, "💡 Did you find this helpful? (yes/no)",{speak: "Did you find this helpful? yes or no?", listStyle: builder.ListStyle["button"]});
	},
	function (session, results){
		if(results.response){
			var wasHelpful = 1;	
			var connection = new Connection(config);
			// Attempt to connect and execute queries if connection goes through
			connection.on('connect', function(err) 
			{
				if (err) 
				{
					console.log(err);
					return;
				}
				else
				{
					storeFeedback(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify('No Feedback Taken').replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"));
				}
			}
			);
		session.beginDialog('askforMore2');
	//	session.endDialog();
		session.endConversation();
		}else{
			var wasHelpful = 0;
			builder.Prompts.confirm(session, "💡 Would you like to leave a feedback? (yes/no)",{speak: "Do you want to leave a feedback? yes or no?", listStyle: builder.ListStyle["button"]});
		}
	},
	function (session, results) {
		if (results.response){
			if(session.message.address.channelId === 'facebook'){
				session.beginDialog('askforFeedbackReasonFB');
			}else{
				session.beginDialog('askforFeedbackReason');
			}
		}
		else {	
			session.beginDialog('askforMore');
			session.endConversation();
		}
		
	}/*,
	function (session, results) {
//		session.userData.FeedbackResponse = results.response;
		var wasHelpful = 0;
		var connection = new Connection(config);
		// Attempt to connect and execute queries if connection goes through
		connection.on('connect', function(err) 
		{
			if (err) 
			{
				console.log(err);
			}
			else
			{
				console.log('This is session.message data' + JSON.stringify(session.message));
				storeFeedback(JSON.stringify(session.message.user.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(session.userData.FeedbackResponse).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"));
			}
		}
		);
		session.beginDialog('askforMore2');
		session.endDialog();
	}*/,
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);


// Dialog to ask for OTP
bot.dialog('getOTP_trackwid',[
	function (session){
		builder.Prompts.text(session,"A one-time verification code has been sent to your registered email id and mobile number. If you have not received OTP,\r Please login to your **[MediBuddy](https://me.medibuddy.in/\)** portal.");	
										
	},	
	function (session, results) {
		console.log(results.response);
		var otpChecker = /^\d{6}$/.test(results.response);
		if(JSON.stringify(otpChecker) == "true"){
			session.userData.OTP = results.response;

			//Make POST request to MA Server with OTP
			var request = require('request');
			// Set the headers
			var headers = {
				'User-Agent':       'Super Agent/0.0.1',
				'Content-Type':     'application/x-www-form-urlencoded',
				'X-Content-Type-Options': 'nosniff'
			}

			// Configure the request
			var options = {
				url: 'https://www.medibuddy.in/WAPI/infiniti/track/ClaimWithClaimNumber.json',
				method: 'POST',
				headers: headers,
				form: {'claimNumber':session.userData.claimNumber,'date':session.userData.hospitalizationDate, 'BeneficiaryName':session.userData.benefName, 'token': JSON.parse(session.userData.token), 'Value':session.userData.OTP }
			}
			// Start the request
			response = request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {	
					data = JSON.parse(body);
					console.log("JSON Response: "+ body);
					console.log("Success?: "+ data.isSuccess);
					console.log("Message: "+ data.message);
					console.log("isOTPVerified: "+ data.isOTPVerified);

					if(data.errorMessage){
						session.send();
						session.send('⚠️ '+ data.errorMessage);
						session.beginDialog('askforTrackClaimwIDConfirmation');
						return;
						
					}else if(JSON.stringify(data.isOTPVerified) === "true"){
							var claimdata = data.claimDetails;
							session.userData.trackIsSuccess = JSON.stringify(data.isSuccess);
							session.userData.trackIsRetailPolicy = JSON.stringify(data.isRetailPolicy);
							
							console.log("Claim Data JSON Response: "+ JSON.stringify(claimdata));
							//Claim Details
							session.userData.trackClaimId = JSON.stringify(claimdata[0].claimDetails.claimId);
							session.userData.trackClaimType = claimdata[0].claimDetails.claimType;
							session.userData.trackClmAmount = JSON.stringify(claimdata[0].claimDetails.clmAmount);
							session.userData.trackClmApprovedAmt = JSON.stringify(claimdata[0].claimDetails.clmApprovedAmt);
							session.userData.trackclmPreAuthAmt = JSON.stringify(claimdata[0].claimDetails.clmPreAuthAmt);
							session.userData.trackClaimStatus = claimdata[0].claimDetails.claimStatus;
							session.userData.trackDoa = claimdata[0].claimDetails.doa;
							session.userData.trackDod = claimdata[0].claimDetails.dod;
							session.userData.trackHospitalName = claimdata[0].claimDetails.hospitalName;
							session.userData.trackIsClmNMI = JSON.stringify(claimdata[0].claimDetails.isClmNMI);
							session.userData.trackIsClmDenied = JSON.stringify(claimdata[0].claimDetails.isClmDenied);
							
							//Policy Details
							session.userData.trackPolicyNo = claimdata[0].beneficiaryDetails.policyNo;
							session.userData.trackBenefMAID = JSON.stringify(claimdata[0].beneficiaryDetails.benefMAId);
							session.userData.trackBenefName = claimdata[0].beneficiaryDetails.benefName;
							session.userData.trackBenefRelation = claimdata[0].beneficiaryDetails.benefRelation;							
							
							var card = createReceiptCard(session);
							var msg = new builder.Message(session)
							.speak("I was able to get real time status on your claim. Here it is:")
							.addAttachment(card);
							session.send(msg);
							session.userData.serviceName = "Track with Claim ID";
							session.beginDialog('askforFeedback');
/*								session.sendTyping();
							setTimeout(function () {
								session.endConversation();
								session.beginDialog('askforMore');
							}, 5000);	*/	

					}else if (JSON.stringify(data.isOTPVerified) === "false"){		
						session.send('⚠️ '+ data.errorMessage);
						session.beginDialog('askforTrackClaimwIDConfirmation');
					}

				}
			});
			
		}
		else{
			session.send("⚠️ The OTP should only be `numeric` and `six digits` long.");
			session.beginDialog('askforTrackClaimwIDConfirmation');
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to Track with Claim Number
bot.dialog('trackClaimwID', [
				function (session, args, next){

						session.beginDialog('askforClaimNumber');
				},	
				function (session, results, next){
					if(results.response){
						var clmNoChecker = /^\d{8,9}$/.test(results.response);
						if(JSON.stringify(clmNoChecker) == "true"){
							session.userData.claimNumber = results.response;
							session.beginDialog('askforbenefName');
						}
						else{
							session.send("⚠️ The claim number should only be `numeric` and `eight digits` long.");
							session.beginDialog('askforTrackClaimwIDConfirmation');
						}
					}else{
						session.beginDialog('askforbenefName');
					}

				},
				function (session, results, next) {
					session.userData.benefName = results.response;
					session.beginDialog('askforDOA');
				},
				function (session, results) {
					session.userData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					//TO-DO: CHECK FOR UNDEFINED HOSPITALIZATIONDATE BEFORE CONVERTING TOSTRING()
					if(session.userData.hospitalizationDate){
						var msg = new builder.Message(session)
						.speak("Tracking claim with details... Claim Number: %s, Beneficiary Name: %s and Date: %s. Please wait...", 
						session.userData.claimNumber, session.userData.benefName ,session.userData.hospitalizationDate.toString().substring(0,15))
						.text("Tracking claim with details 🕵️ <br/>Claim Number: %s<br/>Beneficiary Name: %s<br/>Date: %s <br/><br/>Please wait ⏳",
						session.userData.claimNumber, session.userData.benefName, session.userData.hospitalizationDate.toString().substring(0,15))
						session.send(msg);
		//				session.send("Tracking claim with details 🕵️ <br/>Claim Number: %s<br/>Date: %s <br/><br/>Please wait ⏳");
						
						//Make POST request to MA Server
						var request = require('request');	
						var async = require('async');
						// Set the headers
						var headers = {
							'User-Agent':       'Super Agent/0.0.1',
							'Content-Type':     'application/x-www-form-urlencoded',
							'X-Content-Type-Options': 'nosniff'
						}

						// Configure the request
						var options = {
							url: 'https://www.medibuddy.in/WAPI/infiniti/track/ClaimWithClaimNumber.json',
							method: 'POST',
							headers: headers,
							form: {'claimNumber':session.userData.claimNumber,'date':session.userData.hospitalizationDate, 'BeneficiaryName':session.userData.benefName, 'SendOTP': true}
						}

						// Start the request
						response = request(options, function (error, response, body) {
							if (!error && response.statusCode == 200) {	
								data = JSON.parse(body);
								if(JSON.stringify(data.isSuccess) === "true"){
									session.userData.token = JSON.stringify(data.token);
									session.userData.message = JSON.stringify(data.message);
									session.userData.isOTPVerified = JSON.stringify(data.isOTPVerified);

									if(JSON.parse(session.userData.message) === "<p> A one-time verification code has been sent to your registered email id and mobile number. If you have not received OTP,<br/> Please login to your <b><a href= \"https://me.medibuddy.in/\" target= \"_blank\">MediBuddy</a></b> portal.</p>"){
										session.beginDialog("getOTP_trackwid");
									}
								}else if(JSON.stringify(data.isSuccess) === "false"){
									if(data.errorMessage){
										session.send('⚠️ '+ data.errorMessage);
										session.beginDialog('askforTrackClaimwIDConfirmation');
									}
								}  

							}
						});
						session.endDialog();
					}
					else{
						session.send("I'm sorry, I didn't get that. Let's retry.");
						session.replaceDialog('askforDOA');
					}
			}
]);

// Dialog to ask for Confirmation - Track with MAID
bot.dialog('askforTrackClaimwMAIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('trackClaimwMAID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);


// Dialog to ask for OTP - MAID
bot.dialog('getOTP_trackwmaid',[
	function (session){
		builder.Prompts.text(session,"A one-time verification code has been sent to your registered email id and mobile number. If you have not received OTP,\r Please login to your **[MediBuddy](https://me.medibuddy.in/\)** portal.");	
										
	},	
	function (session, results) {
		console.log(results.response);
		var otpChecker = /^\d{6}$/.test(results.response);
		if(JSON.stringify(otpChecker) == "true"){
			session.userData.OTP = results.response;
			//Make POST request to MA Server with OTP
			var request = require('request');
			// Set the headers
			var headers = {
				'User-Agent':       'Super Agent/0.0.1',
				'Content-Type':     'application/x-www-form-urlencoded',
				'X-Content-Type-Options': 'nosniff'
			}

			// Configure the request
			var options = {
				url: 'https://www.medibuddy.in/WAPI//infiniti/track/ClaimWithMAID.json',
				method: 'POST',
				headers: headers,
				form: {'maid':session.userData.MAID,'date':session.userData.hospitalizationDate, 'BeneficiaryName':session.userData.benefName, 'token': JSON.parse(session.userData.token), 'Value':session.userData.OTP }
			}

			console.log(JSON.stringify(options));
			// Start the request
			response = request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {	
					data = JSON.parse(body);
	
					if(data.errorMessage){
						session.send();
						session.send('⚠️ '+ data.errorMessage);
						session.beginDialog('askforTrackClaimwMAIDConfirmation');
						return;
						
					}else if(JSON.stringify(data.isOTPVerified) === "true"){

							var claimdata = data.claimDetails;
								
							session.userData.trackIsSuccess = JSON.stringify(data.isSuccess);
							session.userData.trackIsRetailPolicy = JSON.stringify(data.isRetailPolicy);
							
							//Claim Details
							session.userData.trackClaimId = JSON.stringify(claimdata[0].claimDetails.claimId);
							session.userData.trackClaimType = claimdata[0].claimDetails.claimType;
							session.userData.trackClaimReceivedDate = claimdata[0].claimDetails.claimReceivedDate;
							session.userData.trackClmAmount = JSON.stringify(claimdata[0].claimDetails.clmAmount);
							session.userData.trackClmApprovedAmt = JSON.stringify(claimdata[0].claimDetails.clmApprovedAmt);
							session.userData.trackclmPreAuthAmt = JSON.stringify(claimdata[0].claimDetails.clmPreAuthAmt);
							session.userData.trackClaimStatus = claimdata[0].claimDetails.claimStatus;
							session.userData.trackDoa = claimdata[0].claimDetails.doa;
							session.userData.trackDod = claimdata[0].claimDetails.dod;
							session.userData.trackClaimApprovedDate = claimdata[0].claimDetails.claimApprovedDate;
							if(claimdata[0].claimDetails.claimDeniedDate === "01-Jan-0001" ){
								session.userData.trackClaimDeniedDate = "-";
							}else{
								session.userData.trackClaimDeniedDate = claimdata[0].claimDetails.claimDeniedDate;
							}
							session.userData.trackHospitalName = claimdata[0].claimDetails.hospitalName;
							session.userData.trackIsClmNMI = JSON.stringify(claimdata[0].claimDetails.isClmNMI);
							session.userData.trackIsClmDenied = JSON.stringify(claimdata[0].claimDetails.isClmDenied);
							session.userData.trackDenialReasons = claimdata[0].claimDetails.denialReasons;
							
							//Policy Details
							session.userData.trackPolicyNo = claimdata[0].beneficiaryDetails.policyNo;
							session.userData.trackBenefMAID = JSON.stringify(claimdata[0].beneficiaryDetails.benefMAId);
							session.userData.trackBenefName = claimdata[0].beneficiaryDetails.benefName;
							session.userData.trackBenefRelation = claimdata[0].beneficiaryDetails.benefRelation;
							
							var card = createReceiptCard(session);
							var msg = new builder.Message(session)
							.speak("I was able to get real time status on your claim. Here it is:")
							.addAttachment(card);
							session.send("Here are your latest claim details:");
							session.send(msg);
							session.userData.serviceName = "Track with Medi Assist ID";
							session.beginDialog('askforFeedback');
/*								session.sendTyping();
							setTimeout(function () {
								session.endConversation();		
								session.beginDialog('askforMore');
							}, 5000);		*/

					}else if (JSON.stringify(data.isOTPVerified) === "false"){		
						session.send('⚠️ '+ data.errorMessage);
						session.beginDialog('askforTrackClaimwMAIDConfirmation');
					}

				}
			});
			
		}
		else{
			session.send("⚠️ The OTP should only be `numeric` and `six digits` long.");
			session.beginDialog('askforTrackClaimwIDConfirmation');
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to Track with Medi Assist ID
bot.dialog('trackClaimwMAID', [
				function (session){
						session.beginDialog('askforMAID');
					
				},	
				function (session, results) {
					if(results.response){
						var clmMAIDChecker = /^\d{10}$/.test(results.response);
						if(JSON.stringify(clmMAIDChecker) == "true"){
							session.userData.MAID = results.response;
							session.beginDialog('askforbenefName');
						}
						else{
							session.send("⚠️ The Medi Assist ID should only be `numeric` and `ten digits` long.");
							session.beginDialog('askforTrackClaimwMAIDConfirmation');
						}
					}else{
						session.beginDialog('askforMAID');
					}
				},	
				function (session, results, next) {
					session.userData.benefName = results.response;
					session.beginDialog('askforDOA');
				},
				function (session, results) {
					session.userData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);
					if(session.userData.hospitalizationDate){
						// Process request and display reservation details
						var msg = new builder.Message(session)
						.speak("Tracking claim with details... Medi Assist ID: %s and Date: %s. Please wait...", 
						session.userData.MAID, session.userData.hospitalizationDate.toString().substring(0,15))
						.text("Tracking claim with details 🕵️ <br/>Medi Assist ID: %s<br/>Date: %s. <br/><br/>Please wait ⏳",
						session.userData.MAID, session.userData.hospitalizationDate.toString().substring(0,15))
						session.send(msg);
						
						//Make POST request to MA Server
						var request = require('request');
						
						// Set the headers
						var headers = {
							'User-Agent':       'Super Agent/0.0.1',
							'Content-Type':     'application/x-www-form-urlencoded',
							'X-Content-Type-Options': 'nosniff'
						}

						// Configure the request
						var options = {
							url: 'https://www.medibuddy.in/WAPI//infiniti/track/ClaimWithMAID.json',
							method: 'POST',
							headers: headers,
							form: {'maid':session.userData.MAID,'date':session.userData.hospitalizationDate, 'BeneficiaryName':session.userData.benefName, 'SendOTP': true}
						}
						console.log(JSON.stringify(options));

						// Start the request
						response = request(options, function (error, response, body) {
							if (!error && response.statusCode == 200) {	
								// Print out the response body
								console.log("Received first response");
								data = JSON.parse(body);
								console.log(body);
								if(JSON.stringify(data.isSuccess) === "true"){
									session.userData.token = JSON.stringify(data.token);
									session.userData.message = JSON.stringify(data.message);
									session.userData.isOTPVerified = JSON.stringify(data.isOTPVerified);

									if(JSON.parse(session.userData.message) === "<p> A one-time verification code has been sent to your registered email id and mobile number. If you have not received OTP,<br/> Please login to your <b><a href= \"https://me.medibuddy.in/\" target= \"_blank\">MediBuddy</a></b> portal.</p>"){
										session.beginDialog("getOTP_trackwmaid");
									}
								}else if(JSON.stringify(data.isSuccess) === "false"){
									if(data.errorMessage){
										session.send('⚠️ '+ data.errorMessage);
										session.beginDialog('askforTrackClaimwMAIDConfirmation');
									}
								}  
							}
						});
						session.endDialog();
				}
				else{
					session.send("I'm sorry, I didn't get that. Let's retry.");
					session.replaceDialog('askforDOA');
				}	
	}
				
]);

// Dialog to ask for Confirmation - Track with Employee Details
bot.dialog('askforTrackClaimwEmpIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('trackClaimwEmpID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);


// Dialog to ask for OTP - EmpID
bot.dialog('getOTP_trackwempid',[
	function (session){
		builder.Prompts.text(session,"A one-time verification code has been sent to your registered email id and mobile number. If you have not received OTP,\r Please login to your **[MediBuddy](https://me.medibuddy.in/\)** portal.");						
	},	
	function (session, results) {
		console.log(results.response);
		var otpChecker = /^\d{6}$/.test(results.response);
		if(JSON.stringify(otpChecker) == "true"){
			session.userData.OTP = results.response;
			//Make POST request to MA Server with OTP
			var request = require('request');
			// Set the headers
			var headers = {
				'User-Agent':       'Super Agent/0.0.1',
				'Content-Type':     'application/x-www-form-urlencoded',
				'X-Content-Type-Options': 'nosniff'
			}

			// Configure the request
			var options = {
				url: 'https://www.medibuddy.in/WAPI//infiniti/track/ClaimWithEmpDetails.json',
				method: 'POST',
				headers: headers,
				form: {'employeeId':session.userData.EmpID,'date':session.userData.hospitalizationDate, 'corporateName': session.userData.Corporate, 'BeneficiaryName':session.userData.benefName, 'token': JSON.parse(session.userData.token), 'Value':session.userData.OTP }
			}

			console.log(JSON.stringify(options));
			// Start the request
			response = request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {	
					data = JSON.parse(body);
	
					if(data.errorMessage){
						session.send();
						session.send('⚠️ '+ data.errorMessage);
						session.beginDialog('askforTrackClaimwEmpIDConfirmation');
						return;
						
					}else if(JSON.stringify(data.isOTPVerified) === "true"){

						var claimdata = data.claimDetails;
								
						session.userData.trackIsSuccess = JSON.stringify(data.isSuccess);
						session.userData.trackIsRetailPolicy = JSON.stringify(data.isRetailPolicy);
						
						//Claim Details
						session.userData.trackClaimId = JSON.stringify(claimdata[0].claimDetails.claimId);
						session.userData.trackClaimType = claimdata[0].claimDetails.claimType;
						session.userData.trackClaimReceivedDate = claimdata[0].claimDetails.claimReceivedDate;
						session.userData.trackClmAmount = JSON.stringify(claimdata[0].claimDetails.clmAmount);
						session.userData.trackClmApprovedAmt = JSON.stringify(claimdata[0].claimDetails.clmApprovedAmt);
						session.userData.trackclmPreAuthAmt = JSON.stringify(claimdata[0].claimDetails.clmPreAuthAmt);
						session.userData.trackClaimStatus = claimdata[0].claimDetails.claimStatus;
						session.userData.trackDoa = claimdata[0].claimDetails.doa;
						session.userData.trackDod = claimdata[0].claimDetails.dod;
						session.userData.trackClaimApprovedDate = claimdata[0].claimDetails.claimApprovedDate;
						if(claimdata[0].claimDetails.claimDeniedDate === "01-Jan-0001" ){
							session.userData.trackClaimDeniedDate = "-";
						}else{
							session.userData.trackClaimDeniedDate = claimdata[0].claimDetails.claimDeniedDate;
						}
						session.userData.trackHospitalName = claimdata[0].claimDetails.hospitalName;
						session.userData.trackIsClmNMI = JSON.stringify(claimdata[0].claimDetails.isClmNMI);
						session.userData.trackIsClmDenied = JSON.stringify(claimdata[0].claimDetails.isClmDenied);
						session.userData.trackDenialReasons = claimdata[0].claimDetails.denialReasons;
						
						//Policy Details
						session.userData.trackPolicyNo = claimdata[0].beneficiaryDetails.policyNo;
						session.userData.trackBenefMAID = JSON.stringify(claimdata[0].beneficiaryDetails.benefMAId);
						session.userData.trackBenefName = claimdata[0].beneficiaryDetails.benefName;
						session.userData.trackBenefRelation = claimdata[0].beneficiaryDetails.benefRelation;
					
						var card = createReceiptCard(session);
						var msg = new builder.Message(session)
						.speak("I was able to get real time status on your claim. Here it is:")
						.addAttachment(card);
						session.send("Here are your latest claim details:");
						session.send(msg);
						session.userData.serviceName = "Track with Employee ID";
						session.beginDialog('askforFeedback');
/*								session.sendTyping();
						setTimeout(function () {
							session.endConversation();
							session.beginDialog('askforMore');
						}, 5000);		*/

					}else if (JSON.stringify(data.isOTPVerified) === "false"){		
						session.send('⚠️ '+ data.errorMessage);
						session.beginDialog('askforTrackClaimwEmpIDConfirmation');
					}

				}
			});
			
		}
		else{
			session.send("⚠️ The OTP should only be `numeric` and `six digits` long.");
			session.beginDialog('askforTrackClaimwIDConfirmation');
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);


// Dialog to Track with Employee Details
bot.dialog('trackClaimwEmpID', [
				function (session){
						session.beginDialog('askforEmpID');
				},	
				function (session, results){
					session.userData.EmpID = results.response;
					session.beginDialog('askforCorporate');
				},	
				function (session, results) {
					session.userData.Corporate = results.response;
					session.beginDialog('askforbenefName');
				},	
				function (session, results) {
					session.userData.benefName = results.response;
					session.beginDialog('askforDOA');
				},
				function (session, results) {
					session.userData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					if(session.userData.hospitalizationDate){

						var msg = new builder.Message(session)
						.speak("Tracking claim with details... Employee ID: %s, Corporate: %s and Date: %s. Please wait...", 
						session.userData.EmpID, session.userData.Corporate, session.userData.hospitalizationDate.toString().substring(0,15))
						.text("Tracking claim with details 🕵️ <br/>Employee ID: %s<br/>Corporate: %s<br/>Date: %s. <br/><br/>Please wait ⏳",
						session.userData.EmpID, session.userData.Corporate, session.userData.hospitalizationDate.toString().substring(0,15))
						session.send(msg);
						
						//Make POST request to MA Server
						var request = require('request');
						
						// Set the headers
						var headers = {
							'User-Agent':       'Super Agent/0.0.1',
							'Content-Type':     'application/x-www-form-urlencoded',
							'X-Content-Type-Options': 'nosniff'
						}

						// Configure the request
						var options = {
							url: 'https://www.medibuddy.in/WAPI//infiniti/track/ClaimWithEmpDetails.json',
							method: 'POST',
							headers: headers,
							form: {'employeeId':session.userData.EmpID, 'corporateName': session.userData.Corporate, 'date':session.userData.hospitalizationDate, 'BeneficiaryName':session.userData.benefName, 'SendOTP': true }
						}
						// Start the request
						response = request(options, function (error, response, body) {
							if (!error && response.statusCode == 200) {	
								// Print out the response body
								console.log("Received first response");
								data = JSON.parse(body);
								console.log(body);
								if(JSON.stringify(data.isSuccess) === "true"){
									session.userData.token = JSON.stringify(data.token);
									session.userData.message = JSON.stringify(data.message);
									session.userData.isOTPVerified = JSON.stringify(data.isOTPVerified);

									if(JSON.parse(session.userData.message) === "<p> A one-time verification code has been sent to your registered email id and mobile number. If you have not received OTP,<br/> Please login to your <b><a href= \"https://me.medibuddy.in/\" target= \"_blank\">MediBuddy</a></b> portal.</p>"){
										session.beginDialog("getOTP_trackwempid");
									}
								}else if(JSON.stringify(data.isSuccess) === "false"){
									if(data.errorMessage){
										session.send('⚠️ '+ data.errorMessage);
										session.beginDialog('askforTrackClaimwEmpIDConfirmation');
									}
								}  
							}
						});

						session.endDialog();
				}
				else{
					session.send("I'm sorry, I didn't get that. Let's retry.");
					session.replaceDialog('askforDOA');
				}	
					
				}
]);

// Format Number in Indian Format
function formatNumber(num){
	var x=num;
	x=x.toString();
	var lastThree = x.substring(x.length-3);
	var otherNumbers = x.substring(0,x.length-3);
	if(otherNumbers != '')
		lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

	return(res);

}

// Receipt Card - Track Claim Result
function createReceiptCard(session) {
	if (session.message.address.channelId === 'facebook'){
		return session.send('📝 Beneficiary: '+ session.userData.trackBenefName+' | Medi Assist ID: '+ session.userData.trackBenefMAID+' | Hospital: '+ session.userData.trackHospitalName+ ' | Claim Number: '+ session.userData.trackClaimId+' | '
		+ 'Claim Status: '+ session.userData.trackClaimStatus  + ' | Claim Type: '+ session.userData.trackClaimType + ' | Date of Hospitalization: '+ session.userData.trackDoa+ ' | Date of Discharge: ' + session.userData.trackDod 
		+ ' | Relation to Beneficiary: ' + session.userData.trackBenefRelation+ ' | Policy Number: ' + session.userData.trackPolicyNo + 
		' | Claimed Amount: Rs. '+ formatNumber(session.userData.trackClmAmount) + ' | Approved Amount : Rs. '+ formatNumber(session.userData.trackClmApprovedAmt)
		);
	}
	else{
    return new builder.HeroCard(session)
        .title(session.userData.trackBenefName + ' (' + session.userData.trackBenefMAID + ')')
        .subtitle('### Hospital : ' + session.userData.trackHospitalName + '\r\r ### Status : ' + session.userData.trackClaimStatus)
        .text('#### Claim Number : ' + session.userData.trackClaimId + '\r\r' +
			'#### Claim Type : ' + session.userData.trackClaimType + '\r\r' +
			'#### Date of Hospitalization : ' + session.userData.trackDoa + '\r\r' +
			'#### Date of Discharge: ' + session.userData.trackDod + '\r\r' +
			'#### Relation to Beneficiary : ' + session.userData.trackBenefRelation + '\r\r' +
			'#### Policy Number : ' + session.userData.trackPolicyNo + '\r\r' +
			'#### Claimed Amount : &#x20B9; ' + formatNumber(session.userData.trackClmAmount) + '/- \r\r' +
			'#### Approved Amount : &#x20B9; ' + formatNumber(session.userData.trackClmApprovedAmt) + '/- \r\r' 
		)
        .images([
            builder.CardImage.create(session, 'https://i.imgur.com/S5aclut.png')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://www.medibuddy.in/claim', 'More Information')
        ]);
	}	
}

// Dialog to ask for Claim Number
bot.dialog('askforClaimNumber',[
	function (session){
		builder.Prompts.text(session, "Please provide your claim number");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);


//Dialog to ask for DOA
bot.dialog('askforDOA',[
	function (session){
		builder.Prompts.time(session, "Please provide any date between admission and discharge for hospitalization");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.beginDialogAction('doaHelpAction', 'doaHelp', { matches: /^help$/i });

// Dialog to ask for Medi Assist ID
bot.dialog('askforMAID',[
	function (session){
		builder.Prompts.text(session, "Please provide your Medi Assist ID");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to ask for Employee ID
bot.dialog('askforEmpID',[
	function (session){
		builder.Prompts.text(session, "Please provide your Employee ID");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to ask for Corporate Name
bot.dialog('askforCorporate',[
	function (session){
		builder.Prompts.text(session, "Please provide Corporate's Name");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to ask for Policy Number
bot.dialog('askforPolNo',[
	function (session){
		builder.Prompts.text(session, "Please provide your Policy Number");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Context Help dialog for Hospitalization date 
bot.dialog('doaHelp', function(session, args, next) {
    var msg = "You can enter the date in any format. Eg. if date of admission is 01-Jan-2017 and discharge is 05-Jan-2017, you can enter any date from 1st Jan,2017 to 5th Jan, 2017";
    session.endDialog(msg);
});

// Generic Help dialog for Bot
bot.dialog('help', [
	function(session){
			builder.Prompts.text(session,"Type in your query, and I'll try my best to resolve it");
	},
	function(session, results){
		if(results.response){
			/* Start of QNA */
			let host = process.env.QnAHostName;

			// NOTE: Replace this with a valid endpoint key.
			// This is not your subscription key.
			// To get your endpoint keys, call the GET /endpointkeys method.
			let endpoint_key = process.env.QnAAuthKey;

			// NOTE: Replace this with a valid knowledge base ID.
			// Make sure you have published the knowledge base with the
			// POST /knowledgebases/{knowledge base ID} method.
			let kb = process.env.QnAknowledgeBaseId;

			let method = "/qnamaker/knowledgebases/" + kb + "/generateAnswer";

			let question = {
				'question': JSON.stringify(results.response),
				'top': 3
			};

			let pretty_print = function (s) {
				return JSON.stringify(JSON.parse(s), null, 4);
			}

			// callback is the function to call when we have the entire response.
			let response_handler = function (callback, response) {
				let body = '';
				response.on ('data', function (d) {
					body += d;
				});
				response.on ('end', function () {
			// Call the callback function with the status code, headers, and body of the response.
					callback ({ status : response.statusCode, headers : response.headers, body : body });
				});
				response.on ('error', function (e) {
					console.log ('Error: ' + e.message);
					session.send("Looks like I still have to learn some more! Sorry, but I can't help you with your query right now.");
					session.send("While I attend my classes, please write to info@mediassistindia.com for help.");
					
				session.beginDialog('askforMore');
				});
			};

			// Get an HTTP response handler that calls the specified callback function when we have the entire response.
			let get_response_handler = function (callback) {
			// Return a function that takes an HTTP response, and is closed over the specified callback.
			// This function signature is required by https.request, hence the need for the closure.
				return function (response) {
					response_handler (callback, response);
				}
			}

			// callback is the function to call when we have the entire response from the POST request.
			let post = function (path, content, callback) {
				let request_params = {
					method : 'POST',
					hostname : host,
					path : path,
					headers : {
						'Content-Type' : 'application/json',
						'X-Content-Type-Options': 'nosniff',
						'Content-Length' : content.length,
						'Authorization' : 'EndpointKey ' + endpoint_key,
					}
				};

			// Pass the callback function to the response handler.
				let req = https.request (request_params, get_response_handler (callback));
				req.write (content);
				req.end ();
			}

			// callback is the function to call when we have the response from the /knowledgebases POST method.
			let get_answers = function (path, req, callback) {
				console.log ('Calling ' + host + path + '.');
			// Send the POST request.
				post (path, req, function (response) {
					callback (response.body);
				});
			}

			// Convert the request to a string.
			let content = JSON.stringify(question);
			get_answers (method, content, function (result) {
			// Write out the response from the /knowledgebases/create method.
				result = JSON.parse(result);
				result2 = JSON.parse(JSON.stringify(result.answers[0].answer));
				if(result2 == "No good match found in KB."){
					var wasHelpful = 0;
					session.userData.serviceName = "Not Trained - Help";
					var userQuery = JSON.parse(question.question);
					storeFeedback(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(userQuery).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"));
			
					session.send("Looks like I still have to learn some more! Sorry, but I can't help you with your query right now.");
					session.send("While I attend my classes, please write to info@mediassistindia.com for help.");
					session.beginDialog('askforMore');
					session.endConversation();
				}else{
					var customMsg = new builder.Message(session).text(result2);
					session.send(customMsg);
					session.userData.serviceName = "Help";
					session.beginDialog('askforFeedback');
				}
				
//				console.log (pretty_print(JSON.stringify(result.answers[0].answer)));
			});

			/*End of QNA */
		}
	}
	/*,
	function(session, results){
		
		const msg = new builder.Message(session);
			msg.text("Would any of these topics be of interest to you?")
				.addAttachment(new builder.HeroCard(session)
						.images([
							new builder.CardImage(session)
								.url('https://i.imgur.com/7XCSpue.png')
								.alt('Other Help Topics')
						])
						.buttons([
							builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/get-insights-into-your-non-medical-expenses-now-with-medibuddy/", "Non Medical Expenses"),
							builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/claimed-and-approved-amounts-difference/", "Difference between claimed and approved amount"),
							builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/faster-claim-reimbursement-medibuddy-5-step-process/", "Raising reimbursement claims for pre- and post-hospitalization expenses"),
							builder.CardAction.openUrl(session, "https://goo.gl/mz8uQL", "Medicines and post-operative home healthcare")								
							]));
			session.send(msg);
			session.userData.serviceName = "Information Center";
			session.beginDialog('askforFeedback');
			
//			session.endConversation();
	} */
])
.triggerAction({
	matches: /^help$/i,
	onSelectAction: (session, args) => {
		session.beginDialog(args.action, args);
	}
});

//------------------------------------------------------------------------------------------------------------------------------------------------//


// Dialog to Download E-Card
bot.dialog('downloadEcard',[
	function (session){
//		session.send("Welcome to E-Card Download Center️ 🎊️️🎈🎉");
		session.beginDialog('askforDownloadBy');
	},
	function (session, results){

		
		session.sendTyping();
		setTimeout(function () {
			const msg = new builder.Message(session);
				msg.text("Would you like to know more about your eCard? Here are a few posts that'll help you out. ")
					.addAttachment(new builder.HeroCard(session)
							.buttons([
								builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/use-e-card-identify-beneficiaries/", "Watch Video"),
								builder.CardAction.openUrl(session, "https://blogs.medibuddy.in/ecard/", "Read Blog")							
								]));
				session.send(msg);
		}, 15000);	
			
		session.sendTyping();
		setTimeout(function () {
			session.endConversation();	
			session.beginDialog('askforMore');
		}, 25000);		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/download e-card/i, /download ecard/i,/download e card/i, /ecard/i, /tpa card/i, /insurance card/i, /card/i, /download card/i, /^download e-card$/i, 'downloadECard'],
	// /^download e-card$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to ask for Download By
bot.dialog('askforDownloadBy',[
	function (session){
		var msg = new builder.Message(session)
			.speak("Alright, let's get started. There are three ways to download your e-card. You can download with your MediAssist ID, Employee ID or Policy Number")
			.text("Let's get started 🚀. There are three ways to download your e-card. Please select one of the following options. Download with: ")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Download with Medi Assist ID", "Medi Assist ID"),
						builder.CardAction.imBack(session, "Download with Employee ID", "Employee ID"),
						builder.CardAction.imBack(session, "Download with Policy Number", "Policy Number")
					])
			);
		session.send(msg);	
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

//Custom redirect to Download with Claim ID
/*bot.customAction({
	matches: /^Download with Claim ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('downloadwID');
		
	}
}); */

//Custom redirect to Download with Medi Assist ID
bot.customAction({
	matches: /^Download with Medi Assist ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('downloadwMAID');	
	}
});

//Custom redirect to Download with Employee ID
bot.customAction({
	matches: /^Download with Employee ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('downloadwEmpID');
	}
});

//Custom redirect to Download with Policy Number
bot.customAction({
	matches: /^Download with Policy Number$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('downloadwPolNo');
		
	}
});


// Dialog to ask for Confirmation - Download with Claim Number
/*bot.dialog('askforDownloadwIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('downloadwID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]); */

// Dialog to ask for Confirmation - Download with Medi Assist ID
bot.dialog('askforDownloadwMAIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('downloadwMAID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);

// Dialog to ask for Confirmation - Download with Medi Assist ID
bot.dialog('askforDownloadwMAIDConfirmationStandAlone',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('setMAID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);

// Dialog to ask for Confirmation - Download with Employee ID
bot.dialog('askforDownloadwEmpIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('downloadwEmpID', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);

// Dialog to ask for Confirmation - Download with Policy Number
bot.dialog('askforDownloadwPolNoConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('downloadwPolNo', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);

// Dialog to ask for Beneficiary Name
bot.dialog('askforbenefName',[
	function (session){
		builder.Prompts.text(session, "Please provide beneficiary name");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to Download E-Card with Claim Number
/*bot.dialog('downloadwID', [
				function (session, args, next){
					if(session.userData.claimNumber == ""){
						session.beginDialog('askforClaimNumber');
					}else{
						next();
					}
				},	
				function (session, results, next) {
					if(results.response){
						var clmNoChecker = /^\d{8}$/.test(results.response);
						if(JSON.stringify(clmNoChecker) == "true"){
							session.userData.claimNumber = results.response;
							session.beginDialog('askforbenefName');
						}
						else{
							session.send("⚠️ The claim number should only be numeric and eight digits long.");
							session.beginDialog('askforDownloadwIDConfirmation');
						}
					}
					else{
						session.beginDialog('askforbenefName');
					}
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					var msg = new builder.Message(session)
					.speak("Finding Medi Assist E-Card with details... Claim Number: %s and Beneficiary Name: %s. Please wait...", 
					session.userData.claimNumber, session.dialogData.benefName)
					.text("Finding Medi Assist E-Card with details 🔎 <br/>Claim Number: %s<br/>Beneficiary Name: %s",
					session.userData.claimNumber, session.dialogData.benefName)
					session.send(msg);
					
					var clmId = session.userData.claimNumber;
					var benefName = session.dialogData.benefName;
					console.log(clmId);
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/ClaimId/'+clmId+'/'+benefName;
					var downloadlink2 = 'http://track-api-lb.medibuddy.in/getEcardWithClaimId'
					//Make POST request to MA Server
					var request = require('request');	
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded'
					}

					// Configure the request
					var options = {
						url: downloadlink,
						method: 'GET',
						headers: headers
					}

					// Configure the request
					var options2 = {
						url: downloadlink2,
						method: 'POST',
						headers: headers
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session)
								.speak("Click below to download your Medi Assist E-Card")
								.addAttachment(ecard);
								session.send(msg);
								session.userData.serviceName = "Download with Claim ID";
								session.beginDialog('askforFeedback');
								session.sendTyping();
								setTimeout(function () {
									session.endConversation();	
									session.beginDialog('askforMore');
								}, 5000);		
								
							}
							else if (sizeof(body) == 0){
								session.send('⚠️ I was unable to find your e-card with the details you provided. ');
								session.beginDialog('askforDownloadwIDConfirmation');
							}
						}
						else{
								session.send('⚠️ I was unable to find your e-card with the details you provided. ');
								session.beginDialog('askforDownloadwIDConfirmation');
						}
					});

					response2 = request(options2, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							console.log(JSON.stringify(response));
						}
						else{
								session.send('⚠️ I was unable to find your e-card with the details you provided. ');
								session.beginDialog('askforDownloadwIDConfirmation');
						}
					});

					session.endDialog();
				}
]); */

// Dialog to Download E-Card with Medi Assist ID
bot.dialog('downloadwMAID', [
				function (session, args, next){
					session.beginDialog('askforMAID');
				},	
				function (session, results, next) {
					if(results.response){
						session.userData.MAID = results.response;
						
						var clmMAIDChecker = /^\d{10}$/.test(results.response);
						if(JSON.stringify(clmMAIDChecker) == "true"){
							session.beginDialog('askforbenefName');
							session.userData.MAID = results.response;
						}
						else{
							session.send("⚠️ The Medi Assist ID should only be numeric and ten digits long.");
							session.beginDialog('askforDownloadwMAIDConfirmation');
						}
					}else{
						session.beginDialog('askforbenefName');
					}
				},
				function (session, results, next) {
					session.userData.benefName = results.response;

					// Process request and display reservation details
					var msg = new builder.Message(session)
					.speak("Finding Medi Assist E-Card with details... Medi Assist ID: %s and Beneficiary Name: %s. Please wait...", 
					session.userData.MAID, session.userData.benefName)
					.text("Finding Medi Assist E-Card with details 🔎 <br/>Medi Assist ID: %s<br/>Beneficiary Name: %s",
					session.userData.MAID, session.userData.benefName)
					session.send(msg);
					
					var MAID = session.userData.MAID;
					var benefName = session.userData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/MAID/'+MAID+'/'+benefName+'/9190';
					
					// Make POST request to MA Server
					var request = require('request');	
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded',
						'X-Content-Type-Options': 'nosniff'
					}

					// Configure the request
					var options = {
						url: downloadlink,
						method: 'GET',
						headers: headers
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session)
								.speak("Click below to download your Medi Assist E-Card")
								.addAttachment(ecard);
								session.send(msg);
								session.userData.serviceName = "Download with Medi Assist ID";
								session.beginDialog('askforFeedback');
/*								session.sendTyping();
								setTimeout(function () {
									session.endConversation();
									session.beginDialog('askforMore');
								}, 5000);		*/
								
							}
							else if (sizeof(body) == 0){
								session.send('⚠️ I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('askforDownloadwMAIDConfirmation');
							}
						}
						else{
								session.send('⚠️ I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('askforDownloadwMAIDConfirmation');							
						}
					});
					
					session.endDialog();
				}
]);

// Dialog to Download E-Card with Employee Details
bot.dialog('downloadwEmpID', [
				function (session){
						session.beginDialog('askforEmpID');
				},	
				function (session, results) {
					session.dialogData.EmpID = results.response;
					session.beginDialog('askforCorporate');
				},
				function (session, results) {
					session.dialogData.Corporate = results.response;
					session.beginDialog('askforbenefName');
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					var msg = new builder.Message(session)
					.speak("Finding Medi Assist E-Card with details... Employee ID: %s, Corporate: %s and Beneficiary Name: %s. Please wait...", 
					session.dialogData.EmpID, session.dialogData.Corporate, session.dialogData.benefName)
					.text("Finding Medi Assist E-Card with details 🔎<br/>Employee ID: %s<br/>Corporate: %s<br/>Beneficiary Name: %s",
					session.dialogData.EmpID, session.dialogData.Corporate, session.dialogData.benefName)
					session.send(msg);
					
					var EmpID = session.dialogData.EmpID;
					var Corporate = session.dialogData.Corporate;
					var benefName = session.dialogData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/EmployeeId/'+EmpID+'/'+benefName+'/'+Corporate;
					
					//Make POST request to MA Server
					var request = require('request');	
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded',
						'X-Content-Type-Options': 'nosniff'
					}

					// Configure the request
					var options = {
						url: downloadlink,
						method: 'GET',
						headers: headers
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session)
								.speak("Click below to download your Medi Assist E-Card")
								.addAttachment(ecard);
								session.send(msg);
								session.userData.serviceName = "Download with Employee ID";
								session.beginDialog('askforFeedback');
/*								session.sendTyping();
								setTimeout(function () {
									session.endConversation();
									session.beginDialog('askforMore');
								}, 5000);		*/
								
							}
							else if (sizeof(body) == 0){
								session.send('⚠️ I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('askforDownloadwEmpIDConfirmation');
							}
						}
						else{
								session.send('⚠️ I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('askforDownloadwEmpIDConfirmation');
						}
					});
					
					session.endDialog();
				}
]);

// Dialog to Download E-Card with Policy Number
bot.dialog('downloadwPolNo', [
				function (session){
						session.beginDialog('askforPolNo');
				},	
				function (session, results) {
					session.dialogData.PolNo = results.response;
					session.beginDialog('askforbenefName');
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					var msg = new builder.Message(session)
					.speak("Finding Medi Assist E-Card with details... Policy Number: %s and Beneficiary Name: %s. Please wait...", 
					session.dialogData.PolNo, session.dialogData.benefName)
					.text("Finding Medi Assist E-Card with details 🔎 <br/>Policy Number: %s<br/>Beneficiary Name: %s",
					session.dialogData.PolNo, session.dialogData.benefName)
					session.send(msg);
					
					var PolNo = (session.dialogData.PolNo).replace(/\//g, "");
					var benefName = session.dialogData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/PolicyNo/'+PolNo+'/'+benefName;
					
					//Make POST request to MA Server
					var request = require('request');	
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded',
						'X-Content-Type-Options': 'nosniff'
					}

					// Configure the request
					var options = {
						url: downloadlink,
						method: 'GET',
						headers: headers
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session)
								.speak("Click below to download your Medi Assist E-Card")
								.addAttachment(ecard);
								session.send(msg);
								session.userData.serviceName = "Download with Policy Number";
								session.beginDialog('askforFeedback');
/*								session.sendTyping();
								setTimeout(function () {
									session.endConversation();
									session.beginDialog('askforMore');
								}, 5000);		*/
								
							}
							else if (sizeof(body) == 0){
								session.send('⚠️ I was unable to find your e-card with the details you provided.');
								session.beginDialog('askforDownloadwPolNoConfirmation');
							}
						}
						else{
								session.send('⚠️ I was unable to find your e-card with the details you provided.');
								session.beginDialog('askforDownloadwPolNoConfirmation');
						}
					});
					
					session.endDialog();
				}
]);

function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('Download Medi Assist E-Card')
        .subtitle('ℹ️ Flash this E-Card upon request at the insurance desk in the hospital at the time of admission')
        .text('')
        .images([
            builder.CardImage.create(session, 'https://i.imgur.com/FzwvV2m.png')
        ])
        .buttons([
            builder.CardAction.openUrl(session, session.userData.downloadURL, 'Download E-Card 📥')
        ]);
};

// Dialog to Search Network Hospitals
bot.dialog('searchNetwork',[
	function (session){
		session.beginDialog('askforLocation');
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/search network hospitals/i, /Locate Network Hospital/i, /search network/i, /search nearby hospitals/i, /search providers/i, /hospitals around/i, /network hospital/i, /network hospitals/i, 'searchNetwork'],
	// /^search network hospitals$|^search network$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to ask for Confirmation - Download with Medi Assist ID
bot.dialog('askforLocationConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)",
		{	speak: "Let's try again? yes or no?",
			listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			session.replaceDialog('askforLocation', {reprompt: true});
		}
		else {
			session.endConversation();
			session.beginDialog('askforMore');
		}
		
	}
]);

// Function to check if returned JSON object is empty
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var locationDialog = require('botbuilder-location');
bot.library(locationDialog.createLibrary(process.env.BING_MAPS_API_KEY));
bot.dialog('askforLocation',  [
    function (session) {
		
		var options = {
			prompt: "Where should I search for hospitals?",
			useNativeControl: false,
			reverseGeocode: true,
					skipFavorites: true,
					skipConfirmationAsk: true,
            requiredFields:
                locationDialog.LocationRequiredFields.streetAddress |
                locationDialog.LocationRequiredFields.locality |
                locationDialog.LocationRequiredFields.region |
                locationDialog.LocationRequiredFields.country
		};
		locationDialog.getLocation(session, options);

    },
    function (session, results) {
        if (results.response) {
			session.userData.place = results.response;
			var formattedAddress = getFormattedAddressFromPlace(session, session.userData.place, ", ");
			session.userData.formattedAddress = formattedAddress;
		}
		
		if(session.message.address.channelId === 'facebook'){
			session.beginDialog('askforInsurerFB');
			return;
		}else{
			session.beginDialog('askforInsurer');	
		}
		
	},		//Make POST request to MA Server
	function(session, results){
		if(results.response){
			var request = require('request');
			
			// Set the headers
			var headers = {
				'User-Agent':       'Super Agent/0.0.1',
				'Content-Type':     'application/x-www-form-urlencoded',
				'X-Content-Type-Options': 'nosniff'
			}


	codeLatLng(function(lat, lng){
			session.userData.lat = lat;
			session.userData.lng = lng;

			// Configure the request
			var options = {
				url: 'http://track-api-lb.medibuddy.in/GetHospitalsByLocation/.json',
				method: 'POST',
				headers: headers,
				form: {"insuranceCompany":session.userData.insurer,"latitude":session.userData.lat,"longitude":session.userData.lng,"distance":10,"hospSpeciality":session.userData.speciality,"maRating":""}
			}
			// Start the request
			response = request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {	
					// Print out the response body
					data = JSON.parse(body);
					if(JSON.stringify(data.isSuccess) === "true"){				
						var cards = [];
						
					if(isEmptyObject(data.hospitals)){
						session.send("⚠️ Sorry! Could not find any hospitals based on your search request.");
						session.beginDialog('askforLocationConfirmation');
					}
					else{
						
						for (var item in data.hospitals){	
							// Get Distance between User and Hospital
							var geolib = require("geolib");						
							data.hospitals[item].dist = geolib.getDistance(
									{latitude: JSON.parse(session.userData.lat), longitude: JSON.parse(session.userData.lng)},
									{latitude: data.hospitals[item].latitude, longitude: data.hospitals[item].longitude}
									);													
						}
						
						data.hospitals.sort(function(a, b) { return a.dist - b.dist})
						.slice(0, 10);
												
						for (var item in data.hospitals){
							var nwHospAddress = JSON.stringify(data.hospitals[item].address);	
							var nwHospPhNo = data.hospitals[item].phone.split('/')[0];								
							nwHospPhNo = nwHospPhNo.replace(/-/g,'');
							
							if(item < 10){
								cards.push(
									new builder.HeroCard(session)
									.title(data.hospitals[item].name + " (" + data.hospitals[item].dist + " meters)")
									.subtitle("Phone: " + data.hospitals[item].phone)
									.text(nwHospAddress + ', ' + data.hospitals[item].city + ', ' + data.hospitals[item].state + ', ' + data.hospitals[item].pinCode)
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/d6EtCMR.png')
											.alt(data.hospitals[item].name)
									])
									.buttons([
										builder.CardAction.openUrl(session, "tel:"+nwHospPhNo, "Call Hospital"),
										builder.CardAction.openUrl(session, "http://maps.google.com/maps?q="+data.hospitals[item].latitude+","+data.hospitals[item].longitude, "View Hospital"),
										builder.CardAction.openUrl(session, "https://me.medibuddy.in/", "Request for eCashless")
									])
								);
								console.log(JSON.stringify(cards));
							}else{ break;}
							
						}

						session.send("Trying to find hospitals near you. Please wait...");
						session.sendTyping();
						var msg = new builder.Message(session);
							msg.attachmentLayout(builder.AttachmentLayout.carousel)
							.attachments(cards);
//						console.log("FINAL MESSAGE: "+ json.stringify(msg));
						session.send(msg);
						session.userData.serviceName = "Search Network";
						session.beginDialog('askforFeedback');						
/*						session.sendTyping();
						setTimeout(function () {
							session.endConversation();
							session.beginDialog('askforMore');
						}, 5000);		*/
					}
					}
				}
				else{
					console.log("Error in connecting: "+ JSON.stringify(error) + " Status Code: "+ JSON.stringify(response));
				}
			});	
			}, session);
			
		}
},
function(session, results){
	session.endDialogWithResult(results);
}
]);

function codeLatLng(callback, session){
			
	var options = {
		httpAdapter: 'https',
		apiKey: process.env.GoogleGeo2,
		formatter: null
	};

	var geocoder = NodeGeocoder(options);
	geocoder.geocode(session.userData.formattedAddress, function(err, res){
		if(res){
			console.log("Result: "+ JSON.stringify(res));
		session.userData.lat = JSON.stringify(res[0].latitude);
		session.userData.lng = JSON.stringify(res[0].longitude);
		callback(session.userData.lat, session.userData.lng);
		}
		else if(err){
			console.log("Error: "+ JSON.stringify(err));
			console.log("Result: "+ JSON.stringify(res));
			session.send("Sorry, I'm unable to list our network hospitals at the moment! Please try again later.");
			session.userData.serviceName = "Search Network";
			session.userData.errorMessage = "Google - Geocode API (Quota Exceeded Exception)";
			wasHelpful = 0;
			storeFeedback(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(session.userData.errorMessage).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"));
			//return;
		}
	});
}


function getFormattedAddressFromPlace(session, place, separator) {
	var place = session.userData.place;
    var addressParts = [place.streetAddress, place.locality, place.region, place.postalCode, place.country, place.latitude, place.longitude];
    return addressParts.filter(i => i).join(separator);
}

// Dialog to ask for Insurer Name
bot.dialog('askforInsurer',[
	function (session){

		if(session.message && session.message.value){
			processSubmitAction8(session, session.message.value);
			session.endDialog();
			return;
		}

		var card = 
		{
			"contentType": "application/vnd.microsoft.card.adaptive",
			"content": {
				
			"type": "AdaptiveCard",
				"body": [
				{
					"type": "TextBlock",
					"text": "Select Filters: Search Network",
					"weight": "bolder",
					"size": "medium"
				},
				{
					"type": "TextBlock",
					"text": "Please choose insurer and speciality from options below.",
					"wrap": true,
					"maxLines": 4
				},
				{
					"type": "TextBlock",
					"text": "Insurer"
				},
				{
					"type": "Input.ChoiceSet",
					"id": "insurer",
					"placeholder": "Select your insurer",	
					"style":"compact",
					"choices": [
					{
						"title": "Aditya Birla Health Insurance Co. Ltd.",
						"value": "Aditya Birla Health Insurance Co. Ltd."
					},
					{
						"title": "Apollo Munich Health Insurance Co. Ltd.",
						"value": "Apollo Munich Health Insurance Co. Ltd."
					},
					{
						"title": "Bajaj Allianz General Insurance Co. Ltd.",
						"value": "Bajaj Allianz General Insurance Co. Ltd."
					},
					{
						"title": "Bharti AXA General Insurance Co. Ltd.",
						"value": "Bharti AXA General Insurance Co. Ltd."
					},
					{
						"title": "Cholamandalam MS General Insurance Co. Ltd.",
						"value": "Cholamandalam MS General Insurance Co. Ltd."
					},
					{
						"title": "Cigna TTK Health Insurance Co. Ltd.",
						"value": "Cigna TTK Health Insurance Co. Ltd."
					},
					{
						"title": "Future Generali India Insurance Co. Ltd.",
						"value": "Future Generali India Insurance Co. Ltd."
					},
					{
						"title": "HDFC Ergo General Insurance Co. Ltd.",
						"value": "HDFC Ergo General Insurance Co. Ltd."
					},
					{
						"title": "ICICI Lombard General Insurance Co. Ltd.",
						"value": "ICICI Lombard General Insurance Co. Ltd."
					},
					{
						"title": "IFFCO-TOKIO General Insurance Co. Ltd.",
						"value": "IFFCO-TOKIO General Insurance Co. Ltd."
					},
					{
						"title": "HDFC Ergo General Insurance Co. Ltd.",
						"value": "HDFC Ergo General Insurance Co. Ltd."
					},
					{
						"title": "IndiaFirst Life Insurance Co. Ltd.",
						"value": "IndiaFirst Life Insurance Co. Ltd."
					},
					{
						"title": "L&T General Insurance Co. Ltd.",
						"value": "L&T General Insurance Co. Ltd."
					},
					{
						"title": "Liberty Videocon General Insurance Co. Ltd.",
						"value": "Liberty Videocon General Insurance Co. Ltd."
					},
					{
						"title": "LIC Of India",
						"value": "LIC Of India"
					},
					{
						"title": "MaxBupa Health Insurance Co. Ltd.",
						"value": "MaxBupa Health Insurance Co. Ltd."
					},
					{
						"title": "National Insurance Co. Ltd.",
						"value": "National Insurance Co. Ltd."
					},
					{
						"title": "Reliance General Insurance Co. Ltd.",
						"value": "Reliance General Insurance Co. Ltd."
					},
					{
						"title": "Reliance Life Insurance Co. Ltd.",
						"value": "Reliance Life Insurance Co. Ltd."
					},
					{
						"title": "Religare Health Insurance Co. Ltd.",
						"value": "Religare Health Insurance Co. Ltd."
					},
					{
						"title": "Royal Sundaram General Insurance Co. Ltd.",
						"value": "Royal Sundaram General Insurance Co. Ltd."
					},
					{
						"title": "SBI General Insurance Co. Ltd.",
						"value": "SBI General Insurance Co. Ltd."
					},
					{
						"title": "Star Health and Allied Insurance Co. Ltd.",
						"value": "Star Health and Allied Insurance Co. Ltd."
					},
					{
						"title": "The New India Assurance Co. Ltd.",
						"value": "The New India Assurance Co. Ltd.",
						"isSelected": true
					},
					{
						"title": "The Oriental Insurance Co. Ltd.",
						"value": "The Oriental Insurance Co. Ltd."
					},
					{
						"title": "United India Insurance Co. Ltd.",
						"value": "United India Insurance Co. Ltd."
					},
					{
						"title": "Universal Sompo General Insurance Co. Ltd.",
						"value": "Universal Sompo General Insurance Co. Ltd."
					}					
					]
				},
				{
					"type": "TextBlock",
					"text": "Speciality"
				},
				{
					"type": "Input.ChoiceSet",
					"id": "speciality",
					"placeholder": "Select your speciality",
					"style":"compact",
					"choices": [
					{
						"title": "Cardiac & Circulatory Disorder",
						"value": "Cardiac & Circulatory Disorder"
					},
					{
						"title": "Cardiac & Circulatory Disorder (Medicine)",
						"value": "Cardiac & Circulatory Disorder (Medicine)"
					},
					{
						"title": "Dermatology",
						"value": "Dermatology"
					},
					{
						"title": "Endocrinology",
						"value": "Endocrinology"
					},
					{
						"title": "ENT",
						"value": "ENT"
					},
					{
						"title": "Gastroenterology",
						"value": "Gastroenterology"
					},
					{
						"title": "Hematology",
						"value": "Hematology"
					},
					{
						"title": "Infectious and parasitic diseases",
						"value": "Infectious and parasitic diseases"
					},
					{
						"title": "Kidney",
						"value": "Kidney"
					},
					{
						"title": "Medicine",
						"value": "Medicine"
					},
					{
						"title": "Neurology",
						"value": "Neurology"
					},
					{
						"title": "Obstetrics",
						"value": "Obstetrics"
					},
					{
						"title": "Oncology",
						"value": "Oncology"
					},
					{
						"title": "Ophthalomology",
						"value": "Ophthalomology"
					},
					{
						"title": "Orthopedics",
						"value": "Orthopedics"
					},
					{
						"title": "Pediatrics",
						"value": "Pediatrics"
					},
					{
						"title": "Plastic Surgery",
						"value": "Plastic Surgery"
					},
					{
						"title": "Psychiatric Disorders",
						"value": "Psychiatric Disorders"
					},
					{
						"title": "Pulmonology",
						"value": "Pulmonology"
					},
					{
						"title": "Uronephrology",
						"value": "Uronephrology"
					}					
					]
				}
				],
				"actions": [
				{
					"type": "Action.Submit",
					"title": "Search Network Hospital"
				}
				]
			}
		};
		session.send(new builder.Message(session)
			.speak("Please choose insurer and speciality from options below.")
			.addAttachment(card));

		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);


function processSubmitAction8(session, message){
		session.userData.insurer = message["insurer"];
		session.userData.speciality = message["speciality"];	
		return session;		
}


// Dialog to ask for Insurer Name on Facebook
bot.dialog('askforInsurerFB',[
	function (session){
		session.beginDialog('askforInsurerName');
	},
	function(session, results){
		if(results.response){
			session.userData.insurer = results.response;
			const client = new Wit({accessToken: process.env.WIT_ACCESS_TOKEN});
			client.message(session.userData.insurer, {})
			.then((data) => {
				entities = data['entities'];
				for (var entity in entities){
				session.userData.insurer = data['entities'][entity][0]['value'];
				}
				})
			.catch(console.error);
			session.beginDialog('askforSpeciality');
		}
	},
	function(session, results) {
		if(results.response){
			session.userData.speciality = results.response;
			const client = new Wit({accessToken: process.env.WIT_ACCESS_TOKEN});
			client.message(session.userData.speciality, {})
			.then((data) => {
			  entities = data['entities'];
			  for (var entity in entities){
				session.userData.speciality = data['entities'][entity][0]['value'];
			  }
			  })
			.catch(console.error);
			session.endDialogWithResult(results);
		}
	}
]);

// Dialog to ask for Insurer Name
bot.dialog('askforInsurerName',[
	function (session){
		builder.Prompts.text(session, "Please provide your `Insurer` name");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to ask for Speciality
bot.dialog('askforSpeciality',[
	function (session){
		builder.Prompts.text(session, "What is the medical `speciality` you're looking for. Eg: `Dermatology`, `Orthopedics`, `Kidney`, `Cardiac & Circulatory Disorder` etc.");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// -----------------------------------------------------------------------------------------------------------------------------------------------------

// REDIRECTS

// Dialog to redirect to Call Center
bot.dialog('askforCallCenter',[
	function (session){
		session.endDialog("ℹ️ You can reach our call center at `1800 425 9449` or write to `gethelp@mahs.in` for claim related queries");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/customer/i, /support/i, /call center/i, /call centre/i, /customer service/i, /cc number/i, /cc/i, /helpline/i, /toll/i, /tech support/i, 'CustomerCare']
	// /^customer$|^support$|^call centre$|^customer service$|^ cc number$|^cc$|^helpline$|^toll free$|^call center$/i,
	
});

// Dialog to redirect to HR
bot.dialog('askforHR',[
	function (session){
		session.endDialog("ℹ️ For recent updates on career opportunities, kindly check out the \"Careers\" tab on our Medi Assist facebook page or mail us at `harish.dasepalli@mahs.in`");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/HR/i, /join.*company/i, /hr department/i, /human resource/i, /hr dept/i, /career/i, /job/i, /join/i, /opportunity/i, /opportunities/i, /opening/i, /fresher/i, 'HR']
	// /^HR$|^human resource$|^hr dept$|^hr department$|^ join.*company$|^careers$|^career$|^job$|^join$|^job|^opportunit$|^opening$|^fresher$|^$|^$/i,
	
});

// Dialog to redirect to Investigation
bot.dialog('askforInvestigation',[
	function (session){
		session.endDialog("ℹ️ Thank you for your valuable feedback. We will notify our investigation team");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/investigation/i, /forge/i, /malpractice/i, /fishy/i, /suspicious/i, /fordge/i, 'Investigation']
	
});

// Dialog to redirect to Grievance
bot.dialog('askforGrievance',[
	function (session){
		session.endDialog("ℹ️ We sincerely regret for the unpleasant experience! For expeditious handling of grievance we have a well laid down procedures as per Quality norms. There is a seperate Grievance Team to ensure grievance disposal within 7 working days. You may send your grievances, if any, to: The Grievance Cell, Medi Assist Insurance TPA Private Limited, Tower 'D', 4th Floor, IBC Knowledge Park, 4/1, Bannerghatta Road, Bengaluru - 560029. Email: grievance@mediassistindia.com");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/grievance/i, /disappoint/i, /angry/i ,/disappointed/i, /dissatisfied/i, /unhappy/i, /horrible/i, /worst/i, /bad/i, /poor/i, /not settled/i, /not paid/i, /not received/i, /very poor/i, /very bad/i, /terrible/i, /not received any amount/i, /not intimated the hospital/i, /not working/i, /support is slow/i, /I did not get/i, /bad service/i, /I did not receive/i, /bad service/i, /bad tpa/i, /bad/i, /worst/i, /complaint/i, 'Grievance'],
	
});

// Dialog to redirect to Offshore
bot.dialog('askforOffshore',[
	function (session){
		session.endDialog("ℹ️ For further assistance you can either write to `gethelp@mahs.in` or call on our \"Overseas\" contact number at `91-80-67617555`");
	},
	function(session, results) {i 
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/offshore/i, /abroad/i, /overseas contact number/i, /USA/i, /Australia/i, /overseas/i, 'Offshore']
	
});

// Dialog to redirect to General Query
bot.dialog('askforGeneralQuery',[
	function (session){
		session.endConversation("ℹ️ For all your claim/application (MediBuddy)/transaction related queries kindly write to `gethelp@mahs.in` or call us at `1800 425 9449`");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/register/i, /application/i, /app/i, /transaction/i, /query/i, /queries/i, /question/i, /doubt/i, /clarify/i, /clarity/i, /contact information/i, /registration/i, /can i submit/i, /for how many days/i, /how many/i, /help us urgently/i, /help us/i, /purchase/i, /buy/i, /how much/i, /log in/i, /please guide/i, /responding/i, /please help/i]
	
});


// Dialog to handle abuse
bot.dialog('askforAbuse',[
	function (session){
		session.endDialog("🚫 Hey, that language is uncalled for! I request you to write to us on `gethelp@mahs.in` or call us on our toll free no `1800 425 9449`. Alternatively, you can also download MediBuddy and track your claim on real time basis");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: ['Abuse']
});

// Get random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Dialog to handle goodbye
bot.dialog('sayGoodbye',[
	function (session){
		msg = ["See you later 👋, Keep rocking!","Stay healthy, always! Bye for now!","See you 👋!","Have a good day.","Later gator!","Talking to you makes my day. Come back soon!", "Ok, bye🙂!", "Till next time!"]
		x = getRandomInt(0,7);
		session.endDialog(msg[x]);
//		session.endDialog("goodbyeMsg");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: ['sayGoodbye', /end conversation/i]
});

// Dialog to handle Technology Issue
bot.dialog('techIssue',[
	function (session){
		builder.Prompts.confirm(session, "Do you have a working account on MediBuddy? (yes/no)",
		{	speak: "Do you have a working account on MediBuddy? yes or no?",
		listStyle: builder.ListStyle["button"]})
	},
	function (session, results) {
		if (results.response){
			activateAccountCard = new builder.HeroCard(session)
			.title("Account Issue")
			.subtitle("Having troubles logging in? This should help.")
			.buttons([
				builder.CardAction.openUrl(session, "https://blogs.medibuddy.in/login-issues-medibuddy-read/", "Fix Login Issues on MediBuddy")
				]);
		session.send(new builder.Message(session)
		.addAttachment(activateAccountCard));
		setTimeout(function () {
			session.endConversation();
			session.beginDialog('askforMore');
		},2000);
		}
		else {
			activateAccountCard = new builder.HeroCard(session)
			.title("Activate Account")
			.subtitle("Not yet? Here's where you can go to activate your account.")
			.text("https://me.medibuddy.in/")
			.buttons([
				builder.CardAction.openUrl(session, "https://me.medibuddy.in/", "Activate My Account")
				]);
		session.send(new builder.Message(session)
		.addAttachment(activateAccountCard));		
		setTimeout(function () {
			session.endConversation();
			session.beginDialog('askforMore');
		},2000);
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: ['TechIssue']
});

// Dialog to handle Compliment
bot.dialog('getCompliment',[
	function (session){
		msg = ["Welcome! It's nothing","👍","That's all right!","Don't mention it.","😍", "That is very kind of you", "Thank you, I appreciate the compliment.", "Thank you very much. 🙏","All I can say is, Thanks!", "MediBuddy appreciates your gratitude! We wish you good health and smiles 🙂"]
		x = getRandomInt(0,9);
//		session.endDialog("Bye!");
		session.endDialog(msg[x]);
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/thanks/i, /thank you/i, /awesome/i, /great/i, /brilliant/i, /i love you/i, /excellent/i, /fantastic/i, /amazing/i, /cute/i, /you're great/i, 'sayThanks']
});


// Dialog to trigger InPatient Services Conversation
bot.dialog('serviceIP',[
	function (session){
		var menucards = [];
		policyCoverageCard = new builder.HeroCard(session)
		.title("Policy coverage details")
		.subtitle("I've created a button for you. Click on it, login, and you'll be able to view your policy details.")
		.images([
			new builder.CardImage(session)
				.url('https://i.imgur.com/7Fc2dgp.png')
				.alt('Track Claim')
		])
		.buttons([
			builder.CardAction.openUrl(session, "https://www.google.com/url?q=https://portal.medibuddy.in/policy.aspx&sa=D&source=hangouts&ust=1541677704835000&usg=AFQjCNFTw9NFlXWUC_IRQAhIjEau3N2ZYg", "Show Me My Policy Details")
			]);

	menucards.push(policyCoverageCard);

	eCashlessCard = new builder.HeroCard(session)
			.title("Plan eCashless for Hospitalization")
			.subtitle("I suggest you devour this post on eCashless before you begin.")
			.images([
				new builder.CardImage(session)
					.url('https://i.imgur.com/01QMBJe.png')
					.alt('Plan eCashless')
			])
			.buttons([
				builder.CardAction.imBack(session, "Know more about eCashless", "Know More")
				]);

	menucards.push(eCashlessCard);

	searchNetworkCard = new builder.HeroCard(session)
			.title("View Network Hospitals")
			.subtitle("Search Medi Assist to find the nearest network hospitals and avail e-cashless benefits.")
			.images([
				new builder.CardImage(session)
					.url('https://i.imgur.com/5XFqXU7.png')
					.alt('Search Network')
			])
			.buttons([
				builder.CardAction.imBack(session, "Locate Network Hospital", "Locate Network Hospital")
				]);

	menucards.push(searchNetworkCard);

	ailmentIPCard = new builder.HeroCard(session)
			.title("Know More About Ailment-Specific IP Services on MediBuddy")
			.subtitle("Getting your Medi Assist E-Card is much simpler and at your finger tips. Download your E-Card now.")
			.images([
				new builder.CardImage(session)
					.url('https://i.imgur.com/01QMBJe.png')
					.alt('Download E-Card')
			])
			.buttons([
				builder.CardAction.imBack(session, "Download E-Card", "Download E-Card")
				]);

//	menucards.push(ailmentIPCard);

		var msg = new builder.Message(session)
		.speak("Go on then...choose any: ")
		.text("Go on then...choose any: ")
		.attachmentLayout(builder.AttachmentLayout.carousel)
		.attachments(menucards);
		session.send(msg);

		setTimeout(function () {
			session.endConversation();
			session.beginDialog('askforMore');
		},10000);
	},
	function(session, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: ['serviceIP']
	
});	

//Custom redirect to Know more about eCashless
bot.customAction({
	matches: [/^Know more about eCashless$/gi],
	onSelectAction: (session, args, next) => {
		session.beginDialog('learneCashless');	
	}
});


// Dialog to trigger Learn eCashless
bot.dialog('learneCashless',[
	function (session){
		var menucard = [];
		eCashlessCard = new builder.HeroCard(session)
		.title("Learn Enrollment")
		.subtitle("Now, here lies the gateway to cashless hospitalization. Would you like to...")
		.buttons([
			builder.CardAction.openUrl(session, "https://portal.medibuddy.in/Plannedhospitalisation.aspx", "Plan eCashless hospitalization"),
			builder.CardAction.openUrl(session, "https://blogs.medibuddy.in/ecashless-paving-the-way-for-digital-transformation/", "Read Now"),
			builder.CardAction.imBack(session, "help", "Read Cashless Guidelines"),
			builder.CardAction.imBack(session, "help", "Read Reimbursement Guidelines"),

			]);

		menucard.push(eCashlessCard);

		var msg = new builder.Message(session)
		.speak("Now, here lies the gateway to cashless hospitalization. Would you like to Plan eCashless hospitalization, read about eCashless")
//		.text("My abilities are still growing. In a nutshell, here's what I can do: ")
		.attachmentLayout(builder.AttachmentLayout.carousel)
		.attachments(menucard);
		session.send(msg);
	},
	function(session, results){	
		session.endDialogWithResult(results);		
	}
]);	


// Dialog to trigger Contact dialog
bot.dialog('contact',[
	function (session){

		var msg = new builder.Message(session)
		.speak("I will answer all your queries someday. But until then, I'm going to point you in the right direction where you can get all your answers. Hope this helps!")
		.text("I will answer all your queries someday. But until then, I'm going to point you in the right direction where you can get all your answers. Hope this helps! :-)")
		.suggestedActions(
			builder.SuggestedActions.create(
				session, [
					builder.CardAction.openUrl(session, "https://www.medibuddy.in/", "Login to MediBuddy"),
					builder.CardAction.openUrl(session, "https://blogs.medibuddy.in/", "Need More")
				])
		);
	session.send(msg);	
	
		setTimeout(function () {
			session.endConversation();
			session.beginDialog('askforMore');
		},15000);
	},
	function(session, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: ['contact']
	
});	


// Dialog to trigger Testing
bot.dialog('Testing',[
	function (session){
		var request = require("request");
		request("https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key="+process.env.GoogleGeo2, function(error, response, body) {
			console.log(body);
		  });
	},
	function(session, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/asdfasdfasdfasdf/i]
	
});	


// Generic Help dialog for Bot
bot.dialog('Junk', [
	function(session){
			builder.Prompts.text(session,"Type in your query, and I'll try my best to resolve it");
	},
	function(session, results){
		if(results.response){
			/* Start of QNA */
			let host = process.env.QnAHostName;

			// NOTE: Replace this with a valid endpoint key.
			// This is not your subscription key.
			// To get your endpoint keys, call the GET /endpointkeys method.
			let endpoint_key = process.env.QnAAuthKey;

			// NOTE: Replace this with a valid knowledge base ID.
			// Make sure you have published the knowledge base with the
			// POST /knowledgebases/{knowledge base ID} method.
			let kb = process.env.QnAknowledgeBaseId;

			let method = "/qnamaker/knowledgebases/" + kb + "/generateAnswer";

			let question = {
				'question': JSON.stringify(results.response),
				'top': 3
			};

			let pretty_print = function (s) {
				return JSON.stringify(JSON.parse(s), null, 4);
			}

			// callback is the function to call when we have the entire response.
			let response_handler = function (callback, response) {
				let body = '';
				response.on ('data', function (d) {
					body += d;
				});
				response.on ('end', function () {
			// Call the callback function with the status code, headers, and body of the response.
					callback ({ status : response.statusCode, headers : response.headers, body : body });
				});
				response.on ('error', function (e) {
					console.log ('Error: ' + e.message);
					session.send("Looks like I still have to learn some more! Sorry, but I can't help you with your query right now.");
					session.send("While I attend my classes, please write to info@mediassistindia.com for help.");
					
				session.beginDialog('askforMore');
				});
			};

			// Get an HTTP response handler that calls the specified callback function when we have the entire response.
			let get_response_handler = function (callback) {
			// Return a function that takes an HTTP response, and is closed over the specified callback.
			// This function signature is required by https.request, hence the need for the closure.
				return function (response) {
					response_handler (callback, response);
				}
			}

			// callback is the function to call when we have the entire response from the POST request.
			let post = function (path, content, callback) {
				let request_params = {
					method : 'POST',
					hostname : host,
					path : path,
					headers : {
						'Content-Type' : 'application/json',
						'X-Content-Type-Options': 'nosniff',
						'Content-Length' : content.length,
						'Authorization' : 'EndpointKey ' + endpoint_key,
					}
				};

			// Pass the callback function to the response handler.
				let req = https.request (request_params, get_response_handler (callback));
				req.write (content);
				req.end ();
			}

			// callback is the function to call when we have the response from the /knowledgebases POST method.
			let get_answers = function (path, req, callback) {
				console.log ('Calling ' + host + path + '.');
			// Send the POST request.
				post (path, req, function (response) {
					callback (response.body);
				});
			}

			// Convert the request to a string.
			let content = JSON.stringify(question);
			get_answers (method, content, function (result) {
			// Write out the response from the /knowledgebases/create method.
				result = JSON.parse(result);
				result2 = JSON.parse(JSON.stringify(result.answers[0].answer));
				if(result2 == "No good match found in KB."){
					var wasHelpful = 0;
					session.userData.serviceName = "Not Trained - Help";
					var userQuery = JSON.parse(question.question);
					storeFeedback(JSON.stringify(session.message.address.id).replace(/"/g, "'"), JSON.stringify(session.userData.serviceName).replace(/"/g, "'"), wasHelpful,JSON.stringify(userQuery).replace(/"/g, "'"), JSON.stringify(session.message.timestamp).replace(/"/g, "'"), JSON.stringify(session.message.source).replace(/"/g, "'"));
			
					session.send("Looks like I still have to learn some more! Sorry, but I can't help you with your query right now.");
					session.send("While I attend my classes, please write to info@mediassistindia.com for help.");
					session.beginDialog('askforMore');
					session.endConversation();
				}else{
					var customMsg = new builder.Message(session).text(result2);
					session.send(customMsg);
					session.userData.serviceName = "Help";
					session.beginDialog('askforFeedback');
				}
				
//				console.log (pretty_print(JSON.stringify(result.answers[0].answer)));
			});

			/*End of QNA */
		}
	}
	/*,
	function(session, results){
		
		const msg = new builder.Message(session);
			msg.text("Would any of these topics be of interest to you?")
				.addAttachment(new builder.HeroCard(session)
						.images([
							new builder.CardImage(session)
								.url('https://i.imgur.com/7XCSpue.png')
								.alt('Other Help Topics')
						])
						.buttons([
							builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/get-insights-into-your-non-medical-expenses-now-with-medibuddy/", "Non Medical Expenses"),
							builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/claimed-and-approved-amounts-difference/", "Difference between claimed and approved amount"),
							builder.CardAction.openUrl(session, "http://blogs.medibuddy.in/faster-claim-reimbursement-medibuddy-5-step-process/", "Raising reimbursement claims for pre- and post-hospitalization expenses"),
							builder.CardAction.openUrl(session, "https://goo.gl/mz8uQL", "Medicines and post-operative home healthcare")								
							]));
			session.send(msg);
			session.userData.serviceName = "Information Center";
			session.beginDialog('askforFeedback');
			
//			session.endConversation();
	} */
])
.triggerAction({
	matches: /^help$/i,
	onSelectAction: (session, args) => {
		session.beginDialog(args.action, args);
	}
});
