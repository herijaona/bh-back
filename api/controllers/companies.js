var mongoose = require("mongoose");
var Account = mongoose.model("Account");
var app_const = require("../config/constant");
var User = mongoose.model("User");
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");
var Zone = mongoose.model("Zone");
var Presentation = mongoose.model("Presentation");
var tools_service = require("../services/app-general");
var DataForResponse = {
	_id: "",
	adresse: "",
	Logo: "",
	raisonSociale: "",
	enseigneCommerciale: "",
	typeOrganisation: "",
	coverImage: "",
	_slug: "",
	website: "",
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
								var c = tools_service.copydata(m, acc_);
								c.Logo = tools_service.media_url(
									c.Logo.url,
									"images"
								);
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
						accMap[iter].adresse = tools_service.getAddrData(
							accMap[iter]
						);
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
							r = tools_service.copydata(m, elt);
							r.Logo = tools_service.media_url(
								r.Logo.url,
								"images"
							);
							if (r.coverImage) {
								r.coverImage = tools_service.media_url(
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
			r.adresse = tools_service.getAddrData(r);
			res.status(200).json(r);
		},
		er => {
			console.log("Error");
			res.status(400).json({ text: "error" });
		}
	);
};

/* handle the get requet about company details info*/
module.exports.getCompanyDetailsData = async (req, res) => {
	var m = Object.create(DataForResponse);
	var populateQuery = [{ path: "Logo" }, { path: "coverImage" }];
	try {
		let elt = await Account.findById(req.ACC._id).populate(populateQuery);
		if (elt) {
			var cmp = tools_service.copydata(m, elt);
			cmp.Logo = tools_service.media_url(cmp.Logo.url, "images");
			if (cmp.coverImage) {
				cmp.coverImage = tools_service.media_url(cmp.coverImage.url);
			}
			cmp.adresse = tools_service.getAddrData(cmp);
			res.status(200).json(cmp);
		} else {
			res.status(404).json({ dtls: "account not Found" });
		}
	} catch (e) {
		// statements
		console.log(e);
		res.status(500).json({ dtls: "Erreur serveur" });
	}
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
					var et = tools_service.copydata(m, vt);
					et.Logo = tools_service.media_url(et.Logo.url, "images");
					et.adresse = tools_service.getAddrData(et);
					if (et.coverImage) {
						et.coverImage = tools_service.media_url(
							et.coverImage.url,
							"images"
						);
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
				var et = tools_service.copydata(m, a);
				et.Logo = tools_service.media_url(et.Logo.url, "images");
				et.adresse = tools_service.getAddrData(et);
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

module.exports.getCbiblioImage = async (req, res) => {
	let data = req.query["data"];
	let entity = req.query["entity"];
	let ac_id = req.ACC._id;
	let usr_id = req.userDATA._id;
	let keySearch_ = {};

	if (entity == "user") {
		keySearch_ = { user_owner: usr_id };
	} else if (entity == "account") {
		keySearch_ = { acc_owner: ac_id };
	}

	try {
		let imbb = await Image.find(keySearch_);
		if (imbb) {
			let l_ = [];
			await imbb.forEach(function(el, indx) {
				let on_ = {
					_id: el._id,
					url: tools_service.media_url(el.url),
					mimetype: el.mimetype
				};
				l_.push(on_);
			});
			res.status(200).json({ allIm: l_ });
		}
	} catch (e) {
		console.log(e);
		res.status(500).json({ status: "NOK", message: "Not ok" });
	}
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
				if (tools_service.inArray(el.video._id, id_in)) {
					arrElts[i].video.url = el.video.url;
				} else {
					arrElts[i].video.url =
						app_const.url +
						"/" +
						el.video.url.replace("uploads", "files");
					id_in.push(el.video._id);
				}
			} else if (el.dtype == 1) {
				if (tools_service.inArray(el.image._id, id_in)) {
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

module.exports.companyDetailsByUserID = async (req, res, next) => {
	let userId = req.userDATA._id;
	try {
		let arrComp = await Account.find({ users: userId });
		if (arrComp.length > 0) {
			req.ACC = arrComp[0];
			next();
		}
	} catch (e) {
		// statements
		console.log(e);
		res.status(500).json({ st: "erreur serveur" });
	}
};
