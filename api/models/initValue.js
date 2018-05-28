var mongoose = require("mongoose");
const path = require("path");
var Image = mongoose.model("Image");
var OrganisationType = mongoose.model("OrganisationType");
var fs = require("fs");
var orgTypeDefaults = fs.readFileSync(
	path.join(global.basedir, "/api/templates/organisationtype.json"),
	"utf8"
);

var initImage = async () => {
	try {
		// statements
		let imZDefaults = await Image.find({ name: "DefaultsZone" });
		let imPrDefaults = await Image.find({ name: "DefaultsprofileImage" });

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

		if (imPrDefaults.length == 0) {
			var image = new Image();
			image.name = "DefaultsprofileImage";
			image.url = "uploads/defaults/profile_default.png";
			let imDef = await image.save();
			if (imDef) {
				console.log("Defaults data Image Profile defaults create");
			}
		} else {
			console.log("Defaults Profile Image Already exist");
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

var initOrganistationType = async () => {
	let orgJson = JSON.parse(orgTypeDefaults);
	try {
		for (defOrg of orgJson.default_type) {
			let cSlug = defOrg.text.toLowerCase().replace(/ /g, "");
			let txt = defOrg.text;
			let orgType = await OrganisationType.find({ slug: cSlug });
			if (orgType.length == 0) {
				let nOrgtype = new OrganisationType({ text: txt, slug: cSlug });
				let newotype = await nOrgtype.save();
			}
		}
	} catch (e) {
		console.log(e);
	}
};

var allDefaultsCall = () => {
	initImage();
	initOrganistationType();
};

allDefaultsCall();