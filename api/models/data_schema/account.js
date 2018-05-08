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
  typeOrganisation: String,
  adresse: [String],
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

accountSchema.add({ pagetoShow: String });
accountSchema.add({
  userAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

accountSchema.add({
  presentation: { type: mongoose.Schema.Types.ObjectId, ref: "Presentation" }
});

accountSchema.add({
  _slug: { type: String , unique: true}
});

accountSchema.add({
  website: { type: String }
}); 

accountSchema.add({
  coverImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image"
  }
});

mongoose.model("Account", accountSchema);

/*
typeOrganisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrganisationType"
  },
*/
