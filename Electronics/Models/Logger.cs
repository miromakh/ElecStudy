using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;

namespace Electronics.Models
{
	public class Logger
	{
		private static HttpContext Context;

		private static bool IsWeb => Process.GetCurrentProcess().ProcessName.ToUpper().Contains("W3WP") || Process.GetCurrentProcess().ProcessName.ToUpper().Contains("IIS");
		static Logger()
		{
			
		}

		public static void Write(string logMessage)
		{
			try
			{
				Log(logMessage);
			}
			catch (IOException e)
			{
				
			}
		}

		private static readonly object _syncObject = new object();

		private static void Log(string logMessage)
		{
			lock (_syncObject)
			{
				string folderName = "";
				string fileName = "";

				if (IsWeb)
				{
					if (HttpContext.Current != null)
					{
						Context = HttpContext.Current;
					}
					if (Context != null)
					{
						folderName = Context.Server.MapPath("Logs");
						fileName = Context.Server.MapPath($"Logs/log.txt");
					}
				}
				else
				{
					folderName = System.Windows.Forms.Application.StartupPath.TrimEnd('\\') + "\\Logs";
					fileName = $"{folderName}\\log.txt";
				}

				if (!Directory.Exists(folderName)) Directory.CreateDirectory(folderName);
				if (!File.Exists(fileName)) File.Create(fileName)?.Close();

				File.AppendAllText(fileName, $"{DateTime.Now.ToString("yyyy-MM-dd")} {DateTime.Now.ToString("HH:mm:ss.fff")}: {logMessage}{Environment.NewLine}");


				//logMessage + Environment.NewLine);
			}
		}

	}
}