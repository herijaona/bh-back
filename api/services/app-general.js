const path = require("path");
var Hogan = require("hogan.js");
var fs = require("fs");
var app_const = require(path.join(global.basedir, "/api/config/constant"));

var templateActivation = fs.readFileSync(
	app_const.templatesPath + "/mails/activation.hjs",
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

module.exports.sendActivationMail = function(argMail) {
	var data_email = {
		name:
			titleCase(argMail.user.firstname) +
			" " +
			titleCase(argMail.user.lastname),
		url_activation:
			app_const.url_front + "/activate/" + argMail.user.activation_text,
		sitename: app_const.name
	};

	var templ = activationTemplate;
	var dest = {
		name: data_email.name,
		email: argMail.user.email
	};
	console.log(data_email.url_activation);

	return deliverEmail(templ, data_email, dest);
};

module.exports.sendResetPasswordMail = function(u, d) {
	var templ = resetPassTemplate;
	var data_m = {
		sitename: app_const.name,
		url_reset:
			app_const.url_front + "/reset-my-pass/" + d._id + "/" + d.resetCode
	};
	var dest = {
		name: titleCase(u.firstname) + " " + titleCase(u.lastname),
		email: u.email
	};
	console.log(data_m.url_reset);
	return deliverEmail(templ, data_m, dest);
};

module.exports.sendEmailPassResetednotif = function(u) {
	var templ = notifresetPassTemplate;
	var data_m = {
		username: titleCase(u.firstname) + " " + titleCase(u.lastname)
	};
	var dest = {
		name: titleCase(u.firstname) + " " + titleCase(u.lastname),
		email: u.email
	};
	return deliverEmail(templ, data_m, dest);
};


/* Copy data between object */
module.exports.copydata = function(model, source) {
	var k2 = JSON.parse(JSON.stringify(source));
	Object.keys(k2).forEach(function(keyn) {
		if (keyn in model) {
			model[keyn] = k2[keyn];
		}
	});
	return model;
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
function deliverEmail(template, data_email, to_) {
	// body...
	const request = mailjet.post("send", { version: "v3.1" }).request({
		Messages: [
			{
				From: {
					Email: app_const.emails.contact,
					Name: "Team Vitasoft"
				},
				To: [
					{
						Email: to_.email,
						Name: to_.name
					}
				],
				Subject: "Your email flight plan!",
				TextPart:
					"Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
				HTMLPart: template.render(data_email)
			}
		]
	});
	return request;
}
