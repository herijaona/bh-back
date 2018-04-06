var mongoose = require("mongoose");

var usertokenSchema = new mongoose.Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	token: String,
	createdAt: Date
});

mongoose.model("Usertoken", usertokenSchema);
