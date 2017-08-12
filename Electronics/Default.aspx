<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="Electronics.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>אלקטרו סטדי</title>
    <script runat="server">
        protected string GetBrowserCssClasses()
        {
            var name = Request.Browser.Browser.Replace("InternetExplorer", "IE").Replace("Firefox", "FF");
            return "rtl " + name + " " +  (name + Request.Browser.MajorVersion) + " " +  (name + Request.Browser.MajorVersion + Request.Browser.MinorVersion);
        }
    </script>
	<link rel="shortcut icon" href="Images/favicon.ico" />
	<link href="CSS/bootstrap-rtl.css" rel="stylesheet" />
	<link href="CSS/bootstrap-theme.css" rel="stylesheet" />
	<link href="CSS/easyTree.css" rel="stylesheet" />
	<link href="CSS/Default.css" rel="stylesheet" />
</head>
<body class="<%=GetBrowserCssClasses() %>">
    <form id="form1" runat="server" >
		<asp:HiddenField ID="hidPageData" runat="server" ClientIDMode="Static" />
    </form>
	<div class="container-fluid">
        <div class="row">
			<div class="col-sm-2 panel-body" data-bind="visible: AuthorUnlogged">
				<!-- LOGIN -->
				<div class="form-group ">
					<input type="text" name="username" id="username" tabindex="1" class="form-control" placeholder="שם משתמש" value="" />
				</div>
				<div class="form-group">
					<input type="password" name="password" id="password" tabindex="2" class="form-control" placeholder="סיסמאה" />
				</div>
				<div class="form-group">
					<div class="row">
						<div class="col-sm-6 col-sm-offset-3">
							<button tabindex="3" class="form-control btn btn-login bg-success" data-bind="click: Login">כניסה</button>
						</div>
					</div>
				</div>
			</div>
			<div class="col-sm-2 panel-body" data-bind="visible: AuthorLogged">
				<!-- LOGOUT -->
				<div class="form-group">
					<div class="row">
						<div class="col-sm-6"><img data-bind="attr: { src: LoggedAuthorPictureUrl, title: LoggedAuthorName }" width="148" height="148" class="img-circle" /></div>
						<div class="col-sm-6">
							<br />
							<button tabindex="3" class="form-control btn btn-login bg-success" data-bind="click: Logout">יציאה</button>
						</div>
					</div>
				</div>
			</div>
			<div class="col-sm-8 text-center">
				<!-- LOGO + TITLE -->
				<img src="Images/logo4.png"/><h5>בנק חומרי לימוד של מגמת אלקטרוניקה וחשמל</h5>
			</div>
			<div class="col-sm-2">
				<!-- CUSTOM -->custom 2
			</div>
        </div>
		<div class="row">
			<div class="col-sm-3">
				<!-- MENU -->
				<div id="treeview" class="easy-tree"></div>
				<div id="treeview_staff" class="easy-tree">
					<ul>
						<li class="parent_li">
							<span>
								<span  title="סגור עץ" class="glyphicon glyphicon-minus"></span>
								<a href="javascript: void(0)">צוות ומורים</a>
							</span>
							<ul>
							<!-- ko foreach: Authors -->
								<li data-bind="event: { click: Edit }">
									<span>
										<span class="glyphicon glyphicon-asterisk"></span>
										<a href="javascript: void(0);" data-bind="text: Name">אילנה טרוצקובסקי</a>
									</span>
								</li>
							<!-- /ko -->
							</ul>
						</li>
					</ul>
				</div>
			</div>
			<div class="col-sm-7 text-right panel panel-default">
				<!-- MAIN CONTENT -->
				<div class="panel-body">
				<div class="row" data-bind="visible: Mode_Articles">
					<div class="col-sm-12" data-bind="if: Articles().length == 0">אין כתבות <span data-bind="visible: SubjectSelected"> בנושה</span> "<span data-bind="text: SelectedSubjectName"></span>"</div>
					<div class="row">
						<!-- ko foreach: Articles -->
						<div class="col-sm-4">
							<div class="panel panel-default">
								<div class="panel-heading" data-bind="text: Title"></div>
								<div class="panel-body">
									<div data-bind="text: Description, visible: IsRegular"></div>
									<div data-bind="visible: IsImageOnly">
										<img alt="" data-bind="attr: { src: FileUploadState().FilePath }" style="width:100%" />
									</div>
									<div data-bind="visible: IsTextOnly, text: MainText().substr(0, MainText().length > 250 ? 250 : MainText().length)">
										
									</div>
									<div class="padding0_2em"></div>
									<div class="font08em">נושים:</div>
									<!-- ko foreach: SubjectsList -->
									<div data-bind="text: Name, attr: { title: Parents }, event: { click: FindInTree}" class="font08em pointer"></div>
									<!-- /ko -->
									<div class="padding0_2em"></div>
									<div class="font08em">מחברים:</div>
									<!-- ko foreach: AuthorsList -->
									<div data-bind="text: Name, attr: { title: '<img src=\'' + FileUploadState().FilePath() + '\' style=\'width:100px; float:right;\' />' + Description() }" class="font08em cursor-default"></div>
									<!-- /ko -->
								</div>
								<div class="panel-footer">
									<div class="row">
										<div data-bind="css: { 'col-sm-8': window.model.AuthorLogged, 'col-sm-12': !window.model.AuthorLogged() }">
											<button class="btn btn-default btn-sm btn-lg" title="ראה את הכתבה" data-bind="click: View"><span class="glyphicon glyphicon-eye-open"></span></button>
										</div>
										<div class="col-sm-4" data-bind="visible: window.model.AuthorLogged">
											<button class="btn btn-default btn-sm btn-primary" title="ערוך" data-bind="click: Edit, visible: $parent.SubjectSelected"><span class="glyphicon glyphicon-edit"></span></button>
											<button class="btn btn-default btn-sm btn-danger" title="מחק" data-bind="click: Delete, visible: $parent.SubjectSelected"><span class="glyphicon glyphicon-remove"></span></button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- /ko -->
					</div>
					<div class="row" data-bind="visible: Mode_AllArticles">
						<div class="col-sm-12">
							<button class="btn btn-default btn-sm btn-success" data-bind="click: SetNewArticleMode, attr: { title: 'הוסף כתבה בנושה &quot;' + SelectedSubjectName() + '&quot;' }, visible: AuthorLogged"><span class="glyphicon glyphicon-plus"></span></button>
						</div>
					</div>
				</div>
				<div class="row" data-bind="visible: Mode_NewArticle">
					<div class="col-sm-12 panel-body" data-bind="with: NewArticle">
						<div class="form-group radio">
							<label style="margin-left:20px;"><input type="radio" name="ArticleType"	data-bind="checkedValue: 3, checked: ArticleType" />מצב מלא</label>
							<label style="margin-left:20px;"><input type="radio" name="ArticleType" data-bind="checkedValue: 1, checked: ArticleType" />מצב תמונה</label>
							<label style="margin-left:20px;"><input type="radio" name="ArticleType" data-bind="checkedValue: 2, checked: ArticleType" />מצב טקסט</label>
						</div>
						<div class="form-group" data-bind="visible: !IsTextOnly()">
							<input class="form-control" type="text" data-bind="value: Title" placeholder="שם הכתבה" />
						</div>
						<div class="form-group" data-bind="visible: IsRegular">
							<textarea class="form-control" data-bind="value: Description" placeholder="תיאור קצר"></textarea>
						</div>
						<div class="form-group" data-bind="visible: IsTextOnly">
							<textarea class="form-control" rows="5" data-bind="value: MainText" placeholder="תוכן הכתבה"></textarea>
						</div>
						<div class="row">
							<div class="col-sm-4">
								<div class="panel panel-default" data-bind="visible: !IsTextOnly()">
									<div class="panel-body">
										<label class="btn btn-default btn-file">
										בחר קובץ להעלאה <input type="file" form="upload_article_form" class="hidden" id="fileArticle" name="fileArticle" accept=".txt, .pdf, image/*" data-bind="event: { change: AddFile }" />
										<input type="text" disabled="disabled" data-bind="value: FileUploadState().FilePath" />
										</label>
									</div>
								</div>
							</div>
							<div data-bind="css: { 'col-sm-8': !IsTextOnly(), 'col-sm-12': IsTextOnly  }">
								<div class="panel panel-default">
									<div class="row panel-body">
										<div class="col-sm-5">
											<select class="form-control height40px" data-bind="options: $parent.Authors, value:SelectedAuthorID, optionsText: 'Name', optionsValue: 'ID', optionsCaption: 'בחר מחבר', event: {change: AddAuthor}" ></select>
										</div>
										<div class="col-sm-2">
											<button class="btn btn-block btn-success left height40px" data-bind="click: CreateAuthor">הוסף חדש</button>
										</div>
										<div class="col-sm-5">
											<!-- ko foreach: AuthorsList -->
											<div>
												<span class="glyphicon glyphicon-remove pointer" data-bind="event: { click: function () { $parent.RemoveAuthor($index()); } }"></span>
												<span data-bind="text: Name"></span>
											</div>
											<!-- /ko -->
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-sm-3">
								<div class="panel panel-default">
									<div class="panel-body">
										<button class="btn btn-block btn-default left height40px" data-bind="click: Cancel">בטל</button>
									</div>
								</div>
							</div>
							<div class="col-sm-6">&nbsp;</div>
							<div class="col-sm-3">
								<div class="panel panel-default">
									<div class="panel-body">
										<button class="btn btn-block btn-success left height40px" data-bind="click: Save">שמור כתבה</button>
									</div>
								</div>
							</div>
							
						</div>

					</div>
				</div>
				</div>
			</div>
			<div class="col-sm-2">
				<!-- LINKS AND NEWS -->
				<div class="row">
					<div class="col-sm-12">
						<!-- LINKS -->
						Links
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12">
						<!-- NEWS -->
						News
					</div>
				</div>
			</div>
        </div>
	</div>
	<img src="Images/loading2.gif" style="display:none;" id="mmImgLoading" />
	<script src="Scripts/jquery-3.2.1.min.js"></script>
	<script src="Scripts/knockout-3.4.2.js"></script>
	<script src="Scripts/bootstrap.min.js"></script>
	<script src="Scripts/easyTree.js"></script>
	<script src="Scripts/MMJqPluginsAddons.js"></script>
	<script src="Scripts/Default.js"></script>

	<form action="upload" id="upload_author_form" method="post" enctype="multipart/form-data" target="upload_target">
		<input type="hidden" name="type" value="author" />
		<input type="hidden" name="prevFile" />
	</form>
	<form action="upload" id="upload_article_form" method="post" enctype="multipart/form-data" target="upload_target">
		<input type="hidden" name="type" value="article" />
		<input type="hidden" name="prevFile" />
	</form>
	<iframe id="upload_target" name="upload_target" src="about:blank" style="width:0;height:0;border:0px solid #fff;"></iframe>
</body>
</html>