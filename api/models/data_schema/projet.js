var mongoose = require("mongoose");

var projetSchema = new mongoose.Schema({
	listeCandidatures: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Candidature"
	}],
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
	dataDetails: {},
	addDate: Date,
	name: String, 
	status: String
});

mongoose.model("Project", projetSchema);