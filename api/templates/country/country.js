const path = require("path");
var fs = require("fs");

var americaObj = fs.readFileSync(
    path.join(global.basedir, "/api/templates/country/america.json"),
    "utf8"
);
var africaObj = fs.readFileSync(
    path.join(global.basedir, "/api/templates/country/africa.json"),
    "utf8"
);
var europaObj = fs.readFileSync(
    path.join(global.basedir, "/api/templates/country/europa.json"),
    "utf8"
);
var asiaObj = fs.readFileSync(
    path.join(global.basedir, "/api/templates/country/asia.json"),
    "utf8"
);
var oceaniaObj = fs.readFileSync(
    path.join(global.basedir, "/api/templates/country/oceania.json"),
    "utf8"
);

module.exports.countryList = () => {
    let amList = JSON.parse(americaObj).list;
    let africaList = JSON.parse(africaObj).list;
    let asiaList = JSON.parse(asiaObj).list;
    let europaList = JSON.parse(europaObj).list;
    let ocaeniaList = JSON.parse(oceaniaObj).list;
    let allCont = {
        africa: africaList,
        asia: asiaList,
        europa: europaList,
        america: amList,
        oceania: ocaeniaList
    };
    let cKey = Object.keys(allCont);
    for (const key of cKey) {
        const c1 = allCont[key]
        for (const k in c1) {
            let cc = allCont[key][k].country;
            let rt = cc.replace(/ /g, "").toLowerCase();
            allCont[key][k].code = rt
        }
    }
    return allCont;
};