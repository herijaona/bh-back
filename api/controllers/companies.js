var mongoose = require("mongoose");
var Account = mongoose.model("Account");
var app_const = require("../config/constant");
var User = mongoose.model("User");
// var Promise = require("promise");

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
						enseigneCommerciale: ""
					};
					User.findById(userAdmin, function(er_r, _doc) {
						if (!er_r) {
							if (_doc.active) {
								var c = copydata(m, acc_);
								c.Logo = img_url(c.Logo.url);
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
					var formt = /[{:}]/;
					var l = accMap.length;
					for (var iter = 0; iter < l; iter++) {
						var el = accMap[iter].adresse;
						var li = el.length;
						var adrText = "";
						for (var itern = 0; itern < li; itern++) {
							if (formt.test(el[itern])) {
								var sd = JSON.parse(el[itern]).data.vicinity;
								adrText += " " + sd;
							}
						}
						if (adrText) {
							accMap[iter].adresse = adrText;
						}
					}

					res.json(accMap);
				},
				() => {}
			);
		});
	// res.json({ list: "a moment please ..." });
};

/* Controllers handle request on  company generale info */
module.exports.general_info = function(req, res) {
	var m = {
		_id: "",
		adresse: "",
		Logo: "",
		raisonSociale: "",
		enseigneCommerciale: "",
		typeOrganisation: ""
	};
	var curr = req.userDATA;
	var id_v = req.body.c;
	var dataW = new Promise((resolve, reject) => {
		Account.find({ userAdmin: curr._id })
			.populate("Logo")
			.exec((e_, u_) => {
				if (!e_) {
					var r;
					u_.forEach(function(elt) {
						if (id_v == elt._id) {
							r = copydata(m, elt);
							r.Logo = img_url(r.Logo.url);
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
			console.log(r);
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
	var m = {
		_id: "",
		adresse: "",
		Logo: "",
		raisonSociale: "",
		enseigneCommerciale: "",
		typeOrganisation: ""
	};
	var acc = req.ACC;
	acc.raisonSociale = req.body.raisonSociale;
	acc.enseigneCommerciale = req.body.enseigneCommerciale;
	acc.typeOrganisation = req.body.typeOrganisation;

	acc.save(function(e, r) {
		if (!e) {
			Account.populate(r, { path: "Logo" }, function(err, a) {
				var et = copydata(m, a);
				et.Logo = img_url(et.Logo.url);
				et.adresse = getAddrData(et);
				res.status(200).json(et);
			});
		}
	});
};

/* Controllers handle  company generale Logo Update*/
module.exports.updateCompanyLogo = function(req, res) {
	var m = {
		_id: "",
		adresse: "",
		Logo: "",
		raisonSociale: "",
		enseigneCommerciale: ""
	};
	var acc = req.ACC;
	acc.Logo = new mongoose.mongo.ObjectId(req.body.IdIm);
	acc.save(function(e, r) {
		if (!e) {
			Account.populate(r, { path: "Logo" }, function(err, a) {
				var et = copydata(m, a);
	console.log(et);
				et.Logo = img_url(et.Logo.url);
				et.adresse = getAddrData(et);
				res.status(200).json(et);
			});
		}
	});
};

/* Helpers to copy data between object */
function copydata(data1, data2) {
	var k2 = JSON.parse(JSON.stringify(data2));
	Object.keys(k2).forEach(function(keyn) {
		if (keyn in data1) {
			data1[keyn] = k2[keyn];
		}
	});
	return data1;
}

/*Formulate an url for Image */
function img_url(img_u) {
	var x = img_u.split("/");
	return app_const.url + "/files/images/" + x[2];
}

/* Address Data reformat */
function getAddrData(ac) {
	// console.log(arrData);
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
