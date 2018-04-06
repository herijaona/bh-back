var mongoose = require("mongoose");

var candidatureSchema = new mongoose.Schema({
	accountID: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	candidat: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" },
	createdAt: Date,
	proposition: String,
	questions: String,
	background: String
});

mongoose.model("Candidature", candidatureSchema);
