const path = require("path");
var Hogan = require("hogan.js");
var fs = require("fs");
var app_const = require(path.join(global.basedir, "/api/config/constant"));

var templateInvitation = fs.readFileSync(
	app_const.templatesPath + "/mails/invitationBH.hjs",
	"utf-8"
);
var templateActivation = fs.readFileSync(
	app_const.templatesPath + "/mails/activation.hjs",
	"utf-8"
);

var templateAfterUserApply = fs.readFileSync(
	app_const.templatesPath + "/mails/afterUserApply.hjs",
	"utf-8"
);

var templateResetpass = fs.readFileSync(
	app_const.templatesPath + "/mails/resetpass.hjs",
	"utf-8"
);
var notifResetpass = fs.readFileSync(
	app_const.templatesPath + "/mails/notif.hjs",
	"utf-8"
);

const mailjet = require("node-mailjet").connect(
	app_const.mailjet.api_pub,
	app_const.mailjet.api_priv
);
var activationTemplate = Hogan.compile(templateActivation);
var resetPassTemplate = Hogan.compile(templateResetpass);
var notifresetPassTemplate = Hogan.compile(notifResetpass);
var invitationTemplate = Hogan.compile(templateInvitation);
var afterUserApplyTemplate = Hogan.compile(templateAfterUserApply);

module.exports.sendActivationMail = function (argMail) {
	var subj = "Active votre compte";
	var data_email = {
		name: titleCase(argMail.user.firstname) +
			" " +
			titleCase(argMail.user.lastname),
		url_activation: app_const.url_front + "/activate/" + argMail.user.activation_text,
		sitename: app_const.name
	};

	var templ = activationTemplate;
	var dest = {
		name: data_email.name,
		email: argMail.user.email
	};
	console.log(data_email.url_activation);

	return deliverEmail(subj, templ, data_email, dest);
};

module.exports.sendResetPasswordMail = function (u, d) {
	var subj = "Demande de reinitialisation de mot de passe ";
	var templ = resetPassTemplate;
	var data_m = {
		sitename: app_const.name,
		url_reset: app_const.url_front + "/reset-my-pass/" + d._id + "/" + d.resetCode
	};
	var dest = {
		name: titleCase(u.firstname) + " " + titleCase(u.lastname),
		email: u.email
	};
	console.log(data_m.url_reset);
	return deliverEmail(subj, templ, data_m, dest);
};

/*Send Mail password was changed*/
module.exports.sendEmailPassResetednotif = function (u) {
	var subj = "Votre mot de passe a changé ";

	var templ = notifresetPassTemplate;
	var data_m = {
		username: titleCase(u.firstname) + " " + titleCase(u.lastname)
	};
	var dest = {
		name: titleCase(u.firstname) + " " + titleCase(u.lastname),
		email: u.email
	};
	return deliverEmail(subj, templ, data_m, dest);
};

module.exports.mailInvitations = (inv, usr, usAcc) => {
	var subj = "Invitation sur Business Haven";
	var role = "";
	if (inv.invAsTeam && inv.invAsComm) {
		role = "Team & Commitee";
	} else {
		if (inv.invAsTeam) {
			role = "Team";
		}
		if (inv.invAsComm) {
			role = "Commitee";
		}
	}
	var templ = invitationTemplate;
	var data_m = {
		userSender: titleCase(usr.firstname) + " " + titleCase(usr.lastname),
		invitedName: titleCase(inv.firstname) + " " + titleCase(inv.lastname),
		sitename: app_const.name,
		role: role,
		invitationUrl: app_const.url_front +
			"/invitation_response/" +
			usAcc._slug +
			"/invitation/" +
			inv._id
	};
	var dest = {
		name: titleCase(inv.firstname) + " " + titleCase(inv.lastname),
		email: inv.email
	};
	console.log(data_m.invitationUrl);
	return deliverEmail(subj, templ, data_m, dest);
};

module.exports.userEmailAfterApply = (usr, data) => {
	var subj = "applicationSent";
	var templ = afterUserApplyTemplate;
	var data_m = {
		username: titleCase(usr.firstname) + " " + titleCase(usr.lastname),
		title: data.t,
		org: data.ens
	};
	var dest = {
		name: titleCase(usr.firstname) + " " + titleCase(usr.lastname),
		email: usr.email
	};
	return deliverEmail(subj, templ, data_m, dest);
};

/* Capitalize all word in string */
function titleCase(str) {
	var splitStr = str.toLowerCase().split(" ");
	for (var i = 0; i < splitStr.length; i++) {
		splitStr[i] =
			splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(" ");
}

/* Real mail Service*/
function deliverEmail(subject, template, data_email, to_) {
	// body...
	const request = mailjet.post("send", {
		version: "v3.1"
	}).request({
		Messages: [{
			From: {
				Email: app_const.emails.contact,
				Name: "Business Haven"
			},
			To: [{
				Email: to_.email,
				Name: to_.name
			}],
			Subject: subject,
			TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
			HTMLPart: template.render(data_email)
		}]
	});
	return request;
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

/* get collab type from json */
var collabfile = fs.readFileSync(
	path.join(global.basedir, "/api/templates/collaboration_Type_Default.json"),
	"utf8"
);
module.exports.getCollabTypeText = type => {
	let allCollab = JSON.parse(collabfile)["default_type"];
	let curr = allCollab.filter(el => el.code == type);
	console.log(curr);
	if (curr.length) {
		if (curr[0].hasOwnProperty("text")) return curr[0].text;
		else return "no typed";
	}
	return "no";
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