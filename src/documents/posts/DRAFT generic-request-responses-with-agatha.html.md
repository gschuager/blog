---
layout: post
title: Generic request/responses with Agatha
date: 2011-07-12 10:41
comments: true
categories: []
ignored: true
---

One of the first things that I noticed when started using Agatha was that it doesn't support using open generic types for requests and responses.

At that time I was trying to construct some infrastructure to simplify the implementation of the admin/CRUD part of the project I was working on and my idea was to have something like GetEntityRequest&lt;TDto&gt;, SaveEntityRequest&lt;TDto&gt;, DeleteEntityRequest&lt;TDto&gt;, etc where TDto would be a DTO type that would map to one of my domain entities; this mapping was solved using Automaper.

I'm not a WCF expert, but I concluded that the limitation is related to the fact that WCF needs to know beforehand which types are going to be transmited over the wire, hence serialized and deserialized; these are known as "<a href="http://msdn.microsoft.com/en-us/library/ms730167.aspx">Known Types</a>".

The solution that I ended up with was to "close" the generic request/response types with every possible generic parameter that I needed, and to register those closed generic types as Known Types. In order to know which were the types allowed to be used as the generic parameter, I limited those to the ones that implement an interface specified as generic constraint for that generic parameter... kinda tongue-twister :)

Lets see some code:
[csharp]
public class SaveEntityRequest&lt;TDto&gt; : Request
	where TDto : IDtoWithId
{
	public TDto Entity { get; set; }
}

public interface IDtoWithId
{
	int Id { get; set; }
}
[/csharp]

This made a lot of sense as I will be needing that Id property in my generic handlers in order to delegate it to NHibernate to do its work.


