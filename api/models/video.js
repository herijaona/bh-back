var mongoose = require("mongoose");

var videoSchema = new mongoose.Schema({
	name: String,
	url: String,
});

mongoose.model("Video", videoSchema);
