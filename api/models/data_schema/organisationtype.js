var mongoose = require("mongoose");

var orgTypeSchema = new mongoose.Schema({
	text: String,
	slug: {type:String, unique: true}
});

mongoose.model("OrganisationType", orgTypeSchema);
