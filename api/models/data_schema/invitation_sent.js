var mongoose = require("mongoose");
var crypto = require("crypto");

var InvitationSchema = new mongoose.Schema({
	lastname: String,
	firstname: String,
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	email: String,
	invAsTeam: Boolean,
	invAsComm: Boolean,
	status: String,
	dateAdd: Date,
	invintedbyUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

mongoose.model("InvitationSent", InvitationSchema);
