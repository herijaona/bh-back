var mongoose = require("mongoose");

var orgInvitSchema = new mongoose.Schema({
	dataDetails: {},
	byAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	byUser :{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

mongoose.model("OrganisationInvitation", orgInvitSchema);
