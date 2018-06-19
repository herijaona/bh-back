var mongoose = require('mongoose');
var User = mongoose.model('User');
var tools_service = require('../services/app-general');
var mail_services = require('../services/mailing-service');
var Account = mongoose.model('Account');
var InvitationSent = mongoose.model('InvitationSent');
var userTosend = {
	_id: '',
	active: false,
	function: '',
	email: '',
	lastname: '',
	firstname: '',
	isAdmin: false,
	imageProfile: '',
};

var sendJSONresponse = function (res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.profileRead = async function (req, res) {
	if (!req.payload._id) {
		return res.status(401).json({
			message: 'UnauthorizedError: private profile',
			Error: 'Any data for you',
		});
	}

	try {


	} catch (e) {
		console.log(e);
	}



	User.findById(req.payload._id)
		.populate([{
			path: 'imageProfile',
		}, ])
		.exec(function (err, user) {
			var send_data = tools_service.copydata(userTosend, user);
			Account.find({
					userAdmin: send_data._id,
				},
				(err, resp) => {
					if (err) {
						res.status(200).json(send_data);
					} else {
						var ws = [];
						resp.forEach(function (adm) {
							var ino = {
								_id: adm._id,
								name: adm.enseigneCommerciale,
							};
							ws.push(ino);
						});
						send_data.accountAdmin = ws;
						/*to delete before pushing*/
						console.log(user);
						if ('imageProfile' in user) {
							send_data['imageProfile'] = tools_service.media_url(user['imageProfile'].url);
						}
						send_data.isAdmin = true;
						res.status(200).json(send_data);
					}
				}
			);
		});
};
// Edit Password
module.exports.editpass = function (req, res) {
	var _u = new User();
	User.findOne({
			email: req.payload.email,
		},
		function (err, user) {
			_u = user;
			_u.setPassword(req.body.password);
			_u.save(function (e_, u_) {
				if (!e_) {
					res.status(200).json(u_);
				} else {
					res.status(404).json({
						message: 'save error',
						Error: 'Any data save error',
					});
				}
			});
		}
	);
};
//Edit Profile
module.exports.editprofile = async function (req, res) {
	if (!req.payload._id) {
		res.status(401).json({
			message: 'UnauthorizedError: private profile',
			Error: 'Any data for you',
		});
	}
	let bodyData = req.body;
	try {
		let usr = await User.findOneAndUpdate({
				email: req.payload.email,
			},
			bodyData, {
				new: true,
			}
		);
		if (usr) {
			var m = Object.create(userTosend);
			let send_data = tools_service.copydata(m, usr);
			if ('imageProfile' in Object.keys(usr)) {
				send_data['imageProfile'] = tools_service.media_url(send_data['imageProfile'].url);
			}
			delete send_data.isAdmin;
			res.status(200).json({
				status: 'OK',
				message: 'mis a jour reussi',
				data: send_data,
			});
		}
	} catch (e) {
		// statements
		console.log(e);
		res.status(500).json({
			status: 'NOK',
			message: 'Error',
		});
	}
};
module.exports.checkInvitationVal = async (req, res) => {
	let invtID = req.query['invitId'];
	var populateQuery = [{
			path: 'account',
		},
		{
			path: 'invintedbyUser',
		},
	];
	try {
		let invt = await InvitationSent.findById(invtID).populate(populateQuery);
		if (invt) {
			if (invt.status == 'SENT') {
				var a = invt.account;
				var u = invt.invintedbyUser;
				var m = {
					_id: '',
					lastname: '',
					firstname: '',
					invAsTeam: false,
					invAsComm: false,
					email: '',
					DateAdd: '',
					accountN: '',
					userINVT: '',
				};
				var e = tools_service.copydata(m, invt);
				e.accountN = a.enseigneCommerciale;
				e.userINVT = u.firstname + ' ' + u.lastname;
				res.status(200).json({
					status: 'OK',
					message: 'Valid',
					data: e,
				});
			} else {
				res.status(404).json({
					status: 'NOK',
					message: 'Invitation no valid',
				});
			}
		} else {
			res.status(404).json({
				status: 'NOK',
				message: 'Invitation no valid',
			});
		}
	} catch (e) {
		// statements
		res.status(500).json({
			status: 'NOK',
			message: 'Invitation no valid',
		});
		console.log(e);
	}
};
module.exports.PostInvitationVal = async (req, res) => {
	let dtaInvt = req.body.user_new;
	let dtaPass = req.body.new_pass;
	let user_dat = {
		lastname: dtaInvt.lastname,
		firstname: dtaInvt.firstname,
		email: dtaInvt.email,
	};
	let newUser = new User(user_dat);
	newUser.setPassword(dtaPass);
	newUser.generateActivationCode();
	try {
		let imageDF = await Image.findOne({
			name: "DefaultsprofileImage"
		});
		if (imageDF) {
			newUser.imageProfile = imageDF._id;
		}
		let nUser = await newUser.save();
		if (nUser) {
			let inv = await InvitationSent.findById(dtaInvt._id);
			if (inv) {
				let acc_id = inv.account;
				let updateData = {};
				if (dtaInvt.invAsTeam) {
					updateData['userAdmin'] = nUser._id;
					updateData['usersTeam'] = nUser._id;
				}
				if (dtaInvt.invAsComm) {
					updateData['usersCommetee'] = nUser._id;
				}
				updateData['users'] = nUser._id;
				let acc = await Account.findByIdAndUpdate(
					acc_id, {
						$push: updateData,
					}, {
						new: true,
					}
				);
				if (acc) {
					let invs = await inv.update({
						status: 'ACTIVE',
					});
					let mailRes = await mail_services.sendActivationMail({
						user: nUser,
					});
					if (mailRes.body.Messages[0].Status == 'success') {
						return res.status(200).json({
							status: 'OK',
							message: 'Compte cree avec success',
							data: nUser.email,
						});
					}
				}
			}
		}
	} catch (e) {
		// statements
		console.log(e);
	}
};


module.exports.DataRole = async (req, res) => {
	try {
		let roleData = {
			hsAc: false
		}
		let accUserAdminIn = await Account.find({
			userAdmin: req.userDATA._id
		}, '_slug')
		let accUserComm = await Account.find({
			usersCommetee: req.userDATA._id
		}, '_slug');
		roleData['isAdm'] = false;
		if (accUserAdminIn.length > 0) {
			roleData['hsAc'] = true;
			roleData['isAdm'] = true;
			roleData['admAc'] = accUserAdminIn;
		}
		roleData['isInCom'] = false;
		if (accUserComm.length > 0) {
			roleData['hsAc'] = true;
			roleData['isInCom'] = true;
			roleData['inCom'] = accUserComm;
		}

		return sendJSONresponse(res, 200, {
			status: 'OK',
			data: roleData
		})

	} catch (err) {
		console.log(err);
		return sendJSONresponse(res, 500, {
			status: "NOK",
			message: 'Error Server'
		})
	}
}