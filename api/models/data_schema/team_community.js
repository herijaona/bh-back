var mongoose = require("mongoose");
var teamCommSchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	users: [{
		us: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		last_date: Date,
		last_act: String,
		last_objData: String,
		act: [String]
	}]
});
mongoose.model("TeamCommunity", teamCommSchema);