using Electronics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.SessionState;

namespace Electronics.Controllers
{
    public class LoginoutController : ApiController, IRequiresSessionState
    {
		public HttpResponseMessage Get(string username = null, string password = null)
		{
			using (ElectronicsEntities ee = new ElectronicsEntities())
			{
				if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
				{
					var a = ee.GetAuthors(null, null, null, username, password).FirstOrDefault();
					a.Username = "";
					a.Password = "";
					HttpContext.Current.Session["LoggedAuthor"] = a;
				}
				return Globals.FinishResponse((Author)HttpContext.Current.Session["LoggedAuthor"]);
			}
		}
	}
}
