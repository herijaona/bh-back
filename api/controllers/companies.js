var mongoose = require("mongoose");
var Account = mongoose.model("Account");
var app_const = require("../config/constant");
var User = mongoose.model("User");
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");
var Zone = mongoose.model("Zone");
var Presentation = mongoose.model("Presentation");
var DataForResponse = {
	_id: "",
	adresse: "",
	Logo: "",
	raisonSociale: "",
	enseigneCommerciale: "",
	typeOrganisation: "",
	coverImage: "",
	_slug: "",
	pagetoShow: ""
};

/* Get the list of activated company */
module.exports.listall = function(req, res) {
	Account.find()
		.populate("Logo")
		.exec(function(err, acc) {
			var accMap = [];
			var l = acc.length,
				li = 1;
			waitData = new Promise((resolve, reject) => {
				acc.forEach(function(acc_) {
					var userAdmin = acc_.userAdmin[0];
					var m = Object.create(DataForResponse);
					User.findById(userAdmin, function(er_r, _doc) {
						if (!er_r) {
							if (_doc.active) {
								var c = copydata(m, acc_);
								c.Logo = media_url(c.Logo.url, "images");
								accMap.push(c);
							}
							if (l == li) {
								resolve();
							}
						}
						li++;
					});
				});
			});

			waitData.then(
				() => {
					var l = accMap.length;
					for (var iter = 0; iter < l; iter++) {
						accMap[iter].adresse = getAddrData(accMap[iter]);
					}
					res.json(accMap);
				},
				() => {}
			);
		});
};

/* Controllers handle request on  company generale info */
module.exports.general_info = function(req, res) {
	var m = Object.create(DataForResponse);
	var populateQuery = [{ path: "Logo" }, { path: "coverImage" }];
	var curr = req.userDATA;
	var id_v = req.body.c;
	var dataW = new Promise((resolve, reject) => {
		Account.find({ userAdmin: curr._id })
			.populate(populateQuery)
			.exec((e_, u_) => {
				if (!e_) {
					var r;
					u_.forEach(function(elt) {
						if (id_v == elt._id) {
							r = copydata(m, elt);
							r.Logo = media_url(r.Logo.url, "images");
							if (r.coverImage) {
								r.coverImage = media_url(
									r.coverImage.url,
									"images"
								);
							}
						}
					});
					if (r) {
						resolve(r);
					} else {
						reject(0);
					}
				}
			});
	});

	dataW.then(
		r => {
			r.adresse = getAddrData(r);
			res.status(200).json(r);
		},
		er => {
			console.log("Error");
			res.status(400).json({ text: "error" });
		}
	);
};

/* handle the get requet about company details info*/
module.exports.getCompanyDetailsData = function(req, res) {
	console.log(req.query);
	var m = Object.create(DataForResponse);
	var populateQuery = [{ path: "Logo" }, { path: "coverImage" }];
	Account.findOne({ _slug: req.query.company_slug })
		.populate(populateQuery)
		.exec((err, elt) => {
			if (!err) {
				if (elt) {
					var cmp = copydata(m, elt);
					cmp.Logo = media_url(cmp.Logo.url, "images");
					if (cmp.coverImage) {
						cmp.coverImage = media_url(
							cmp.coverImage.url,
							"images"
						);
					}
					cmp.adresse = getAddrData(cmp);
					res.status(200).json(cmp);
				} else {
					res.status(404).json({ dtls: "account not Found" });
				}
			}
		});
};

