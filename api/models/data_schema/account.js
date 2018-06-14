var mongoose = require("mongoose");
var crypto = require("crypto");

var accountSchema = new mongoose.Schema({
    enseigneCommerciale: String,
    activityArea: String,
    Logo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    },
    idCompteCCA: String,
    typeOrganisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrganisationType"
    },
    adresse: [String],
    presentation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Presentation"
    },
    members: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    projets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],
    successStories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuccessStorie"
    }]
});
accountSchema.add({
    pagetoShow: String
});

accountSchema.add({
    userAdmin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});
accountSchema.add({
    presentation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Presentation"
    }
});
accountSchema.add({
    _slug: {
        type: String,
        unique: true
    }
});
accountSchema.add({
    websiteUrl: {
        type: String
    }
});
accountSchema.add({
    usersTeam: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});
accountSchema.add({
    usersCommetee: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});
accountSchema.add({
    coverImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    }
});

accountSchema.add({
    isActive: {
        type: Boolean,
        default: false
    }
});

accountSchema.add({
    signinDate: {
        type: Date
    }
});

mongoose.model("Account", accountSchema);
/*

*/