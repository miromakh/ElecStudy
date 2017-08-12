using Electronics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Electronics.Controllers
{
    public class NewsController : ApiController
    {
		public HttpResponseMessage Get(int top)
		{
			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				var ee_news = ee.GetNews(null, null, null, top).ToList();

				return Globals.FinishResponse(ee_news);
			}
		}
	}
}
