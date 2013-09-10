---
layout: post
title: Appending an attribute to a XML node
originalUrl: /2008/05/appending-attribute-to-xml-node.html
date: 2008-05-12 18:52
comments: true
categories: ['nant', 'tools', 'xml']
---

I just needed to append an attribute to a tag in a XML file, and it took me a  while to figure it out how to do it from the command line.

The "easiest" way I've found is  using a tool called [XMLStartlet](http://xmlstar.sourceforge.net/).

Some background... I am automating a Clickonce deployment through a nant  build file and I need to specify in the application manifest that one of the  files is a "[Data File](http://msdn.microsoft.com/es-es/library/6fehc36e%28VS.80%29.aspx)". I'm using [mage](http://msdn.microsoft.com/en-us/library/acz3y3te.aspx) to  generate the manifests.

The app.exe.manifest XML file (application manifest) looks something like  this:

``` xml
<?xml version="1.0" encoding="utf-8"?>
<asmv1:assembly xmlns:asmv3="urn:schemas-microsoft-com:asm.v3" xmlns:dsig="http://www.w3.org/2000/09/xmldsig#" xmlns="urn:schemas-microsoft-com:asm.v2" xmlns:asmv1="urn:schemas-microsoft-com:asm.v1" xmlns:asmv2="urn:schemas-microsoft-com:asm.v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:co.v1="urn:schemas-microsoft-com:clickonce.v1" xsi:schemaLocation="urn:schemas-microsoft-com:asm.v1 assembly.adaptive.xsd" manifestVersion="1.0">

...

<file name="windsor.config.xml" size="819">
 <hash>
   <dsig:Transforms>
     <dsig:Transform Algorithm="urn:schemas-microsoft-com:HashTransforms.Identity" />
   </dsig:Transforms>
   <dsig:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
   <dsig:DigestValue>EO69DP0Ewj2rOeFxdwSaqN6NY1s=</dsig:DigestValue>
 </hash>
</file>

...

</asmv1:assembly>
```


My requirement  was to append the writeableType attribute with value "applicationData" to the  shown "file" node.

To accomplish this I've used this command:

```
xml ed -N a="urn:schemas-microsoft-com:asm.v1" -N b="urn:schemas-microsoft-com:asm.v2" -a "/a:assembly/b:file[@name='windsor.config.xml']/." -t attr -n writeableType -v applicationData app.exe.manifest
```

You get the resulting XML in the standard output (which need to be  redirected), and the result contains:

``` xml
<file name="windsor.config.xml" size="819" writeableType="applicationData">
```

The XML namespaces make it somewhat tricky to get the correct arguments for  xml.exe, but when namespaces are not specified it turns out to be pretty easy  and straightforward.

Remember also that if you want to include this command line in a nant script you will need to replace the double quotes with "& quot;" (without the space)

I think that XMLStartlet will be useful for me in the future, so this one goes  to my toolbox from now.

