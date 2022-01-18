					
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
