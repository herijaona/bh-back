var tools_service = require("../services/app-general");
var mongoose = require("mongoose");
var TeamFront = mongoose.model("TeamFront");
var Project = mongoose.model("Project");

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.saveProjectsDATA = async (req, res) => {
	// console.log(req.body, req.ACC, req.userDATA);
	let prDATA = req.body;
	prDATA["account"] = req.ACC._id;
	prDATA["createdByUser"] = req.userDATA._id;

	try {
		let pr = new Project(prDATA);
		let sv = await pr.save();
		if (sv) {
			sendJSONresponse(res, 200, {
				status: "OK",
				message: "Reussi",
				data: sv
			});
		}
	} catch (e) {
		console.log(e);
		sendJSONresponse(res, 500, { status: "NOK", message: "Error serveur" });
	}
};

module.exports.getAllProjectsCompany = async (req, res) => {
	let acc_curr = req.ACC;
	/*var populateQuery = [
		{ path: "listeCandidatures" },
		{ path: "createdByUser" }
	];*/
	try {
		let all_ = await Project.find({ account: acc_curr });
		if (all_) {
			let datSendModel = {
				name: "",
				_id: "",
				responseTimeUnit: "",
				responseTimeValue: 0
			};

			let resData = [];

			for (pr0 of all_) {
				let r = tools_service.copydata(datSendModel, pr0);
				resData.push(r);
			}

			sendJSONresponse(res, 200, {
				status: "OK",
				message: "List",
				data: resData
			});
		}
	} catch (e) {
		sendJSONresponse(res, 500, { status: "NOK", message: "error" });
		console.log(e);
	}
};
