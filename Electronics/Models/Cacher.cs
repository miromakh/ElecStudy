using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

public static class Cacher
{
	private static object _locker = new object();
	private static Dictionary<string, CacheItem> _cachedResults = new Dictionary<string, CacheItem>();

	public static T GetFromCache<T>(Func<T> action, string cachekey, bool force = false, int cacheTimeMinutes = 60 /*, Dictionary<string, object> ret = null, string dictKey = null*/)
	{
		string code = string.IsNullOrEmpty(cachekey) ? action.GetHashCode().ToString() : cachekey;
		CacheItem item = null;

		lock (_locker)
		{
			if (_cachedResults.ContainsKey(code))
			{
				item = _cachedResults[code];
			}
			else
			{
				item = new CacheItem { LastUpdateTime = DateTime.MinValue };
				_cachedResults.Add(code, item);
			}
		}

		if (item == null || force || (item != null && !force && item.LastUpdateTime.AddMinutes(cacheTimeMinutes) < DateTime.Now))
		{
			lock (item.locker)
			{
				if (item == null || force || (item != null && !force && item.LastUpdateTime.AddMinutes(cacheTimeMinutes) < DateTime.Now))
				{
					#region action
					var oldResult = item.Result;
					try
					{
						item.Result = action();
						item.LastUpdateTime = DateTime.Now;
					}
					catch (Exception ex)
					{
						item.Result = (T)oldResult;
					}
					if (item.Result == null)
					{
						item.Result = oldResult;
						return (T)item.Result;
					}

					Type resType = item.Result.GetType();
					PropertyInfo piData = resType.GetProperty("data");
					bool hasData = piData != null;
					var dataValue = hasData ? piData.GetValue(item.Result) : null;
					bool isDataNull = dataValue == null;
					bool isDataTable = resType?.BaseType?.BaseType?.Name == "DataTable";
					//bool isEmpty = 

					if ((hasData && isDataNull) || (isDataTable && (item.Result as System.Data.DataTable).Rows.Count == 0))
					{
						item.Result = oldResult;
						return (T)item.Result;
					}

					Type dataType = hasData ? piData.GetType() : null;
					bool isDataEnumerable = hasData && dataType != null && (dataType.GetInterfaces().Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>) && dataType.IsAssignableFrom(i.GetGenericArguments()[0])).Count() > 0);

					if (isDataEnumerable && (dataValue as IEnumerable<object>).Count() == 0)
					{
						item.Result = oldResult;
						return (T)item.Result;
					}

					return (T)item.Result;
					#endregion
				}
				else if (item != null)
				{
					return (T)item.Result;
				}
			}
		}
		else if (item != null)
		{
			return (T)item.Result;
		}
		return default(T);
	}
}
class CacheItem
{
	public DateTime LastUpdateTime { get; set; }
	public object Result { get; set; }
	public object locker { get; set; } = new object();
}
