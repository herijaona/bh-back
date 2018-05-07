var mongoose = require("mongoose");

var videoSchema = new mongoose.Schema({
	name: String,
	url: String,
	user_owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	acc_owner: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	mimetype: String ,
	hosted: Boolean
});

mongoose.model("Video", videoSchema);
