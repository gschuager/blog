var moment = require('moment');

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
      posts.forEach(function(post) {
        var dateUrl = moment.utc(post.getMeta('date')).format('/YYYY/MM') + "/" + post.get('outFilename').replace(post_date_regex, '');
        var originalUrl = post.get('originalUrl');
        if (originalUrl && (originalUrl != dateUrl)) {
          throw 'Urls do not match "' + originalUrl + '" <-> "' + dateUrl + '"';
        }

        return post.setUrl(dateUrl);
      });
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