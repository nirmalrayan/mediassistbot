// Add your requirements
var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');
require('env2')('.env'); // loads all entries into process.env
//console.log(process.env.DB_HOST); // "127.0.0.1"

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
		if(session.userData.trackBenefName){
			var msg = new builder.Message(session)
			.text("Greetings " + session.userData.trackBenefName + "! I am MediBot and I'll be your personal healthcare assistant. How can I help you?")
			.suggestedActions(
				builder.SuggestedActions.create(
						session, [
							builder.CardAction.imBack(session, "Track Claim", "Track Claim"),
							builder.CardAction.imBack(session, "Download E-Card", "Download E-Card"),
							builder.CardAction.imBack(session, "Search Network Hospitals", "Search Network Hospitals")
						]
					));
		}
		else{
			var msg = new builder.Message(session)
			.text("Greetings! I am MediBot and I'll be your personal healthcare assistant. How can I help you?")
			.suggestedActions(
				builder.SuggestedActions.create(
						session, [
							builder.CardAction.imBack(session, "Track Claim", "Track Claim"),
							builder.CardAction.imBack(session, "Download E-Card", "Download E-Card"),
							builder.CardAction.imBack(session, "Search Network Hospitals", "Search Network Hospitals")
						]
					));
		}
		session.send(msg);
		
    });
	
// Add first run dialog
bot.dialog('firstRun', function (session) {    
    session.userData.firstRun = true;
    session.send("Greetings! I am MediBot and I'll be your personal healthcare assistant. Please say `Track Claim`, `Download E-Card` or `Search Network`.").endDialog();
}).triggerAction({
    onFindAction: function (context, callback) {
        // Only trigger if we've never seen user before
        if (!context.userData.firstRun) {
            // Return a score of 1.1 to ensure the first run dialog wins
            callback(null, 1.1);
        } else {
            callback(null, 0.0);
        }
    }
});

// Dialog to start tracking claims
bot.dialog('trackClaim', [
	function (session){
		session.send("Wecome to Claim Tracking System.");
		session.beginDialog('askforTrackBy');
	},
	function (session, results) {
		if (results.response) {
			var item = trackMenu[results.response.entity];
			var msg = "You have chosen to track with: %(Description)s.";
			session.dialogData.item = item;
			session.send(msg, item);
			if (results.response.entity == 'Track with Claim ID'){
				session.beginDialog('trackClaimwID');
			}
			else if (results.response.entity == 'Track with Medi Assist ID'){
				session.beginDialog('trackClaimwMAID');
			}
			else if (results.response.entity == 'Track with Employee Details'){
				session.beginDialog('trackClaimwEmpID');
			}
			
		}
//		session.endDialog();
	}

])
.triggerAction({
	matches: /^track claim$/i,
	confirmPrompt: "This will cancel your current request. Are you sure?"
	
});

// Dialog to display main menu after other conversations.
var mainMenu = {
		"Track Claim":{
			Description: "Track"
		},
		"Download E-Card":{
			Description: "Download"
		},
		"Search Network Hospitals":{
			Description: "Search"
		}
};

bot.dialog('askforMore',[
	function (session){
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
		session.endDialogWithResult(results);	
	}
]);


// Dialog to Track with Claim Number
bot.dialog('trackClaimwID', [
				function (session){
					if(!session.dialogData.claimNumber){
						session.beginDialog('askforClaimNumber');
					}
				},	
				function (session, results) {
					session.dialogData.claimNumber = results.response;
					session.beginDialog('askforDOA');
				},
				function (session, results) {
					session.dialogData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					session.send("Tracking claim with details: <br/>Claim Number: %s<br/>Date/Time: %s",
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
							// Print out the response body
							data = JSON.parse(body);
							console.log(data);
							
							if(JSON.stringify(data.isSuccess) === "true"){
//								session.send(JSON.stringify(data.claimDetails));
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
								session.send(msg);
								session.sendTyping();
								setTimeout(function () {
									session.beginDialog('askforMore');
								}, 5000);		
  							}
							else if(JSON.stringify(data.isSuccess) === "false"){
								if(data.errorMessage == "Please enter valid claim ID."){
									session.send('The claim ID you have entered is incorrect. Let\'s retry.');
									session.beginDialog('trackClaimwID');
								}
								else if (data.errorMessage == "Please enter valid date between hospitalization and discharge."){
									session.send('The date you have entered is incorrect. Let\'s retry.');
								//	session.cancelDialog('askforDOA','askforDOA', session.dialogData.claimNumber);	
									session.beginDialog('trackClaimwID');
								}
							}  
						}
					});
					
					session.endDialog();
				}
]);


