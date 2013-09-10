---
layout: post
title: Moving to WordPress
originalUrl: /2010/12/moving-to-wordpress.html
date: 2010-12-07 22:07
comments: true
categories: ['blog']
---

A couple of weeks ago I decided that I would migrate my blog to WordPress, and finally here I am.

I'm writing this mainly to keep record of my motivations, to describe briefly the steps that I've accomplished and maybe to give some tips to anyone who is willing to do the same.


### Why?

A couple of my reasons:

* I got tired of dealing with a formatting issue in Blogger that made my posts look ugly when I post any source code.
* I was hosting a set of static pages (About, Projects, etc) at the root of my domain and I wanted that content to be integrated with the rest of my blog; I didn't find out (didn't research much either) how to do this in blogger, but with WP pages this is a standard feature.
* I decided to restyle my blog and it seemed that there were a lot more of options with WP than with Blogger.
* WP admin features and extensibility options looked outstanding (they are indeed).


### How?

I was lucky enough to be using a custom subdomain (blog.schuager.com) instead of using the default Blogger domain (gschuager.blogspot.com); this allowed me to setup WP in another subdomain (blog2.schuager.com) and swap them when I finished.

The Wordpress installation was very easy. I used this [list](http://codex.wordpress.org/Installing_WordPress) as reference.

After that, I used a [plugin](http://wordpress.org/extend/plugins/blogger-importer/) to import all my posts and comments from Blogger.

I configured my new blog's permalink options to match the url structure used by blogger and then put [some code](http://codex.wordpress.org/Using_Permalinks#Permalinks_without_mod_rewrite) into web.config to tell [IIS URL Rewrite](http://learn.iis.net/page.aspx/460/using-the-url-rewrite-module/) to play nice with the new url format.

Then I moved to the styling phase:

* I tried several themes (there are too many of them), but none of them convinced me as they were.
* I research a little about theme authoring, [theme frameworks](http://codex.wordpress.org/Theme_Frameworks), WP actions and filters, etc.
* I ended up using [WP framework](http://wordpress.org/extend/themes/wp-framework) and writing custom a CSS file (and some php code) to adapt the layout to what I was looking for
* Firebug and Chrome developer tools where of great help at this point

I installed plugins for: syntax highlighting, comments spam filtering, broken links verification, Feedburner feed redirection, Google Analytics integration, etc.

The final step in my conversion was to review my old posts and update the embedded code to fix the styling issue mentioned above using the syntax highlighter plugin.


### Conclusion

Here are images of the old blog vs the new one for comparison:

<a href="/assets/images/blog-old.jpg"><img src="/assets/images/blog-old.jpg" title="Old blog layout" width="400" height="462"/></a>

<a href="/assets/images/blog-new.jpg"><img src="/assets/images/blog-new.jpg" title="New blog layout" width="400" height="522"/></a>

I think I've come up with a nice design and I'm very happy with the result 
All that's left now is to start bloging more often!
