var mongoose = require("mongoose");
var crypto = require("crypto");

var accountSchema = new mongoose.Schema({
  enseigneCommerciale: String,
  raisonSociale: String,
  Logo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image"
  },
  idCompteCCA: String,
  typeOrganisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrganisationType"
  },
  adresse: String,
  presentation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Presentation"
  },
  members: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  projets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  successStories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuccessStorie"
    }
  ],
  meetings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting"
    }
  ]
});

accountSchema.add({ userAdmin: [{type: mongoose.Schema.Types.ObjectId , ref: "User"}]});

mongoose.model("Account", accountSchema);

