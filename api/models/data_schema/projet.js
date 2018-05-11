var mongoose = require("mongoose");

var projetSchema = new mongoose.Schema({
	listeCandidatures: [
		{ type: mongoose.Schema.Types.ObjectId, ref: "Candidature" }
	],
	contexte: String,
	dateFinCandidature: Date,
	objectif: String,
	elementProposition: String,
	idProjetCCA: String,
	name: String,
	dateRencontre: Date,
	responseTimeUnit: String,
	responseTimeValue: Number,
	dateCloture: Date,
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	createdByUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

mongoose.model("Project", projetSchema);
