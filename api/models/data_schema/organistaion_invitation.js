var mongoose = require("mongoose");

var orgInvitSchema = new mongoose.Schema({
	dataDetails: {},
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	byUser :{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

mongoose.model("OrganisationInvitation", orgInvitSchema);
