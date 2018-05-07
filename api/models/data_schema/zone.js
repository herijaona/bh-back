var mongoose = require("mongoose");

var zoneSchema = new mongoose.Schema({
	presentation: { type: mongoose.Schema.Types.ObjectId, ref: "Presentation" },
	video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
	image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
	account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
	caption: String,
	zHeight: Number,
	zWidth: Number
});

zoneSchema.add({ dtype: Number });
zoneSchema.add({ rang: Number });
zoneSchema.add({ data_suppl: String });
zoneSchema.add({ canDeleted: Boolean });

mongoose.model("Zone", zoneSchema);
