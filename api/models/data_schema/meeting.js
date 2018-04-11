var mongoose = require("mongoose");

var meetingSchema = new mongoose.Schema({
	name: String,
	description: String,
	dateMeeting: Date,
	image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
});

mongoose.model("Meeting", meetingSchema);
