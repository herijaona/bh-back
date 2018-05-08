var mongoose = require("mongoose");

var TeamFrontSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	dateAdd: Date,
	account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	iframe_: String,
	id_video:String,
	video_url: String,
	caption: String,
	textTeam: String,
	im_poster: String
});

mongoose.model("TeamFront", TeamFrontSchema);
