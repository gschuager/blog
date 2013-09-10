---
layout: post
title: Case-sensitive queries in NHibernate using SQL Server
originalUrl: /2009/06/case-sensitive-queries-in-nhibernate.html
date: 2009-06-19 14:21
comments: true
categories: ['nhibernate']
---

Depending on the collation setting of your database (you probably already know this) the queries that you issue against it are treated as case-insensitive (CI collations) or as case-sensitive (CS collations).

If your database use a CI collation and you need to do some case-sensitive querying, the target SQL statement would be something like this:

``` sql
SELECT u.Name
FROM Users u
WHERE u.Name like 'SomeName' COLLATE Modern_Spanish_CS_AS
```

Now, if you are using NHibernate you can do some things to make it help you issuing this kind of query.

The first one is to just use the Criteria API specifying the desired SQL expression:

``` cs
var user = session.CreateCriteria(typeof (User))
    .Add(Expression.Sql("Username like ? collate Modern_Spanish_CS_AS", username, NHibernateUtil.String))
    .UniqueResult<User>();
```

This approach has the drawback that you tie your code to SQL Server specifically, and that will give you some headaches if you ever try to target another RDBMS.

The other (more elegant) option is to subclass the dialect that you are using (in this case MsSql2005Dialect) and register in it a custom function to perform case-sensitive comparisons.

``` cs
public class CustomMsSqlDialect : MsSql2005Dialect
{
    public CustomMsSqlDialect()
    {
        RegisterFunction("sensitivelike",
            new SQLFunctionTemplate(NHibernateUtil.String,
                "?1 like ?2 collate Modern_Spanish_CS_AS"));
    }
}
```

Then you can use this new `sensitivelike` function inside any HQL statement and NHibernate will generate the correct SQL for you.

``` cs
var user = session.CreateQuery("from User u where sensitivelike(u.Username, :username)")
    .SetParameter("username", username)
    .UniqueResult<User>();
```

This way allows you to support a different RDBMS just by registering the corresponding function implementation in a new derived dialect and without modifying your code.

Thanks to [Dario](http://darioquintana.com.ar/blogging/) for the tip.
