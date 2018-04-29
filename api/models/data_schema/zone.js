var mongoose = require("mongoose");

var zoneSchema = new mongoose.Schema({
	presentation: { type: mongoose.Schema.Types.ObjectId, ref: "Presentation" },
	video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
	image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
	account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	caption: String,
	zHeight:  Number,
	dtype:  Number,
	zWidth: Number
});

mongoose.model("Zone", zoneSchema);
