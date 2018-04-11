var mongoose = require("mongoose");

var orgTypeSchema = new mongoose.Schema({
	text: String,
	slug: String
});

mongoose.model("OrganisationType", orgTypeSchema);
