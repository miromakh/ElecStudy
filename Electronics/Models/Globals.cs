using Emgu.CV;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Web;
using System.Web.UI;

namespace Electronics.Models
{
	public static class Globals
	{
		public static HttpResponseMessage PublicCache(this HttpResponseMessage response, bool noStore, bool noCache = true, bool mustRevalidate = true)
		{
			response.Headers.CacheControl = new CacheControlHeaderValue { NoStore = noStore, NoCache = noCache, MustRevalidate = mustRevalidate };
			if (noCache)
				response.Headers.Add("Pragma", "No-Cache");

			return response;
		}
		public static HttpResponseMessage FinishResponse<T>(T obj, Dictionary<string,string> contentHeaders = null)
		{
			HttpResponseMessage rm = new HttpResponseMessage(HttpStatusCode.OK);
			
			JsonMediaTypeFormatter jmtf = new JsonMediaTypeFormatter();
			jmtf.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;

			try
			{
				rm.PublicCache(true);

				if (obj == null)
				{
					rm.Content = new ObjectContent<string>("null", jmtf);
				}
				else
				{
					if (obj.GetType().IsArray || obj.GetType().GetInterfaces().Where(i => new string[] { "list", "enumerable", "collection" }.Contains(i.Name.ToLower())).Count() > 0)
					{
						List<object> l = new List<object>();
						IEnumerator ie = ((IEnumerable)obj).GetEnumerator();
						ie.Reset();

						while (ie.MoveNext())
						{
							l.Add(ie.Current);
						}
						rm.Content = new ObjectContent<List<object>>(l, jmtf);
					}
					else
					{
						rm.Content = new ObjectContent<object>(obj, jmtf);
					}
				}
			}
			catch (Exception ex)
			{
				
			}

			if (contentHeaders != null)
			{
				foreach (var h in contentHeaders)
				{
					rm.Content.Headers.Add(h.Key, h.Value);
				}
			}

			return rm;
		}

		public static Image ToFixedSize(this Image imgPhoto, int Width, int Height)
		{
			int sourceWidth = imgPhoto.Width;
			int sourceHeight = imgPhoto.Height;
			int sourceX = 0;
			int sourceY = 0;
			int destX = 0;
			int destY = 0;

			float nPercent = 0;
			float nPercentW = 0;
			float nPercentH = 0;

			nPercentW = ((float)Width / (float)sourceWidth);
			nPercentH = ((float)Height / (float)sourceHeight);
			if (nPercentH < nPercentW)
			{
				nPercent = nPercentH;
				destX = Convert.ToInt16((Width -
							  (sourceWidth * nPercent)) / 2);
			}
			else
			{
				nPercent = nPercentW;
				destY = Convert.ToInt16((Height -
							  (sourceHeight * nPercent)) / 2);
			}

			int destWidth = (int)(sourceWidth * nPercent);
			int destHeight = (int)(sourceHeight * nPercent);

			Bitmap bmPhoto = new Bitmap(Width, Height, System.Drawing.Imaging.PixelFormat.Format24bppRgb);
			bmPhoto.SetResolution(imgPhoto.HorizontalResolution,
							 imgPhoto.VerticalResolution);

			Graphics grPhoto = Graphics.FromImage(bmPhoto);
			grPhoto.Clear(Color.Transparent);
			grPhoto.InterpolationMode =
					System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;

			grPhoto.DrawImage(imgPhoto,
				new Rectangle(destX, destY, destWidth, destHeight),
				new Rectangle(sourceX, sourceY, sourceWidth, sourceHeight),
				GraphicsUnit.Pixel);

			grPhoto.Dispose();
			return bmPhoto;
		}

		public static void SetClientVariables(this Page p, Hashtable hashToSerialize)
		{
			if (hashToSerialize == null) return;
			var hf = p.Master == null ? p.FindControl("hidPageData") : p.Master.FindControl("hidPageData");
			if (hf == null)return;
			string value = (string)hf.GetType().GetProperty("Value").GetValue(hf, null);
			if (value != "")
			{
				Hashtable ht = JsonConvert.DeserializeObject<Hashtable>(value);
				foreach (string key in ht.Keys)
				{
					if (hashToSerialize.Contains(key)) continue;
					hashToSerialize[key] = ht[key];
				}
			}
			hf.GetType().GetProperty("Value").SetValue(hf, JsonConvert.SerializeObject(hashToSerialize), null);

			// SAMPLE
			//	Hashtable cd = new Hashtable();
			//	cd[“text"] = “Hello, World!”;
			//	cd[“number"] = 1000;
			//	cd[“object”] = new {id=1, name=“Sample object”};
			//	this.Page.SetClientVariables(cd);

			// Javascript
			// var cd = eval(document.getElementById("hidPageData").value);
		}
	}

	public class FaceDetector
	{
		public static List<Rectangle> DetectFaces(Mat image)
		{
			List<Rectangle> faces = new List<Rectangle>();
			var facesCascade = HttpContext.Current.Server.MapPath("~/Models/haarcascade_frontalface_default.xml");
			using (CascadeClassifier face = new CascadeClassifier(facesCascade))
			{
				using (UMat ugray = new UMat())
				{
					try
					{
						CvInvoke.CvtColor(image, ugray, Emgu.CV.CvEnum.ColorConversion.Bgr2Gray);

						//normalizes brightness and increases contrast of the image
						CvInvoke.EqualizeHist(ugray, ugray);

						//Detect the faces  from the gray scale image and store the locations as rectangle
						//The first dimensional is the channel
						//The second dimension is the index of the rectangle in the specific channel
						Rectangle[] facesDetected = face.DetectMultiScale(
						   ugray,
						   1.1,
						   10,
						   new Size(20, 20));

						faces.AddRange(facesDetected);
					}
					catch (Exception ex)
					{
						while (ex != null)
						{
							Logger.Write(ex.Message);
							ex = ex.InnerException;
						}
					}
				}
			}
			return faces;
		}
	}


}