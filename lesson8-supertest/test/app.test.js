var app = require('../app');
var supertest = require('supertest');

var request = supertest(app);

var should = require('should');

describe('test/app.test.js', function () {
  it('should return 55 when n is 10', function (done) {
    request.get('/fib')
        .query({n: 10})
        .end(function (err, res) {
          res.text.should.equal('55'); // http response is a string
          done(err);
        });
  });

  //因???代?都与上面�W似，因此可以抽象出一�蘑�?
  var testFib = function (n, statusCode, expect, done) {
    request.get('/fib')
        .query({n: n})
        .expect(statusCode)
        .end(function (err, res) {
          res.text.should.equal(expect);
          done(err);
        });
  };

  //boundary value
  it('should return 0 when n === 0', function (done) {
    testFib(0, 200, '0', done);
  });

  it('should return 1 when n === 1', function (done) {
    testFib(1, 200, '1', done);
  });

  it('should throw when n > 10', function (done) {
    testFib(11, 500, 'n should <= 10', done);
  });

  it('should throw when n < 0', function (done) {
    testFib(-1, 500, 'n should >= 0', done);
  });

  it('should throw when n is not a number', function (done) {
    testFib('test string', 500, 'n should be a number', done);
  });

  //?什么要???? error? statusCode === 500？ ?上面??不通??，方便排除??原因
  it('should status 500 when error', function (done) {
    request.get('/fib')
        .query({n: 100})
        .expect(500)
        .end(function (err, res) {
          done(err);
        });
  })
});