//Author: Nirmal Rayan
//Version: 1.0
//Application: Medibot (Microsoft Bot Framework)

// Add your requirements
var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');
const {Wit, log} = require('node-wit');
require('env2')('.env'); // loads all entries into process.env
/* 
const botauth = require("botauth");

const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

//oauth details for facebook
const FACEBOOK_APP_ID = envx("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET = envx("FACEBOOK_APP_SECRET");

//encryption key for saved state
const BOTAUTH_SECRET = envx("BOTAUTH_SECRET");  */

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || process.env.port || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

//Direct to index.html web page
 server.get('/', restify.plugins.serveStatic({
 directory: __dirname,
 default: '/index.html'
})); 

// Create chat bot
var connector = new builder.ChatConnector
({ appId: process.env.MY_APP_ID, appPassword: process.env.MY_APP_PASSWORD }); 

// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
var bot = new builder.UniversalBot(connector,

    function (session) {
		
			session.send('LABTEST ID IS :'+process.env.LABTEST_ID);
		if(session.message.address.channelId === 'facebook'){
			var welcomeCard = new builder.HeroCard(session)
				.title("Hi %s! Nice to see you. I am MediBot", session.message.address.user.name)
				.subtitle("I will be your personal healthcare assistant. ℹ️ Type \"show menu\" or \"#\" at any time to see the menu.")
				.images([
					new builder.CardImage(session)
						.url('https://i.imgur.com/HwRgHDI.png')
						.alt('MediBot')
				])
				.buttons([
					builder.CardAction.imBack(session, "Show Menu", "Show Menu")
				]);
			session.userData.name = session.message.address.user.name;
		}
		else{
			if(session.userData.masterName){
				var welcomeCard = new builder.HeroCard(session)
				.title("Hi " + session.userData.masterName + "! Nice to see you again")
				.subtitle("I will be your personal healthcare assistant. ℹ️ Type \"show menu\" or \"#\" at any time to see the menu.")
				.images([
					new builder.CardImage(session)
						.url('https://i.imgur.com/HwRgHDI.png')
						.alt('MediBot')
				])
				.buttons([
					builder.CardAction.imBack(session, "Show Menu", "Show Menu")
				]);

			}
			else{
				var welcomeCard = new builder.HeroCard(session)
				.title("Greetings! I'm MediBot")
				.subtitle("I will be your personal healthcare assistant. ℹ️ Type \"show menu\" or \"#\" at any time to see the menu.")
				.images([
					new builder.CardImage(session)
						.url('https://i.imgur.com/HwRgHDI.png')
						.alt('MediBot')
				])
				.buttons([
					builder.CardAction.imBack(session, "Show Menu", "Show Menu")
				]);
				
				
				session.sendTyping();
				setTimeout(function () {
					session.beginDialog('askName');
				}, 8000);		
			
			}
			session.send(new builder.Message(session)
				.addAttachment(welcomeCard));
			
		}	
    });

	
// Dialog to ask for Master Name
bot.dialog('askName',[
	function (session){
			builder.Prompts.text(session, "What's your name?");
	},
	function(session, results) {
		session.userData.masterName =  results.response;
		session.endConversation('Welcome, '+ results.response);
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

	
// Dialog to show main menu
bot.dialog('showMenu',[
	function (session){	
			var menucards = [];
			
			trackClaimCard = new builder.HeroCard(session)
									.title("Track Claim")
									.subtitle("Tracking your claim can help you understand where you are in the claims process.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/RNwn1DK.png')
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
											.url('https://i.imgur.com/80FLdwc.png')
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
											.url('https://i.imgur.com/5Rc0b6m.png')
											.alt('Search Network')
									])
									.buttons([
										builder.CardAction.imBack(session, "Search Network", "Search Network")
										]);
			
			menucards.push(searchNetworkCard);
			
			healthCheckCard = new builder.HeroCard(session)
									.title("Health Check")
									.subtitle("Booking health check has never been easier. Find the best hospitals with discounts in your city now.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/LGKrs5k.png')
											.alt('Health Check')
									])
									.buttons([
										builder.CardAction.imBack(session, "Health Check", "Health Check")
										]);
			
			menucards.push(healthCheckCard);
	
			medicineCard = new builder.HeroCard(session)
									.title("Medicine")
									.subtitle("We bring pharmacies to your doorsteps. Click below to know more about ordering medicines.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/zdqBW3P.png')
											.alt('Medicine')
									])
									.buttons([
										builder.CardAction.imBack(session, "Medicine", "Medicine")
										]);
			
			menucards.push(medicineCard);

			consultationCard = new builder.HeroCard(session)
									.title("Consultation")
									.subtitle("Do you want to book a consultation with a doctor of your choice? Click below to know more.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/kulyrgx.png')
											.alt('Medicine')
									])
									.buttons([
										builder.CardAction.imBack(session, "Consultation", "Consultation")
										]);
			
			menucards.push(consultationCard);

			homecareCard = new builder.HeroCard(session)
									.title("Home Health Care")
									.subtitle("MediBuddy Infiniti brings `Physiotherapist`, `Attendant` and `Nursing` visit facilities to your home.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/FbM1SvH.png')
											.alt('Medicine')
									])
									.buttons([
										builder.CardAction.imBack(session, "Home Health Care", "Home Health Care")
										]);
			
			menucards.push(homecareCard);

			teleconsultationCard = new builder.HeroCard(session)
									.title("Tele Consultation")
									.subtitle("Book a telephonic consultation with our medical professionals at the lowest cost. Click below to learn more.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/Ps8hw1x.png')
											.alt('Tele Consultation')
									])
									.buttons([
										builder.CardAction.imBack(session, "Tele Consultation", "Tele Consultation")
										]);
			
			menucards.push(teleconsultationCard);

			labtestCard = new builder.HeroCard(session)
									.title("Lab Test")
									.subtitle("Looking for a clinical laboratory for diagnostics? We have you covered.")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/BL44d2H.png')
											.alt('Lab Test')
									])
									.buttons([
										builder.CardAction.imBack(session, "Lab Test", "Lab Test")
										]);
			
			menucards.push(labtestCard);
			
			var msg = new builder.Message(session)
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
	matches: [/^show menu$/i, /#/i]
});

// Dialog to start tracking claims
bot.dialog('trackClaim', [
	function (session){
		session.send("Wecome to Claim Tracking System ✨💫🌟");
		session.beginDialog('askforTrackBy');
	},
	function(session, results) {
		session.endDialogWithResult(results);	
	}
])
.triggerAction({
	matches: [/track claim/i, /track/i, /tracking/i, /claim tracking/i, /claim status/i, /pending claim/i, /claim details/i], 
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog for displaying menu after completing requested tasks
bot.dialog('askforMore',[
	function (session){
		
		session.send("How else can I help you?");
		session.beginDialog('showMenu');
		/*
		builder.Prompts.choice(session, "How else can I help you?", mainMenu, builder.ListStyle.button);		
	},
	function (session, results) {
		if(results.response.entity == 'Track Claim'){
			session.beginDialog('trackClaim');
		}
		else if(results.response.entity == 'Download E-Card'){
			session.beginDialog('downloadEcard');
		}
		else if(results.response.entity == 'Search Network Hospitals'){
			session.beginDialog('searchNetwork');
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);	*/
	}
]);

// Dialog to ask for Track By
bot.dialog('askforTrackBy',[
	function (session){
		var msg = new builder.Message(session)
			.text("Alright, let's get started 🚀. There are three ways to track your claim. Please select one of the following options: ")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Track with Claim ID", "Track with Claim ID"),
						builder.CardAction.imBack(session, "Track with Medi Assist ID", "Track with Medi Assist ID"),
						builder.CardAction.imBack(session, "Track with Employee ID", "Track with Employee ID"),
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
	matches: /^Track with Claim ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('trackClaimwID');
		
	}
});

//Custom redirect to Track with Medi Assist ID
bot.customAction({
	matches: /^Track with Medi Assist ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('trackClaimwMAID');
		
	}
});

//Custom redirect to Track with Employee ID
bot.customAction({
	matches: /^Track with Employee ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('trackClaimwEmpID');
		
	}
});

