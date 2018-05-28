var mongoose = require("mongoose");
var User = mongoose.model("User");
var tools_service = require("../services/app-general");
var TeamFront = mongoose.model("TeamFront");
var Candidature = mongoose.model("Candidature");
var Account = mongoose.model("Account");
var Project = mongoose.model("Project");

var ctrlQuestions = require("./questions_ctrl");

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
				contexte: "",
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
		objectif: "",
		account: ""
	};

	if (prID) {
		try {
			let prJ = await Project.findOne({ _id: prID }).populate(
				populateQuery
			);
			if (prJ) {
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
module.exports.updateProjects = async (req, res) => {
	let pr_id = req.body.id_;
	let acc_id = req.ACC._id;

	try {
		let resUpdate = await Project.findOneAndUpdate(
			{
				_id: pr_id,
				account: acc_id
			},
			req.body.edited,
			{ new: true }
		);
		if (resUpdate) {
			sendJSONresponse(res, 200, {
				status: "OK",
				message: "Reussi",
				data: resUpdate
			});
		}
	} catch (e) {
		console.log(e);
		sendJSONresponse(res, 500, { status: "NOK", message: "Error server" });
	}
};

module.exports.deleteProjects = async (req, res) => {
	let prDel = req.body;
	let acc = req.ACC;

	try {
		let resDel = await Project.findOneAndRemove({
			_id: prDel._id,
			account: acc._id
		});
		sendJSONresponse(res, 200, { status: "OK", message: "reussi" });
	} catch (e) {
		// statements
		console.log(e);
		sendJSONresponse(res, 500, {
			status: "NOK",
			message: "Error serveur"
		});
	}
};

module.exports.applyToProjects = async (req, res) => {
	let dataPr = req.body.currObj;
	console.log(dataPr);
	let applData = req.body.data;
	try {
		let cndt = new Candidature(applData);
		cndt.accountID = dataPr["account"];
		cndt.createdAt = Date.now();
		cndt.userID = req.userDATA._id;
		cndt.projectID = dataPr._id;
		cndt.status = "NEW";
		let cndt_appl = await cndt.save();
		if (cndt_appl) {
			sendApplyEmail(req.userDATA, dataPr);
			sendJSONresponse(res, 200, {
				status: "OK",
				message: "saved",
				data: {}
			});
			ctrlQuestions.addToComminity(
				dataPr["account"],
				req.userDATA._id,
				"application"
			);
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

var sendApplyEmail = async (userDATA, dataPr) => {
	try {
		let acc = await Account.findById(dataPr.account);
		if (acc) {
			tools_service.userEmailAfterApply(userDATA, {
				ens: acc.enseigneCommerciale,
				t: dataPr.name
			});

			let Accuser = await acc.populate({ path: "userAdmin" });
		} else {
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};

module.exports.getAllCompanyProjectApplication = async (req, res) => {
	let accId = req.ACC._id;
	try {
		let allApplication = await Candidature.find({
			accountID: accId
		}).populate([{ path: "userID" }, { path: "projectID" }]);
		let applresp = [];
		if (allApplication) {
			for (aa of allApplication) {
				let d = new Date(aa.createdAt);
				let ensc = "";
				let enseigneCommercialeOrg = await Account.findOne(
					{ users: aa.userID._id },
					"enseigneCommerciale"
				);
				if (enseigneCommercialeOrg) {
					ensc = enseigneCommercialeOrg["enseigneCommerciale"];
				}
				let appl_ = {
					_id: aa._id,
					hour: d.toTimeString().split(" ")[0],
					date: d.toDateString(),
					usr: {
						name: aa.userID.lastname + " " + aa.userID.firstname,
						email: aa.userID.email,
						org: ensc
					},
					prjt: {
						_id: aa.projectID._id,
						name: aa.projectID.name
					}
				};

				applresp.push(appl_);
			}
		}
		return sendJSONresponse(res, 200, {
			status: "OK",
			data: applresp
		});
	} catch (e) {
		// statements
		console.log(e);
	}
};

module.exports.getProjectApplicationDetails = async (req, res) => {
	let applID = req.query.applID;
	try {
		let allApplDetails = await Candidature.findById(applID).populate([
			{ path: "userID", populate: { path: "imageProfile" } },
			{
				path: "projectID",
				populate: [{ path: "createdByUser" }, { path: "account" }]
			}
		]);
		if (allApplDetails) {
			let d = new Date(allApplDetails.createdAt);
			let ensc = "";
			let enseigneCommercialeOrg = await Account.findOne(
				{ users: allApplDetails.userID._id },
				"enseigneCommerciale"
			);
			if (enseigneCommercialeOrg) {
				ensc = enseigneCommercialeOrg["enseigneCommerciale"];
			}
			let retDetails = {
				_id: allApplDetails._id,
				hour: d.toTimeString().split(" ")[0],
				date: d.toDateString(),
				usr: {
					_id: allApplDetails.userID._id,
					name:
						allApplDetails.userID.lastname +
						" " +
						allApplDetails.userID.firstname,
					email: allApplDetails.userID.email,
					org: ensc,
					function: allApplDetails.userID.function,
					imageProfile : tools_service.media_url(allApplDetails.userID.imageProfile.url)
				},
				projet: {
					_id: allApplDetails.projectID._id,
					name: allApplDetails.projectID.name,
					accSlug: allApplDetails.projectID.account._slug,
					byUser: allApplDetails.projectID.createdByUser.lastname+' '+allApplDetails.projectID.createdByUser.firstname
				},
				applDetail: {
					mainActivityDomain: allApplDetails.mainActivityDomain,
					secondaryActivityDomain:
						allApplDetails.secondaryActivityDomain,
					skillnCompent: allApplDetails.skillnCompent,
					userActivityDescrib: allApplDetails.userActivityDescrib,
					dataSuppl: allApplDetails.dataSuppl
				}
			};

			return sendJSONresponse(res, 200, {
				status: "OK",
				data: retDetails,
				v: allApplDetails
			});
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};
