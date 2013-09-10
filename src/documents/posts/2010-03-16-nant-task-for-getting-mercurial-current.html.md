---
layout: post
title: NAnt task for getting Mercurial current revision
originalUrl: /2010/03/nant-task-for-getting-mercurial-current.html
date: 2010-03-16 12:58
comments: true
categories: ['hg', 'nant']
---

As part of my continuous integration process I like to get the current VCS revision and stick it somewhere in the build output (almost always to be displayed in some kind of "About" screen)

When using Mercurial in combination with NAnt, you can do this as follows:

``` xml
<property name="hg.revision.hash" value="N/A" />

<target name="common.find-hginfo">
   <property name="vcs.revision" value="0" overwrite="false" />
   <exec
       program="hg"
       commandline='parents --template="{node|short}"'
       output="_revision.txt"
       failonerror="false"/>
   <loadfile file="_revision.txt"
             property="hg.revision.hash" />
   <property name="hg.revision.hash" value="${string::trim(hg.revision.hash)}" />
   <delete file="_revision.txt" failonerror="false" />
   <echo message="INFO: Using Hg revision: ${hg.revision.hash}"/>
</target>
```

Just put this target as a dependency somewhere else and use the property "hg.revision.hash" as you see fit.