// Dialog to ask for Confirmation - Track with Claim Number
bot.dialog('askforTrackClaimwIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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

// Dialog to Track with Claim Number
bot.dialog('trackClaimwID', [
				function (session){
					if(!session.dialogData.claimNumber){
//						console.log(session.message.address.channelId);
						session.beginDialog('askforClaimNumber');
					}
				},	
				function (session, results) {
					var clmNoChecker = /^\d{8}$/.test(results.response);
					if(JSON.stringify(clmNoChecker) == "true"){
						session.dialogData.claimNumber = results.response;
						session.beginDialog('askforDOA');
					}
					else{
						session.send("⚠️ The claim number should only be `numeric` and `eight digits` long.");
						session.beginDialog('askforTrackClaimwIDConfirmation');
					}
				},
				function (session, results) {
					session.dialogData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					session.send("Tracking claim with details 🕵️ <br/>Claim Number: %s<br/>Date/Time: %s. <br/><br/>Please wait ⏳",
						session.dialogData.claimNumber, session.dialogData.hospitalizationDate);
					
					//Make POST request to MA Server
					var request = require('request');	
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded'
					}

					// Configure the request
					var options = {
						url: 'https://track.medibuddy.in/api/TrackClaimWithClaimNumber/.json',
						method: 'POST',
						headers: headers,
						form: {'claimNumber':session.dialogData.claimNumber,'date':session.dialogData.hospitalizationDate}
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							data = JSON.parse(body);
							
							if(JSON.stringify(data.isSuccess) === "true"){

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
								
								//Discharge Summary
								session.userData.trackNonPayableAmount = JSON.stringify(claimdata[0].dischargeSummary.nonPayableAmount);
								session.userData.trackNonPayReason =claimdata[0].dischargeSummary.nonPayReason;
								session.userData.trackAmountPaidByPatient = JSON.stringify(claimdata[0].dischargeSummary.amountPaidByPatient);
								session.userData.trackAmountPaidByCorporate = JSON.stringify(claimdata[0].dischargeSummary.amountPaidByCorporate);
								session.userData.trackPolicyExcessAmount = JSON.stringify(claimdata[0].dischargeSummary.policyExcessAmount);
								session.userData.trackHospitalDiscount = JSON.stringify(claimdata[0].dischargeSummary.hospitalDiscount);
								session.userData.trackAdvancePaidByPatient = JSON.stringify(claimdata[0].dischargeSummary.advancePaidByPatient);
								session.userData.trackDeductionReason = claimdata[0].dischargeSummary.deductionReason;
								
								
								var card = createReceiptCard(session);
								var msg = new builder.Message(session).addAttachment(card);
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
  							}
							else if(JSON.stringify(data.isSuccess) === "false"){
								if(data.errorMessage == "Please enter valid claim ID."){
									session.send('⚠️ The claim ID you have entered is incorrect.');
									session.beginDialog('askforTrackClaimwIDConfirmation');
								}
								else if (data.errorMessage == "Please enter valid date between hospitalization and discharge."){
									session.send('⚠️ The date you have entered is incorrect.');
									session.beginDialog('askforTrackClaimwIDConfirmation');
								}
							}  
						}
					});
					
					session.endDialog();
				}
]);

// Dialog to ask for Confirmation - Track with MAID
bot.dialog('askforTrackClaimwMAIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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

// Dialog to Track with Medi Assist ID
bot.dialog('trackClaimwMAID', [
				function (session){
						session.beginDialog('askforMAID');
					
				},	
				function (session, results) {
					session.dialogData.MAID = results.response;
					
					var clmMAIDChecker = /^\d{10}$/.test(results.response);
					if(JSON.stringify(clmMAIDChecker) == "true"){
						session.dialogData.MAID = results.response;
						session.beginDialog('askforDOA');
					}
					else{
						session.send("⚠️ The Medi Assist ID should only be `numeric` and `ten digits` long.");
						session.beginDialog('askforTrackClaimwMAIDConfirmation');
					}
				},
				function (session, results) {
					session.dialogData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					session.send("Tracking claim with details 🕵️ <br/>Medi Assist ID: %s<br/>Date/Time: %s. <br/><br/>Please wait ⏳",
						session.dialogData.MAID, session.dialogData.hospitalizationDate);
					
					//Make POST request to MA Server
					var request = require('request');
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded'
					}

					// Configure the request
					var options = {
						url: 'https://track.medibuddy.in/api/TrackClaimWithMAID/.json',
						method: 'POST',
						headers: headers,
						form: {'maid':session.dialogData.MAID,'date':session.dialogData.hospitalizationDate}
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							// Print out the response body
							data = JSON.parse(body);
							console.log(data);
							
							if(JSON.stringify(data.isSuccess) === "true"){
						    	console.log(JSON.stringify(data.isSuccess));

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
								
								//Discharge Summary
								session.userData.trackNonPayableAmount = JSON.stringify(claimdata[0].dischargeSummary.nonPayableAmount);
								session.userData.trackNonPayReason =claimdata[0].dischargeSummary.nonPayReason;
								session.userData.trackAmountPaidByPatient = JSON.stringify(claimdata[0].dischargeSummary.amountPaidByPatient);
								session.userData.trackAmountPaidByCorporate = JSON.stringify(claimdata[0].dischargeSummary.amountPaidByCorporate);
								session.userData.trackPolicyExcessAmount = JSON.stringify(claimdata[0].dischargeSummary.policyExcessAmount);
								session.userData.trackHospitalDiscount = JSON.stringify(claimdata[0].dischargeSummary.hospitalDiscount);
								session.userData.trackAdvancePaidByPatient = JSON.stringify(claimdata[0].dischargeSummary.advancePaidByPatient);
								session.userData.trackDeductionReason = claimdata[0].dischargeSummary.deductionReason;
								
								
								var card = createReceiptCard(session);
								var msg = new builder.Message(session).addAttachment(card);
								session.send("Here are your latest claim details:");
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
  							}
							else if(JSON.stringify(data.isSuccess) === "false"){
								console.log("Error message is "+ data.errorMessage);
								if(data.errorMessage == "Please enter valid Medi Assist ID."){
									session.send('⚠️ The Medi Assist ID you have entered is incorrect.');
									session.beginDialog('askforTrackClaimwMAIDConfirmation');
								}
								else if (data.errorMessage == "Please enter valid date between hospitalization and discharge."){
									session.send('⚠️ The date you have entered is incorrect.');
									session.beginDialog('askforTrackClaimwMAIDConfirmation');
								}
							}  
						}
					});
					
					session.endDialog();
				}
]);

