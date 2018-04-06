var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
	name: String,
	url: String,
});

mongoose.model("Image", imageSchema);
