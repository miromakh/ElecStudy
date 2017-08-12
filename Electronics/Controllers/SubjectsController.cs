using Electronics.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Electronics.Controllers
{
    public class SubjectsController : ApiController
    {
		public HttpResponseMessage Get()
		{
			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var ee_subjects = ee.GetSubjects(null, null, null);
				List<SubjectResponse> subjects = new List<SubjectResponse>();
				foreach (var s in ee_subjects)
				{
					var ee_articles = ee.GetArticles(null, null, null, null, null, s.ID, null).ToList();
					subjects.Add(new SubjectResponse
					{
						ID = s.ID,
						ParentID = s.ParentID,
						Name = s.Name,
						Articles = ee_articles.Select(a => new { ID = a.ID, Title = a.Title, URL = a.FilePath })
					});
				}

				return Globals.FinishResponse(subjects);
			}
		}

		public HttpResponseMessage Post()
		{
			HttpContext.Current.Request.InputStream.Seek(0, SeekOrigin.Begin);
			string requestJSON = new StreamReader(HttpContext.Current.Request.InputStream).ReadToEnd().ToString();

			Subject sbj = JsonConvert.DeserializeObject<Subject>(requestJSON);

			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var res = ee.SetSubject(sbj.ID, sbj.ParentID, sbj.Name).FirstOrDefault();

				return Globals.FinishResponse(res);
			}
		}

		public HttpResponseMessage Delete()
		{
			HttpContext.Current.Request.InputStream.Seek(0, SeekOrigin.Begin);
			string requestJSON = new StreamReader(HttpContext.Current.Request.InputStream).ReadToEnd().ToString();

			Subject sbj = JsonConvert.DeserializeObject<Subject>(requestJSON);

			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var res = ee.DeleteSubjects(sbj.ID, null).FirstOrDefault();

				return Globals.FinishResponse(res);
			}
		}
	}
}
