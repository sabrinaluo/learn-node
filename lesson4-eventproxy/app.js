var eventproxy = require('eventproxy');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var url = require('url');
var cnodeUrl = 'https://cnodejs.org/';

//获取主页的html，提取40个topic的url
console.log('crawling home page');
request(cnodeUrl, function (error, response, body) {
  if (error) {
    return console.log(error);
  }
  var topicsUrls = [];
  var $ = cheerio.load(body); //body内容是页面html，cheerio使得其可以使用类似jquery的方法操作DOM
  $('#topic_list .topic_title').each(function (index, element) {
    var $element = $(element);
    var href = url.resolve(cnodeUrl, $element.attr('href'));
    topicsUrls.push(href);
  });
  console.log('number of topic url: ' + topicsUrls.length);

  var ep = new eventproxy();

  //监听到topic_html N次之后 运行回调函数，回调函数的参数是topics
  ep.after('topic_html', topicsUrls.length, function (topics) {
    console.log('get all topic_html, doing data retrieval');
    topics = topics.map(function (topic) {
      var $ = cheerio.load(topic.html);
      var href = $('.reply_author').length!=0?url.resolve(cnodeUrl, $('.reply_author').eq(0).attr('href')):null;

      return {
        title: $('.topic_full_title').text().trim(),
        href: topic.url,
        comment1: $('.reply_content').eq(0).text().trim()
      }
    });
    console.log(topics)
  });

  //爬取topic的html
  var i=0;
  console.log('crawling topic_html');
  topicsUrls.forEach(function (topicUrl) {
    request(topicUrl, function (error, response, body) {
      console.log(++i + ' ' + response.statusCode + ' ' + topicUrl);
      ep.emit('topic_html', {url: topicUrl, html: body});
    });
  })
});