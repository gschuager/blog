---
layout: post
title: CompactContainer rebump
originalUrl: /2011/01/compactcontainer-rebump.html
date: 2011-01-08 15:37
comments: true
categories: ['castle', 'ioc', 'netcf']
---

Almost a year ago I did some experimentation with porting [Castle](http://stw.castleproject.org/Windsor.MainPage.ashx) [Windsor](https://github.com/castleproject/Castle.Windsor) to be used under the .NET Compact Framework, and while I got it done (excluding several features; mainly everything that has to do with proxys), it was clear that its implementation was not though to be used in a resource-constrained environment.

<img src="/assets/images/container.jpeg" class="align-right" />

Windsor has lots of functionality that I was wishing to be able to use in some Compact Framework applications, but according to the results of my tests, it was slower and consumed more memory than my own [CompactContainer](http://code.google.com/p/compactcontainer/). Sum that to the fact that Windsor is evolving every day and most of the new stuff use features of .NET that are not available under the Compact Framework, and I had a pretty good reason not go further with this endeavor. 

Considering the previously described experiments I've decided to add the features I was needing to [CompactContainer](http://code.google.com/p/compactcontainer/).

So my first step was to migrate the repository to Mercurial (good: it is so much easy to work with than SVN / bad: you now need a [hg client](http://tortoisehg.bitbucket.org/) to get the source code), then I refactored a little the existing code-base and finally I added several new features.

Here is a list of the major changes and additions:

* Ditched .NET Compact Framework 2.0 support
* Lots of internal refactorings:
  * Changed main namespace from InversionOfControl to CompactContainer
  * Renamed IHandler to IActivator (implementors are responsible of instantiating components)
  * Removed ComponentList and replaced by IEnumerable<ComponentInfo> and extension methods
  * Changed auto registration stuff by implementations of IDiscoveryConvention
  * Removed capability to resolve component given its implementation type.
  * ... several others that I cannot remember right now... (I should really keep a changelog file)
* Major new features:
  * **Implemented [programmatic registration](http://code.google.com/p/compactcontainer/wiki/ComponentsRegistration) heavily based on Castle Windsor API**
  * Added several [extension points](http://code.google.com/p/compactcontainer/wiki/ExtensionPoints): IActivator, **IDependencyResolver**, **IComponentSelector** and IDiscoveryConvention
  * Added property injection support
  * Added container events for component registration and component resolution
  * Added basic container facilities support (a-la-Windsor)
  * Added basic configuration method to be used by IComponentsInstaller and IFacility implementors

Another thing that I've done is to remove the binary files available for download... I've done this for mainly 2 reasons:

* I don't have an automated build process, so I needed to remember to make this archive manually in each commit and I always keep forgetting about it (I need to do something about this)
* the existing file was compiled for just one target (Pocket PC 2003 SE Emulator), but most probably you'd need to compile it again for the target platform that you are actually using, so it seems worthless to have to maintain something that in the end it is not going to be used; however, I see in my Google Analytics reports that the binaries were downloaded several times, so I promise to put it up again once I solve the versioning/automation stuff.

All in all, I'm very happy with the current state of this project and it is actually helping me a lot in some places.

If you have some comment or suggestion or bug report about CompactContainer, feel free to contact me and let me know!

