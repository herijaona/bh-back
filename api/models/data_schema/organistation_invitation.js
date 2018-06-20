var mongoose = require("mongoose");

var orgInvitSchema = new mongoose.Schema({
	dataDetails: {},
	sendDate: Date,
	byAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	byUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	status: String
});

mongoose.model("OrganisationInvitation", orgInvitSchema);