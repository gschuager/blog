---
layout: post
title: Inversion of Control container on .NET Compact Framework
originalUrl: /2008/04/inversion-of-control-container-on-net.html
date: 2008-04-02 00:40
comments: true
categories: ['ioc', 'netcf']
---

Once upon a time I started to write an ambitiuos embedded application... I had very little knowledge about .NET, Design Patterns, TDD, DDD and all those cool things at that time.
My application grew over time and suddenly it became an unmaintainable monster. It was composed of a big web of interrelated components each of one did his work the way they wanted. It was full of singletons and static classes...

Since that time I've studied and learned a lot of usefull things like the ones that I mentioned above, and at some point I decided that I need to do something to prevent the monster from eating me.

This is where "[The Great Refactoring](http://codebetter.com/blogs/jeremy.miller/archive/2008/03/13/observations.aspx)" came in.... TDD... MVP... IoC!

Among other things I was in the need of a IoC/DI tool that works under .NET Compact Framework. The only one that I've found is [uIoC](http://www.codeplex.com/uIoC) but it lacks some features that I consider "must haves" for such a tool (constructor injection for example).
So, I decided to write my own Inversion of Control Container... so CompactContainer borns.

The API is roughly based on Castle MicroKernel and the main features are:

* Constructor injection
* Handlers for custom creation of different types of objects: I've used this to implement a PersistantaceHandler that attemps to create the asked component by deserializing it from disk, and if it can't then instanciate a new one in the usual way. This feature could be use to implement an IStartable interface with the same effect as the Startable Facility of MicroKernel. (not in the repository yet)
* Lifestyles: Singleton and Transient (the only ones I've needed so far)

The source code can be found at http://code.google.com/p/compactcontainer/
Here you can find 2 solutions: one targeted to Pocket PC platform (can be retargeted as needed) and other composed of 2 project, CompactContainer and CompactContainer.Tests that is used to run the tests under the full .NET Framework (uses MBUnit).

My 2 cents...
