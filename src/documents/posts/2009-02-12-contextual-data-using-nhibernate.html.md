---
layout: post
title: Contextual data using NHibernate filters
originalUrl: /2009/02/contextual-data-using-nhibernate.html
date: 2009-02-12 16:56
comments: true
categories: ['nhibernate']
---

I'm in the middle of the development process of an application using NH for data access, and I'm faced with a requirement that could be stated as follows:

> The application needs to provide support for different Contexts of execution, and certain entities must be context-aware, which means that at a given time, the application only see instances of those entities that corresponds to the current context of execution.

Now, just remember that I have several entities defined that are used throught the entire application layer stack, so I wanted to solve this issue modifying as little as possible.

I'm very proud with the solution that I came up with, and also very amazed by the power of NHibernate.

To simplify a little lets assume that I have a static class that defines the current context of execution:

``` cs
public enum ContexType
{
    ContextA,
    ContextB,
}

public static class Context
{
    public static ContextType Current { get; set; }
}
```

Then, I create an interface that will be implemented by all the entities that need to be contextualized:

``` cs
public interface IContextAware
{
    ContextType Context { get; set; }
}
```

Given a Cat class that needs to be contextualized, then I add the property to the class and to the mapping:

``` cs
public class Cat : Entity, IContextAware
{
    ...
    ContextType Context { get; set; }
    ...
}
```
``` xml
<class name="Cat">
    ...
    <property name="Context">
    ...
</class>
```

The idea now, is to use the dynamic filtering capabilities of NHibernate to only retrieve the Cats instances corresponding with the current context every time that a query against Cat is issued.

Typically this means that I need to add a filter definition to the mappings and to specify the condition for that filter in every class mapping that need to be aware of this behavior.

But there is an easier way to do this automatically:

``` cs
var filterParametersType = new Dictionary<string, IType>(1);
filterParametersType.Add("current", NHibernateUtil.Enum(typeof(ContextType)));
cfg.AddFilterDefinition(new FilterDefinition("contextFilter", ":current = Context", filterParametersType));

foreach (var mapping in cfg.ClassMappings)
{
    if (typeof(IContextAware).IsAssignableFrom(mapping.MappedClass))
    {
        mapping.AddFilter("contextFilter", ":current = Context");
    }
}
```

Just do this (cfg is the NH Configuration object) before building the session factory and it creates the correct filter definition and adds the condition to every entity mapped that implements IContextAware.

At this point we just have our filter defined; now we need to enable it in order to actually filter something. It would be very handy if we can enable filtering at session factory scope, but since the session factory is immutable we need to enable it for each session that we will be using.

Wait.... maybe something else can do this work for us...

The following interceptor actually takes care of 2 things:

1. enables the context filter as soon as it is attached to the session, and
2. assigns the correct value to the Context property of entities implementing IContextAware when they are persisted.

``` cs
public class ContextInterceptor : EmptyInterceptor
{
    public override void SetSession(ISession session)
    {
         session.EnableFilter("contextFilter").SetParameter("current", Context.Current);
    }

    public override bool OnSave(object entity, object id, object[] state, string[] propertyNames, IType[] types)
    {
        var contextAware = entity as IContextAware;
        if (contextAware != null)
        {
            int index = Array.Find(propertyNames, 0, x => x.Equals("Context"));
            state[index] = contextAware.Context = Context.Current;
            return true;
        }
        return false;
    }
}
```

Every session in the application needs to be created specifying this interceptor, but this should be an easy change (that depends on your architecture) if you are doing things right.

And thats all, the rest of the application is untouched and the requirement is fulfilled in a very elegant way.
