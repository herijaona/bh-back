var helper = require("sendgrid").mail;
const path = require("path");
var Hogan = require("hogan.js");
var fs = require("fs");
var app_const = require(path.join(global.basedir, "/api/config/constant"));
var templateActivation = fs.readFileSync(
	app_const.templatesPath + "/mails/activation.hjs",
	"utf-8"
);
const mailjet = require("node-mailjet").connect(
	app_const.mailjet.api_pub,
	app_const.mailjet.api_priv
);
var compiledTemplate = Hogan.compile(templateActivation);

module.exports.sendMail = function(argMail) {
	/**
	 *
	 * This call sends a message to one recipient.
	 *
	 */
	var data_email = {
		name:
			titleCase(argMail.user.firstname) +
			" " +
			titleCase(argMail.user.lastname),
		url_activation:
			app_const.url_front + "/activate/" + argMail.user.activation_text,
		sitename: app_const.name
	};

	console.log(data_email.url_activation);

	const request = mailjet.post("send", { version: "v3.1" }).request({
		Messages: [
			{
				From: {
					Email: app_const.emails.contact,
					Name: "Team Vitasoft"
				},
				To: [
					{
						Email: argMail.user.email,
						Name: "passenger 1"
					}
				],
				Subject: "Your email flight plan!",
				TextPart:
					"Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
				HTMLPart: compiledTemplate.render(data_email)
			}
		]
	});
	return request;
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
