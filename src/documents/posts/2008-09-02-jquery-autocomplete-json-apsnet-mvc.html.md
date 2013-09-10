---
layout: post
title: jQuery Autocomplete + JSON + ASP.NET MVC
originalUrl: /2008/09/jquery-autocomplete-json-apsnet-mvc.html
date: 2008-09-02 23:25
comments: true
categories: ['ASP.NET MVC', 'jquery']
---

It just took me a while to get this running, so maybe this could save you some time.

The requirement was to use the [jQuery Autocomplete plugin](http://bassistance.de/jquery-plugins/jquery-plugin-autocomplete/) to aid in the selection of some data coming from a database in an application using ASP.NET MVC Preview 4.

If you would like to see this plugin in action, refer to its [demo page](http://jquery.bassistance.de/autocomplete/demo/).

The [documentation](http://docs.jquery.com/Plugins/Autocomplete/autocomplete#url_or_dataoptions) of the plugin states that when a remote source is used, the result must be returned formatted with one value on each line; but since I want to return a list of complex objects I would like to use JSON... googling around I've arrived to [this](http://www.it-eye.nl/weblog/2008/08/23/using-jquery-autocomplete-with-grails-and-json/) page and learnt about the **parse** and **dataType** options that are not documented... using this options you can make the autocomplete plugin to receive remote data in JSON format.

So... this is the JS code that configures the plugin:

``` js
$(document).ready( function() {
  $('#signalName').autocomplete('<%=Url.Action("Lookup", "Signal") %>', {
      dataType: 'json',
      parse: function(data) {
          var rows = new Array();
          for(var i=0; i<data.length; i++){
              rows[i] = { data:data[i], value:data[i].SignalName, result:data[i].SignalName };
          }
          return rows;
      },
      formatItem: function(row, i, n) {
          return row.SignalName + ' - ' + row.Description;
      },
      width: 300,
      mustMatch: true,
  });
});
```

Here, I specify that the rows in the drop down will have the "SignalName - Description" format, and that the value that will be put in the textbox is the SignalName property of the selected item... this is done with the **value** property of the **rows** array.

The ASP.NET MVC controller/action that provides the data will be something like this:

``` cs
public class SignalController : Controller {
  ...
  public ActionResult Lookup(string q, int limit)
  {
      var list = signalRepository.SearchByPage(q, 1, limit);
      var data = from s in list select new {s.SignalName, s.Description};
      return Json(data);
  }
  ...
}
```

To get this running, don't forget to include the required javascript files and the css to style the autocomplete drop down. Refer to the documentation for more information.

That's all for now.