/* Controllers handle  company generale info Update*/
module.exports.updategeneral_info = async function(req, res) {
	var m = Object.create(DataForResponse);
	var acc = req.ACC;
	var sl_ = "";
	var sl_dupl = 0;
	var loop_ind = true;

	Object.keys(req.body).forEach(function(keyn) {
		console.log(keyn);
		acc[keyn] = req.body[keyn];
		if (keyn == "enseigneCommerciale") {
			sl_ = req.body[keyn].replace(/ /g, "");
			acc["_slug"] = sl_;
		}
	});

	while (loop_ind) {
		try {
			let vt = await acc.save();
			if (vt) {
				let a_ = await Account.populate(vt, [
					{ path: "Logo" },
					{ path: "coverImage" }
				]);
				if (a_) {
					loop_ind = false;
					var et = copydata(m, vt);
					et.Logo = media_url(et.Logo.url, "images");
					et.adresse = getAddrData(et);
					if (et.coverImage) {
						et.coverImage = media_url(et.coverImage.url, "images");
					}
					res.status(200).json(et);
				}
			}
		} catch (e) {
			// statements
			console.log(e);
			if (e.code == 11000) {
				acc["_slug"] = sl_ + "_" + sl_dupl;
				sl_dupl++;
				loop_ind = true;
			}
		}
	}
};

/* Controllers handle  company generale Logo Update*/
module.exports.updateCompanyImage = function(req, res) {
	var m = Object.create(DataForResponse);
	var acc = req.ACC;
	acc[req.body.dataIm] = new mongoose.mongo.ObjectId(req.body.IdIm);
	acc.save(function(e, r) {
		if (!e) {
			Account.populate(r, { path: "Logo" }, function(err, a) {
				var et = copydata(m, a);
				et.Logo = media_url(et.Logo.url, "images");
				et.adresse = getAddrData(et);
				res.status(200).json(et);
			});
		}
	});
};

module.exports.updatePageShow = function(req, res) {
	var ac = req.ACC;
	ac.pagetoShow = JSON.stringify(req.body);
	ac.save(function(e, r) {
		if (!e) {
			res.status(200).json({ status: "OK" });
		}
	});
};

module.exports.getCbiblioImage = function(req, res) {
	var x_type = req.headers["x-type-data"];
	var dtype = x_type == "images" ? Image : Video;
	var ac_id = req.ACC._id;
	var pr = new Promise((resolve, reject) => {
		dtype.find({ acc_owner: ac_id }).exec((e, i) => {
			if (e || i.length == 0) {
				res.status(400).json({ err: "Not Found or Data Not Valid" });
			}
			var l = i.length;
			var l_ = [];
			i.forEach(function(el, indx) {
				var on_ = {
					_id: el._id,
					url: media_url(el.url, x_type.toLowerCase()),
					mimetype: el.mimetype
				};
				l_.push(on_);

				if (l == indx + 1) {
					resolve(l_);
				}
			});
		});
	});

	pr.then(iml => {
		res.status(200).json({ allIm: iml });
	});
};

module.exports.updateImageBiblio = function(req, res) {
	var data_T = req.body.ty_pe == "images" ? Image : Video;
	var ac = req.body.all_im;
	var prom = new Promise((resolve, reject) => {
		var l = ac.length;
		ac.forEach(function(ee, ie) {
			data_T.findById(new mongoose.mongo.ObjectId(ee), function(er, im) {
				im.acc_owner = req.ACC._id;
				im.save(function(e, r) {
					if (l == ie + 1) {
						resolve();
					}
				});
			});
		});
	});

	prom.then(() => {
		res.status(200).json({ status: "OK", message: "VAlue updated" });
	});
};

/* add new presentation*/
module.exports.updatePresentation = async (req, res) => {
	var d = req.body;
	try {
		let pr_ = await Presentation.findOne({ account: req.ACC._id });
		if (pr_) {
			let k = await Object.keys(d).map((elem, index) => {
				pr_[elem] = d[elem];
				return elem;
			});

			if (k) {
				console.log(k);
				let sav_ = await pr_.save();
				if (sav_) {
					console.log(sav_);
					res.status(200).json({
						status: "OK",
						message: "Element mis a jour avec succes"
					});
				}
			}
		}
	} catch (e) {
		// statements
		console.log(e);
	}

	/*Presentation.findOne({ account: req.ACC._id }).exec((er, elt) => {
	elt.description = d.description;
	elt.autreDescription = d.autreDescription;
	elt.save((e, p) => {
		if (!e) {
			res.status(200).json({
				status: "OK",
				message: "Element mis a jour avec succes"
			});
		}
	});
});*/
};

