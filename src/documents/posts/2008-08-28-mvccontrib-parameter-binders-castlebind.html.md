---
layout: post
title: MvcContrib parameter binders: CastleBind vs Deserialize
originalUrl: /2008/08/mvccontrib-parameter-binders-castlebind.html
date: 2008-08-28 17:20
comments: true
categories: ['ASP.NET MVC', 'castle']
---

I'm using [MvcContrib](http://mvccontrib.codeplex.com/) in my first ASP.NET MVC based project...
I need to get an object built from the user entry in a web form, and to simplify this task I'm trying the ''parameter binding'' feature implemented in MvcContrib.

I've tested both Deserialize and CastleBind attributes and the first big difference I've found between them is that the Deserialize attribute tries to fill every property in the newed object whether the property value is contained in the Request or not. Since I'm using my business objects directly in my controllers (shame for me), this behaviour fires some properties setter that weren't intended to run.

The CastleBind attribute, which uses the Castle project Binder component, works as expected.
