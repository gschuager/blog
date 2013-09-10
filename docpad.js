var moment = require('moment');

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
      return this.getCollection('html').findAllLive({layout: "post"}, [{date:-1}]);
    }
  }
}

module.exports = docpadConfig;