module.exports.getCompanyPresentation = async (req, res) => {
	console.log(req.ACC);
	try {
		let pr = await Presentation.findOne({ account: req.ACC._id });
		if (pr) {
			res.status(200).json({ data: pr });
		} else {
			res.status(404).json({ message: "Presentation not found" });
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

/* 
* Return the mindset data for admin view 
*/
module.exports.getAdminDataMindset = function(req, res) {
	var znData = new Promise((resolve, reject) => {
		var populateQuery = [{ path: "video" }, { path: "image" }];
		Zone.find({ account: req.ACC._id })
			.populate(populateQuery)
			.exec((er, elts) => {
				if (!er) {
					resolve(elts);
				} else {
					reject(0);
				}
			});
	});

	znData.then(function(arrElts) {
		var ln = arrElts.length;
		var id_in = [];
		for (var i = 0; i < ln; i++) {
			var el;
			var el = arrElts[i];
			if (el.dtype == 2) {
				if (inArray(el.video._id, id_in)) {
					arrElts[i].video.url = el.video.url;
				} else {
					arrElts[i].video.url =
						app_const.url +
						"/" +
						el.video.url.replace("uploads", "files");
					id_in.push(el.video._id);
				}
			} else if (el.dtype == 1) {
				if (inArray(el.image._id, id_in)) {
					arrElts[i].image.url = el.image.url;
				} else {
					arrElts[i].image.url =
						app_const.url +
						"/" +
						el.image.url.replace("uploads", "files");
				}
				id_in.push(el.image._id);
			}
			delete el;
		}
		return arrElts;
	});
	znData.then(
		zn => {
			Presentation.find({ account: req.ACC._id }).exec((er, elt) => {
				if (!er) {
					res.status(200).json({
						zone: zn,
						presentation: elt[0]
					});
				}
			});
		},
		err => {}
	);
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

/**/
module.exports.getZoneDATA = function(req, res) {
	console.log(req.query.idzone);
	var dt = req.query.idzone;
	Zone.findById(dt)
		.populate([{ path: "image" }, { path: "video" }])
		.exec((e, el) => {
			if (!e) {
				console.log(el);
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

module.exports.checkRole_userAdmin = function(req, res) {
	var currUSERID = req.userDATA._id;
	var dt = req.query.slug_chk;
	Account.findOne({ _slug: dt }).exec((er, elts) => {
		if (!er) {
			if (elts) {
				var usersAdm = elts.userAdmin;
				var existIN = false;
				for (i_d in usersAdm) {
					if (currUSERID.toString() == usersAdm[i_d].toString()) {
						existIN = true;
						break;
					}
				}
				res.status(200).json({
					data_check_response: existIN,
					_id_check: elts._id
				});
			} else {
				res.status(200).json({
					data_check_response: false
				});
			}
		}
	});
};

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
							if (inArray(e.image._id, id_in)) {
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
				console.log(znData);
				res.status(200).json(znData);
			}
		}
	} catch (e) {
		console.log(e);
	}
};

module.exports.saveZoneEditDATA = async (req, res) => {
	// console.log(req.body);
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
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};
/*
* Helpers to copy data between object 
*/
function copydata(data1, data2) {
	var k2 = JSON.parse(JSON.stringify(data2));
	Object.keys(k2).forEach(function(keyn) {
		if (keyn in data1) {
			data1[keyn] = k2[keyn];
		}
	});
	return data1;
}

/*
* Formulate an url for media files 
*/
function media_url(img_) {
	return app_const.url + "/" + img_.replace("uploads", "files");
}

/* 
* Address Data reformat 
*/
function getAddrData(ac) {
	var formt = /[{:}]/;
	var el = ac.adresse;
	var li = el.length;
	var adrText = "";
	for (var itern = 0; itern < li; itern++) {
		if (formt.test(el[itern])) {
			var sd = JSON.parse(el[itern]).data.vicinity;
			adrText += " " + sd;
		} else {
			adrText += el[itern];
		}
	}
	return adrText;
}

/* IN_Array*/
function inArray(needle, haystack) {
	var length = haystack.length;
	for (var i = 0; i < length; i++) {
		if (haystack[i] == needle) return true;
	}
	return false;
}
