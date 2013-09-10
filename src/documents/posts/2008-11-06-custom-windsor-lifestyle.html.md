---
layout: post
title: Custom Windsor lifestyle: ResolutionContextLifestyleManager
originalUrl: /2008/11/custom-windsor-lifestyle.html
date: 2008-11-06 04:04
comments: true
categories: ['castle', 'ioc']
---

> UPDATED 27/11/2011: New implementation [here](/2010/11/contextual-lifestyle-reloaded.html)

For reasons that will become clear in a future post (or later in this one), I needed to implement a custom lifestyle for Microkernel/Windsor. The required behavior was to propagate an instance of a component through the whole resolution chain but no further.

Let me explain it a little better.

The default lifestyle used by the container when none is specified is Singleton. This means that the first time that a service is resolved, the instance created is cached, and every other time after that, this same instance is returned.

You can also specify a Transient lifestyle, which indicates that every time that a service is being resolved a new instance is created.

What I was looking for here was some way to specify context boundaries in order that when the container is asked to provide a dependency for a given service within these boundaries, it will provides always the same instance, but when you are outside that context (or inside a different one) it will resolve a different (new) instance.
This behavior is achieved by the ResolutionContextLifestyleManager, that although it is not perfect at all (it is not thread-safe for example), fulfills my current requirements very well.

The implementation is based in remembering the type of the handler that initiates the resolution chain along with the instance just created, then every time that an instance is asked for within the same resolution chain, the cached instance is returned. It also hooks to the Kernel.ComponentCreated event in order to determine when the cached instances must be released (the resolution starter component has been created). It has grow a little messy to enable support for generic services.

I've put together the custom lifestyle with some tests in a solution that you can download from [here](http://www.mediafire.com/?jh3yoimcume).

The motivation behind this idea was to enable the usage of simultaneous forms in a rich-client environment where each one maintains its own context (NHibernate session manager in my current scenario).
