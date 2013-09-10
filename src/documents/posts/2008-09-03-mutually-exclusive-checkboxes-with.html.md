---
layout: post
title: Mutually exclusive checkboxes with jQuery
originalUrl: /2008/09/mutually-exclusive-checkboxes-with.html
date: 2008-09-03 23:08
comments: true
categories: ['jquery']
---

I was needing a way for the user to select none or just one item in a set... here is how I've managed to achieve this functionality using jQuery:

``` html
<html>
  <head>
      <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
      <script type="text/javascript" language="javascript">
          $(document).ready(function() {
              $('.mutuallyexclusive').click(function () {
                  checkedState = $(this).attr('checked');
                  $('.mutuallyexclusive:checked').each(function () {
                      $(this).attr('checked', false);
                  });
                  $(this).attr('checked', checkedState);
              });
          });              
      </script>
  </head>
  <body>
      <div>
          Red: <input id="chkRed" name="chkRed" type="checkbox" value="red" class="mutuallyexclusive">
          Blue: <input id="chkBlue" name="chkBlue" type="checkbox" value="blue" class="mutuallyexclusive">
          Green: <input id="chkGreen" name="chkGreen" type="checkbox" value="green" class="mutuallyexclusive">
      </div>
  </body>
</html>
```

(Based on [this](http://forums.asp.net/p/1303486/2549303.aspx) post. Thanks Tony.)
