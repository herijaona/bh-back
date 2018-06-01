var mongoose = require("mongoose");
const path = require("path");
var Image = mongoose.model("Image");
var OrganisationType = mongoose.model("OrganisationType");
var CollaborationType = mongoose.model("CollaborationType");
var fs = require("fs");
var orgTypeDefaults = fs.readFileSync(
	path.join(global.basedir, "/api/templates/organisationtype.json"),
	"utf8"
);
var collaborationDefaultsType = fs.readFileSync(
	path.join(global.basedir, "/api/templates/collaboration_Type_Default.json"),
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

var initCollaborationDefaultType = async () => {
	let collborationDf= JSON.parse(collaborationDefaultsType);
	try {
		for (defCollab of collborationDf.default_type) {
			// let colSlug = defCollab.text.toLowerCase().replace(/ /g, "");
			let colSlug = defCollab.code;
			let txt = defCollab.text;
			let colType = await CollaborationType.find({ slug: colSlug });
			if (colType.length == 0) {
				let ncolType = new CollaborationType({ text: txt, slug: colSlug });
				let newctype = await ncolType.save();
			}
		}
	} catch (e) {
		console.log(e);
	}
};

var allDefaultsCall = () => {
	initImage();
	initOrganistationType();
	initCollaborationDefaultType();
};

allDefaultsCall();
