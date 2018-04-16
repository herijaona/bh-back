var mongoose = require("mongoose");
var Account = mongoose.model("Account");
var app_const = require('../config/constant');

/*Uploading Image*/
module.exports.listall = function(req, res) {
	Account.find({}, function(err, acc) {
		var accMap = {};

		acc.forEach(function(acc_) {
			var m = {
				_id: "",
				adresse: "",
				Logo: "",
				raisonSociale: "",
				enseigneCommerciale: ""
			};
			var c = copydata(m, acc_);
			c.Logo = app_const.url + '/files/images/'+ c.Logo;
			accMap[acc_._id] = c;
		});

		res.send(accMap);
	});
	// res.json({ list: "a moment please ..." });
};

/* Helpers */
function copydata(data1, data2) {
	var k2 = JSON.parse(JSON.stringify(data2));
	Object.keys(k2).forEach(function(keyn) {
		if (keyn in data1) {
			data1[keyn] = k2[keyn];
		}
	});
	return data1;
}
