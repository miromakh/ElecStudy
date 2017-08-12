using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Electronics.Models
{
	public class SubjectsRequest
	{
		public int? ID { get; set; }
		public int? ParentID { get; set; }
		public string Name { get; set; }
	}

	public class ArticlesRequest
	{
		public int? Top { get; set; }
		public int? ID { get; set; }
		public List<int> Authors { get; set; }
		public List<int> Subjects { get; set; }
		public string Title { get; set; }
		public string Description { get; set; }
		public string MainText { get; set; }
		public string FilePath { get; set; }
		public bool IsImageOnly { get; set; }
		public bool IsTextOnly { get; set; }
	}

	public class AuthorsRequest
	{
		public int? ID { get; set; }
		public string Name { get; set; }
		public string Description { get; set; }
		public string FilePath { get; set; }
		public string Username { get; set; }
		public string Password { get; set; }
	}
}