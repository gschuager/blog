---
layout: post
title: Polymorphic query using interfaces
originalUrl: /2008/12/polymorphic-query-using-interfaces.html
date: 2008-12-23 21:11
comments: true
categories: ['nhibernate']
---

Given an object model defined by the following classes/interfaces:
``` cs
public class Animal

public interface IHasFourLegs

public interface ICanFly

public class Dog : Animal, IHasFourLegs

public class Bird : Animal, ICanFly

public class Unicorn : Animal, IHasFourLegs, ICanFly
```

Suppose that you want to persist this class hierarchy to a database and be able to easily retrieve all the entities that implement one of both interfaces... then NHibernate is your friend (as always)

I've chosen to map this using the [table-per-subclass strategy](http://www.nhforge.org/doc/nh/en/index.html#inheritance-tablepersubclass"), but probably the other [inheritance mapping strategies](http://www.nhforge.org/doc/nh/en/index.html#inheritance-strategies) would work as well:
``` xml
<hibernate-mapping xmlns="urn:nhibernate-mapping-2.2"
                 assembly="Assembly"
                 namespace="Namespace">

<class name="Animal">
  <id>...
  <property>...
</class>

<joined-subclass name="Dog" extends="Animal">
  <key>...
  <property>...
</joined-subclass>

<joined-subclass name="Bird" extends="Animal">
  <key>...
  <property>...
</joined-subclass>

<joined-subclass name="Unicorn" extends="Animal">
  <key>...
  <property>...
</joined-subclass>

</hibernate-mapping>
```

Now that we have our classes and their mappings we are going to query our domain to get all the entities that implement ICanFly.

Basically you have 2 options right now: Criteria API and HQL.


### Using Criteria API

This is very simple, all you need to do is this:
``` cs
var flyers = session.CreateCriteria(typeof (ICanFly)).List<ICanFly>();
```


### Using HQL

This one gets a little trickier (at least it got for me) since you need to explicitly import the interface type inside the mapping to get NH to know about it; this is simply done by adding the following line to your mapping:
``` xml
<import class="Namespace.ICanFly" rename="ICanFly"/>
```

After this little addition we can issue a successful HQL query:
``` cs
var flyers = session.CreateQuery("from ICanFly").List<ICanFly>();
```


### Remarks

* The `import` mapping needed when using HQL seems to be used by NH to map the string used in the query (`ICanFly`) to an actual type... if you'd have put `rename="Flyers"` in the import element then the HQL would need to be `"from Flyers"`.
* At first, I thought that specifying the full name of the type directly in the HQL string would have been enough, but it is not.
* Take special care when trying to retrieve an ordered result set because since NH should issue several SELECT statements to get all the entities from the different tables (instead of using an UNION) the order of the results will probably be wrong.


### Conclusion

This polymorphic behavior of NHibernate is just awesome because it allows you to be creative with your domain and frees you of the constraints imposed by the underlying relational model.
