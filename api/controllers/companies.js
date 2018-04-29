var mongoose = require("mongoose");
var Account = mongoose.model("Account");
var app_const = require("../config/constant");
var User = mongoose.model("User");
var Image = mongoose.model("Image");
var Video = mongoose.model("Video");
var Zone = mongoose.model("Zone");
var Presentation = mongoose.model("Presentation");
var DtoS = {
	_id: "",
	adresse: "",
	Logo: "",
	raisonSociale: "",
	enseigneCommerciale: "",
	typeOrganisation: "",
	coverImage: ""
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
					var m = {
						_id: "",
						adresse: "",
						Logo: "",
						raisonSociale: "",
						enseigneCommerciale: "",
						coverImage: ""
					};
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
	var m = {
		_id: "",
		adresse: "",
		Logo: "",
		raisonSociale: "",
		enseigneCommerciale: "",
		typeOrganisation: "",
		pagetoShow: "",
		coverImage: ""
	};
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

/* Controllers handle  company generale info Update*/
module.exports.updategeneral_info = function(req, res) {
	var sd = {
		_id: "",
		adresse: "",
		Logo: "",
		raisonSociale: "",
		enseigneCommerciale: "",
		typeOrganisation: "",
		coverImage: ""
	};

	var m = Object.create(DtoS);

	var acc = req.ACC;
	acc.raisonSociale = req.body.raisonSociale;
	acc.enseigneCommerciale = req.body.enseigneCommerciale;
	acc.typeOrganisation = req.body.typeOrganisation;

	acc.save(function(e, r) {
		if (!e) {
			Account.populate(r, { path: "Logo" }, function(err, a) {
				var et = copydata(m, a);
				console.log(et);
				et.Logo = media_url(et.Logo.url, "images");
				et.adresse = getAddrData(et);
				res.status(200).json(et);
			});
		}
	});
};

/* Controllers handle  company generale Logo Update*/
module.exports.updateCompanyImage = function(req, res) {
	var m = {
		_id: "",
		adresse: "",
		Logo: "",
		raisonSociale: "",
		enseigneCommerciale: "",
		coverImage: ""
	};
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
	delete req.body.acc_id;
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
module.exports.updatePresentation = function(req, res) {
	var d = req.body;
	Presentation.findOne({ account: req.ACC._id }).exec((er, elt) => {
		elt.description = d.description;
		elt.autreDescription = d.autreDescription;
		elt.save((e,p)=>{
			if (!e) {
				res.status(200).json({status: 'OK', message:'Element mis a jour avec succes'});
			}
		})
	});
};

/* 
* Return the mindset data for admin view 
*/
module.exports.getAdminDataMindset = function(req, res) {
	var znData = getZoneData(req.ACC._id);
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
		zn.dtype = 1;
	} else {
		zn.video = dt.media_id;
		zn.dtype = 2;
	}
	zn.zHeight = req.body.height;
	zn.zWidth = req.body.width;
	zn.account = new mongoose.mongo.ObjectId(req.ACC._id);
	zn.caption = dt.name;
	zn.save((e, zi) => {
		if (!e) {
			res.status(200).json({ status: "OK", message: "reussi" });
		}
	});
};

/*
*	Get zone of a Company send in header 
*/
function getZoneData(ac_id) {
	var zoneData = new Promise((resolve, reject) => {
		var populateQuery = [{ path: "image" }, { path: "video" }];
		Zone.find({ account: ac_id })
			.populate(populateQuery)
			.exec((er, elts) => {
				if (!er) {
					for (el in elts) {
						var e1 = elts[el];
						if (e1.dtype == 1) {
							elts[el].image.url = media_url(
								e1.image.url,
								"images"
							);
							delete elts[el].video;
						} else if (e1.dtype == 2) {
							elts[el].video.url = media_url(
								e1.video.url,
								"videos"
							);
							delete elts[el].image;
						}
					}
					resolve(elts);
				} else {
					reject(0);
				}
			});
	});
	return zoneData;
}
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
function media_url(img_u, f) {
	var x = img_u.split("/");
	return app_const.url + "/files/" + f + "/" + x[2];
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