// Dialog to Track with Medi Assist ID
bot.dialog('trackClaimwMAID', [
				function (session){
						session.beginDialog('askforMAID');
					
				},	
				function (session, results) {
					session.dialogData.MAID = results.response;
					session.beginDialog('askforDOA');
				},
				function (session, results) {
					session.dialogData.hospitalizationDate = builder.EntityRecognizer.resolveTime([results.response]);

					// Process request and display reservation details
					session.send("Tracking claim with details: <br/>Medi Assist ID: %s<br/>Date/Time: %s",
						session.dialogData.MAID, session.dialogData.hospitalizationDate);
				
/* 					parameters = {"maid":session.dialogData.claimNumber,"date":session.dialogData.hospitalizationDate};
					console.log(parameters); */
					
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
//								session.send(JSON.stringify(data.claimDetails));
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
								if(data.errorMessage == "Please enter valid Medi Assist ID."){
									session.send('The Medi Assist ID you have entered is incorrect. Let\'s retry.');
									session.beginDialog('trackClaimwMAID');
								}
								else if (data.errorMessage == "Please enter valid date between hospitalization and discharge."){
									session.send('The date you have entered is incorrect. Let\'s retry.');
								//	session.cancelDialog('askforDOA','askforDOA', session.dialogData.claimNumber);	
									session.beginDialog('trackClaimwMAID');
								}
							}  
						}
					});
					
					session.endDialog();
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
					session.send("Tracking claim with details: <br/>Employee ID: %s<br/>Corporate: %s<br/>Date/Time: %s",
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
//								session.send(JSON.stringify(data.claimDetails));
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
								if(data.errorMessage == "Please enter valid Medi Assist ID."){
									session.send('The Medi Assist ID you have entered is incorrect. Let\'s retry.');
									session.beginDialog('trackClaimwMAID');
								}
								else if (data.errorMessage == "Please enter valid date between hospitalization and discharge."){
									session.send('The date you have entered is incorrect. Let\'s retry.');
								//	session.cancelDialog('askforDOA','askforDOA', session.dialogData.claimNumber);	
									session.beginDialog('trackClaimwMAID');
								}
							}  
						}
					});
					
					session.endDialog();
				}
]);

// Receipt Card - Track Claim Result
function createReceiptCard(session) {
    return new builder.ReceiptCard(session)
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
            builder.ReceiptItem.create(session, 'Rs. '+ session.userData.trackAdvancePaidByPatient, 'Advance Paid by Beneficiary'),
//                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
        ])
        .total('Rs. ' + session.userData.trackClmApprovedAmt)
        .buttons([
            builder.CardAction.openUrl(session, 'https://track.medibuddy.in/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}

// Dialog to ask for Track By
var trackMenu = {
		"Track with Claim ID":{
			Description: "ClaimID"
		},
		"Track with Medi Assist ID":{
			Description: "MAID"
		},
		"Track with Employee Details":{
			Description: "EmpID"
		}
};

bot.dialog('askforTrackBy',[
	function (session){
		builder.Prompts.choice(session, "There are three ways to track your claim:", trackMenu, builder.ListStyle.button);		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);

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
    var msg = "You can enter the date in any format. Eg. if date of admission is 01-Jan-2017 and discharge is 05-Jan-2017, you can enter any date from 1st Jan,2017 to 5th Jan, 2017";
    session.endDialog(msg);
})
;

// Generic Help dialog for Bot
bot.dialog('help', function (session, args, next) {
    session.endDialog("Medibot can help you track your claim, download e-card or search nearby hospitals within Medi Assist Network. <br/>Please say 'next' to continue");
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
		session.send("Welcome to E-Card Download Center.");
		session.beginDialog('askforDownloadBy');
	},
	function(session, results) {
		if (results.response) {
			var item = downloadMenu[results.response.entity];
			var msg = "You have chosen to download with: %(Description)s.";
			session.dialogData.item = item;
			session.send(msg, item);
			if (results.response.entity == 'Download with Claim ID'){
				session.beginDialog('downloadwID');
			}
			else if (results.response.entity == 'Download with Medi Assist ID'){
				session.beginDialog('downloadwMAID');
			}
			else if (results.response.entity == 'Download with Employee Details'){
				session.beginDialog('downloadwEmpID');
			}
			else if (results.response.entity == 'Download with Policy Number'){
				session.beginDialog('downloadwPolNo');
			}
			
		}		
	}
])
.triggerAction({
	matches: /^download e-card$/i,
	confirmPrompt: "This will cancel your current request. Are you sure?"
	
});

// Dialog to ask for Download By
var downloadMenu = {
		"Download with Claim ID":{
			Description: "ClaimID"
		},
		"Download with Medi Assist ID":{
			Description: "MAID"
		},
		"Download with Employee Details":{
			Description: "EmpID"
		},
		"Download with Policy Number":{
			Description: "PolNo"
		},
		
};

bot.dialog('askforDownloadBy',[
	function (session){
		builder.Prompts.choice(session, "There are four ways to track your claim:", downloadMenu, builder.ListStyle.button);		
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]);


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
					session.dialogData.claimNumber = results.response;
					session.beginDialog('askforbenefName');
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					session.send("Finding Medi Assist E-Card with details: <br/>Claim Number: %s<br/>Beneficiary Name: %s",
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
								session.send('I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('downloadwID');
							}
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
					session.beginDialog('askforbenefName');
				},
				function (session, results) {
					session.dialogData.benefName = results.response;

					// Process request and display reservation details
					session.send("Finding Medi Assist E-Card with details: <br/>Medi Assist ID: %s<br/>Beneficiary Name: %s",
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
								session.send('I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('downloadwMAID');
							}
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
					session.send("Finding Medi Assist E-Card with details: <br/>Employee ID: %s<br/>Corporate: %s<br/>Beneficiary Name: %s",
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
								session.send('I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('downloadwEmpID');
							}
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
					session.send("Finding Medi Assist E-Card with details: <br/>Policy Number: %s<br/>Beneficiary Name: %s",
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
								session.send('I was unable to find your e-card with the details you provided. Let\'s retry.');
								session.beginDialog('downloadwPolNo');
							}
						}
					});
					
					session.endDialog();
				}
]);

