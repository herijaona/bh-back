var mongoose = require("mongoose");

var TeamFrontSchema = new mongoose.Schema({
	type: Number,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	dateAdd: Date,
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	data: {},
	question_list: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Question"
	}]
});

TeamFrontSchema.add({
	updateDate: Date
});

mongoose.model("TeamFront", TeamFrontSchema);