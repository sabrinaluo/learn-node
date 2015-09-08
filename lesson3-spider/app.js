var express = require("express");
//var superagent = require("superagent");
var cheerio = require("cheerio");
var request = require("request");

var app = express();

//NOTES: ¨Ï¥Îsuperagent¼ÒšÂ©Mrequest¼ÒšÂ³£üÓªk§ì¨ú¥¿ÚÌ?Õu¡A¥u¯à§ì¨ì???ªG"Resolve Domain Error"

app.get("/", function (req, res) {
  var url = "https://www.cnodejs.org/";
  request(url,function(err, response, body){
    var $ = cheerio.load(body);
    var items = [];
    $("#topic_list .topic_title").each(function (index, ele) {
      var $ele = $(ele);
      items.push({
        title: $ele.attr("title"),
        href: $ele.attr("href")
      });
    });

    res.send(items);
  });

});

app.listen(3000, function () {
  console.log("app is running at port 3000")
});