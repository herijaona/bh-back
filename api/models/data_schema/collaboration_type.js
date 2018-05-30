var mongoose = require("mongoose");
var collaborationTypeSchema = new mongoose.Schema({
	text: String,
	slug: {type:String, unique: true}
});
mongoose.model("CollaborationType", collaborationTypeSchema);
