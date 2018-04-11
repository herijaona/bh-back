var mongoose = require("mongoose");

var memberSchema = new mongoose.Schema({
	video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
	image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
	description: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

mongoose.model("Member", memberSchema);
