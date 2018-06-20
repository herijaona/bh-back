var mongoose = require("mongoose");

var orgInvitSchema = new mongoose.Schema({
	dataDetails: {},
	sendDate: Date,
	activeDate: Date,
	byAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	byUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	status: String,
	collabConcerned: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project"
	}]
});

mongoose.model("OrganisationInvitation", orgInvitSchema);