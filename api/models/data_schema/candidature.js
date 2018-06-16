var mongoose = require("mongoose");

var candidatureSchema = new mongoose.Schema({
	accountID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	createdAt: Date,
	questions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Question"
	}],
	projectID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project"
	},
	status: String,
	applicationData: {},
	countryCD: String
});
/* candidat: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" }, */
mongoose.model("Candidature", candidatureSchema);