var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Image = mongoose.model("Image");
var Zone = mongoose.model("Zone");
var Presentation = mongoose.model("Presentation");
var Account = mongoose.model("Account");
var ResetPassword = mongoose.model("ResetPassword");
var OrganisationInvitation = mongoose.model("OrganisationInvitation");
var mail_services = require("../services/mailing-service");
/* response sender */
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
var registerUser = async (rq, rs) => {
    var user = new User();
    user.firstname = rq.body.firstname;
    user.lastname = rq.body.lastname;
    user.email = rq.body.email;
    user.function = rq.body.function;
    user.generateActivationCode();
    user.active = false;
    user.admin_defaults = true;
    user.setPassword(rq.body.password);
    try {
        let imageDF = await Image.findOne({
            name: "DefaultsprofileImage"
        });
        if (imageDF) {
            user.imageProfile = imageDF._id;
        }
        let usr = await user.save();
        if (usr) {
            return usr;
        }
    } catch (e) {
        if (e.code == 11000) {
            sendJSONresponse(rs, 409, {
                error: true,
                text: "Email deja Utilisee"
            });
        } else {
            sendJSONresponse(rs, 500, {
                error: true,
                text: "Erreur Serveur"
            });
        }
    }
};
var registerAccount = async (rq, rs, usr) => {
    var account_ = new Account();
    account_.enseigneCommerciale = rq.body.enseigneCommerciale;
    account_.activityArea = rq.body.activityArea;
    account_.pagetoShow = '{"pMindset":true,"pTeam":true,"pSs":false,"pProjects":true}';
    account_.typeOrganisation = rq.body.typeOrganisation;
    account_.Logo = new mongoose.mongo.ObjectId(rq.body.Logo);
    account_.adresse.push(rq.body.adresse);
    account_.isActive = false;
    account_.userAdmin.push(usr.id);
    account_.usersTeam.push(usr.id);
    account_.usersCommetee.push(usr.id);
    account_.users.push(usr.id);
    let sl_ = rq.body.enseigneCommerciale.replace(/ /g, "");
    account_["_slug"] = sl_;
    var sl_dupl = 0;
    var loop_ind = true;
    while (loop_ind) {
        try {
            let acc = await account_.save();
            if (acc) {
                loop_ind = false;
                return acc;
            }
        } catch (e) {
            // statements
            console.log(e);
            if (e.code == 11000) {
                account_["_slug"] = sl_ + "_" + sl_dupl;
                sl_dupl++;
                loop_ind = true;
            } else {
                rs.status(500);
                rs.json({
                    error: true,
                    text: "Erreur Serveur"
                });
            }
        }
    }
};
var defaultDATAAcc = async (rs, ac) => {
    var pr = new Presentation();
    pr.account = ac._id;
    pr.description = "Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte";
    pr.autreDescription = "Information complementaire";
    var zn = new Zone();
    zn.caption = "Default";
    zn.account = ac._id;
    zn.dtype = 1;
    zn.canDeleted = false;
    zn.rang = 100;
    let dtz = {
        dtype: 3,
        canDeleted: false,
        caption: "_chiffres",
        data_suppl: '{}',
        account: ac._id,
        __v: 0
    };
    var znc = new Zone(dtz);
    try {
        let imageDF = await Image.findOne({
            name: "DefaultsZone"
        });
        if (imageDF) {
            zn.image = imageDF._id;
            let znD = await zn.save();
            let pre = await pr.save();
            let zne = await znc.save();
            return Promise.all([pre, znD, zne]);
        }
    } catch (e) {
        // statements
        console.log(e);
    }
};
module.exports.registerOrganisation = async (req, res) => {
    let user = await registerUser(req, res);
    let acc = await registerAccount(req, res, user);
    let createDefaultData = await defaultDATAAcc(res, acc);
    if (createDefaultData.length == 3) {
        mail_services.sendActivationMail({
            user: user,
            account: acc
        }).then(reslt => {
            if (reslt.body.Messages[0].Status == "success") {
                if ('invitationId' in req.body) {
                    invitation_Process(req.body.invitationId, acc._id, user._id);
                }
                return sendJSONresponse(res, 200, {
                    status: "OK",
                    message: "email sent",
                    user_email: user.email
                })
            }
        }, err => {
            console.log(err);
            rs.status(500);
            rs.json({
                error: true,
                text: "Erreur Serveur"
            });
        });
    }
};

var invitation_Process = async (invtID, accID, usrID) => {
    try {
        let updateInvitation = await OrganisationInvitation.findOneAndUpdate({
            _id: invtID
        }, {
            status: 'active',
            $set: {
                'dataDetails.accountCreated': accID,
                'dataDetails.userSignedUp': usrID
            },
            activeDate: Date.now()
        }, {
            new: true
        })
        return;
    } catch (e) {
        console.log(e);
        return;
    }
};

