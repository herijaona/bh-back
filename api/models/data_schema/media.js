var mongoose = require("mongoose");

var mediaSchema = new mongoose.Schema({
	name: String,
	url: String,
	mediaTypes:String
});

mongoose.model("Media", mediaSchema);
