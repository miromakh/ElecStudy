using Electronics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Electronics.Controllers
{
    public class SearchController : ApiController
    {
		public HttpResponseMessage Get(string q)
		{
			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var ee_subjects = ee.GetSubjects(null, null, q).ToList();
				var ee_articlesT = ee.GetArticles(null, q, null, null, null, null, null);
				var ee_articlesD = ee.GetArticles(null, null, q, null, null, null, null);
				var ee_articlesM = ee.GetArticles(null, null, null, q, null, null, null);

				var joined = ee_subjects.Select(s => new { Title = s.Name, ID = s.ID, Type = "S" }).ToList();
				joined.AddRange(ee_articlesT.Select(a => new { Title = a.Title, ID = a.ID, Type = "A" }).ToList());
				joined.AddRange(ee_articlesD.Select(a => new { Title = a.Title, ID = a.ID, Type = "A" }).ToList());
				joined.AddRange(ee_articlesM.Select(a => new { Title = a.Title, ID = a.ID, Type = "A" }).ToList());

				return Globals.FinishResponse(joined);
			}
		}
	}
}
