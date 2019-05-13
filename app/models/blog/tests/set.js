describe("Blog.set", function() {
  var set = require("../set");
  var config = require("config");
  var fs = require("fs-extra");
  var HOSTS = process.env.BLOT_DIRECTORY + "/data/hosts";

  // Create a test blog before each spec
  global.test.blog();

  it("will set up a symlink from the cache folder to the blog folder", function(done) {
    var test = this;
    var domain = "example.com";

    set(test.blog.id, { domain: domain }, function(err) {
      if (err) return done.fail(err);

      var domainFolder = HOSTS + "/" + domain + "/folder";
      var backupDomainFolder = HOSTS + "/www." + domain + "/folder";
      var handleFolder =
        HOSTS + "/" + test.blog.handle + "." + config.host + "/folder";

      expect(fs.realpathSync(domainFolder)).toEqual(test.blogDirectory);
      expect(fs.realpathSync(backupDomainFolder)).toEqual(test.blogDirectory);
      expect(fs.realpathSync(handleFolder)).toEqual(test.blogDirectory);

      done();
    });
  });
});
