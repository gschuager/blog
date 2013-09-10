---
layout: post
title: NHibernate Read-only property access
originalUrl: /2008/12/nhibernate-read-only-property-access.html
date: 2008-12-22 11:48
comments: true
categories: ['nhibernate']
---

UPDATE: If you use the trunk you can now just do this (since rev. 3965):

`<property name="Total" type="Decimal" access="readonly"/>`

Keep reading if you are using an older version of NHibernate.

---

Recently I've asked in the [NHibernate mailing list](http://groups.google.com/group/nhusers) about how to map a property that is calculated in the domain but needs to be persisted in order to query data based on this property's value.

The thread is [here](http://groups.google.com/group/nhusers/browse_thread/thread/7251b55b123b1e1b?tvc=2&q=+Calculated+property+mapping+) and the sample I've used is the following:

``` cs
public decimal Total
{
   get { return calculateTotal(); }
}

private decimal calculateTotal()
{
   return children.Sum(x => x.Price);
}
```

Basically, you have 3 options to persist this property.


### 1. Add an empty set method

This is the simplest but the ugliest of the three, you don't need to do anything else and it works just fine:

``` cs
public decimal Total
{
   get { return calculateTotal(); }
   set { }
}
```


### 2. Use a nullable field to hold the value

Fabio suggested this approach:

``` cs
private decimal total?;

public decimal Total
{
    get
    {
        if (!total.HasValue)
            total = calculateTotal();
        return total.Value;
    }
}

public Item AddItem()
{
    invalidateTotal();
}

private void invalidateTotal()
{
    total = null;
}
```

In this case, the Total property is only calculated the first time that is required and its value cached, also you need to add calls to invalidateTotal() in every operation that would alter the result of the calculation.

Here you should use `access="field.camelcase"` when mapping the property.

As long as you don't call `invalidateTotal()` again, the calculated value is persisted and restored from the DB without processing the sum again.

This method is the most efficient, but requires you to put `invalidateTotal()` calls (and to don't forget about that) in some places... if you have a few calculated properties that each one depends on a few others it can get quite messy.


### 3. Read-only property accessor

Because of this issue, I've dove into NHibernate source code and tried to create a new property accessor that would allow me to map the domain that I really want without any hassle.

I was surprised at how easy I've found what I wanted to do inside that jungle.

I've created a JIRA issue with the patch ~~but so far it is not applied to the trunk.~~

In the mean time you can use the readonly property accessor from [here](invalid link) mapping it using the custom accessor functionality of NHibernate like this:

``` xml
<property name="Total" type="Decimal" access="Namespace.ReadonlyAccessor, Assembly"/>
```

(remember to replace Namespace and Assembly with the real namespace and assembly name where you put ReadonlyPropertyAccessor.cs)

This ReadonlyPropertyAccessor is working against NHibernate 2.0.0.GA and it needs a minor spell correction to make it work against the trunk... you will notice if you try.

---

So, here we are... those were the 3 options... choose whichever you like most.