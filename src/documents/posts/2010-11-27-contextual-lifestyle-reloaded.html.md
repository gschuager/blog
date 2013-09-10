---
layout: post
title: Contextual Lifestyle Reloaded
originalUrl: /2010/11/contextual-lifestyle-reloaded.html
date: 2010-11-27 21:22
categories: ['castle']
---

Some time ago I did some experimentation with a custom Castle Windsor lifestyle under the main motivation of coming up with a way for managing the NHibernate session in a fat client application.

After I posted [my findings](http://blog.schuager.com/2008/11/custom-windsor-lifestyle.html) on that matter I have continued spiking a cleaner solution and I've came up with something worth sharing again; but this time, rather than posting the code here, I preferred to share it in a more visible and maintainable place, so I asked [Mauricio](http://bugsquash.blogspot.com/) if he was willing to include it in the Castle.Windsor.Lifestyles contrib project on github and he certainly did that (after reviewing my implementation and adding code for coping with components release - thanks Mauricio!)

As explained in my previous post about this matter, the idea of this lifestyle is to be able to define a context (or scope) in which the container will resolve always the same instance of a given component and when asking for the same component outside of that context, a new instance will be created.

One of the main changes from my previous attempt is that before I used an implicit delimitation of the context based on "a single call to container.Resolve", but since then I've found that that strategy was rather limiting, so in this new implementation, the context can be explicitly defined by the `ContainerContext` class; although it is worth noting that the implicit delimitation of contexts can still be used in this new implementation.

To better describe the intended behavior, I’m including here a few tests that I think that should help make my intention clearer:

``` cs
[Test]
public void Should_resolve_the_same_instances_when_inside_the_same_context()
{
	kernel.Register(Component.For<ComponentA>().LifeStyle.Custom(typeof(ContextualLifestyle)));
	using (new ContainerContext(kernel))
	{
		var c1 = kernel.Resolve<ComponentA>();
		var c2 = kernel.Resolve<ComponentA>();
		Assert.That(c1, Is.SameAs(c2));
	}
}

[Test]
public void Should_resolve_different_instances_when_inside_different_contexts()
{
	kernel.Register(Component.For<ComponentA>().LifeStyle.Custom(typeof(ContextualLifestyle)));

	ComponentA c1, c2;
	using (new ContainerContext(kernel))
	{
		c1 = kernel.Resolve<ComponentA>();
	}
	using (new ContainerContext(kernel))
	{
		c2 = kernel.Resolve<ComponentA>();
	}

	Assert.That(c1, Is.Not.SameAs(c2));
}

[Test]
public void Should_implicitly_initialize_a_new_context_when_there_is_none_created()
{
	kernel.Register(Component.For<ComponentA>().LifeStyle.Custom(typeof(ContextualLifestyle)));

	var c1 = kernel.Resolve<ComponentA>();
	var c2 = kernel.Resolve<ComponentA>();
	Assert.That(c1, Is.Not.SameAs(c2));
}
```

This lifestyle is supposed to work with nested dependencies, generic components, and in multithreaded scenarios, so if you use it and find anything wrong with it, please let me know.

You can get the code from here: https://github.com/castleprojectcontrib/Castle.Windsor.Lifestyles
