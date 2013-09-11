var moment = require('moment');
var path = require('path');

var post_date_regex = new RegExp("([0-9]+-)*");

var docpadConfig = {

  templateData: {

    site: {
      url: "http://schuager.com",
      title: "Germán Schuager's blog"
    },

    getPreparedTitle: function() {
      if (this.document.title) {
        return this.document.title + ' | ' + this.site.title;
      }

      return this.site.title;
    },

    getFormattedDate: function(date) {
      return moment(date).format('D MMM YYYY');
    }
  },

  collections: {
    posts: function() {
      return this.getCollection('html').findAllLive({
        layout: "post"
      }, [{
        date: -1
      }]);
    }
  },

  events: {

    renderBefore: function(opts) {
      var posts = this.docpad.getCollection('posts');

      // ignore DRAFTs
      posts.forEach(function(post) {
        var originalFilename = post.get('outFilename');
        if (/^[dD][rR][aA][fF][tT]/.test(originalFilename)) {
          console.log('skipped draft: ' + originalFilename);
          post.set('ignore', true);
          post.getMeta().set('ignore', true)
        }
      });


      console.log('');
      var count = 0;

      // custom routing
      posts.forEach(function(post) {

        if (post.get('ignore'))
          return;

        var originalFilename = post.get('outFilename');
        console.log('**** ' + originalFilename);

        var matches = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(originalFilename);
        if (matches.length != 4) {  // full match + year + month + day
          return;
        }

        var date = new Date(matches[1] + '-' + matches[2] + '-' + matches[3]);

        var newFilename = originalFilename.replace(post_date_regex, '');
        var newOutPath = path.join(this.docpad.config.outPath, matches[1], matches[2], newFilename);
        var newUrl = '/' + matches[1] + '/' + matches[2] + '/' + newFilename;

        // ensure original urls are kept
        var originalUrl = post.get('originalUrl');
        if (originalUrl && (originalUrl != newUrl)) {
          throw 'Urls do not match "' + originalUrl + '" <-> "' + newUrl + '"';
        }

        post.set('outPath', newOutPath);
        post.setUrl(newUrl);

        count = count + 1;
      });

      console.log('Processed posts count: ' + count);
      console.log('');

    }
  },

  plugins: {
    rss: {
      collection: 'posts',
      url: '/rss.xml'
    }
  }
}

module.exports = docpadConfig;