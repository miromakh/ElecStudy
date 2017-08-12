using Electronics.Models;
using Emgu.CV;
using Emgu.CV.Structure;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Http;

namespace Electronics.Controllers
{
    public class UploadController : ApiController
    {
		public HttpResponseMessage Post()
		{
			//Logger.Write("Starting upload");

			HttpResponseMessage rm = new HttpResponseMessage(HttpStatusCode.OK);
			rm.PublicCache(true);
			JsonMediaTypeFormatter jmtf = new JsonMediaTypeFormatter();
			jmtf.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;

			string script;
			var httpRequest = HttpContext.Current.Request;

			//Logger.Write($"Got {httpRequest.Files.Count} file(s)");

			if (httpRequest.Files.Count > 0)
			{
				var postedFile = httpRequest.Files[0];
				string type = "Images"; //postedFile.FileName.ToLower().EndsWith("jpg") || postedFile.FileName.ToLower().EndsWith("png") ? "Images" : "Documents";
				var filePath = HttpContext.Current.Server.MapPath($"~/UploadedFiles/{type}/{postedFile.FileName}");

				try
				{
					Bitmap img = new Bitmap(postedFile.InputStream);
					img.Dispose();
				}
				catch(Exception ex)
				{
					type = "Documents";
				}

				postedFile.SaveAs(filePath);

				//Logger.Write($"Saved file - {filePath}");

				var requestType = httpRequest.Form["type"];

				//Logger.Write($"Request type is '{requestType}'");

				switch(requestType)
				{
					case "article":
						script = $"<script type='text/javascript'>(function(){{" +
							$"parent.model.NewArticle().FileUploadState({{FilePath:'UploadedFiles/{type}/{postedFile.FileName}',ErrorMessage:'',IsError:false}});}})();" +
							$"parent.$.page.hideLoading();</script>";
						break;
					case "author":
						bool isImage = true;
						string error = "";
						try
						{
							//Logger.Write("Creating bitmap");

							Bitmap img = new Bitmap(filePath);

							//Logger.Write("Created bitmap");

							//Logger.Write("Detecting faces");
							var faces = FaceDetector.DetectFaces(new Image<Bgr, byte>(img).Mat);

							//Logger.Write($"Detected {faces.Count} face(s)");

							if (faces.Count < 1)
							{
								isImage = false;
								error = "לא זוהו פנים בתמונה שהועלתה";
								img.Dispose();
							}
							else
							{
								//Logger.Write("Resizing image");
								using (Image newImage = img.ToFixedSize(300, 300))
								{
									img.Dispose();
									if (File.Exists(filePath))
										File.Delete(filePath);
									newImage.Save(filePath, System.Drawing.Imaging.ImageFormat.Png);
									//Logger.Write("Resized image");
								}
							}

						}
						catch(Exception ex)
						{
							while (ex != null)
							{
								Logger.Write(ex.Message);
								ex = ex.InnerException;
							}
							error = "הקובץ שהועלה אינו תמונה";
							isImage = false;
						}

						if(!isImage)
						{
							if(File.Exists(filePath))
								File.Delete(filePath);
						}
						else
						{

						}

						script = $"<script type='text/javascript'>(function()" +
							$"{{\r\n" +
						//	$"	debugger\r\n" +
							$"	parent.model.NewAuthorHolder.Author.FileUploadState(" +
							$"		new parent.FileUploadState(\r\n" +
							$"		{{" +
							$"			FilePath:'{(isImage?$"UploadedFiles/{type}/{postedFile.FileName}":"Images/no-photo.jpg")}',\r\n" +
							$"			ErrorMessage:'{error.Replace("'", "\\'")}',\r\n" +
							$"			IsError:{(!isImage).ToString().ToLower()}" +
							$"		}}));\r\n" +
							$"}})();" +
							$"parent.$.page.hideLoading();\r\n" +
							$"</script>";
						break;
					default:
						script = "";
						break;
				}
				
			}
			else
			{
				script = $"<script type='text/javascript'></script>"; //(function(){{parent.model.NewArticle().FilePath('');}})();
			}
			
			rm.Content = new StringContent(script, Encoding.UTF8, "text/html");

			return rm;
		}

		//protected void Page_Load(object sender, EventArgs e)
		//{
		//	Microsoft.Office.Interop.Word.Application appWord = new Microsoft.Office.Interop.Word.Application();
		//	wordDocument = appWord.Documents.Open(@"D:\desktop\xxxxxx.docx");
		//	wordDocument.ExportAsFixedFormat(@"D:\desktop\DocTo.pdf", WdExportFormat.wdExportFormatPDF);
		//}
		//public Microsoft.Office.Interop.Word.Document wordDocument { get; set; }
	}
}
