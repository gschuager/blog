---
layout: post
title: NHibernate.Search with Castle.Facilities.NHibernateIntegration
originalUrl: /2008/04/nhibernatesearch-with.html
date: 2008-04-30 02:57
comments: true
categories: ['castle', 'nhibernate']
---

A few days ago I was looking to add full text search capability to an application that uses NHibernate, so I took a look at [NHibernate.Search](http://www.ayende.com/Blog/archive/2007/04/02/NHibernate-Search.aspx).

The application also uses Windsor and the [NH integration facility](http://castleproject.org/container/facilities/trunk/nhibernate/index.html). This facility provides my repositories with an instance of ISessionManager (or ISessionFactory) which in turn is used to get the ISession.

Next, I will explain roughly what you need to do to integrate NH.Search with an application that uses the NHibertante integration facility.

At the end of the post you will find a link to download the full source code.

The first thing we need to do is to initialize the NH.Search engine. This is done in your application startup as follows:
``` cs
var container = new WindsorContainer(new XmlInterpreter("windsor.config.xml"));
container.AddComponentLifeStyle("nhibernate.session.interceptor", typeof(IInterceptor),
                           typeof(SearchInterceptor), LifestyleType.Transient);

var cfg = container.Resolve<Configuration>();
var sessionFactory = container.Resolve<ISessionFactory>();
SearchFactory.Initialize(cfg, sessionFactory);
```

The registration of the "nhibernate.session.interceptor" component is required for ISessionManager to return us ISession's already configured to use with NH.Search.

Once we have everything in place we can define our repository class as follows:
``` cs
public class PostRepository
{
    private readonly ISessionManager sessionManager;

    public PostRepository(ISessionManager sessionManager)
    {
        this.sessionManager = sessionManager;
    }

    public IList<Post> GetAll()
    {
        using (ISession session = sessionManager.OpenSession()) {
            ICriteria crit = session.CreateCriteria(typeof (Post));
            return crit.List<Post>();
        }
    }

    public virtual void Save(Post post)
    {
        using (ISession session = sessionManager.OpenSession()) {
            session.Save(post);
            session.Flush();
        }
    }
}
```

And the Post class...

``` cs
[Indexed]
public class Post
{
    private int id;
    private string title;
    private string content;

    [DocumentId]
    public virtual int ID
    {
       get { return id; }
       set { id = value; }
    }

    [Field(Index.Tokenized, Store = Store.Yes)]
    public virtual string Title
    {
       get { return title; }
       set { title = value; }
    }

    [Field(Index.Tokenized, Store = Store.Yes)]
    public virtual string Content
    {
       get { return content; }
       set { content = value; }
    }

    public Post()
    {
    }

    public Post(string title, string content)
    {
       this.title = title;
       this.content = content;
    }
}
```

Ok, now we have our repository and our entity. Now suppose that we want to add a Find method to PostRepository that returns all the Posts that contains a given text on its Title or Content properties.

This method could be implemented as follows:

``` cs
public IList<Post> Find(string text)
{
    using (ISession session = sessionManager.OpenSession()) {
       using (IFullTextSession fullTextSession = Search.CreateFullTextSession(((SessionDelegate)session).InnerSession)) {
           var queryString = string.Format("Title: {0} OR Content: {0}", text);
           try {
               return fullTextSession.CreateFullTextQuery<Post>(queryString)
                   .List<Post>();
           }
           catch (ParseException) {
               return null;
           }
       }
    }
}
```

The important thing you have to look at here is that ISessionManager.OpenSession() doesn't return a ISessionImplementor which is required by Search.CreateFullTextSession... instead it returns a wrapper of type SessionDelegate (used to control the closing of the session when it is inside a transaction scope), so in order to be able to create the full text session we need to use the ISessionImplementor that the SessionDelegate wraps around ;)

### Using ISessionFactory instead of ISessionManager
Another way of doing this is using ISessionFactory directly instead of ISessionManager. In this case, the component name of the IInterceptor that you have to register at startup is "nhibernate.sessionfactory.interceptor" and since the ISession return by ISessionFactory.OpenSession() is in fact an ISessionImplementor, the creation of the full text search session is reduced to:

``` cs
using (ISession session = sessionFactory.OpenSession()) {
    using (IFullTextSession fullTextSession = Search.CreateFullTextSession(session)) {
```

### Sample Solution
I have put together a sample solution that implements this concepts. It uses a SQLite database to save you from setting up the DB in a RDBMS, so it should run "out of the zip".

Although a winform application is not the optimal case to illustrate NH.Search usage (it is oriented to be used on server side components or in web applications) it serves the purpose of this post.

You can download it from [here](http://www.mediafire.com/?mrwnoz2nnzh).
