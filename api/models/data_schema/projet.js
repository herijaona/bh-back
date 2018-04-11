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
	nom: String,
	dateRencontre: Date,
	dateCloture: Date
});

mongoose.model("Projet", projetSchema);