function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('Download Medi Assist E-Card')
        .subtitle('Flash this E-Card upon request at the insurance desk in the hospital at the time of admission')
        .text('')
        .images([
            builder.CardImage.create(session, 'https://image.ibb.co/hRiDKv/id_card_4.png')
        ])
        .buttons([
            builder.CardAction.openUrl(session, session.userData.downloadURL, 'Download E-Card')
        ]);
};

// Dialog to Search Network Hospitals
bot.dialog('searchNetwork',[
	function (session){
		session.beginDialog('askforLocation');
	},
	function(session, results) {
		if (results.response){
			var place = results.response;
			session.send("This is the place i got: "+place);
		}
		else {
			session.send("Ok, I didn't understand the address");
		}
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
])
.triggerAction({
	matches: /^search network hospitals$|^search network$/i,
	confirmPrompt: "This will cancel your current request. Are you sure?"
	
});


bot.dialog('askforLocation',  [
    function (session) {
		var locationDialog = require('botbuilder-location');
		bot.library(locationDialog.createLibrary(process.env.BING_MAPS_API_KEY));
		
		var options = {
			prompt: "Please share your location",
			useNativeControl: true,
			reverseGeocode: true,
			skipFavorites: true,
			skipConfirmationAsk: true
/* 			requiredFields:
				locationDialog.LocationRequiredFields.streetAddress | 
				locationDialog.LocationRequiredFields.locality | 
				locationDialog.LocationRequiredFields.region | 
				locationDialog.LocationRequiredFields.postalCode | 
				locationDialog.LocationRequiredFields.country  */
		};
		locationDialog.getLocation(session, options);
//		session.send(msg);

    },
    function (session, results) {
        if (results.response) {
			session.userData.place = results.response;
			var place = session.userData.place;
			session.userData.lat = JSON.stringify(place.geo.latitude);
			session.userData.lng = JSON.stringify(place.geo.longitude);
			session.send("Looking for hospitals around " + JSON.stringify(place));
//			var formattedAddress = session.send("Thanks, searching for hospitals around " + getFormattedAddressFromPlace(place, ", "));
			session.beginDialog('askforInsurer');	
        }
		else{
			session.send("I was not able to fetch your address. Let's retry");
			session.beginDialog('askforLocation');
		}
    },
	function (session, results) {
		if (results.response){
			session.userData.insurer = results.response;
			session.beginDialog('askforSpeciality');		
		}
	},
	function (session, results) {
		if (results.response){
			session.userData.speciality = results.response;
	
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
					
					if(JSON.stringify(data.isSuccess) === "true"){
//						var cards = getCardsAttachments();
						
						var cards = [];
						for (var item in data.hospitals){
							console.log(item+ ": "+JSON.stringify(data.hospitals[item]));
/* 							var nwHospName = data.hospitals[item].name;
							var nwHospID = data.hospitals[item].id;
							var nwHospPhone = data.hospitals[item].phone;
							var nwHospEmail = data.hospitals[item].email;
							var nwHospCity = data.hospitals[item].city;
							var nwHospState = data.hospitals[item].state;
							var nwHospPin = data.hospitals[item].pinCode;
							var nwHospLat = data.hospitals[item].latitude;
							var nwHospLong = data.hospitals[item].longitude;
							var nwHospRating = data.hospitals[item].avgRating; */
							var nwHospAddress = JSON.stringify(data.hospitals[item].address);
							
							cards.push(
								new builder.HeroCard(session)
								.title(data.hospitals[item].name)
								.subtitle("Phone: " + data.hospitals[item].phone)
								.text(nwHospAddress + ', ' + data.hospitals[item].city + ', ' + data.hospitals[item].state + ', ' + data.hospitals[item].pinCode)
//								.images([builder.CardImage.create(session,"https://image.ibb.co/jYCPwk/check_1.png")])
								.buttons([
									builder.CardAction.call(session, data.hospitals[item].phone.split('/')[0], "Call Hospital"),
									builder.CardAction.openUrl(session, "http://maps.google.com/maps?q="+data.hospitals[item].latitude+","+data.hospitals[item].longitude, "View Hospital")
								])
							);
//							console.log(item + " item is " + JSON.stringify(myHosp));
						}
//						console.log("Final Hosp OBJECT : " + JSON.stringify(myHosp));
						session.send("Trying to find hospitals near you. Please wait...");
						session.sendTyping();
						var msg = new builder.Message(session);
							msg.attachmentLayout(builder.AttachmentLayout.carousel)
							.attachments(cards);
						session.send(msg);
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

function getCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
            .title('Azure Storage')
            .subtitle('Offload the heavy lifting of data center management')
            .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/storage/media/storage-introduction/storage-concepts.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('DocumentDB')
            .subtitle('Blazing fast, planet-scale NoSQL')
            .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
            ]),

        new builder.HeroCard(session)
            .title('Azure Functions')
            .subtitle('Process events with a serverless code architecture')
            .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-5daae9212bb433ad0510fbfbff44121ac7c759adc284d7a43d60dbbf2358a07a/images/page/services/functions/01-develop.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
            ]),

        new builder.ThumbnailCard(session)
            .title('Cognitive Services')
            .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
            .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
            .images([
                builder.CardImage.create(session, 'https://azurecomcdn.azureedge.net/cvt-68b530dac63f0ccae8466a2610289af04bdc67ee0bfbc2d5e526b8efd10af05a/images/page/services/cognitive-services/cognitive-services.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
            ])
    ];
}

server.post('/api/messages', connector.listen());

/* // Dialog to get User Location
bot.dialog('getUserLocation', [
    function (session){
        builder.Prompts.text(session, "Send me your current location.");
    },
    function (session) {
        if(session.message.entities.length != 0){
            session.userData.lat = session.message.entities[0].geo.latitude;
            session.userData.lon = session.message.entities[0].geo.longitude;
            session.endDialog();
        }else{
            session.endDialog("Sorry, I didn't get your location.");
        }
    },
	function (session){
    var data = { method: "sendMessage", parameters: { text: "<b>Save time by sending us your current location.</b>", parse_mode: "HTML", reply_markup: { keyboard: [ [ { text: "Share location", request_location: true } ] ] } } };
    const message = new builder.Message(session);
    message.setChannelData(data);
    session.send(message);
	}
]);
 */
 /* 
// Dialog to ask for Location
var lat = 0;
var lng = 0;


const restifyBodyParser = require('restify-plugins').bodyParser;
server.use(restifyBodyParser({ mapParams: true }));

//KEEP THIS ALIVE
/* server.post('/location', function(req, res){
	console.log("Entire request: Lat-"+ JSON.stringify(req.body.lat) + " & Long-" + JSON.stringify(req.body.lng));
	console.log(req.body.lat);
	console.log(req.body.lng);
	lat = req.body.lat;
	lng = req.body.lng;
}); */

// Dialog to set Location
/* bot.dialog('setLocation',[
	function (session){
		session.userData.latitude = lat;
		session.userData.longitude = JSON.stringify(req.body.lng);
		console.log("Passed location: "+session.userData.latitude);
		session.send("Trying to find hospitals around: " + session.userData.latitude + " & " + session.userData.longitude);
	},
	function(session, results) {
		session.endDialogWithResult(results);
	}
]); */
/* 
function setLocation(){
	console.log("inside set location");
	
	io.on('connection', function (socket) {
		console.log("Requesting client for user location");
		socket.emit('event1', {send: 'crap'});
		socket.on('event2', function (data){
			console.log("Got Lat and Long from Client: " + data);
/* 			session.userData.latitude = data.lat;
			session.userData.longitude = data.lng; 
		});
	});
	
} */ 