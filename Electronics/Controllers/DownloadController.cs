using Electronics.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Electronics.Controllers
{
    public class DownloadController : ApiController
    {
		public HttpResponseMessage Get(string fileName)
		{
			var path = HttpContext.Current.Server.MapPath(fileName);
			HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
			var stream = new FileStream(path, FileMode.Open);
			result.Content = new StreamContent(stream);
			result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline");
			result.Content.Headers.ContentDisposition.FileName = Path.GetFileName(path);
			result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/" + (fileName.EndsWith("pdf") ? "pdf" : "octet-stream"));
			result.Content.Headers.ContentLength = stream.Length;
			return result;
		} 
    }
}
