var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Presentation = mongoose.model("Presentation");
var Account = mongoose.model("Account");
var ResetPassword = mongoose.model("ResetPassword");
var gen_services = require("../services/app-general");
var CryptoJS = require("crypto-js");

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  var user = new User();

  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;
  user.email = req.body.email;
  user.function = req.body.function;
  user.generateActivationCode();
  user.active = false;

  user.setPassword(req.body.password);
  user.save(function(err, user_) {
    if (!err) {
      var account_ = new Account();
      account_.enseigneCommerciale = req.body.enseigneCommerciale;
      account_.raisonSociale = req.body.raisonSociale;
      account_.pagetoShow =
        '{"pMindset":false,"pTeam":false,"pSs":false,"pIdeas":false,"pProjects":false}';
      account_.typeOrganisation = req.body.typeOrganisation;
      account_.Logo = new mongoose.mongo.ObjectId(req.body.Logo);
      account_.adresse.push(req.body.adresse);
      account_.userAdmin.push(user_.id);
      account_.users.push(user_.id);

      account_.save(function(err_, accID) {
        if (!err_) {
          var resEmail = gen_services.sendActivationMail({
            user: user_,
            account: accID
          });

          resEmail.then(result => {
            var p = new Presentation({ account: accID._id });
            p.save((ee, ie) => {
              if (!ee) {
                resolve({ status: "OK" });
              }
            });
          });

          resEmail
            .then(result => {
              res.status(200);
              res.json({
                status: "OK",
                message: "email sent",
                user_email: user_.email
              });
            })
            .catch(err => {});
        }
      });
    } else {
      res.status(409);
      res.json({
        error: true,
        text: "Email deja Utilisee"
      });
    }
  });
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
