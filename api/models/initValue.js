var mongoose = require("mongoose");
var Image = mongoose.model("Image");

var initImage = async () => {
	try {
		// statements
		let imZDefaults = await Image.find({ name: "DefaultsZone" });
		if (imZDefaults.length == 0) {
			var image = new Image();
			image.name = "DefaultsZone";
			image.url = "uploads/defaults/team_default.png";
			let imDef = await image.save();
			if (imDef) {
				console.log("Defaults data Image defaults create");
			}
		} else {
			console.log("Defaults data Image Already exist");
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

initImage();
