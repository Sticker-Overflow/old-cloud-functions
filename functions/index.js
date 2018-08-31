const functions = require('firebase-functions');
const admin = require("firebase-admin");
const storage = require("@google-cloud/storage")();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://stickeroverflow-1d318.firebaseio.com/'
});

const APP_NAME = 'Sticker Overflow';
var db = admin.firestore();

const bucket = storage.bucket("stickeroverflow-1d318.appspot.com");

exports.createUser = functions.auth.user().onCreate((user) => {
	console.log("Recieved");
	console.log("User data: " + user.displayName + ", " + user.photoURL + ", " + user.email + ", " + user.uid);
	var userData = {
		"name": user.displayName,
		"photoUrl": user.photoURL,
		"email": user.email,
		"uid": user.uid,
		"isAdmin": false,
		"isSuperUser": false,
		"memberOrganizationId": null
	};

	console.log("About to create user");

	var setDoc = db.collection("users").doc(user["uid"]).set(userData);
	console.log("Created User");

	return "Created User!"
});

/*
exports.verifyStickerInBucket = functions.firestore.document('stickers/{stickerId}').onCreate(event => {
	var stickerData = event.data.data();
	var stickerId = stickerData.id;

	var stickerImage = bucket.file("stickers/" + stickerId + "/" + stickerId + ".png");

	return stickerImage.exists().then(function(data) {
		var exists = data[0];
		if(!exists) { 
			db.collection("stickers").doc(stickerId).update({'error': "Image not in storage"})
		}
	});
	
});

exports.incrementStickerOwnerCount = functions.firestore.document("users/{userId}/stickers/{stickerId}").onCreate(event => {
	var stickerId = event.params.stickerId;
	return db.collection("stickers").doc(stickerId).get().then(stickerDoc => {
		if(stickerDoc.exists) {
			return db.collection("stickers").doc(stickerId).update({ numberOfUsersWhoHaveThisSticker: stickerDoc.data().numberOfUsersWhoHaveThisSticker + 1});
		}
	});
});

exports.deccrementStickerOwnerCount = functions.firestore.document("users/{userId}/stickers/{stickerId}").onDelete(event => {
	var stickerId = event.params.stickerId;
	return db.collection("stickers").doc(stickerId).get().then(stickerDoc => {
		if(stickerDoc.exists) {
			if(stickerDoc.data().numberOfUsersWhoHaveThisSticker > 0) {
				return db.collection("stickers").doc(stickerId).update({ numberOfUsersWhoHaveThisSticker: stickerDoc.data().numberOfUsersWhoHaveThisSticker - 1});
			}
		}
	});
});

exports.conversationCreated = functions.firestore.document("users/{userId}/conversations/{conversationId}").onCreate(event => {
	var userId = event.params.userId;
	var conversationId = event.params.conversationId
	var conversationData = event.data.data();

	return db.collection("users").doc(conversationData.otherUserId).collection("conversations").doc(conversationId).get().then(doc => {
		if(!doc.exists) {
			var data = {
				id: conversationData.id,
				otherUserId: userId,
				latestMessage: conversationData.latestMessage,
				numberOfUnreadMessages: 0
			};	
			
			return db.collection("users").doc(conversationData.otherUserId).collection("conversations").doc(conversationId).set(data);
		} else {
			return null;
		}
	});
});

function sendNotification(userId, messageObj) {
	return db.collection("users").doc(userId).get().then(userObj => {
		var notification = {
			notification: {
				icon: messageObj.senderId,
				body: messageObj.text,
			},
		}

		return admin.messaging().sendToDevice(userObj.data().fcmToken, notification).then((response) => {
			console.log("Successfully sent message:", response);
		}).catch((error) => {
			console.log("Error sending message:", error);
		});
	});
}

exports.messageSent =  functions.firestore.document("users/{userId}/conversations/{conversationId}/messages/{messageId}").onCreate(event => {
	var userId = event.params.userId;
	var conversationId = event.params.conversationId
	var messageId = event.params.messageId;

	var messageData = event.data.data();

	return db.collection("users").doc(userId).collection("conversations").doc(conversationId).get().then(conversation => {
		return db.collection("users").doc(conversation.data().otherUserId).collection("conversations").doc(conversationId).collection('messages').doc(messageId).get().then(doc => {
			if(!doc.exists) {
				var data = {
					id: messageData.id,
					senderId: userId,
					createdAt: messageData.createdAt,
					text: messageData.text,
					hasBeenRead: false
				};	

				sendNotification(conversation.data().otherUserId, data);
				
				return db.collection("users").doc(conversation.data().otherUserId).collection("conversations").doc(conversationId).collection('messages').doc(messageId).set(data).then(result => {
					var rUserId = "";
		
					if(conversation.data().otherUserId != messageData.senderId) {
						rUserId = conversation.data().otherUserId;
					} else {
						rUserId = userId;
						console.log("I don't think this can happen");
					}

					return db.collection("users").doc(rUserId).collection("conversations").doc(conversationId).get().then(gConvo => {
						var numberToReturn = 0;

						if(!isNaN(gConvo.data().numberOfUnreadMessages)) {
							numberToReturn = gConvo.data().numberOfUnreadMessages + 1;
						}

						return db.collection("users").doc(rUserId).collection("conversations").doc(conversationId).update({numberOfUnreadMessages: numberToReturn}).then(second_result => {
							return db.collection("users").doc(conversation.data().otherUserId).collection("conversations").doc(conversationId).collection('messages').orderBy("createdAt").limit(1).get().then(message => {
								if(message.exists) {
									if(message.createdAt < data.createdAt) {
										db.collection("users").doc(conversation.data().otherUserId).collection("conversations").doc(conversationId).update({latestMessage: data.text });
									} else {
										console.log("This shouldn't occur");
									}
								} else {
									db.collection("users").doc(conversation.data().otherUserId).collection("conversations").doc(conversationId).update({latestMessage: data.text, lastModified: data.createdAt });
								}
								
							});	
						});
					});
				});
			} else {
				return db.collection("users").doc(conversation.data().otherUserId).collection("conversations").doc(conversationId).update({latestMessage: messageData.text, lastModified: messageData.createdAt });
			}
		});
	});
});
*/

