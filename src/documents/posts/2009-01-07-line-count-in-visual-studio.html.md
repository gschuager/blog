---
layout: post
title: Line count in Visual Studio
originalUrl: /2009/01/line-count-in-visual-studio.html
date: 2009-01-07 11:11
comments: true
categories: ['tools']
---

This is a nice trick that should be spreaded.

Select **Edit** -> **Find & Replace** -> **Find in files...** or just press CTRL+SHIFT+F

Check **Use** and select **Regular expressions**.

Type the following as the text to find:

for C#
```
^~(:Wh@//.+)~(:Wh@\{:Wh@)~(:Wh@\}:Wh@)~(:Wh@/#).+
```

fore VB.NET (thanks Steve for the info!)
```
^~(:Wh@'.+)~(:Wh@/#).+
```

Select where you want to do the search/count: file, project or solution.

If you select Current project or Entire solution, you also need to specify the file types that will be included in the search.

!["find and replace dialog"](/assets/images/findinfiles.png "Find and replace dialog")

Proceed with the "search" and at the bottom of the Find results window you will see the total line count.

!["line count output"](/assets/images/linecount.png "Line count output")

The regular expression that is used match every line that are not a comment (//), a compiler directive (starts with #), a single opening or closing brace, or blank lines.

*Note: This post is based on [this one](http://redgloo.sse.reading.ac.uk/dotnet/weblog/103.html) from Philip Stears (the regex in the original post does not work correctly).*

