var mongoose = require("mongoose");

var biblioSchema = new mongoose.Schema({
	objetowner: String,
	image:  { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
	user_owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	acc_owner: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }

});

mongoose.model("BiblioImage", biblioSchema);