// Dialog to ask for Confirmation - Track with Employee Details
bot.dialog('askforTrackClaimwEmpIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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

// Dialog to Track with Employee Details
bot.dialog('trackClaimwEmpID', [
				function (session){
						session.beginDialog('askforEmpID');
				},	
				function (session, results){
					session.dialogData.EmpID = results.response;
					session.beginDialog('askforCorporate');
				},	
				function (session, results) {
					session.dialogData.Corporate = results.response;
					session.beginDialog('askforDOA');
				},
				function (session, results) {
					session.dialogData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					session.send("Tracking claim with details 🕵️ <br/>Employee ID: %s<br/>Corporate: %s<br/>Date/Time: %s. <br/><br/>Please wait ⏳",
						session.dialogData.EmpID, session.dialogData.Corporate, session.dialogData.hospitalizationDate);
					
					//Make POST request to MA Server
					var request = require('request');
					
					// Set the headers
					var headers = {
						'User-Agent':       'Super Agent/0.0.1',
						'Content-Type':     'application/x-www-form-urlencoded'
					}

					// Configure the request
					var options = {
						url: 'https://track.medibuddy.in/api/TrackClaimWithEmpDetails/.json',
						method: 'POST',
						headers: headers,
						form: {'employeeId':session.dialogData.EmpID, 'corporateName': session.dialogData.Corporate, 'date':session.dialogData.hospitalizationDate}
					}

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							// Print out the response body
							data = JSON.parse(body);
							console.log(data);
							
							if(JSON.stringify(data.isSuccess) === "true"){

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
								
								//Discharge Summary
								session.userData.trackNonPayableAmount = JSON.stringify(claimdata[0].dischargeSummary.nonPayableAmount);
								session.userData.trackNonPayReason =claimdata[0].dischargeSummary.nonPayReason;
								session.userData.trackAmountPaidByPatient = JSON.stringify(claimdata[0].dischargeSummary.amountPaidByPatient);
								session.userData.trackAmountPaidByCorporate = JSON.stringify(claimdata[0].dischargeSummary.amountPaidByCorporate);
								session.userData.trackPolicyExcessAmount = JSON.stringify(claimdata[0].dischargeSummary.policyExcessAmount);
								session.userData.trackHospitalDiscount = JSON.stringify(claimdata[0].dischargeSummary.hospitalDiscount);
								session.userData.trackAdvancePaidByPatient = JSON.stringify(claimdata[0].dischargeSummary.advancePaidByPatient);
								session.userData.trackDeductionReason = claimdata[0].dischargeSummary.deductionReason;
								
								
								var card = createReceiptCard(session);
								var msg = new builder.Message(session).addAttachment(card);
								session.send("Here are your latest claim details:");
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
  							}
							else if(JSON.stringify(data.isSuccess) === "false"){
								if(data.errorMessage == "Please enter valid employee details."){
									session.send('⚠️ The employee details you have entered is incorrect.');
									session.beginDialog('askforTrackClaimwEmpIDConfirmation');
								}
								else if (data.errorMessage == "Please enter valid date between hospitalization and discharge."){
									session.send('⚠️ The date you have entered is incorrect.');
									session.beginDialog('askforTrackClaimwEmpIDConfirmation');
								}
							}  
						}
					});
					
					session.endDialog();
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
		+ ' | Claim Type: '+ session.userData.trackClaimType + ' | Date of Hospitalization: '+ session.userData.trackDoa+ ' | Date of Discharge: ' + session.userData.trackDod 
		+ ' | Relation to Beneficiary: ' + session.userData.trackBenefRelation+ ' | Claim Received Date: ' + session.userData.trackClaimReceivedDate + ' | Claim Approved Date: '+ 
		session.userData.trackClaimApprovedDate + ' | Claim Denied Date: ' + session.userData.trackClaimDeniedDate+ ' | Policy Number: ' + session.userData.trackPolicyNo + 
		' | Claimed Amount: Rs. '+ formatNumber(session.userData.trackClmAmount) + ' | Hospital Discount : Rs. '+ formatNumber(session.userData.trackHospitalDiscount) + 
		' | Amount Paid by Beneficiary: Rs. '+ formatNumber(session.userData.trackAmountPaidByPatient) + ' | Amount Paid by Corporate : Rs. '+ formatNumber(session.userData.trackAmountPaidByCorporate) + 
		' | Non Payable Amount : Rs. ' + formatNumber(session.userData.trackNonPayableAmount) + ' | Policy Excess Amount : Rs. '+ formatNumber(session.userData.trackPolicyExcessAmount) +
		' | Advance Paid by Beneficiary : Rs. '+formatNumber(session.userData.trackAdvancePaidByPatient)+ ' | Approved Amount : Rs. '+ formatNumber(session.userData.trackClmApprovedAmt)
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
			'#### Claim Received Date : ' + session.userData.trackClaimReceivedDate + '\r\r' +
			'#### Claim Approved Date : ' + session.userData.trackClaimApprovedDate + '\r\r' +
			'#### Claim Denied Date : ' + session.userData.trackClaimDeniedDate + '\r\r' +
			'#### Policy Number : ' + session.userData.trackPolicyNo + '\r\r' +
			'#### Claimed Amount : &#x20B9; ' + formatNumber(session.userData.trackClmAmount) + '/- \r\r' +
			'#### Hospital Discount : &#x20B9; ' + formatNumber(session.userData.trackHospitalDiscount) + '/- \r\r' +
			'#### Amount Paid by Beneficiary : &#x20B9; ' + formatNumber(session.userData.trackAmountPaidByPatient) + '/- \r\r' +
			'#### Amount Paid by Corporate : &#x20B9; ' + formatNumber(session.userData.trackAmountPaidByCorporate) + '/- \r\r' +
			'#### Non Payable Amount : &#x20B9; ' + formatNumber(session.userData.trackNonPayableAmount) + '/- \r\r' +
			'#### Policy Excess Amount : &#x20B9; ' + formatNumber(session.userData.trackPolicyExcessAmount) + '/- \r\r' +
			'#### Advance Paid by Beneficiary : &#x20B9; ' + formatNumber(session.userData.trackAdvancePaidByPatient) + '/- \r\r' +
			'#### Approved Amount : &#x20B9; ' + formatNumber(session.userData.trackClmApprovedAmt) + '/- \r\r' 
		)
        .images([
            builder.CardImage.create(session, 'https://i.imgur.com/j6md6yB.png')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://track.medibuddy.in/', 'More Information')
        ]);
	
	}	
	
	
/*     return new builder.ReceiptCard(session)
        .title(session.userData.trackBenefName + ' (' + session.userData.trackBenefMAID + ')')
        .facts([
            builder.Fact.create(session, session.userData.trackClaimId, 'Claim Number'),
            builder.Fact.create(session, session.userData.trackClaimType, 'Claim Type'),
			builder.Fact.create(session, session.userData.trackHospitalName, 'Hospital Name'),
			builder.Fact.create(session, session.userData.trackDoa, 'Date of Hospitalization'),
			builder.Fact.create(session, session.userData.trackDoa, 'Date of Discharge'),
			builder.Fact.create(session, session.userData.trackClaimStatus, 'Claim Status'),
			builder.Fact.create(session, session.userData.trackBenefRelation, 'Relation'),
			builder.Fact.create(session, session.userData.trackClaimReceivedDate, 'Claim Received Date'),
			builder.Fact.create(session, session.userData.trackClaimApprovedDate, 'Claim Approved Date'),
			builder.Fact.create(session, session.userData.trackClaimDeniedDate, 'Claim Denied Date'),
			builder.Fact.create(session, session.userData.trackPolicyNo, 'Policy Number')
			
			
        ])
        .items([
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackClmAmount, 'Claimed Amount'),
            builder.ReceiptItem.create(session, 'Rs. ' + session.userData.trackHospitalDiscount, 'Hospital Discount'),
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackAmountPaidByPatient, 'Amount Paid by Beneficiary'),
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackAmountPaidByCorporate, 'Amount Paid by Corporate'),
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackNonPayableAmount, 'Non Payable Amount'),
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackPolicyExcessAmount, 'Policy Excess Amount'),
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackAdvancePaidByPatient, 'Advance Paid by Beneficiary')
        ])
        .total('Rs. ' + session.userData.trackClmApprovedAmt)
        .buttons([
            builder.CardAction.openUrl(session, 'https://track.medibuddy.in/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]); */
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
		builder.Prompts.time(session, "Please provide any date between hospitalization and discharge");		
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
		builder.Prompts.text(session, "Please provide your Corporate Name");		
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
    var msg = "⛑️ You can enter the date in any format. Eg. if date of admission is 01-Jan-2017 and discharge is 05-Jan-2017, you can enter any date from 1st Jan,2017 to 5th Jan, 2017";
    session.endDialog(msg);
});

