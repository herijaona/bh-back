const path = require("path");
var fs = require("fs");
var app_const = require(path.join(global.basedir, "/api/config/constant"));

/* Capitalize all word in string */
module.exports.titleCase = (str) => {
	var splitStr = str.toLowerCase().split(" ");
	for (var i = 0; i < splitStr.length; i++) {
		splitStr[i] =
			splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(" ");
}

/* IN_Array*/
module.exports.inArray = (needle, haystack) => {
	var length = haystack.length;
	for (var i = 0; i < length; i++) {
		if (haystack[i] == needle) return true;
	}
	return false;
};

/* Copy data between object */
module.exports.copydata = function (model, source) {
	var k2 = JSON.parse(JSON.stringify(source));
	Object.keys(k2).forEach(function (keyn) {
		if (keyn in model) {
			model[keyn] = k2[keyn];
		}
	});
	return model;
};

/* 
 * Address Data reformat 
 */
module.exports.getAddrData = ac => {
	var formt = /[{:}]/;
	var el = ac.adresse;
	var li = el.length;
	var adrText = "";
	for (var itern = 0; itern < li; itern++) {
		if (formt.test(el[itern])) {
			var sd = JSON.parse(el[itern]).vicinity;
			adrText += " " + sd;
		} else {
			adrText += el[itern];
		}
	}
	return adrText;
};

module.exports.media_url = img_ => {
	return app_const.url + "/" + img_.replace("uploads", "files");
};

/* get country from json */
var allCountry = fs.readFileSync(
	path.join(global.basedir, "/api/templates/country.json"),
	"utf8"
);
var cou2 = require('./../templates/country/country')

module.exports.getcountry = (type) => {
	if (type === 'all') {
		return JSON.parse(allCountry);
	} else if (type === 'continent') {
		return cou2.countryList();
	}
};

module.exports.getCountryText = code => {
	const allC = JSON.parse(allCountry).default_type;
	let cText = '';
	for (const co of allC) {
		if (co.code === code) {
			cText = co.name
		}
	}
	return cText;
}