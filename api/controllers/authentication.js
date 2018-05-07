var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Image = mongoose.model("Image");
var Zone = mongoose.model("Zone");
var Presentation = mongoose.model("Presentation");
var Account = mongoose.model("Account");
var ResetPassword = mongoose.model("ResetPassword");
var gen_services = require("../services/app-general");
var CryptoJS = require("crypto-js");

var sendJSONresponse = function(res, status, content) {
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
  user.setPassword(rq.body.password);
  try {
    let usr = await user.save();
    if (usr) {
      return usr;
    }
  } catch (e) {
    if (e.code == 11000) {
      rs.status(409);
      rs.json({
        error: true,
        text: "Email deja Utilisee"
      });
    } else {
      rs.status(500);
      rs.json({
        error: true,
        text: "Erreur Serveur"
      });
    }
  }
};

var registerAccount = async (rq, rs, usr) => {
  var account_ = new Account();
  account_.enseigneCommerciale = rq.body.enseigneCommerciale;
  account_.raisonSociale = rq.body.raisonSociale;
  account_.pagetoShow =
    '{"pMindset":true,"pTeam":false,"pSs":false,"pIdeas":false,"pMeeting":false,"pProjects":false}';
  account_.typeOrganisation = rq.body.typeOrganisation;
  account_.Logo = new mongoose.mongo.ObjectId(rq.body.Logo);
  account_.adresse.push(rq.body.adresse);
  account_.userAdmin.push(usr.id);
  account_.users.push(usr.id);
  sl_ = rq.body.enseigneCommerciale.replace(/ /g, "");
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
  pr.description =
    "Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte";
  pr.autreDescription = "Information complementaire";

  var zn = new Zone();
  zn.caption = "Default";
  zn.account = ac._id;
  zn.dtype = 1;
  zn.canDeleted = false;
  zn.rang = 100;

  try {
    let imageDF = await Image.findOne({ name: "DefaultsZone" });
    if (imageDF) {
      zn.image = imageDF._id;
      let znD = await zn.save();
      let pre = await pr.save();
      return Promise.all([pre, znD]);
    }
  } catch (e) {
    // statements
    console.log(e);
  }
};

module.exports.register = async (req, res) => {
  let user = await registerUser(req, res);
  let acc = await registerAccount(req, res, user);
  let createDefaultData = await defaultDATAAcc(res, acc);

  console.log("Defaults Data");
  console.log(createDefaultData);
  console.log("---- Data --- ");
  let resEmail = gen_services
    .sendActivationMail({
      user: user,
      account: acc
    })
    .then(
      reslt => {
        console.log(reslt.body.Messages[0].Status == "success");
        if (reslt.body.Messages[0].Status == "success") {
          res.status(200);
          res.json({
            status: "OK",
            message: "email sent",
            user_email: user.email
          });
        }
      },
      err => {
        console.log(err);
        rs.status(500);
        rs.json({
          error: true,
          text: "Erreur Serveur"
        });
      }
    );
};

module.exports.login = function(req, res) {
  passport.authenticate("local", function(err, user, info) {
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

module.exports.activate_user = function(req, res) {
  // var User_ = new User();
  User.findOne({ activation_text: req.body.activation_code }, function(
    err,
    doc
  ) {
    if (!err) {
      // var u_ = new User(doc);
      if (!doc.active) {
        doc.activate();
        doc.save(function(err) {
          res.status(200);
          res.json({
            status: "OK",
            message: "Activation successful",
            _id: doc._id
          });
        });
      } else {
        res.status(200);
        res.json({
          status: "_OK",
          message: "User already Active",
          _id: doc._id
        });
      }
    } else {
      res.status(200);
      res.json({
        status: "NOK",
        message: "User Not Found"
      });
    }
  });
};

module.exports.requestResetPass = function(req, res) {
  if (!req.body.email) {
    res.status(404).json({
      status: "NOK",
      message: "User Not Found"
    });
  }
  var userMail = req.body.email;
  User.findOne({ email: userMail }, (err, usr_) => {
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
            var mail_res = gen_services.sendResetPasswordMail(usr_, doc_reset);
            mail_res
              .then(result => {
                res.status(200).json({
                  status: "OK",
                  message: "Email envoye avec success",
                  emailStatus: result.body
                });
              })
              .catch(err => {});
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
module.exports.checkResetPass = function(req, res) {
  // body...
  if (!req.body.id_data || !req.body.code_) {
    res.status(403).json({ status: "NOK", data: "code de reset obligatoire" });
  } else {
    ResetPassword.findById(req.body.id_data).exec((err, doc) => {
      if (!err) {
        if (doc) {
          if (doc.resetCode == req.body.code_) {
            isValid = doc.checkValidate();
            if (isValid) {
              res.status(200).json({
                status: "valid",
                data:
                  "Veuiller inserer un nouveau mot de passe - minimum 8 caracteres"
              });
            } else {
              res.status(200).json({
                status: "no-valid",
                data:
                  "Lien deja expiree ou deja utilise - Lien de reinitialisation de mot passe est valide 24h"
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
        res
          .status(403)
          .json({ status: "NOK", data: "Donnee envoyer errone - url Erronee" });
      }
    });
  }
};

/* Submit new pass */

module.exports.submitNewPass = function(req, res) {
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
          res.status(404).json({ s: "none" });
        }
      } else {
        res.status(401).json({ s: "none" });
      }
    });
    step.then(et => {
      doc.setStatus(false);
      doc.save((w, c) => {
        if (!w) {
          /* Envoie d'email password change succefully*/
          var em = gen_services.sendEmailPassResetednotif(et);
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
