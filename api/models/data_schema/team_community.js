var mongoose = require("mongoose");
var teamCommSchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	users: [
		{
			us: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				unique: true
			},
			act: [String]
		}
	]
});
mongoose.model("TeamCommunity", teamCommSchema);
