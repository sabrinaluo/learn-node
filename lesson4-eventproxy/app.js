var eventproxy = require('eventproxy');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('lodash');

var url = require('url');
var cnodeUrl = 'https://cnodejs.org/';

var ep = new eventproxy();
var topics = [];
var total = 5;


console.log('crawling home page');

//获取主页的html，提取topic的url
request(cnodeUrl, function (error, response, body) {
  if (error) {
    return console.log(error);
  }
  var topicsUrls = [];
  var $ = cheerio.load(body); //body内容是页面html，cheerio使得其可以使用类似jquery的方法操作DOM
  var $topicTitles = $('#topic_list').find('.topic_title');
  $topicTitles.each(function (index, element) {
    var $title = $(element);
    var href = url.resolve(cnodeUrl, $title.attr('href'));
    topicsUrls.push(href);
  });
  console.log('number of topic url: ' + topicsUrls.length);

  //爬取topic页面的html
  asyncCrawler(topicsUrls.slice(0, total), 'topic', 3);

});

//监听到topic事件 N次之后 运行回调函数，回调函数的参数是topicsMarkup 数组， 数组元素为html
ep.after('topic', total, function (topicsMarkup) {
  console.log('get all topic_html, doing data retrieval');
  topics = topicsMarkup.map(function (topic) {
    var $ = cheerio.load(topic.html);
    var href = $('.reply_author').length != 0 ? url.resolve(cnodeUrl, $('.reply_author').eq(0).attr('href')) : null;

    return {
      title: $('.topic_full_title').text().trim(),
      href: topic.url,
      comment1: $('.reply_content').eq(0).text().trim(),
      author1: $('.reply_author').eq(0).text().trim(),
      authorUrl: href
    }
  });
  console.log('topics ok');
  ep.emit('topics ok', topics);
});

ep.once('topics ok', function (data) {
  console.log(data)
  var authorUrls = _.map(data, function (item) {
    return item.authorUrl
  });

  //爬取author页面的html
  asyncCrawler(authorUrls, 'author', 3);
});

ep.after('author', total, function (authors) {
  console.log('get all author_html, doing data retrieval');
  authors.forEach(function (author, index) {
    var $ = cheerio.load(author.html);
    topics[index].score1 = +$('.user_profile .big').eq(0).text().trim();
  });

  console.log(topics);
});

/**
 *
 * @param urls
 * @param type
 * @param limit
 */
function asyncCrawler(urls, type, limit) {
  if (!arguments[1]) {
    type = ''
  }
  if (!arguments[2]) {
    limit = 3
  }

  console.log('START crawling ' + type);

  var i = 0;
  var delay = 0;
  var requestId = 0;
  var resultId = 0;
  async.eachLimit(urls, limit, function (url, callback) {
    delay = Math.floor(i++ / limit) * 5000; // send x requests per 5 seconds
    setTimeout(function () {
      console.log(++requestId + 'sending request: ' + type);
      try {
        request(url, function (error, response, body) {
          if(!error){
          console.log(++resultId + ' ' + response.statusCode + ' ' + url);
          ep.emit(type, {url: url, html: body});
          }else{
            console.log(++resultId + 'request internal err:' + error);
            ep.emit(type, {url: url, html: ''});
          }
        });
      } catch (e) {
        console.log(type + e);
        ep.emit(type, {url: url, html: ''});
      }
    }, delay);
    callback(null); //一定要写这句，否则无法正确执行。当发生错误时需要调用callback(err)，如果没有发生错误则需调用callback(null)
  }, function (err) {
    if (err) {
      console.log('failed: crawling ->' + type)
    } else {
      console.log('succeed: send all crawling request ->' + type)
    }
  });
}