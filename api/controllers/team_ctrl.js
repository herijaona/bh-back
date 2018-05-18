var mongoose = require("mongoose");
var TeamFront = mongoose.model("TeamFront");
var tools_service = require("../services/app-general");
var User = mongoose.model("User");
var InvitationSent = mongoose.model("InvitationSent");
var Account = mongoose.model("Account");

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.saveTeamsFrontVideoData = async (req, res) => {
	let tmF = new TeamFront(req.body);
	tmF.user = req.userDATA._id;
	tmF.account = req.ACC._id;
	try {
		let tmN = tmF.save();
		if (tmN) {
			sendJSONresponse(res, 200, { status: "OK", message: "Reussi" });
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

module.exports.getTeamsFrontVideoData = async (req, res) => {
	console.log(req.ACC);
	try {
		let allmyVideoTeamFrom = await TeamFront.find({ account: req.ACC._id });
		if (allmyVideoTeamFrom) {
			sendJSONresponse(res, 200, {
				status: 200,
				videoTeam: allmyVideoTeamFrom
			});
		} else {
			sendJSONresponse(res, 200, { status: 0, videoTeam: [] });
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

module.exports.deleteTeamsFrontVideoData = async (req, res) => {
	let tmv = req.body["tm_video_id"];
	try {
		let tmv_rem = await TeamFront.findById(tmv).remove();
		if (tmv_rem) {
			console.log(tmv_rem);
			sendJSONresponse(res, 200, { status: "OK", message: "Reussi" });
		} else {
			sendJSONresponse(res, 500, {
				status: "NOK",
				message: "Erreur au du traitement",
				data: e.error
			});
		}
	} catch (e) {
		console.log(e);
		sendJSONresponse(res, 500, {
			status: "NOK",
			message: "Erreur",
			data: e.error
		});
	}
};

module.exports.updateTeamsFrontVideoData = async (req, res) => {
	console.log(req.body);
	try {
		let tmvUpdate = await TeamFront.findOneAndUpdate(
			{ _id: req.body.id_ },
			req.body.data
		);
		if (tmvUpdate) {
			sendJSONresponse(res, 200, {
				status: "OK",
				massage: "modification reussi"
			});
		} else {
			sendJSONresponse(res, 500, {
				status: "NOK",
				message: "Erreur survenue au cous de l'operation"
			});
		}
	} catch (e) {
		// statements
		console.log(e);
		sendJSONresponse(res, 500, {
			status: "NOK",
			message: "Erreur survenue au cous de l'operation",
			data: e.error
		});
	}
};

module.exports.inviteUserInTeam = async (req, res) => {
	let dataInvitation = req.body;
	let userData = req.userDATA;
	let userACC = req.ACC;

	try {
		// statements
		let usrOwnerMail = await User.find({ email: req.body.email });
		console.log(usrOwnerMail);
		if (usrOwnerMail.length > 0) {
			sendJSONresponse(res, 409, {
				status: "NOK",
				message: "User already registered"
			});
		} else {
			let usrOwnerMailI = await InvitationSent.find({
				email: req.body.email,
				status: "SENT"
			});
			if (usrOwnerMailI.length > 0) {
				sendJSONresponse(res, 409, {
					status: "NOK",
					message: "User already Invited"
				});
			} else {
				let invtation = new InvitationSent(dataInvitation);
				invtation["account"] = userACC._id;
				invtation["invintedbyUser"] = userData._id;
				invtation["status"] = "SENT";
				invtation["DateAdd"] = Date.now();

				let yu = await invtation.save();
				if (yu) {
					let m = await tools_service.mailInvitations(
						yu,
						userData,
						userACC
					);
					if (m.body.Messages[0].Status == "success") {
						sendJSONresponse(res, 200, {
							status: "OK",
							message: "Email d'invitation envoyE"
						});
					}
				}
			}
		}
	} catch (e) {
		// statements
		console.log(e);
		sendJSONresponse(res, 500, {
			status: "NOK",
			message: "Erreur serveur"
		});
	}
};

module.exports.getTeamUsers = async (req, res) => {
	let a = req.ACC;
	try {
		let acc = await Account.populate(a, { path: "users" });
		if (acc) {
			let ll = [];
			for (eo of acc.users) {
				if (eo.active) {
					let s = {};
					s["name_"] = eo.lastname + " " + eo.firstname;
					s["_id"] = eo._id;
					s["fn"] = eo.function != undefined ? eo.function : "";
					ll.push(s);
				}
			}
			sendJSONresponse(res, 200, { status: "OK", data: ll });
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

module.exports.getTeamUsersDetails = async (req, res) => {
	let i = req.query.id_user;
	try {
		let u = await User.findOne({ _id: i });
		if (u) {

			let detl = {
				usr: u.firstname + " " + u.lastname,
				fn: u["function"]
			};

			sendJSONresponse(res, 200, {
				status: "OK",
				message: "valid",
				data: detl
			});
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};
