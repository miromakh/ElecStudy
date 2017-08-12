using System;
using System.Collections;
using System.Web.UI;
using Electronics.Models;

namespace Electronics
{
	public partial class Default : Page
	{
        protected void Page_Load(object sender, EventArgs e)
        {
			Hashtable cd = new Hashtable();
			cd["LoggedAuthor"] = Session["LoggedAuthor"];

			Page.SetClientVariables(cd);
		}
	}
}