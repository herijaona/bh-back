var mongoose = require("mongoose");

var presentationSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  description: String,
  autreDescription: String,
  zones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone"
    }
  ]
});

mongoose.model("Presentation", presentationSchema);