// Generic Help dialog for Bot
bot.dialog('help', function (session, args, next) {
    session.endDialog("⛑️ Medibot can help you track your claim, download e-card or search nearby hospitals within Medi Assist Network. <br/>Please say 'next' to continue");
})
.triggerAction({
    matches: /^help$/i,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack 
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
});

//------------------------------------------------------------------------------------------------------------------------------------------------//


// Dialog to Download E-Card
bot.dialog('downloadEcard',[
	function (session){
		session.send("Welcome to E-Card Download Center️ 🎊️️🎈🎉");
		session.beginDialog('askforDownloadBy');
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/download e-card/i, /download ecard/i, /ecard/i, /tpa card/i, /insurance card/i, /card/i, /download card/i, /^download e-card$/i],
	// /^download e-card$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to ask for Download By
bot.dialog('askforDownloadBy',[
	function (session){
		var msg = new builder.Message(session)
			.text("Let's get started 🚀. There are four ways to download your e-card. Please select one of the following options: ")
			.suggestedActions(
				builder.SuggestedActions.create(
					session, [
						builder.CardAction.imBack(session, "Download with Claim ID", "Download with Claim ID"),
						builder.CardAction.imBack(session, "Download with Medi Assist ID", "Download with Medi Assist ID"),
						builder.CardAction.imBack(session, "Download with Employee ID", "Download with Employee ID"),
						builder.CardAction.imBack(session, "Download with Policy Number", "Download with Policy Number")
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
	matches: /^Download with Claim ID$/gi,
	onSelectAction: (session, args, next) => {
		session.beginDialog('downloadwID');
		
	}
});

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
bot.dialog('askforDownloadwIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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
]);

// Dialog to ask for Confirmation - Download with Medi Assist ID
bot.dialog('askforDownloadwMAIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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

// Dialog to ask for Confirmation - Download with Employee ID
bot.dialog('askforDownloadwEmpIDConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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

/* 
bot.dialog('askforDownloadBy',[
	function (session){
		builder.Prompts.choice(session, "There are four ways to track your claim:", downloadMenu, builder.ListStyle.button);		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

 */
// Dialog to ask for Beneficiary Name
bot.dialog('askforbenefName',[
	function (session){
		builder.Prompts.text(session, "Please provide name of the primary beneficiary");		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

// Dialog to Download E-Card with Claim Number
bot.dialog('downloadwID', [
				function (session){
						session.beginDialog('askforClaimNumber');
				},	
				function (session, results) {
					var clmNoChecker = /^\d{8}$/.test(results.response);
					if(JSON.stringify(clmNoChecker) == "true"){
						session.dialogData.claimNumber = results.response;
						session.beginDialog('askforbenefName');
					}
					else{
						session.send("⚠️ The claim number should only be numeric and eight digits long.");
						session.beginDialog('askforDownloadwIDConfirmation');
					}
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					session.send("Finding Medi Assist E-Card with details 🔎 <br/>Claim Number: %s<br/>Beneficiary Name: %s",
						session.dialogData.claimNumber, session.dialogData.benefName);
					
					var clmId = session.dialogData.claimNumber;
					var benefName = session.dialogData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/ClaimId/'+clmId+'/'+benefName;
					
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

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							console.log(sizeof(body));
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session).addAttachment(ecard);
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
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
					session.endDialog();
				}
]);

// Dialog to Download E-Card with Medi Assist ID
bot.dialog('downloadwMAID', [
				function (session){
						session.beginDialog('askforMAID');
				},	
				function (session, results) {
					
					session.dialogData.MAID = results.response;
					
					var clmMAIDChecker = /^\d{10}$/.test(results.response);
					if(JSON.stringify(clmMAIDChecker) == "true"){
						session.beginDialog('askforbenefName');
						session.dialogData.MAID = results.response;
					}
					else{
						session.send("⚠️ The Medi Assist ID should only be numeric and ten digits long.");
						session.beginDialog('askforDownloadwMAIDConfirmation');
					}
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					session.send("Finding Medi Assist E-Card with details 🔎 <br/>Medi Assist ID: %s<br/>Beneficiary Name: %s",
						session.dialogData.MAID, session.dialogData.benefName);
					
					var MAID = session.dialogData.MAID;
					var benefName = session.dialogData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/MAID/'+MAID+'/'+benefName+'/9190';
					
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

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							console.log(sizeof(body));
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session).addAttachment(ecard);
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
								
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
					session.send("Finding Medi Assist E-Card with details 🔎<br/>Employee ID: %s<br/>Corporate: %s<br/>Beneficiary Name: %s",
						session.dialogData.EmpID, session.dialogData.Corporate, session.dialogData.benefName);
					
					var EmpID = session.dialogData.EmpID;
					var Corporate = session.dialogData.Corporate;
					var benefName = session.dialogData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/EmployeeId/'+EmpID+'/'+benefName+'/'+Corporate;
					
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

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							console.log(sizeof(body));
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session).addAttachment(ecard);
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
								
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
					session.send("Finding Medi Assist E-Card with details 🔎 <br/>Policy Number: %s<br/>Beneficiary Name: %s",
						session.dialogData.PolNo, session.dialogData.benefName);
					
					var PolNo = (session.dialogData.PolNo).replace(/\//g, "");
					console.log(PolNo);
					var benefName = session.dialogData.benefName;
					
					var downloadlink = 'http://track-api-lb.medibuddy.in/getecard/PolicyNo/'+PolNo+'/'+benefName;
					
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

					// Start the request
					response = request(options, function (error, response, body) {
						if (!error && response.statusCode == 200) {	
							var sizeof = require('object-sizeof');
							console.log(sizeof(body));
							
							if(sizeof(body) > 0){
								session.userData.downloadURL = downloadlink;
								var ecard = createHeroCard(session);
								var msg = new builder.Message(session).addAttachment(ecard);
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
								
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
            builder.CardImage.create(session, 'https://i.imgur.com/RKYzoRi.png')
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
	matches: [/search network hospitals/i, /search network/i, /search nearby hospitals/i, /search providers/i, /hospitals around/i],
	// /^search network hospitals$|^search network$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to ask for Confirmation - Download with Medi Assist ID
bot.dialog('askforLocationConfirmation',[
	function (session){
		builder.Prompts.confirm(session, "💡 Let's try again? (yes/no)")
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

bot.dialog('askforLocation',  [
    function (session) {
		var locationDialog = require('botbuilder-location');
		bot.library(locationDialog.createLibrary(process.env.BING_MAPS_API_KEY));
		
		var options = {
			prompt: 'Where should I search for hospitals? 🏥. Type your city.',
			useNativeControl: true,
			reverseGeocode: true,
			skipFavorites: true,
			skipConfirmationAsk: true
		};
		locationDialog.getLocation(session, options);

    },
    function (session, results) {
        if (results.response) {
			session.userData.place = results.response;
			var place = session.userData.place;
			session.userData.lat = JSON.stringify(place.geo.latitude);
			session.userData.lng = JSON.stringify(place.geo.longitude);
			session.beginDialog('askforInsurer');	
        }
		else{
			session.send("I was not able to fetch your address 😞. Let's retry");
			session.beginDialog('askforLocation');
		}
    },
	function (session, results) {
		if (results.response){
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
	function (session, results) {
		if (results.response){
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
	
			//Make POST request to MA Server
			var request = require('request');
			
			// Set the headers
			var headers = {
				'User-Agent':       'Super Agent/0.0.1',
				'Content-Type':     'application/x-www-form-urlencoded'
			}

			// Configure the request
			var options = {
				url: 'https://track.medibuddy.in/api/GetHospitalsByLocation/.json',
				method: 'POST',
				headers: headers,
				form: {"insuranceCompany":session.userData.speciality,"latitude":session.userData.lat,"longitude":session.userData.lng,"distance":10,"hospSpeciality":session.userData.speciality,"maRating":""}
			}

			// Start the request
			response = request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {	
					// Print out the response body
					data = JSON.parse(body);
					console.log(data);
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
											.url('https://i.imgur.com/OaMnJ52.png')
											.alt(data.hospitals[item].name)
									])
									.buttons([
										builder.CardAction.openUrl(session, "tel:"+nwHospPhNo, "Call Hospital"),
										builder.CardAction.openUrl(session, "http://maps.google.com/maps?q="+data.hospitals[item].latitude+","+data.hospitals[item].longitude, "View Hospital"),
										builder.CardAction.openUrl(session, "https://m.medibuddy.in/PlannedHospitalization.aspx?hospid="+data.hospitals[item].id+"&hospname="+data.hospitals[item].name, "Submit eCashless")
									])
								);
							}else{ break;}
							
						}

						session.send("Trying to find hospitals near you 🏥. Please wait ⏳");
						session.sendTyping();
						var msg = new builder.Message(session);
							msg.attachmentLayout(builder.AttachmentLayout.carousel)
							.attachments(cards);
						session.send(msg);						
						session.sendTyping();
						setTimeout(function () {
							session.beginDialog('askforMore');
						}, 5000);		
					}
					}
				}
			});				
		}
	}
]);

function getFormattedAddressFromPlace(place, separator) {
    var addressParts = [place.streetAddress, place.locality, place.region, place.postalCode, place.country, place.latitude, place.longitude];
    return addressParts.filter(i => i).join(separator);
}

// Dialog to ask for Insurer Name
bot.dialog('askforInsurer',[
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
		session.send("ℹ️ You can reach our call center at `1800 425 9449` or write to `gethelp@mahs.in` for claim related queries");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/customer/i, /support/i, /call center/i, /call centre/i, /customer service/i, /cc number/i, /cc/i, /helpline/i, /toll/i, /tech support/i],
	// /^customer$|^support$|^call centre$|^customer service$|^ cc number$|^cc$|^helpline$|^toll free$|^call center$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to redirect to HR
bot.dialog('askforHR',[
	function (session){
		session.send("ℹ️ For recent updates on career opportunities, kindly check out the \"Careers\" tab on our Medi Assist facebook page or mail us at `harish.dasepalli@mahs.in`");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/HR/i, /join.*company/i, /hr department/i, /human resource/i, /hr dept/i, /career/i, /job/i, /join/i, /opportunity/i, /opportunities/i, /opening/i, /fresher/i],
	// /^HR$|^human resource$|^hr dept$|^hr department$|^ join.*company$|^careers$|^career$|^job$|^join$|^job|^opportunit$|^opening$|^fresher$|^$|^$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to redirect to Investigation
bot.dialog('askforInvestigation',[
	function (session){
		session.send("ℹ️ Thank you for your valuable feedback. We will notify our investigation team");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/investigation/i, /forge/i, /malpractice/i, /fishy/i, /suspicious/i, /fordge/i],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to redirect to Grievance
bot.dialog('askforGrievance',[
	function (session){
		session.send("ℹ️ We sincerely regret for the unpleasant experience! I request you to write to us on `gethelp@mahs.in` or call us on our toll free no `1800 425 9449`. Alternatively, you can also download MediBuddy and track your claim on real time basis");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/grievance/i, /disappoint/i, /angry/i ,/disappointed/i, /dissatisfied/i, /unhappy/i, /horrible/i, /worst/i, /bad/i, /poor/i, /not settled/i, /not paid/i, /not received/i, /very poor/i, /very bad/i, /terrible/i, /not received any amount/i, /not intimated the hospital/i, /not working/i, /support is slow/i, /I did not get/i, /bad service/i, /I did not receive/i, /bad service/i, /bad tpa/i, /bad/i, /worst/i, /complaint/i],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to redirect to Offshore
bot.dialog('askforOffshore',[
	function (session){
		session.send("ℹ️ For further assistance you can either write to `gethelp@mahs.in` or call on our \"Overseas\" contact number at `91-80-67617555`");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/offshore/i, /abroad/i, /overseas contact number/i, /USA/i, /Australia/i, /overseas/i],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to redirect to General Query
bot.dialog('askforGeneralQuery',[
	function (session){
		session.send("ℹ️ For all your claim/application (MediBuddy)/transaction related queries kindly write to `gethelp@mahs.in` or call us at `1800 425 9449`");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/register/i, /application/i, /app/i, /medibuddy/i, /transaction/i, /query/i, /queries/i, /question/i, /doubt/i, /clarify/i, /clarity/i, /contact information/i, /registration/i, /can i submit/i, /for how many days/i, /how many/i, /help us urgently/i, /help us/i, /purchase/i, /buy/i, /how much/i, /log in/i, /please guide/i, /responding/i, /please help/i],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});

// Dialog to handle abuse
bot.dialog('askforAbuse',[
	function (session){
		session.send("🚫 Hey, that language is uncalled for! I request you to write to us on `gethelp@mahs.in` or call us on our toll free no `1800 425 9449`. Alternatively, you can also download MediBuddy and track your claim on real time basis");
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/anal/i, /ass/i, /asshole/i ,/balls/i, /bitch/i, /butt/i, /fuck/i, /cum/i, /cunt/i, /cock/i, /retard/i, /psycho/i, /mental/i, /finger/i, /jerk/i, /nudity/i, /milf/i, /piss/i, /shit/i, /rape/i, /tit/i, /vagina/i, /sucker/i, /sex/i, /semen/i, /slut/i, /hump/i, /suck/i]
	
});

// Get random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Dialog to handle goodbye
bot.dialog('sayGoodbye',[
	function (session){
		msg = ["See you later 👋, Keep rocking!","See you 👋!","Have a good day.","Later gator!","Talking to you makes my day. Come back soon!", "Ok, bye🙂!", "Till next time!"]
		x = getRandomInt(0,6);
		session.send(msg[x]);
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/bye/i, /see you/i, /cu/i ,/ciao/i, /ta ta/i, /cheerio/i, /cheers/i, /gtg/i, /got to go/i,/bai/i, /c u/i, /l8r/i, /exit/i, /quit/i, /take care/i, /cya/i, /shalom/i, /sayonara/i, /farewell/i, /later/i, /so long/i, /peace out/i, /see you/i]
	
});

// Dialog to handle Compliment
bot.dialog('sayThanks',[
	function (session){
		msg = ["Welcome, It's nothing","👍","That's all right!","Don't mention it.","😊","😍", "That's very kind of you", "Thank you, I appreciate the compliment.", "Thank you very much. 🙏","All I can say is, Thanks!", "MediBot appreciates your gratitude! We wish you good health and smiles 🙂"]
		x = getRandomInt(0,10);
		session.send(msg[x]);
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: [/thanks/i, /👍/i,/thx/i, /thank/i ,/helpful/i, /kind/i, /You're great/i, /great/i, /amazing/i, /brilliant/i, /excellent/i, /awesome/i, /amazing/i, /love/i, /cute/i, /awww/i, /i like you/i, /like/i]
	
});

//-------------------------------------------------------------------------------------------------------------------------------------

// INIFINITI SERVICES


// Dialog to 
bot.dialog('healthCheck',[
	function (session){
		session.beginDialog('askforhealthcheckCity');
	},
	function(sesison, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/health check/i, /health check up/i, /check up/i, /health check package/i],
	// /^search network hospitals$|^search network$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});


// Dialog to ask for Health Check city
bot.dialog('askforhealthcheckCity',[
	function (session){
		//Make POST request to MA Server
		
			if(session.message && session.message.value){
				processSubmitAction(session, session.message.value);
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
						  "text": "Select Filters: Health Check",
						  "weight": "bolder",
						  "size": "medium"
						},
						{
						  "type": "TextBlock",
						  "text": "We are one step away. Please choose city and category from options below.",
						  "wrap": true,
						  "maxLines": 4
						},
						{
						  "type": "TextBlock",
						  "text": "Choose your City"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "city",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Bengaluru",
							  "value": "Bengaluru",
							  "isSelected": true
							},
							{
								"title": "Chennai",
								"value": "Chennai"
							},
							{
								"title": "Delhi",
								"value": "Delhi"
							},
							{
								"title": "Hyderabad",
								"value": "Hyderabad"
							},
							{
								"title": "Kolkata",
								"value": "Kolkata"
							},
							{
								"title": "Mumbai",
								"value": "Mumbai"
							},
							{
								"title": "Pune",
								"value": "Pune"
							},
							{
								"title": "Other",
								"value": "Other"
							}
							
						  ]
						},
						{
						  "type": "TextBlock",
						  "text": "Select your Category"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "category",
						  "style":"expanded",
						  "isMultiSelect": false,
						  "choices": [
							{
							  "title": "Preventive",
							  "value": "Preventive",
							  "isSelected": true
							},
							{
							  "title": "Diabetes",
							  "value": "Diabetes"
							},
							{
							  "title": "Cardiac",
							  "value": "Cardiac"
							},
							{
							  "title": "Cancer",
							  "value": "Cancer"
							}
						  ]
						}
					  ],
					  "actions": [
					  {
							"type": "Action.Submit",
							"title": "Find Packages"
					  }
					  ]
				 }
				};
				session.send(new builder.Message(session)
					.addAttachment(card));
			
		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction(session, message){
		session.userData.healthcheckCity = message["city"];
		session.userData.healthcheckCategory = message["category"];	
		if(message["city"] !== "Other"){
			healthcheckCard = new builder.HeroCard(session)
									.title("Health Check Packages")
									.subtitle("Click below to view packages from hospitals in your city")
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Health Check Packages')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/result/package/"+process.env.HEALTHCHECK_ID+"/"+session.userData.healthcheckCategory+"//"+"/?c="+session.userData.healthcheckCity, "Show Packages")
										]);
		}
		else{
		healthcheckCard = new builder.HeroCard(session)
									.title("Health Check Packages")
									.subtitle("Click below to view packages from hospitals in your city")
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Health Check Packages')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/", "Visit MediBuddy Infiniti")
										]);
		}	
		session.send(new builder.Message(session)
			.addAttachment(healthcheckCard));
		
}



// Dialog to Order Medicines
bot.dialog('medicine',[
	function (session){
		session.beginDialog('askformedicineCity');
	},
	function(sesison, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/medicine/i, /medicines/i, /prescription/i, /pharmacy/i, /tablet/i, /syrup/i, /drugs/i],
	// /^search network hospitals$|^search network$/i,
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});


// Dialog to ask for Medicine city
bot.dialog('askformedicineCity',[
	function (session){
		//Make POST request to MA Server
		
			if(session.message && session.message.value){
				processSubmitAction2(session, session.message.value);
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
						  "text": "Select Filters: Order Medicines",
						  "weight": "bolder",
						  "size": "medium"
						},
						{
						  "type": "TextBlock",
						  "text": "We are one step away. Please choose city and enter your pincode below.",
						  "wrap": true,
						  "maxLines": 4
						},
						{
						  "type": "TextBlock",
						  "text": "Choose your City"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "city",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Bengaluru",
							  "value": "Bengaluru",
							  "isSelected": true
							},
							{
								"title": "Chennai",
								"value": "Chennai"
							},
							{
								"title": "Delhi",
								"value": "Delhi"
							},
							{
								"title": "Hyderabad",
								"value": "Hyderabad"
							},
							{
								"title": "Kolkata",
								"value": "Kolkata"
							},
							{
								"title": "Mumbai",
								"value": "Mumbai"
							},
							{
								"title": "Pune",
								"value": "Pune"
							},
							{
								"title": "Ahmedabad",
								"value": "Ahmedabad"
							},
							{
								"title": "Gurgaon",
								"value": "Gurgaon"
							},
							{
								"title": "Jaipur",
								"value": "Jaipur"
							},
							{
								"title": "Navi Mumbai",
								"value": "Navi Mumbai"
							},
							{
								"title": "Noida",
								"value": "Noida"
							},
							{
								"title": "Thane",
								"value": "Thane"
							}
							
						  ]
						},
						{
						  "type": "TextBlock",
						  "text": "Enter your pincode"
						},
						{
						  "type": "Input.Number",
						  "id": "pincode",
						  "placeholder": "Enter pincode, let's check if we operate in your area!",
						  "speak": "What is your pincode?"
						}
					  ],
					  "actions": [
					  {
							"type": "Action.Submit",
							"title": "Search"
					  }
					  ]
				 }
				};
				session.send(new builder.Message(session)
					.addAttachment(card));
			
		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction2(session, message){
		session.userData.medicineCity = message["city"];
		if(message["pincode"].toString().length !== 6){
			session.send("The pin number you have entered in incorrect. It should be exactly `six` digits long.");
		}else{
			session.userData.medicinePincode = message["pincode"];				
		}
			medicineCard = new builder.HeroCard(session)
									.title("Order Medicine")
									.subtitle("I still need your prescription to process the order")
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Health Check Packages')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/medicines/"+process.env.MEDICINE_ID+"/"+session.userData.medicinePincode+"/?c="+session.userData.medicineCity, "Upload Prescription")
										]);
		session.send(new builder.Message(session)
			.addAttachment(medicineCard));
		
}



// Dialog to Book Consultation
bot.dialog('consultation',[
	function (session){
		session.beginDialog('askforconsultationCity');
	},
	function(sesison, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/consultation/i, /consult/i, /doctor/i, /appointment/i],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});


// Dialog to ask for Consultation city
bot.dialog('askforconsultationCity',[
	function (session){
		//Make POST request to MA Server
		
			if(session.message && session.message.value){
				processSubmitAction3(session, session.message.value);
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
						  "text": "Select Filters: Book Consultation",
						  "weight": "bolder",
						  "size": "medium"
						},
						{
						  "type": "TextBlock",
						  "text": "We are one step away. Please choose city and speciality to continue.",
						  "wrap": true,
						  "maxLines": 4
						},
						{
						  "type": "TextBlock",
						  "text": "Choose your City"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "city",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Bengaluru",
							  "value": "Bengaluru",
							  "isSelected": true
							},
							{
								"title": "Chennai",
								"value": "Chennai"
							},
							{
								"title": "Delhi",
								"value": "Delhi"
							},
							{
								"title": "Hyderabad",
								"value": "Hyderabad"
							},
							{
								"title": "Kolkata",
								"value": "Kolkata"
							},
							{
								"title": "Mumbai",
								"value": "Mumbai"
							},
							{
								"title": "Pune",
								"value": "Pune"
							},
							{
								"title": "Ahmedabad",
								"value": "Ahmedabad"
							},
							{
								"title": "Bhubaneswar",
								"value": "Bhubaneswar"
							},
							{
								"title": "Cochin",
								"value": "Cochin"
							},
							{
								"title": "Coimbatore",
								"value": "Coimbatore"
							},
							{
								"title": "Ernakulam",
								"value": "Ernakulam"
							},
							{
								"title": "Faridabad",
								"value": "Faridabad"
							},
							{
								"title": "Ghaziabad",
								"value": "Ghaziabad"
							},
							{
								"title": "Gurgaon",
								"value": "Gurgaon"
							},
							{
								"title": "Hosur",
								"value": "Hosur"
							},
							{
								"title": "Kanpur",
								"value": "Kanpur"
							},
							{
								"title": "Kottayam",
								"value": "Kottayam"
							},
							{
								"title": "Lucknow",
								"value": "Lucknow"
							},
							{
								"title": "Mysuru",
								"value": "Mysuru"
							},
							{
								"title": "Navi Mumbai",
								"value": "Navi Mumbai"
							},
							{
								"title": "Noida",
								"value": "Noida"
							},
							{
								"title": "Patiala",
								"value": "Patiala"
							},
							{
								"title": "Patna",
								"value": "Patna"
							},
							{
								"title": "Secunderabad",
								"value": "Secunderabad"
							},
							{
								"title": "Thane",
								"value": "Thane"
							},
							{
								"title": "Thiruvananthapuram",
								"value": "Thiruvananthapuram"
							},
							{
								"title": "Thodupuzha",
								"value": "Thodupuzha"
							},
							{
								"title": "Trichy",
								"value": "Trichy"
							},
							{
								"title": "Vijayawada",
								"value": "Vijayawada"
							},
							{
								"title": "Visakhapatnam",
								"value": "Visakhapatnam"
							}
							
						  ]
						},
						{
						  "type": "TextBlock",
						  "text": "Select your Speciality"
						},{
						  "type": "Input.ChoiceSet",
						  "id": "speciality",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Cardiologist",
							  "value": "Cardiologist"
							},
							{
								"title": "Gynaecologist",
								"value": "Gynaecologist"
							},
							{
								"title": "Nephrologist",
								"value": "Nephrologist"
							},
							{
								"title": "Gastroenterologist",
								"value": "Gastroenterologist"
							},
							{
								"title": "Ophthalmologist",
								"value": "Ophthalmologist"
							},
							{
								"title": "ENT",
								"value": "ENT"
							},
							{
								"title": "Dermatologist",
								"value": "Dermatologist"
							},
							{
								"title": "Dentist",
								"value": "Dentist"
							},
							{
								"title": "General Physician",
								"value": "General Physician",
							  "isSelected": true
							},
							{
								"title": "Neurologist",
								"value": "Neurologist"
							},
							{
								"title": "Paediatrician",
								"value": "Paediatrician"
							},
							{
								"title": "Orthopaedician",
								"value": "Orthopaedician"
							}
						  ]
						}
					  ],
					  "actions": [
					  {
							"type": "Action.Submit",
							"title": "Search"
					  }
					  ]
				 }
				};
				session.send(new builder.Message(session)
					.addAttachment(card));
			
		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction3(session, message){
		session.userData.consultationCity = message["city"];
			session.userData.consultationSpeciality = message["speciality"];				
			medicineCard = new builder.HeroCard(session)
									.title("Consultation")
									.subtitle("I've curated a list of "+message["speciality"]+"s in "+message["city"]+". Click below to know more")
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Consultations')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/consultation/"+process.env.CONSULTATION_ID+"//"+session.userData.consultationSpeciality+"/?c="+session.userData.consultationCity, "View Consultations")
										]);
		session.send(new builder.Message(session)
			.addAttachment(medicineCard));
		
}



// Dialog to Book Home Health Care
bot.dialog('homehealthcare',[
	function (session){
		session.beginDialog('askforhomehealthcareCity');
	},
	function(sesison, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/home health care/i, /home care/i, /home health/i, /^Home Health Care$/gi],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});


// Dialog to ask for Consultation city
bot.dialog('askforhomehealthcareCity',[
	function (session){
		//Make POST request to MA Server
		
			if(session.message && session.message.value){
				processSubmitAction4(session, session.message.value);
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
						  "text": "Select Filters: Home Health Care",
						  "weight": "bolder",
						  "size": "medium"
						},
						{
						  "type": "TextBlock",
						  "text": "We are one step away. Please choose city and service to continue.",
						  "wrap": true,
						  "maxLines": 4
						},
						{
						  "type": "TextBlock",
						  "text": "Choose your City"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "city",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Bengaluru",
							  "value": "Bengaluru",
							  "isSelected": true
							},
							{
								"title": "Chennai",
								"value": "Chennai"
							},
							{
								"title": "Delhi",
								"value": "Delhi"
							},
							{
								"title": "Hyderabad",
								"value": "Hyderabad"
							},
							{
								"title": "Kolkata",
								"value": "Kolkata"
							},
							{
								"title": "Mumbai",
								"value": "Mumbai"
							},
							{
								"title": "Pune",
								"value": "Pune"
							},
							{
								"title": "Ahmedabad",
								"value": "Ahmedabad"
							},
							{
								"title": "Baroda",
								"value": "Baroda"
							},
							{
								"title": "Chandigarh",
								"value": "Chandigarh"
							},
							{
								"title": "Gurgaon",
								"value": "Gurgaon"
							}
							
						  ]
						},
						{
						  "type": "TextBlock",
						  "text": "Select your Service"
						},{
						  "type": "Input.ChoiceSet",
						  "id": "service",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Physiotherapist Visit",
							  "value": "Physiotherapist Visit"
							},
							{
								"title": "Attendant Visit",
								"value": "Attendant Visit"
							},
							{
								"title": "Nursing Visit",
								"value": "Nursing Visit",
								"isSelected": true
							}
						  ]
						}
					  ],
					  "actions": [
					  {
							"type": "Action.Submit",
							"title": "Search"
					  }
					  ]
				 }
				};
				session.send(new builder.Message(session)
					.addAttachment(card));
			
		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction4(session, message){
		session.userData.homehealthcareCity = message["city"];
			session.userData.homehealthcareService = message["service"];				
			medicineCard = new builder.HeroCard(session)
									.title("Home Health Care")
									.subtitle("Click below to view available home health care services in "+message["city"]+" for "+message["service"])
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Home Health Care')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/homehealthcare/"+process.env.HOMEHEALTHCARE_ID+"//"+session.userData.homehealthcareService+"/?c="+session.userData.homehealthcareCity, "View Services")
										]);
		session.send(new builder.Message(session)
			.addAttachment(medicineCard));
		
}

// Dialog to Book Tele Consultation
bot.dialog('teleconsultation',[
	function (session){
		session.beginDialog('askforTeleConsultationDetails');
	},
	function(sesison, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/telephone consultation/i, /telephonic consultation/i, /teleconsultation/i, /tele consultation/i, /tele-consultation/i, /^Tele Consultation$/gi],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});


// Dialog to ask for Tele Consultation Details
bot.dialog('askforTeleConsultationDetails',[
	function (session){
		
			if(session.message && session.message.value){
				processSubmitAction5(session, session.message.value);
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
						  "text": "Select Filters: Tele Consultation",
						  "weight": "bolder",
						  "size": "medium"
						},
						{
						  "type": "TextBlock",
						  "text": "We are one step away. Please type your preferred `speciality` to continue.",
						  "wrap": true,
						  "maxLines": 4
						},
						{
						  "type": "TextBlock",
						  "text": "Select your Service"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "teleservice",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Ayurveda",
							  "value": "Ayurveda"
							},
							{
								"title": "Cardiologist",
								"value": "Cardiologist"
							},
							{
								"title": "Dentist",
								"value": "Dentist",
								"isSelected": true
							},
							{
								"title": "Dermatologist",
								"value": "Dermatologist"
							},
							{
								"title": "Dietitian/Nutritionist",
								"value": "Dietitian/Nutritionist"
							},
							{
								"title": "Endocrinologist",
								"value": "Endocrinologist"
							},
							{
								"title": "ENT",
								"value": "ENT"
							},
							{
								"title": "General Physician",
								"value": "General Physician"
							},
							{
								"title": "Homoeopath",
								"value": "Homoeopath"
							},
							{
								"title": "Naturopath",
								"value": "Naturopath"
							},
							{
								"title": "Nephrologist",
								"value": "Nephrologist"
							},
							{
								"title": "Neurologist",
								"value": "Neurologist"
							},
							{
								"title": "Obstetrician/Gyneacologist",
								"value": "Obstetrician/Gyneacologist"
							},
							{
								"title": "Ophthalmologist",
								"value": "Ophthalmologist"
							},
							{
								"title": "Orthopedician",
								"value": "Orthopedician"
							},
							{
								"title": "Paediatrician",
								"value": "Paediatrician"
							},
							{
								"title": "Physiotherapist",
								"value": "Physiotherapist"
							},
							{
								"title": "Rheumatologist",
								"value": "Rheumatologist"
							},
							{
								"title": "Sexologist",
								"value": "Sexologist"
							},
							{
								"title": "Sports Medicine",
								"value": "Sports Medicine"
							}
						  ]
						}
					  ],
					  "actions": [
					  {
							"type": "Action.Submit",
							"title": "Search"
					  }
					  ]
				 }
				};
				session.send(new builder.Message(session)
					.addAttachment(card));
			
		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction5(session, message){
			session.userData.teleconsultationService = message["teleservice"];				
			medicineCard = new builder.HeroCard(session)
									.title("Tele Consultation")
									.subtitle("Click below to view available telephonic consultations for "+message["teleservice"])
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Tele Consultation')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/onlineservice/"+process.env.TELE_CONSULTATION+"//"+session.userData.teleconsultationService, "View Services")
										]);
		session.send(new builder.Message(session)
			.addAttachment(medicineCard));
		
}


