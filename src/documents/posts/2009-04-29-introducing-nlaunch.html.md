---
layout: post
title: Introducing NLaunch
originalUrl: /2009/04/introducing-nlaunch.html
date: 2009-04-29 14:58
comments: true
categories: ['deployment', 'tools']
---

In the last month I've been working in several desktop applications and faced the situation of having to remotely update my clients machines repeatedly. It is not fun. The process that I was using for accomplish this task was the following:

1. build the application locally (I'm not using CI)
2. upload the result somewhere (ftp, Mediafire, etc.)
3. notify the client that I will be logging in to do some work
4. log in remotely using Remote Desktop or [LogMeIn](http://logmein.com/) (great tool BTW)
5. backup the current running version (just in case)
6. download and install the new version

I can tell you that it takes a lot of time to do these simple steps (and it is boring as hell) so I've decided to do something about it... I automated it.

The first thing that I've done is to evaluate the existing tools for this job. Here are some of them:


#### [Clickonce](http://msdn.microsoft.com/en-us/library/wh45kb66.aspx)
I had spent almost 3 non-consecutive days trying to integrate Clickonce deployment into my nant build scripts and I had failed; besides this, along the way I’ve discovered some limitations of Clickonce that made me look in other direction:

* Target directory can't be specified, it will always deploy to the Clickonce cache
* Not easy to deploy updates without running through the whole workflow (signing, uploading, etc). This means that you can't just recompile and xcopy the files to the target system (this is useful when you are at the client site).
* Complex. Application manifest, deployment manifest, signing, mage (some things can be only done through mageui), etc, etc.


#### [Updater Application Block](http://msdn.microsoft.com/en-us/library/ms978545.aspx)

It has lots of functionalities, extensibility points and configuration options but it seems too big for my needs. I was looking for something simpler that just works with almost no configuration.


#### [.NET Application Updater Component](http://windowsclient.net/articles/appupdater.aspx)

Not looked at this enough. It is bundled as a component that must be dragged into a form of your application (didn’t liked that)

---

### NLaunch

Anyway... those were some of the existing options, but I was looking for something a lot simpler, something that I hadn't found, so I decided to write it myself.

My two main requirements were:

* Dead simple: it must consist of a single executable file and maybe some configuration.
* Unobtrusive: it must not require to add anything to the target application, it should work on its own.

The simplicity requirement have taken me to make a lot of assumptions and to apply some conventions (a good thing as long as they are documented) that may not apply in everyone's scenario, for this reason, I've created several interfaces first and then developed its implementations to fulfill my requirements; this would allow anyone to easily replace some of my implementations with its owns in order to adjust NLaunch behavior. Right now it is not easily extensible without requiring source code modification, but I plan to fix that in the future.

Now with NLaunch my deployment process is reduced to this:

1. Build the application locally and upload the results to an FTP server (all with just 2 clicks)

I can't say that this is actually fun, but at least is it neither boring nor tiresome... because I don't have to DO anything! :)

Well, enough writing for now, you can check out the project's home page for a little more specific information and you can also download the source code (it is really simple) or a ready-to-work binary.

http://code.google.com/p/nlaunch/
