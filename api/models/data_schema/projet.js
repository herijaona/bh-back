var mongoose = require("mongoose");

var projetSchema = new mongoose.Schema({
	listeCandidatures: [
		{ type: mongoose.Schema.Types.ObjectId, ref: "Candidature" }
	],
	idProjetCCA: String,
	view: Number,
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	createdByUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	typeCollab: String,
	dataDetails: {}
});

mongoose.model("Project", projetSchema);
