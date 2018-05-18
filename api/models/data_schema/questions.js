var mongoose = require("mongoose");

var questionsFrontSchema = new mongoose.Schema({
	objectRef: String,
	userAsk: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	addDate: Date,
	question_content: String,
	objectRefID: { type: mongoose.Schema.Types.ObjectId },
	responseAll: [
		{
			rDate: Date,
			user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
			respText: String,
			numbr: Number
		}
	],
	account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }
});
mongoose.model("Question", questionsFrontSchema);
