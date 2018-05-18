var mongoose = require("mongoose");

var TeamFrontSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	dateAdd: Date,
	account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	team_users: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	iframe_: String,
	id_video: String,
	video_url: String,
	caption: String,
	textTeam: String,
	im_poster: String,
	question_list: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
});

TeamFrontSchema.add({ updateDate: Date });

mongoose.model("TeamFront", TeamFrontSchema);
