---
layout: post
title: Reporting Services + LocalReport hang
originalUrl: /2009/03/reporting-services-localreport-hang.html
date: 2009-03-09 16:12
comments: true
categories: ['bugs', 'reporting']
---

Just for future reference...

Winforms application + Reporting Services + LocalReport + bad luck = Application hangs without throwing any exception :(

I've just spend a lot of time trying to figure out what the hell was causing this issue.
It happened when I did this:

``` cs
localReport.LoadReportDefinition(stream)
localReport.GetDataSourceNames()  // here it hangs 2 of 3 times 
```

I've managed to get the data source names from the stream reading some XML but then it hung at another point where the report was referenced again... agrhh!

Researching a bit more and using Reflector a lot I've found out that the issue might have something to do with the report definition being compiled in another application domain the first time that it is required.

All in all, I've solved this issue by changing the threading model of my application from STA (single-threaded apartment) to MTA (multithreaded apartment) by changing this:

``` cs
[STAThread]
public static void Main()
{
   ...
} 
```

to this: 

``` cs
[MTAThread]
public static void Main()
{
   ...
}
```

Perhaps this can save somebody some time.
