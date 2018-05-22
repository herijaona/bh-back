var mongoose = require("mongoose");

var candidatureSchema = new mongoose.Schema({
	accountID: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	createdAt: Date,
	proposition: String,
	questions: [{type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
	background: String, 
	status: String
});
/* candidat: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" }, */
mongoose.model("Candidature", candidatureSchema);
