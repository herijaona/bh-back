var mongoose = require("mongoose");

var successtoriesSchema = new mongoose.Schema({
	dateAdd: Date,
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	iframe_: String,
	id_video: { type: String, unique: true },
	video_url: String,
	caption: String,
	im_poster: String
});

mongoose.model("SuccessStorie", successtoriesSchema);
