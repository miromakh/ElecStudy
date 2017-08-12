using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Electronics.Models
{
	public class SubjectResponse
	{
		public int? ID { get; set; }
		public int? ParentID { get; set; }
		public string Name { get; set; }
		public IEnumerable<object> Articles { get; set; }
	}
}