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

module.exports.getTeamsFrontVideoData = async (req,res) =>{
	console.log(req.ACC);
	try {
		let allmyVideoTeamFrom = await TeamFront.find({account: req.ACC._id});
		if (allmyVideoTeamFrom) {
			sendJSONresponse(res,200, {status: 200, videoTeam: allmyVideoTeamFrom})
		}else{
			sendJSONresponse(res,200, {status: 0, videoTeam: []})
		}
	} catch(e) {
		// statements
		console.log(e);
	}
}