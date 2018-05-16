var mongoose = require("mongoose");
var crypto = require("crypto");

var teamCommSchema = new mongoose.Schema({
	dateAdd: Date,
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		unique: true
	}
});

mongoose.model("TeamCommitee", teamCommSchema);