module.exports.login = function (req, res) {
    passport.authenticate("local", function (err, user, info) {
        var token;
        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }
        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                token: token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);
};
module.exports.activate_user = async (req, res) => {
    let activate_txt = req.body.activation_code;
    try {
        let usr = await User.findOne({
            activation_text: activate_txt
        });
        if (usr) {
            if (!usr["active"]) {
                usr.activate();
                let activeUsr = await usr.save();
                if (usr.admin_defaults) {
                    let acc = await Account.find({
                        userAdmin: usr._id
                    });
                    if (acc) {
                        let o = [];
                        for (let a_ of acc) {
                            let w = await Account.findByIdAndUpdate({
                                _id: a_._id
                            }, {
                                $set: {
                                    isActive: true
                                }
                            }, {
                                new: true
                            });
                            o.push(w);
                        }
                        if (o) {
                            return sendJSONresponse(res, 200, {
                                status: "OK",
                                message: "Activation successful",
                                _id: usr._id
                            });
                        }
                    }
                }
            } else {
                return sendJSONresponse(res, 200, {
                    status: "_OK",
                    message: "User already Active",
                    _id: usr._id
                });
            }
        } else {
            return sendJSONresponse(res, 200, {
                status: "NOK",
                message: "User Not Found"
            });
        }
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Erreur Server"
        });
    }
};
module.exports.requestResetPass = function (req, res) {
    if (!req.body.email) {
        res.status(404).json({
            status: "NOK",
            message: "User Not Found"
        });
    }
    var userMail = req.body.email;
    User.findOne({
        email: userMail
    }, (err, usr_) => {
        if (err) {
            res.status(404).json({
                status: "NOK",
                message: "User Not Found"
            });
        } else {
            if (usr_) {
                var resetPass = new ResetPassword();
                resetPass.iduser = usr_.id;
                resetPass.setResetCode(usr_.email);
                resetPass.save((er_, doc_reset) => {
                    if (!er_) {
                        var mail_res = mail_services.sendResetPasswordMail(usr_, doc_reset);
                        mail_res.then(result => {
                            res.status(200).json({
                                status: "OK",
                                message: "Email envoye avec success",
                                emailStatus: result.body
                            });
                        }).catch(err => {});
                    }
                });
            } else {
                res.status(200).json({
                    status: "NOK",
                    message: "Adresse email non inscrit."
                });
            }
        }
    });
};
/*  check reset pass Data */
module.exports.checkResetPass = function (req, res) {
    // body...
    if (!req.body.id_data || !req.body.code_) {
        return res.status(403).json({
            status: "NOK",
            data: "code de reset obligatoire"
        });
    } else {
        ResetPassword.findById(req.body.id_data).exec((err, doc) => {
            if (!err) {
                if (doc) {
                    if (doc.resetCode == req.body.code_) {
                        let isValid = doc.checkValidate();
                        if (isValid) {
                            sendJSONresponse(res, 200, {
                                status: "valid",
                                data: "Veuiller inserer un nouveau mot de passe - minimum 8 caracteres"
                            });
                        } else {
                            res.status(200).json({
                                status: "no-valid",
                                data: "Lien deja expiree ou deja utilise - Lien de reinitialisation de mot passe est valide 24h"
                            });
                        }
                    } else {
                        res.status(200).json({
                            status: "no-valid",
                            data: "Donnee envoyer errone"
                        });
                    }
                } else {
                    res.status(200).json({
                        status: "no-valid",
                        data: "Donnee envoyer errone"
                    });
                }
            } else {
                res.status(403).json({
                    status: "NOK",
                    data: "Donnee envoyer errone - url Erronee"
                });
            }
        });
    }
};
/* Submit new pass */
module.exports.submitNewPass = function (req, res) {
    var mdp = req.body.mdp_dump;
    var id_data = req.body.id_data;
    var code_ = req.body.code_;
    ResetPassword.findById(id_data).exec((er, doc) => {
        var step = new Promise((resolve, reject) => {
            if (!er) {
                if (doc && doc.resetCode == code_) {
                    User.findById(doc.iduser).exec((e1, d1) => {
                        if (!e1) {
                            d1.setPassword(mdp);
                            d1.save((e, r) => {
                                if (!e) {
                                    resolve(d1);
                                }
                            });
                        }
                    });
                } else {
                    res.status(404).json({
                        s: "none"
                    });
                }
            } else {
                res.status(401).json({
                    s: "none"
                });
            }
        });
        step.then(et => {
            doc.setStatus(false);
            doc.save((w, c) => {
                if (!w) {
                    /* Envoie d'email password change succefully*/
                    var em = mail_services.sendEmailPassResetednotif(et);
                    em.then(() => {
                        res.status(200).json({
                            status: "OK",
                            text: "Reinitialisation de mot de pass effectuer avec succes"
                        });
                    });
                }
            });
        });
    });
};
/* Register Member*/
module.exports.registerMember = async (req, res) => {
    let usr = await this.regUser(req, res);
    if (usr) {
        mail_services.sendActivationMail({
            user: usr,
            account: {}
        }).then(reslt => {
            if (reslt.body.Messages[0].Status == "success") {
                sendJSONresponse(res, 200, {
                    status: "OK",
                    message: "email sent",
                    user_email: usr.email
                });
            }
        }, err => {
            console.log(err);
            sendJSONresponse(res, 500, {
                error: true,
                text: "Erreur Serveur"
            });
        });
    }
};
module.exports.regUser = async (req, res) => {
    let reqDAta = req.body;
    let pass_ = reqDAta.password;
    delete reqDAta.password;
    let newUser = new User(reqDAta);
    newUser.generateActivationCode();
    newUser.active = false;
    newUser.admin_defaults = false;
    newUser.setPassword(pass_);
    try {
        let imageDF = await Image.findOne({
            name: "DefaultsprofileImage"
        });
        if (imageDF) {
            newUser.imageProfile = imageDF._id;
        }
        let usr = await newUser.save();
        if (usr) {
            return usr;
        }
    } catch (e) {
        if (e.code == 11000) {
            sendJSONresponse(res, 409, {
                error: true,
                text: "Email deja Utilisee"
            });
        } else {
            sendJSONresponse(res, 500, {
                error: true,
                text: "Erreur Serveur"
            });
        }
    }
};