---
layout: post
title: Deferred execution based on PropertyChanged
originalUrl: /2010/12/deferred-execution-based-on-propertychanged.html
date: 2010-12-13 02:51
comments: true
categories: ['c#', 'tools']
---

A few days ago I was implementing toast notifications for a Silverlight application (SL 4 has support for toast notifications but it is only available to out-of-browser applications) and one of the features that I wanted to implement was that the notification doesn't go away while the user holds the mouse pointer over it - pretty much like Tweetdeck notifications.

The idea was that I'd start a timer when the notification is shown and when it times out, if the mouse pointer wasn't over the notification window it would fade out, but if the mouse was indeed over the notification, I'd hook into the MouseLeave event to defer hiding the notification until that event was triggered.

Since I was using the MVVM pattern, rather than handling this in code-behind and attaching directly to the MouseLeave event I had a ViewModel bound to the notification view (UserControl) with a property called IsMouseOver (in the sample application I update this property directly from the events handler in code-behind, but in my actual application I'm using Caliburn and doing all this using its [Actions](http://caliburn.codeplex.com/wikipage?title=Action%20Basics&referringTitle=Documentation) feature).

So, the code for the timer tick handler was something like this:

``` cs
if (!IsMouseOver)
{
	RequestClose();
}
else
{
	Observable.FromEvent<PropertyChangedEventArgs>(this, "PropertyChanged")
		.Where(ev => ev.EventArgs.PropertyName == "IsMouseOver" && !((NotificationViewModel)ev.Sender).IsMouseOver)
		.Subscribe(delegate { RequestClose(); });
}
```

Notice that here I used Rx (because I already had the reference) to hook to the PropertyChanged event of the notification ViewModel to monitor the IsMouseOver property value and trigger the closing of the notification when it becomes false.

At the time of writing, that was the easiest way to accomplish the requirement, but it sparked a light in my head and made me think about which would be the ideal syntax for that code... and I always end up thinking about something like this:

``` cs
Execute.NowOrWhenBecomesTrue(() => IsMouseOver == false, () => RequestClose());
```

So, now after a quite lengthy intro I want to show you how did I implement this method:

``` cs
public static class Execute
{
	private static readonly ExpressionType[] ValidExpressionTypes =
		new[]
			{
				ExpressionType.Equal, ExpressionType.NotEqual,
				ExpressionType.GreaterThan,
				ExpressionType.GreaterThanOrEqual,
				ExpressionType.LessThan,
				ExpressionType.LessThanOrEqual
			};

	public static void NowOrWhenBecomesTrue(Expression<Func<bool>> condition, Action action)
	{
		var compiledCondition = condition.Compile();
			
		if (compiledCondition())
		{
			action();
			return;
		}

		var binaryExpression = condition.Body as BinaryExpression;
		if (binaryExpression == null)
			throw new ArgumentException("must be a binary expression", "condition");

		if (ValidExpressionTypes.Any(t => t == binaryExpression.NodeType) == false)
			throw new ArgumentException("expression is invalid, it must be ==, !=, >, >=, < or <=");

		var memberExpression = binaryExpression.Left as MemberExpression;
		if (memberExpression == null)
			throw new ArgumentException("left side of expression must be a property access", "condition");

		var propertyName = memberExpression.Member.Name;

		var inpc = GetHostFromExpression(memberExpression.Expression) as INotifyPropertyChanged;
		if (inpc == null)
			throw new ArgumentException("cannot determine INotifyPropertyChanged implementor to watch", "condition");

		PropertyChangedEventHandler handler = null;
		handler = (s, e) =>
			        {
						if (e.PropertyName == propertyName)
			          	{
							if (compiledCondition())
							{
								action();
								inpc.PropertyChanged -= handler;
							}
			          	}
			        };

		inpc.PropertyChanged += handler;
	}

	private static object GetHostFromExpression(Expression expression)
	{
		if (expression.NodeType == ExpressionType.Constant)
			// case with "this" pointer
			return ((ConstantExpression)expression).Value;
			
		if (expression.NodeType == ExpressionType.MemberAccess)
			// case when accessing a property of an object other than "this"
			return GetObjectFromMemberExpression((MemberExpression)expression);

		return null;
	}

	private static object GetObjectFromMemberExpression(MemberExpression memberExpression)
	{
		var memberAccessor = memberExpression.Member;
		var host = GetHostFromExpression(memberExpression.Expression);
		return host == null ? null : GetObjectFromMember(memberAccessor, host);
	}

	private static object GetObjectFromMember(MemberInfo memberInfo, object host)
	{
		switch (memberInfo.MemberType)
		{
			case (MemberTypes.Property):
				return ((PropertyInfo) memberInfo).GetValue(host, null);
			case (MemberTypes.Field):
				return ((FieldInfo) memberInfo).GetValue(host);
		}
		return null;
	}
}
```

The main idea is that it takes a the left hand side expression of [BinaryExpression](http://msdn.microsoft.com/en-us/library/system.linq.expressions.binaryexpression.aspx), gets the name of the property that needs to be watched and tries to get the object instance that contains that property; it then hooks a handler for its PropertyChanged event where the expression is evaluated and based on its result the required action is executed; it then unhook the delegate to prevent further executions.

While the implementation is not perfect, it provides the desired functionality and some more:

* it works on "this" class' properties
* it works on nested properties: if you have a property (or field) that implements INotifyPropertyChange you can attach to one of its properties too
* the expression comparison can be any of these: ==, !=, <, <=, >, >=

A simple "notifications" sample application using this helper can be found [here](/assets/attachments/NotificationsDemo.7z')

As a side note, I think that this is one piece of code that can benefit from the deployment method that [Daniel](http://www.clariusconsulting.net/blogs/kzu/) describes [here](http://www.clariusconsulting.net/blogs/kzu/archive/2010/12/08/HowtocreatelightweightreusablesourcecodewithNuGet.aspx).
