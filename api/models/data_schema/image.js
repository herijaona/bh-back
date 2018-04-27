var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
	name: String,
	url: String,
	user_owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	acc_owner: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	mimetype: String
});

mongoose.model("Image", imageSchema);
