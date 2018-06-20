var mongoose = require("mongoose");
var TeamFront = mongoose.model("TeamFront");
var tools_service = require("../services/app-general");
var mail_services = require("../services/mailing-service");
var User = mongoose.model("User");
var TeamCommunity = mongoose.model("TeamCommunity");
var InvitationSent = mongoose.model("InvitationSent");
var OrganisationInvitation = mongoose.model("OrganisationInvitation");
var Project = mongoose.model("Project");
var Account = mongoose.model("Account");
var sendJSONresponse = function (res, status, content) {
	res.status(status);
	res.json(content);
};
module.exports.saveTeamsFrontData = async (req, res) => {
	let tmF = new TeamFront(req.body);
	tmF.user = req.userDATA._id;
	tmF.account = req.ACC._id;
	tmF.dateAdd = Date.now();
	try {
		let tmN = tmF.save();
		if (tmN) {
			sendJSONresponse(res, 200, {
				status: "OK",
				message: "Reussi"
			});
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};
module.exports.getTeamsFrontVideoData = async (req, res) => {
	try {
		let allmyVideoTeamFrom = await TeamFront.find({
			account: req.ACC._id
		});
		if (allmyVideoTeamFrom) {
			sendJSONresponse(res, 200, {
				status: 200,
				videoTeam: allmyVideoTeamFrom
			});
		} else {
			sendJSONresponse(res, 200, {
				status: 0,
				videoTeam: []
			});
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
			sendJSONresponse(res, 200, {
				status: "OK",
				message: "Reussi"
			});
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
	try {
		let tmvUpdate = await TeamFront.findOneAndUpdate({
				_id: req.body.id_
			},
			req.body.dataUpdate
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

module.exports.getInvitationSent = async (req, res) => {
	try {
		let invt = await InvitationSent.find({
				account: req.ACC._id,
				status: {
					$ne: "ACTIVE"
				}
			})
			.populate([{
				path: "invintedbyUser",
				select: "lastname firstname"
			}])
			.sort([
				["dateAdd", "descending"]
			]);
		if (invt.length) {
			console.log(invt);
		}
		return sendJSONresponse(res, 200, {
			status: "OK",
			data: invt
		});
	} catch (er) {
		console.log(er);
	}
};

module.exports.inviteUserInTeam = async (req, res) => {
	let dataInvitation = req.body;
	let userData = req.userDATA;
	let userACC = req.ACC;
	try {
		// statements
		let usrOwnerMail = await User.find({
			email: req.body.email
		});
		if (usrOwnerMail.length > 0) {
			sendJSONresponse(res, 409, {
				status: "NOK",
				message: "User already registered"
			});
		} else {
			let usrOwnerMailI = await InvitationSent.find({
				email: req.body.email,
				status: "SENT",
				account: userACC._id
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
				invtation["dateAdd"] = Date.now();
				let yu = await invtation.save();
				if (yu) {
					let m = await mail_services.mailInvitations(
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

module.exports.reviveInvitations = async (req, res) => {
	let invtID = req.body.invID;
	try {
		let inv = await InvitationSent.findById(invtID).populate([{
				path: "account"
			},
			{
				path: "invintedbyUser"
			}
		]);
		console.log(inv);
		if (inv) {
			let m = await mail_services.mailInvitations(
				inv,
				inv.invintedbyUser,
				inv.account
			);
			if (m.body.Messages[0].Status == "success") {
				return sendJSONresponse(res, 200, {
					status: "OK",
					message: "Invitation Resent"
				});
			}
		}
		return sendJSONresponse(res, 404, {
			status: "NOK",
			message: "INvitation Not Found"
		});
	} catch (e) {
		console.log(e);
	}
};
module.exports.getTeamUsers = async (req, res) => {
	let a = req.ACC;
	try {
		let acc = await Account.populate(a, {
			path: "users"
		});
		if (acc) {
			let ll = [];
			for (let eo of acc.users) {
				if (eo.active) {
					let s = {};
					s["name_"] = eo.lastname + " " + eo.firstname;
					s["_id"] = eo._id;
					s["fn"] = eo.function != undefined ? eo.function : "";
					ll.push(s);
				}
			}
			sendJSONresponse(res, 200, {
				status: "OK",
				data: ll
			});
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};
module.exports.getTeamUsersDetails = async (req, res) => {
	let i = req.query.id_user;
	let acc = req.query.accountID;
	try {
		let u = await User.findOne({
			_id: i
		});
		let aa = await Account.findById(acc, "enseigneCommerciale");
		if (u) {
			let detl = {
				usr: u.firstname + " " + u.lastname,
				fn: u["function"],
				acc: aa.enseigneCommerciale
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

module.exports.getteamsUsersData = async (req, res) => {
	let usrAdm = req.ACC.userAdmin;
	let usrCom = req.ACC.usersCommetee;
	try {
		let popAcc = await Account.populate(req.ACC, [{
			path: "users",
			populate: {
				path: "imageProfile"
			}
		}]);
		if (popAcc) {
			let ll = [];
			let ll_in = [];
			let o_com = userAdmProcess(ll, ll_in, usrAdm, usrCom, popAcc.users);
			return sendJSONresponse(res, 200, {
				status: "OK",
				message: "DataOK",
				data: o_com.ll
			});
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};
var userAdmProcess = (l, l_in, usrAdm, usrCom, usrTab) => {
	var usr = {
		_id: "",
		lastname: "",
		firstname: "",
		email: "",
		function: "",
		imageProfile: "",
		isAdm: false,
		isComm: false
	};
	for (let va of usrTab) {
		if (!tools_service.inArray(va._id, l_in)) {
			var m = Object.create(usr);
			let rp = tools_service.copydata(m, va);
			if (rp.imageProfile) {
				rp.imageProfile = tools_service.media_url(rp.imageProfile.url);
			}
			rp.isAdm = tools_service.inArray(rp._id, usrAdm);
			rp.isComm = tools_service.inArray(rp._id, usrCom);
			l_in.push(rp._id);
			l.push(rp);
		}
	}
	return {
		ll: l,
		ll_in: l_in
	};
};
module.exports.changeAdmRole = async (req, res) => {
	let reqData = req.body;
	let acc_id = req.ACC._id;
	try {
		let admin_defaults = await User.findById(reqData._id, "admin_defaults");
		if (admin_defaults) {
			if ("admin_defaults" in admin_defaults) {
				if (admin_defaults["admin_defaults"] && reqData.reg == "adm") {
					return sendJSONresponse(res, 200, {
						status: "OK"
					});
				}
			}
		}
		let updateData = {};
		let upAcc;
		if (reqData.reg == "adm") {
			updateData = {
				userAdmin: reqData._id,
				usersTeam: reqData._id
			};
		} else if (reqData.reg == "com") {
			updateData = {
				usersCommetee: reqData._id
			};
		}
		if (reqData.value == true) {
			upAcc = await Account.findByIdAndUpdate(
				acc_id, {
					$push: updateData
				}, {
					new: true
				}
			);
		} else {
			upAcc = await Account.findByIdAndUpdate(
				acc_id, {
					$pull: updateData
				}, {
					new: true
				}
			);
		}
		if (upAcc) {
			return sendJSONresponse(res, 200, {
				status: "OK",
				message: "Success",
				data: {
					acc: req.ACC,
					usr: req.userDATA
				}
			});
		}
	} catch (e) {
		// statements
		sendJSONresponse(res, 500, {
			status: "NOK"
		});
		console.log(e);
	}
};

module.exports.deleteUserFromTeam = async (req, res) => {
	let reqData = req.body;
	let acc_id = req.ACC._id;
	try {
		let admin_defaults = await User.findById(
			reqData.usr_id,
			"admin_defaults"
		);
		if (admin_defaults) {
			if ("admin_defaults" in admin_defaults) {
				if (admin_defaults["admin_defaults"]) {
					return sendJSONresponse(res, 200, {
						status: "OK"
					});
				}
			}
		}
		let upAcc = await Account.findByIdAndUpdate(
			acc_id, {
				$pull: {
					users: reqData.usr_id,
					userAdmin: reqData.usr_id,
					usersTeam: reqData.usr_id
				}
			}, {
				new: true
			}
		);
		if (upAcc) {
			return sendJSONresponse(res, 200, {
				status: "OK",
				message: "Deleted"
			});
		}
	} catch (e) {}
};

module.exports.getTeamCommunity = async (req, res) => {
	try {
		let sPop = await TeamCommunity.findOne({
			account: req.ACC._id
		}).populate([{
			path: "users.us",
			select: "firstname lastname email imageProfile function",
			populate: {
				path: "imageProfile"
			}
		}]);

		console.log(sPop);
		let aftCh = [];
		if (sPop) {
			let ret = sPop.users;
			for (let ds of ret) {
				console.log(ds.us);
				let comUser = JSON.parse(JSON.stringify(ds));
				let oo = JSON.parse(JSON.stringify(ds.us));

				oo.imageProfile = tools_service.media_url(
					ds.us.imageProfile.url
				);

				comUser["us"] = oo;
				let enseigneCommercialeOrg = await Account.findOne({
						users: ds.us._id
					},
					"enseigneCommerciale"
				);
				if (enseigneCommercialeOrg) {
					comUser["org"] =
						enseigneCommercialeOrg["enseigneCommerciale"];
				}

				if (comUser.last_act == "application") {
					let prDa = await Project.findById(
						comUser.last_objData,
						"name"
					);
					comUser.lastPrName = prDa.name;
				}
				aftCh.push(comUser);
			}
			let rrt = {
				users: aftCh,
				_id: sPop._id,
				account: sPop.account
			};
			return sendJSONresponse(res, 200, {
				status: "OK",
				data: rrt
			});
		}
		return sendJSONresponse(res, 200, {
			status: "NOK",
			message: "any user found"
		});
	} catch (e) {
		// statements
		console.log(e);
	}
};

module.exports.sendOrgInvitations = async (req, res) => {
	let orgDATA = req.body.org_data;
	try {
		let resForAll = [];
		for (let invt of orgDATA) {
			let status = '';
			let userExist = await User.findOne({
				email: invt.invitation_email
			});
			if (userExist) {
				status = {
					value: 'NOK',
					motif: 'User Already has account'
				};
			} else {
				let alreadyInvited = await OrganisationInvitation.find({
					byAccount: req.ACC._id,
					byUser: req.userDATA,
					'dataDetails.invitation_email': invt.invitation_email
				});
				if (alreadyInvited.length > 0) {
					status = {
						value: 'NOK',
						motif: 'User Already invited'
					};
				} else {
					let nInv = new OrganisationInvitation({
						dataDetails: invt
					});
					nInv.byAccount = req.ACC._id;
					nInv.byUser = req.userDATA._id;
					nInv.status = 'sent';
					nInv.sendDate = Date.now();
					let nn = await nInv.save();
					if (nn) {
						let datMail = {
							invetedData: invt,
							byAccount: req.ACC,
							byUser: req.userDATA,
							id: nn._id
						}
						let resp = await mail_services.sendOrgInvitationEmail(datMail);
						if (resp.body.Messages[0].Status == "success") {
							status = {
								value: 'OK',
								motif: 'User invited and mail succesfully send'
							};
						}
					}
				}
			}
			resForAll.push({
				objInv: invt,
				res_value: status
			})
		}
		return sendJSONresponse(res, 200, {
			status: "OK",
			data: resForAll
		});
	} catch (e) {
		console.log(e);
		return sendJSONresponse(res, 500, {
			status: "NOK",
			message: "error server"
		})
	}
};

module.exports.ckeckInvitationsOrg = async (req, res) => {
	let invtID = req.query['invitID'];
	let retData = {};
	try {
		let ivn = await OrganisationInvitation.findOne({
			_id: invtID
		}).populate([{
			path: 'byAccount',
			select: 'enseigneCommerciale'
		}, {
			path: 'byUser',
			select: 'lastname firstname function'
		}]);
		if (ivn) {
			if (ivn.status == 'sent') {
				retData = {
					status: 'OK',
					data: ivn
				};
			} else {
				retData = {
					status: 'NOK',
					message: 'Invitation already used'
				}
			}
		} else {
			retData = {
				status: 'NOK',
				message: 'Invitation NOT FOUND'
			}
		}
		return sendJSONresponse(res, 200, retData);
	} catch (e) {
		console.log(e);
	}
}

module.exports.getInProgressOrgInvitation = async (req, res) => {
	let accID = req.ACC._id;
	try {
		let list = await OrganisationInvitation.find({
			byAccount: accID,
			status: 'sent'
		}, 'dataDetails byUser').populate([{
			path: 'byUser',
			select: 'firstname lastname function'
		}]).sort([
			['sendDate', 'descending']
		]);

		return sendJSONresponse(res, 200, {
			status: 'OK',
			data: list
		})


	} catch (e) {
		console.log(e);
		return sendJSONresponse(res, 500, {
			status: 'NOK',
			message: 'Error server'
		})
	}
}