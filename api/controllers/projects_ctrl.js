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

			for (pr0 in all_) {
				var m = Object.create(datSendModel);
				var send_data = tools_service.copydata(m, all_[pr0]);
				resData.push(send_data);
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

module.exports.getPrByID = async (req, res) => {
	let prID = req.query["projectID"];
	var populateQuery = [
		{ path: "listeCandidatures" },
		{ path: "createdByUser" }
	];

	let datSendModel = {
		name: "",
		_id: "",
		responseTimeUnit: "",
		responseTimeValue: 0,
		contexte: "0",
		elementProposition: "",
		listeCandidatures: "",
		objectif: ""
	};

	if (prID) {
		try {
			let prJ = await Project.findOne({ _id: prID }).populate(
				populateQuery
			);
			if (prJ) {
				console.log(prJ);
				let pp = tools_service.copydata(datSendModel, prJ);
				pp.listeCandidatures = pp.listeCandidatures.length;
				sendJSONresponse(res, 200, { status: "OK", data: pp });
			}
		} catch (e) {
			// statements
			console.log(e);
		}
	}
};
