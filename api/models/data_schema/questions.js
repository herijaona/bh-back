var mongoose = require("mongoose");

var questionsFrontSchema = new mongoose.Schema({
	objectRef: String,
	userAsk: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	addDate: Date,
	question_content: String,
	dataQuestion: { type: mongoose.Schema.Types.Mixed }
});
mongoose.model("Question", questionsFrontSchema);
