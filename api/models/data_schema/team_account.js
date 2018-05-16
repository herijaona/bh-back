var mongoose = require("mongoose");
var crypto = require("crypto");

var teamAccoutnSchema = new mongoose.Schema({
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

mongoose.model("TeamAccount", teamAccoutnSchema);
