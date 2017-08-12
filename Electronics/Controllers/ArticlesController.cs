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
    public class ArticlesController : ApiController
    {
		public HttpResponseMessage Get(int? top, int? id, int? authorid, int? subjectid)
		{
			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var ee_articles = ee.GetArticles(id, null, null, null, authorid, subjectid, top).ToList();
				var articles = new List<object>();
				foreach (var article in ee_articles)
				{
					articles.Add(new
					{
						ID = article.ID,
						CreationTime = article.CreationTime,
						Description = article.Description,
						FilePath = article.FilePath,
						MainText = article.MainText,
						ModificationTime = article.ModificationTime,
						Title = article.Title,
						Authors = ee.GetArticlesAuthors(article.ID, null).ToList().Select(aa => aa.AuthorID).ToList(),
						Subjects = ee.GetArticlesSubjects(article.ID, null).ToList().Select(aa=>aa.SubjectID).ToList(),
						IsImageOnly = article.IsImageOnly,
						IsTextOnly = article.IsTextOnly
					});
				}
				return Globals.FinishResponse(articles);
			}
		}
		public HttpResponseMessage Post()
		{
			try
			{
				HttpContext.Current.Request.InputStream.Seek(0, SeekOrigin.Begin);
				string requestJSON = new StreamReader(HttpContext.Current.Request.InputStream).ReadToEnd().ToString();

				ArticlesRequest req = JsonConvert.DeserializeObject<ArticlesRequest>(requestJSON);

				using (ElectronicsEntities ee = new ElectronicsEntities())
				{
					var id = ee.SetArticle(req.ID, req.IsTextOnly && !string.IsNullOrEmpty(req.MainText) && req.MainText.IndexOf(" ") > 0 ? req.MainText.Substring(0, req.MainText.IndexOf(" ")) : req.Title, req.MainText ?? "", req.FilePath ?? "", req.Description ?? "", string.Join(",", req.Authors), string.Join(",", req.Subjects), req.IsImageOnly, req.IsTextOnly).FirstOrDefault();

					return Globals.FinishResponse(id);
				}
			}
			catch(Exception ex)
			{
				return Globals.FinishResponse(new { Error = true });
			}
		}

		public HttpResponseMessage Delete()
		{
			HttpContext.Current.Request.InputStream.Seek(0, SeekOrigin.Begin);
			string requestJSON = new StreamReader(HttpContext.Current.Request.InputStream).ReadToEnd().ToString();

			Article art = JsonConvert.DeserializeObject<Article>(requestJSON);

			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var res = ee.DeleteArticles(art.ID).FirstOrDefault();

				return Globals.FinishResponse(res);
			}
		}
	}
}
