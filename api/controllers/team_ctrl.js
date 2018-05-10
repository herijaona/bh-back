var mongoose = require("mongoose");
var TeamFront = mongoose.model("TeamFront");

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
				massage: "modifivation reussi"
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
