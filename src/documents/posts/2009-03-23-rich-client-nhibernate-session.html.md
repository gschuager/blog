---
layout: post
title: Rich-client NHibernate session management
originalUrl: /2009/03/rich-client-nhibernate-session.html
date: 2009-03-23 18:12
comments: true
categories: ['castle', 'ioc', 'nhibernate']
---

I've been struggling with this subject for quite some time now, and I've just seem to found the ['sweet spot'](http://fgheysels.blogspot.com/2008/07/nhibernate-session-management.html).

Before we start, I need to describe some facts about the target application:

* rich-client: this approach will work the same for a Winform application as for a WPF application.
* multi-screen UI: it could be multi-form or tabbed or MDI... the important thing here is that you "will" have several screens opened at the same time.
* application uses an Inversion of Control container for wiring up dependencies among other useful things (I'm using Castle Windsor/Microkernel)

Ok.

Before we continue, I recommend that you read the work of [Sebastian Talamoni](http://stalamoni.blogspot.com/2007/12/nhibernate-and-winforms-article-1st.html), that although not finished yet, covers a lot of ground.

Basically there are 4 options for NH session management on a rich-client environment:

1. Session per application (per thread)
  * the simplest approach</li>
  * only 1 session opened for the whole application lifecycle
  * lots of problems: cache size, stale data due to other users, unrecoverable exception, etc.
  * [Fabio Maulo](http://fabiomaulo.blogspot.com/) calls this pattern TIME BOMB

2. Session per screen
  * 1 session opened for each form/tab/view/whatever
  * implies multiple concurrent sessions
  * since a single screen could be left opened for quite some time, this approach is almost equally susceptible to stale data as the previous one

3. Every data access - Fine-grained sessions
  * every repository/DAO opens and closes a new session each time that a DB access is requested.
  * loss of some useful NH features like lazy loading and 1st level cache... not worth it.

4. Session per use-case
  * also implies multiple concurrent sessions
  * this seems to be the right choice, however it is the most difficult to implement


### Per-thread session management

Options 1 and 3 are easily implemented using some kind of thread-static session manager. Examples of this are [Rhino.Commons](http://ayende.com/wiki/Rhino%20Commons.ashx) and [Castle NHibernate Integration Facility](http://castleproject.org/container/facilities/trunk/nhibernate/index.html).

Each repository/DAO gets an instance of the a global "session manager" and uses it to get hold of the right session:

* if 1 session per application is used, this "global" session is return by each call to SessionManager.OpenSession()
* if fine-grained sessions are used there are two possibilities:
  * we are in the scope of another session... the outer session is returned
  * we are not in the scope of another session... a new one is created

The easy thing about this is that each repository/DAO can access to the "session manager" through some static accessor, or even better, they can receive a singleton (as in singleton lifestyle) instance as a parameter of its constructor, which enable us to use an Inversion of Control container to wire up these dependencies and ease the unit testing of these components (no statics = easier testing).

``` cs
public class Presenter {

   private IBlogRepository blogRepository;

   public Presenter(IView view, IBlogRepository blogRepository)
   {
       this.blogRepository = blogRepository;
   }

   ...

}

public class BlogRepository : IBlogRepository

   private ISessionManager sessionManager;

   public BlogRepository(ISessionManager sessionManager)
   {
       this.sessionManager = sessionManager;
   }

   public Blog Get(int id)
   {
       using (ISession session = sessionManager.OpenSession()) {
           return session.Get<Blog>(id);
       }
   }
}
```

This pattern is suitable for a web application, where the context is usually given by the current request, but in a rich-client application it would imply that two opened screens (different contexts) would share the same session manager and therefore the same session when they intend to do some data access at the same time.


### Contextual session management

Options 2 and 4 require another approach since they imply several simultaneous sessions through the lifecycle of the application. We can no longer have a static or singleton session storage from where to get the right session for each thread... we need some kind of "contextual session management" where each screen/use-case is treated as a different context and provided with sessions accordingly.

This don't seem so hard, right? We can just do something like this for option 4:

``` cs
public class Presenter {
   private ISessionManager sessionManager;
   private IBlogRepository blogRepository;

   public Presenter(IView view)
   {
       sessionManager = SessionManagerFactory.CreateNewContext();
       blogRepository = new BlogRepository(sessionManager);
   }
}
```

The implementation of BlogRepository in this case is the same as before.

At first sight this seems like a nice way to define contexts, but that is until you realize that you are making very hard to unit test this class (hardcoded dependencies) and you are neglecting the help of the IoC container to wire up things.

Imagine that now, instead of BlogRepository we need something like AggregatorService that depends on BlogRepository, UserRepository and CommentService, and CommentService depends on UserRepository and CommentRepository. In this case, you'd need to create the session manager and then to instantiate every one of this components passing the right arguments to them.... this seems too much work for me.

Managing the dependencies yourself is not fun, and your IoC container enjoys doing it for you anyway.

Maybe something can be done using some kind of service location and passing the current context down the chain, like this:

``` cs
container.Resolve<IBlogRepository>(With.Dependency<ISessionManager>(sessionManager)); // imaginary syntax
container.Resolve<IAggregatorService>(With.Dependency<ISessionManager>(sessionManager)); // imaginary syntax
```

but there is an easier way, let me introduce you to the...


### Contextual Session Manager

This is an extension to the NHibernate Integration Facility of the Castle project that allows me to control the scope of my session and do not impose a global per-thread scope.

The solution is integrated by the following components:

* ContextualNHibernateFacility: inherits from NHibernateFacility and all it does is to replace some of the standard components registered by the original facility specifying the right Lifestyle for the new ones.
* ContextualPerThreadStore: inherits from AbstractDictStackSessionStore and provides a contextual session storage where there will be a different session for each instance of this class for each thread (tricky). The original CallContextSessionStore uses the call-context to store sessions, that means that two different instances of CallContextSessionStore will return the same session for the same call-context... this behavior is the one that I didn't like.
* ContextualSessionManager: just inherits from DefaultSessionManager to specify a custom lifestyle (see below) to be use by Microkernel to manage this component.
* ResolutionContextLifestyleManager: inherits from AbstractLifestylemanager. This is the “thing” that delimits our contexts. For more information go [here](/2008/11/custom-windsor-lifestyle.html)

This set of components allow me to use the container to resolve presenters, ViewModels, forms, or anything else that I'd like to use to delimit a context, like this:

``` cs
var presenter = container.Resolve<IBlogPresenter>();
```

then, every required dependency (including the NH session manager) is resolved within the same context, all of this without even making any component aware of the existence of such grouping.

It is all handled by the container, which is exactly what I was looking for.


### Sample Project

I've put together a small spike to illustrate these concepts. Maybe a more complex application would be more suitable to present some things, but for now this is all I've done.

The sample solution uses NHibernate, Windsor, NH facility, ATM (automatic transaction management) and a simple WPF UI using Caliburn's [Action](http://caliburn.codeplex.com/Wiki/View.aspx?title=Action%20Basics&referringTitle=Table%20Of%20Contents) support.

If you're using SQL Server Express you just need to create an empty DB called “test”, otherwise just modify the settings in App.config to suit your needs. The tables and initial data are created by the application at startup.

You can download the sample ~~[here](/assets/attachments/CRMSample.zip)~~.


### Improvements

One obvious thing that is left out here is the capability to resolve more than one root component for a given context (two repositories in two different presenters that get the same ISessionManager) but that is something that could be added with no problem.

There are probably a lot of scenarios where the approach described here does not apply... I've just implemented a solution to my problem that works well for me and I think that maybe someone else can benefit from this.

I would like to know what do you think about this approach.
