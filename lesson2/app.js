var express = require("express");
var utility = require("utility");

var app = express();

app.get("/", function (req, res) {
  var q = req.query.q;
  var md5Value = q ? utility.md5(q) : "There is no query string"; //if arg is undefined, utility error happens

  res.send(md5Value);
});

app.listen(3000, function () {
  console.log("app is running at port 3000")
});