var mongoose = require("mongoose");
var tools_service = require("../services/app-general");
var app_const = require("../config/constant");
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");
var Zone = mongoose.model("Zone");
/*
*	Get zone of a Company send in header
*/

module.exports.getAllZoneData = async (req, res) => {
	let acc_id = req.ACC._id;
	let populateQuery = [{ path: "image" }, { path: "video" }];

	try {
		let znData = await Zone.find({ account: acc_id });
		if (znData) {
			znData = await Zone.populate(znData, populateQuery);

			if (znData) {
				let id_in = [];
				await znData.forEach((e, i) => {
					if (e.dtype == 1) {
						if (e.image) {
							if (tools_service.inArray(e.image._id, id_in)) {
								znData[i].image.url = e.image.url;
							} else {
								znData[i].image.url =
									app_const.url +
									"/" +
									e.image.url.replace("uploads", "files");
							}
							id_in.push(e.image._id);
						} else {
							let i = new Image();
							i.url =
								app_const.url +
								"/" +
								"defaults/team_default.png";
							znData[i][image] = i;
						}
					}
				});
				res.status(200).json(znData);
			}
		}
	} catch (e) {
		console.log(e);
	}
};

/*
* add new zone 
*/
module.exports.saveZoneDATA = function(req, res) {
	var dt = req.body;
	var zn = new Zone();
	if (dt.media_type == 1) {
		zn.image = dt.media_id;
	} else if (dt.media_type == 2) {
		zn.video = dt.media_id;
	}
	zn.dtype = dt.media_type;
	delete dt.media_id;
	delete dt.media_type;

	zn.canDeleted = true;

	Object.keys(dt).forEach(elt => {
		zn[elt] = dt[elt];
	});
	zn.account = new mongoose.mongo.ObjectId(req.ACC._id);
	zn.save((e, zi) => {
		if (!e) {
			res.status(200).json({ status: "OK", message: "reussi" });
		}
	});
};

/*
* Delete zone data
*/
module.exports.deleteZoneDATA = function(req, res) {
	var dt = req.body.idzone;
	var zn_rem = Zone.findById(dt).remove();
	zn_rem.exec(e => {
		if (!e) {
			res.status(200).json({ status: "OK", message: "reussi" });
		}
	});
};

/* getZoneData*/
module.exports.getZoneDATA = function(req, res) {
	var dt = req.query.idzone;
	Zone.findById(dt)
		.populate([{ path: "image" }, { path: "video" }])
		.exec((e, el) => {
			if (!e) {
				if (el.dtype == 1) {
					el.image.url =
						app_const.url +
						"/" +
						el.image.url.replace("uploads", "files");
				} else {
					el.video.url =
						app_const.url +
						"/" +
						el.video.url.replace("uploads", "files");
				}
				res.status(200).json({ status: "OK", message: el });
			}
		});
};

module.exports.saveZoneEditDATA = async (req, res) => {
	let postData = req.body;
	let curr = postData.currZn;
	delete postData.currZn;
	try {
		let currDB = await Zone.findById(curr._id);
		if (currDB) {
			if (curr.dtype != postData.media_type) {
				if (postData.media_type == 1) {
					currDB.image = postData.media_id;
					if (curr.dtype == 2) delete currDB.video;
					else {
						delete curr.data_suppl;
					}
				} else if (postData.media_type == 2) {
					currDB.video = postData.media_id;
					if (curr.dtype == 2) delete currDB.image;
					else {
						delete currDB.data_suppl;
					}
					delete postData.media_id;
				}

				currDB.dtype = postData.media_type;
				delete postData.media_id;
			} else {
				if (postData.media_type == 1) {
					currDB.image = postData.media_id;
				} else if (postData.media_type == 2) {
					currDB.video = postData.media_id;
				}
			}
			delete postData.media_type;
			Object.keys(postData).forEach(elt => {
				currDB[elt] = postData[elt];
			});

			let sv = await currDB.save();
			if (sv) {
				res.status(200).json({ status: "OK", message: "reussi" });
			}
		} else {
			res.status(404).json({ status: "NOK", message: "No data Found" });
		}
	} catch (e) {
		// statements
		console.log(e);
		res.status(500).json({ status: "NOK", message: "Erreur Serveur" });
	}
};
