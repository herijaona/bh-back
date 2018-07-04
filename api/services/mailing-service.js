const path = require("path");
var Hogan = require("hogan.js");
var fs = require("fs");
var gen = require('./app-general');
var app_const = require(path.join(global.basedir, "/api/config/constant"));

const mailjet = require("node-mailjet").connect(
    app_const.mailjet.api_pub,
    app_const.mailjet.api_priv
);

var activationTemplate = Hogan.compile(fs.readFileSync(
    app_const.templatesPath + "/mails/activation.hjs",
    "utf-8"
));

var resetPassTemplate = Hogan.compile(fs.readFileSync(
    app_const.templatesPath + "/mails/resetpass.hjs",
    "utf-8"
));

var notifresetPassTemplate = Hogan.compile(fs.readFileSync(
    app_const.templatesPath + "/mails/notif.hjs",
    "utf-8"
));

var invitationTemplate = Hogan.compile(fs.readFileSync(
    app_const.templatesPath + "/mails/invitationBH.hjs",
    "utf-8"
));

var afterUserApplyTemplate = Hogan.compile(fs.readFileSync(
    app_const.templatesPath + "/mails/afterUserApply.hjs",
    "utf-8"
));

var invitationOrganisationTemplate = Hogan.compile(fs.readFileSync(
    app_const.templatesPath + "/mails/org_invitation.hjs",
    "utf-8"
));

module.exports.sendActivationMail = function (argMail) {
    var subj = "Active votre compte";
    var data_email = {
        name: gen.titleCase(argMail.user.firstname) +
            " " +
            gen.titleCase(argMail.user.lastname),
        url_activation: app_const.url_front + "/activate/" + argMail.user.activation_text,
        sitename: app_const.name,
        logoImage: app_const.url+ '/files/defaults/logo.png'
    };

    var templ = activationTemplate;
    var dest = {
        name: data_email.name,
        email: argMail.user.email
    };
    console.log(data_email.url_activation);

    return deliverEmail(subj, templ, data_email, dest);
};

module.exports.sendResetPasswordMail = function (u, d) {
    var subj = "Demande de reinitialisation de mot de passe ";
    var templ = resetPassTemplate;
    var data_m = {
        sitename: app_const.name,
        url_reset: app_const.url_front + "/reset-my-pass/" + d._id + "/" + d.resetCode
    };
    var dest = {
        name: gen.titleCase(u.firstname) + " " + gen.titleCase(u.lastname),
        email: u.email
    };
    console.log(data_m.url_reset);
    return deliverEmail(subj, templ, data_m, dest);
};

/*Send Mail password was changed*/
module.exports.sendEmailPassResetednotif = function (u) {
    var subj = "Votre mot de passe a changé ";

    var templ = notifresetPassTemplate;
    var data_m = {
        username: gen.titleCase(u.firstname) + " " + gen.titleCase(u.lastname)
    };
    var dest = {
        name: gen.titleCase(u.firstname) + " " + gen.titleCase(u.lastname),
        email: u.email
    };
    return deliverEmail(subj, templ, data_m, dest);
};

module.exports.mailInvitations = (inv, usr, usAcc) => {
    var subj = "Invitation sur Business Haven";
    var role = "";
    if (inv.invAsTeam && inv.invAsComm) {
        role = "Team & Commitee";
    } else {
        if (inv.invAsTeam) {
            role = "Team";
        }
        if (inv.invAsComm) {
            role = "Commitee";
        }
    }
    var templ = invitationTemplate;
    var data_m = {
        userSender: gen.titleCase(usr.firstname) + " " + gen.titleCase(usr.lastname),
        invitedName: gen.titleCase(inv.firstname) + " " + gen.titleCase(inv.lastname),
        sitename: app_const.name,
        role: role,
        invitationUrl: app_const.url_front +
            "/invitation_response/" +
            usAcc._slug +
            "/invitation/" +
            inv._id
    };
    var dest = {
        name: gen.titleCase(inv.firstname) + " " + gen.titleCase(inv.lastname),
        email: inv.email
    };
    console.log(data_m.invitationUrl);
    return deliverEmail(subj, templ, data_m, dest);
};

module.exports.userEmailAfterApply = (usr, data) => {
    var subj = "applicationSent";
    var templ = afterUserApplyTemplate;
    var data_m = {
        username: gen.titleCase(usr.firstname) + " " + gen.titleCase(usr.lastname),
        title: data.t,
        org: data.ens
    };
    var dest = {
        name: gen.titleCase(usr.firstname) + " " + gen.titleCase(usr.lastname),
        email: usr.email
    };
    return deliverEmail(subj, templ, data_m, dest);
};

module.exports.sendOrgInvitationEmail = (data) => {
    var subj = "Invitation";
    var templ = invitationOrganisationTemplate;
    let urlInvitation = app_const.url_front + "/reply-invitation/organisation/" + data.id;
    var data_m = {
        userSender: gen.titleCase(data.byUser.firstname) + " " + gen.titleCase(data.byUser.lastname),
        invitedOrganisationName: data.invetedData.organisationName,
        invitationUrl: urlInvitation,
        byAccountName: data.byAccount.enseigneCommerciale,
        invitedName: gen.titleCase(data.invetedData.firstname) + " " + gen.titleCase(data.invetedData.lastname),
    };
    var dest = {
        name: gen.titleCase(data.invetedData.firstname) + " " + gen.titleCase(data.invetedData.lastname),
        email: data.invetedData.invitation_email
    };
    console.log(urlInvitation);
    return deliverEmail(subj, templ, data_m, dest);
}

/* Real mail Service*/
function deliverEmail(subject, template, data_email, to_) {
    // body...
    const request = mailjet.post("send", {
        version: "v3.1"
    }).request({
        Messages: [{
            From: {
                Email: app_const.emails.contact,
                Name: "Business Haven"
            },
            To: [{
                Email: to_.email,
                Name: to_.name
            }],
            Subject: subject,
            TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
            HTMLPart: template.render(data_email)
        }]
    });
    return request;
}