// Dialog to Book Lab Test
bot.dialog('labtest',[
	function (session){
		session.beginDialog('askforLabTestDetails');
	},
	function(sesison, results){	
		session.endDialogWithResult(results);		
	}
])
.triggerAction({
	matches: [/lab test/i, /^Lab Test$/gi, /Laboratory/i, /Lab/i],
	confirmPrompt: "⚠️ This will cancel your current request. Are you sure? (yes/no)"
	
});


// Dialog to ask for Lab Test Details
bot.dialog('askforLabTestDetails',[
	function (session){
		//Make POST request to MA Server
		
			if(session.message && session.message.value){
				processSubmitAction6(session, session.message.value);
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
						  "text": "Select Filters: Lab Test",
						  "weight": "bolder",
						  "size": "medium"
						},
						{
						  "type": "TextBlock",
						  "text": "We are one step away. Please choose city and type of test to continue.",
						  "wrap": true,
						  "maxLines": 4
						},
						{
						  "type": "TextBlock",
						  "text": "Choose your City"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "city",
						  "style":"compact",
						  "choices": [
							{
							  "title": "Bengaluru",
							  "value": "Bengaluru",
							  "isSelected": true
							},
							{
								"title": "Chennai",
								"value": "Chennai"
							},
							{
								"title": "Delhi",
								"value": "Delhi"
							},
							{
								"title": "Hyderabad",
								"value": "Hyderabad"
							},
							{
								"title": "Kolkata",
								"value": "Kolkata"
							},
							{
								"title": "Mumbai",
								"value": "Mumbai"
							},
							{
								"title": "Pune",
								"value": "Pune"
							},
							{
								"title": "Agra",
								"value": "Agra"
							},
							{
								"title": "Ahmedabad",
								"value": "Ahmedabad"
							},
							{
								"title": "Allahabad",
								"value": "Allahabad"
							},
							{
								"title": "Ambala",
								"value": "Ambala"
							},
							{
								"title": "Amritsar",
								"value": "Amritsar"
							},
							{
								"title": "Bareilly",
								"value": "Bareilly"
							},
							{
								"title": "Bhubaneswar",
								"value": "Bhubaneswar"
							},
							{
								"title": "Chandigarh",
								"value": "Chandigarh"
							},
							{
								"title": "Coimbatore",
								"value": "Coimbatore"
							},
							{
								"title": "Dehradun",
								"value": "Dehradun"
							},
							{
								"title": "Faridabad",
								"value": "Faridabad"
							},
							{
								"title": "Ghaziabad",
								"value": "Ghaziabad"
							},
							{
								"title": "Gurgaon",
								"value": "Gurgaon"
							},
							{
								"title": "Guwahati",
								"value": "Guwahati"
							},
							{
								"title": "Gwalior",
								"value": "Gwalior"
							},
							{
								"title": "Jaipur",
								"value": "Jaipur"
							},
							{
								"title": "Jalandhar",
								"value": "Jalandhar"
							},
							{
								"title": "Lucknow",
								"value": "Lucknow"
							},
							{
								"title": "Ludhiana",
								"value": "Ludhiana"
							},
							{
								"title": "Meerut",
								"value": "Meerut"
							},
							{
								"title": "Mohali",
								"value": "Mohali"
							},
							{
								"title": "Moradabad",
								"value": "Moradabad"
							},
							{
								"title": "Mysuru",
								"value": "Mysuru"
							},
							{
								"title": "Navi Mumbai",
								"value": "Navi Mumbai"
							},
							{
								"title": "Noida",
								"value": "Noida"
							},
							{
								"title": "Panchkula",
								"value": "Panchkula"
							},
							{
								"title": "Patna",
								"value": "Patna"
							},
							{
								"title": "Thane",
								"value": "Thane"
							},
							{
								"title": "Varanasi",
								"value": "Varanasi"
							}
							
						  ]
						},
						{
						  "type": "TextBlock",
						  "text": "Select your Test"
						},
						{
						  "type": "Input.ChoiceSet",
						  "id": "labtest",
						  "style":"compact",
						  "choices": [
							{
							  "title": "T3",
							  "value": "T3",
								"isSelected": true
							},
							{
								"title": "T4",
								"value": "T4"
							},
							{
								"title": "HBA1C",
								"value": "HBA1C"
							},
							{
								"title": "Liver Function Test",
								"value": "Liver Function Test"
							},
							{
								"title": "CBC",
								"value": "CBC"
							},
							{
								"title": "Lipid Profile",
								"value": "Lipid Profile"
							},
							{
								"title": "Platelet Count",
								"value": "Platelet Count"
							},
							{
								"title": "ESR",
								"value": "ESR"
							},
							{
								"title": "Thyroid Stimulating Hormone - TSH",
								"value": "Thyroid Stimulating Hormone - TSH"
							},
							{
								"title": "Vitamin B12",
								"value": "Vitamin B12"
							}
						  ]
						}
					  ],
					  "actions": [
					  {
							"type": "Action.Submit",
							"title": "Search"
					  }
					  ]
				 }
				};
				session.send(new builder.Message(session)
					.addAttachment(card));
			
		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

function processSubmitAction6(session, message){
		session.userData.labtestCity = message["city"];
			session.userData.labtest = message["labtest"];	
			labtestCard = new builder.HeroCard(session)
									.title("Lab Test")
									.subtitle("Click below to view `"+message["labtest"]+"` tests in `"+message["city"]+"`")
									.text("https://infiniti.medibuddy.in")
									.images([
										new builder.CardImage(session)
											.url('https://i.imgur.com/UZXZjqO.png')
											.alt('Lab Test')
									])
									.buttons([
										builder.CardAction.openUrl(session, "https://infiniti.medibuddy.in/labtest/"+process.env.LABTEST_ID+"//"+session.userData.labtest+"/?c="+session.userData.labtestCity, "View Lab Tests")
										]);
		session.send(new builder.Message(session)
			.addAttachment(labtestCard));
		
}


server.post('/api/messages', connector.listen());
