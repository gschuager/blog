---
layout: post
title: CompactContainer new features
originalUrl: /2008/11/compactcontainer-new-features.html
date: 2008-11-26 13:36
comments: true
categories: ['ioc', 'netcf']
---

Last week I've found this [post](http://www.agilification.com/post/Dependency-Injection-for-the-Compact-Framework.aspx), in which [Jeff Doolittle](http://www.agilification.com/) made an analysis of some alternatives about using dependency injection with the .NET Compact Framework.

As I've faced the same decision some time ago and ended rolling out my own solution, I pointed him to [CompactContainer](http://code.google.com/p/compactcontainer/).

Apparently he likes the project but needs some features not implemented at the time. He sent me some patches and in the end we've added the following features to CompactContainer.


### Attribute to mark the injectable constructor

By default, the container uses the constructor with most satisfiable (I think that's not a word...) dependencies to instantiate each component. This is the default behavior of Windsor/Microkernel.

Now, we have created an extension point where the default IHandler (responsible of creation and initialization of each component) can be specified and we've created an AttributedHandler that allows to select which constructor to use by means of an attribute.

The attribute type could be specified by the user when creating the AttributedHandler.

Take a look at the following example:

``` cs
var container = new CompactContainer(); 
container.DefaultHandler = new AttributedHandler(); 
container.AddComponent(typeof(IDependencyA), typeof(DependencyA)); 
container.AddComponent(typeof(IDependencyB), typeof(DependencyB)); 
container.AddComponent(typeof(MyComponent)); 
container.Resolve<MyComponent>(); 
...

public class MyComponent 
{ 
    [Inject] 
    public MyComponent(IDependencyA a) { ... }

    public MyComponent(IDependencyA a, IDependencyB b) { ... } 
}
```

The first constructor will be used to create the MyComponent service even when all the dependencies for the second constructor are available.


### Autoregistration of components

Jeff also added a feature where the container automatically registers concrete types when asked for them and they are not already registered.
This has required some improvements in the code base:

* Specification of the default lifestyle (this can be improved a lot introducing something like ILifestyleManager to decouple the lifestyle's logic)
* Generation of a default component key (based on the type) and overloads to the registration methods that don't require the component key and use the default one instead.

Example:

``` cs
container = new CompactContainer(); 
container.AddComponent(typeof(IDependencyA), typeof(DependencyA)); 
var comp = container.Resolve<MyComponent>();
```

comp will be a singleton of type MyComponent and it is resolved ok even when the container knows nothing about it before the call to `Resolve<T>;`.

To sum up [here](http://www.agilification.com/post/Dependency-Injection-for-the-Compact-Framework-Part-2.aspx) you can read Jeff's thoughts about CompactContainer. Thanks Jeff!

Open source rulez!
