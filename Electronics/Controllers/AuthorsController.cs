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
using System.Web.SessionState;

namespace Electronics.Controllers
{
    public class AuthorsController : ApiController, IRequiresSessionState
    {
		public HttpResponseMessage Get()
		{
			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var ee_authors = ee.GetAuthors(null, null, null, null, null).ToList();
				
				foreach(var a in ee_authors)
				{
					a.Username = "";
					a.Password = "";
				}

				return Globals.FinishResponse(ee_authors);
			}
		}

		public HttpResponseMessage Post()
		{
			HttpContext.Current.Request.InputStream.Seek(0, SeekOrigin.Begin);
			string requestJSON = new StreamReader(HttpContext.Current.Request.InputStream).ReadToEnd().ToString();

			AuthorsRequest req = JsonConvert.DeserializeObject<AuthorsRequest>(requestJSON);

			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				req.ID = ee.SetAuthor(req.ID, req.Name, req.FilePath, req.Description, req.Username, req.Password).FirstOrDefault();

				return Globals.FinishResponse(req);
			}
		}
	}
}
