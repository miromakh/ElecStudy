/// <reference path="jquery-3.2.1.min.js" />
/// <reference path="moment.js" />
/// <reference path="knockout-3.4.2.js" />
/// <reference path="MMJqPluginsAddons.js" />

function Article(A)
{
	var me = this;
	if (!A) A = {};
	me.ID = ko.observable(A.ID);
	me.Title = ko.observable(A.Title);
	me.Description = ko.observable(A.Description);
	me.MainText = ko.observable(A.MainText);
	me.FilePath = ko.observable(A.FilePath);
	me.Authors = ko.observableArray(A.Authors || []);
	me.Subjects = ko.observableArray(A.Subjects || []);
	me.CreationTime = ko.observable(new Date(A.CreationTime));
	me.ModificationTime = ko.observable(new Date(A.ModificationTime));
	me.IsImageOnly = ko.observable(A.IsImageOnly);
	me.IsTextOnly = ko.observable(A.IsTextOnly);
	me.IsRegular = ko.observable(!A.IsImageOnly && !A.IsTextOnly);

	me.ArticleType = ko.computed({
		read: function ()
		{
			if (me.IsImageOnly()) return 1;
			if (me.IsTextOnly()) return 2;
			if (me.IsRegular()) return 3;
		},
		write: function (at)
		{
			me.IsImageOnly(false);
			me.IsTextOnly(false);
			me.IsRegular(false);
			switch (at)
			{
				case 1: me.IsImageOnly(true); break;
				case 2: me.IsTextOnly(true); break;
				case 3: me.IsRegular(true); break;
			}
		},
		owner: me
	});

	me.FileUploadState = ko.observable(new FileUploadState({FilePath:A.FilePath, IsError: false}));

	me.AuthorsList = ko.computed(function ()
	{
		var aut = [];
		me.Authors().forEach(function (a)
		{
			var ag = window.model.Authors().Find(function (e) { return e.ID() == a; });
			if (ag)
				aut.push(ag);
		});
		return aut;
	});

	me.SubjectsList = ko.computed(function ()
	{
		var sl = [];
		me.Subjects().forEach(function (s)
		{
			var sg = window.model.Subjects().Find(function (e) { return e.ID() == s; });
			if (sg)
				sl.push(sg);
		});
		return sl;
	});

	me.FormattedCreationTime = ko.computed(function ()
	{
		if (!me.CreationTime()) return "";
		return me.CreationTime().Format("dd/MM/yyyy");
	});
	me.FormattedModificationTime = ko.computed(function ()
	{
		if (!me.ModificationTime()) return "";
		return me.ModificationTime().Format("dd/MM/yyyy");
	});

	me.AddFile = function ()
	{
		var input = $("#fileArticle");
		var numFiles = input.get(0).files ? input.get(0).files.length : 1;
		var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		$("#upload_article_form")[0].submit();
		$.page.showLoading();
	};

	me.SelectedAuthorID = ko.observable(null);
	me.AddAuthor = function ()
	{
		if (!me.SelectedAuthorID())
			return;
		var ag = window.model.Authors().Find(function (a) { return a.ID() == me.SelectedAuthorID(); });
		// avoid adding same author more than once.
		var al = me.Authors().Find(function (a) { return a == me.SelectedAuthorID(); })

		me.SelectedAuthorID("");
		if (al)
		{
			return;
		}
		me.Authors.push(ag.ID());
		
	};
	me.RemoveAuthor = function (i)
	{
		me.Authors.splice(i, 1);
	};

	me.CreateAuthor = function ()
	{
		window.model.NewAuthor = new Author();
		window.model.NewAuthor.Edit();
	};

	me.Save = function ()
	{
		me.FilePath(me.FileUploadState().FilePath);
		var data = JSON.parse(ko.toJSON(me));

		data.Subjects = [];
		data.Subjects.push(window.model.SelectedSubjectID());

		$.page.ajax({
			func: "articles",
			data: data,
			type: "POST",
			altSuccess: function (r, f, p)
			{
				me.ID(r);

				window.model.SetModesOff();
				window.model.Mode_Articles(true);

				window.model.Articles([]);
				$.page.ajax({
					func: "articles",
					data: { top: null, id: null, authorid: null, subjectid: window.model.SelectedSubjectID() },
					type: "GET",
					altSuccess: function (r, f, p)
					{
						r.forEach(function (e)
						{
							window.model.Articles.push(new Article(e));
						});						
					},
					altError: function (r, f, p)
					{
					}
				});

			},
			altError: function (r, f, p)
			{
			}
		});
	};

	me.View = function ()
	{
		var content = me.IsImageOnly() ? $("<img />").attr("src", me.FileUploadState().FilePath()) :
			me.IsTextOnly() ? $("<div />").html(me.MainText()) :
				$("<iframe />").attr({ src: "download?fileName=" + me.FileUploadState().FilePath(), width: "100%", height: "100%", frameborder: 0 });
		var instance = $.CPAC.show(content, me.Title(), [new $.CPAC.doer($("<button />").text("OK").addClass("btn btn-success").css("float", "left"))], null, { selector: ".content", width: window.innerWidth - 100, height: window.innerHeight - 200 });
		if (instance)
		{
			ko.cleanNode($(".uiPopup")[0]);
			ko.applyBindings(new PopupModel(), $(".uiPopup")[0]);
		}
	};

	me.Edit = function ()
	{
		window.model.SetModesOff();
		window.model.Mode_NewArticle(true);
		window.model.NewArticle(me);

		me.cache = JSON.parse(ko.toJSON(me));
		me.cache.CreationTime = new Date(me.cache.CreationTime);
		me.cache.ModificationTime = new Date(me.cache.ModificationTime);
		me.cache.FileUploadState = new FileUploadState(me.cache.FileUploadState);
		delete me.cache.AuthorsList;
		delete me.cache.FormattedCreationTime;
		delete me.cache.FormattedModificationTime;
		delete me.cache.SubjectsList;
	};

	me.Cancel = function ()
	{
		window.model.SetModesOff();
		window.model.Mode_Articles(true);
		window.model.Mode_AllArticles(true);
		window.model.NewArticle(null);

		restoreFromCache(me);
	};

	me.Delete = function ()
	{
		var btnNo = $("<button />").addClass("btn btn-default").text("לא").attr("data-bind","click: Close");
		var btnYes = $("<button />").addClass("btn btn-success").text("כן").css("float","left");
		var instance = $.CPAC.show("האם ברצונך למחוק את הכתבה '" + me.Title() + "'", "מחיקת כתבה",
			[
				new $.CPAC.doer(btnNo),
				new $.CPAC.doer(btnYes, "click", me, function (e)
				{
					$.page.ajax({
						func: "articles",
						data: { ID: e.data.ID() },
						type: "DELETE",
						altSuccess: function (r, f, p)
						{
							for (var i = 0; i < window.model.Articles().length; i++)
							{
								if (window.model.Articles()[0].ID() == p.ID)
								{
									window.model.Articles.splice(i, 1);
									break;
								}
							}
							
						},
						altError: function (r, f, p)
						{

						}
					});
				})
			]);
		if (instance)
		{
			ko.cleanNode(instance[0]);
			ko.applyBindings(new PopupModel(), instance[0]);
		}
	};
}

function Author(A)
{
	var me = this;
	if (!A) A = {};
	me.ID = ko.observable(A.ID);
	me.Name = ko.observable(A.Name);
	me.Description = ko.observable(A.Description);
	me.Username = ko.observable(A.Username);
	me.Password = ko.observable(A.Password);
	me.FileUploadState = ko.observable(new FileUploadState({ FilePath: A.FilePath || "Images/no-photo.jpg", IsError: false }));

	me.FilePath = ko.computed(function ()
	{
		return me.FileUploadState().FilePath();
	});

	var instance;

	me.Close = function ()
	{
		restoreFromCache(me);
		if(instance && instance.length)
			ko.cleanNode(instance[0]);
		$.CPAC.hide();
	};

	me.Edit = function ()
	{
		window.model.NewAuthorHolder = { Author: me };

		me.cache = JSON.parse(ko.toJSON(me));
		me.cache.FileUploadState = new FileUploadState(me.cache.FileUploadState);
		delete me.cache.FilePath;

		var row = $("<div />").addClass("row");
		var col6_1 = $("<div />").addClass("col-sm-6");
		var col6_2 = $("<div />").addClass("col-sm-6 overflow-hidden");

		var row2 = $("<div />").addClass("row");
		var col12 = $("<div />").addClass("col-sm-12 panel-body");

		col12.append($("<div />").addClass("form-group").append($("<input type='text' />").addClass("form-control").attr("data-bind", "value: Name").attr("placeholder", "שם המחבר")));
		col12.append($("<div />").addClass("form-group").append($("<textarea />").addClass("form-control").attr("data-bind", "value: Description").attr("placeholder", "תיאור קצר")));
		if (window.model.AuthorLogged())
		{
			col12.append($("<div />").addClass("form-group").append($("<input type='text' />").addClass("form-control").attr("data-bind", "value: Username").attr("placeholder", "שם משתמש")));
			col12.append($("<div />").addClass("form-group").append($("<input type='password' />").addClass("form-control").attr("data-bind", "value: Password").attr("placeholder", "סיסמה")));

			col12.append($("<div />").addClass("row")
				.append(
				$("<div />").addClass("col-sm-12").append(
					$("<label />").addClass("btn btn-default btn-file")
						.append("בחר תמונה להעלאה ")
						.append($("<input type='file'/>").attr("form", "upload_author_form").attr("id", "fileAuthor").attr("name", "fileAuthor").attr("accept", ".jpg, .png").attr("data-bind", "event: { change: AddFile }").addClass("hidden"))
						.append($("<input type='text'/>").attr("disabled", "disabled").attr("data-bind", "value: FileUploadState().FilePath"))
				)
				));

			col12.append($("<div />").addClass("row").attr("data-bind", "visible:FileUploadState().IsError")
				.append(
				$("<div />").addClass("col-sm-12").append(
					$("<div />").addClass("alert alert-danger")
						.append($("<span />").attr("data-bind", "text: FileUploadState().ErrorMessage"))
						.append($("<span />").addClass("glyphicon glyphicon-remove").attr("event:{click:function(){ FileUploadState().IsError(false); }}"))
				)
				));
		}
		row2.append(col12);
		col6_1.append(row2);

		col6_2.append($("<img />").attr("data-bind", "attr:{ src: FileUploadState().FilePath }").css({ width: 300, height: 300 }));

		row.append(col6_1);
		row.append(col6_2);

		var listDoers = [];

		if (window.model.AuthorLogged())
		{
			listDoers.push(new $.CPAC.doer($("<button/>").text("בטל").addClass("btn btn-default").css({ float: "right" }).attr("data-bind", "click: Close")));
			listDoers.push(new $.CPAC.doer($("<button/>").text("שמור").addClass("btn btn-success").css({ float: "left" }).attr("data-bind", "click: Save")));
		}
		else
		{
			listDoers.push(new $.CPAC.doer($("<button/>").text("OK").addClass("btn btn-default").css({ float: "left" }).attr("data-bind", "click: Close")));
		}


		instance = $.CPAC.show(row, "מחבר חדש", listDoers);
		if (instance)
		{
			ko.cleanNode(instance[0]);
			ko.applyBindings(window.model.NewAuthorHolder.Author, instance[0]);
		}
	};

	me.AddFile = function ()
	{
		var input = $("#fileAuthor");
		var numFiles = input.get(0).files ? input.get(0).files.length : 0;
		var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		if (!numFiles) return;
		if (input.get(0).files[0].size > (4 * 1024 * 1024))
		{
			var instance = $.CPAC.show("גודל הקובץ חייב להיות קטן מ-4MB", "שגיאה", [new $.CPAC.doer("OK")]);
			if (instance) {
				ko.cleanNode(instance[0]);
				ko.applyBindings(new PopupModel(), instance[0]);
			}
		}
		else
		{
			$.page.showLoading();
			$("#upload_author_form")[0].submit();
		}
	};

	me.Save = function ()
	{
		$.page.ajax({
			func: "authors",
			data: JSON.parse(ko.toJSON(me)),
			type: "POST",
			altSuccess: function (r, f, p)
			{
				if (!window.model.Authors().Find(function (e) { return e.ID() == r.ID; }))
					window.model.Authors.push(new Author(r));

				//var aut = window.model.Authors().Find(function (e) { return e.ID() == r.ID; });
				killCache(me);
				//me.Close();
				//if (aut.ID() == window.model.LoggedAuthor().ID())
				//{
				//	window.model.LoggedAuthor(aut);
				//}
				$('#treeview_staff').EasyTree({
					addable: false, selectable: false, deletable: false, editable: false, searchable: false, collapsedAtStart: false
				});
			},
			altError: function (r, f, p)
			{
			}
		});
	};
}

function News(N)
{
	var me = this;
	if (!N) N = {};
	me.ID = ko.observable(N.ID);
	me.Title = ko.observable(N.Title);
	me.Content = ko.observable(N.Content);
	me.CreationTime = ko.observable(N.CreationTime);
	me.ModificationTime = ko.observable(N.ModificationTime);
}

function Subject(S)
{
	var me = this;
	if (!S) S = {};
	me.ID = ko.observable(S.ID);
	me.ParentID = ko.observable(S.ParentID);
	me.Name = ko.observable(S.Name);
	me.Parents = ko.computed(function ()
	{
		var pid = me.ParentID();
		var parents = "";
		while(pid)
		{
			var sbj = window.model.Subjects().Find(function (e)
			{
				return e.ID() == pid;
			});
			if (!sbj)
			{
				pid = null;
				continue;
			}
			pid = sbj.ParentID();

			parents = sbj.Name() + (parents == "" ? "" : " > ") + parents;
		}
		return parents;
	});

	me.FindInTree = function ()
	{
		var element = $('#treeview li').filter(function ()
		{
			return $(this).data("ID") == me.ID();
		});
		if (element && element.length > 0)
			$("> span > a", element).click();
	};
}

function PopupModel()
{
	var me = this;

	me.Close = function ()
	{
		$.CPAC.hide();
	};
}

function FileUploadState(F)
{
	var me = this;
	if (!F) F = {};
	me.FilePath = ko.observable(F.FilePath);
	me.ErrorMessage = ko.observable(F.ErrorMessage);
	me.IsError = ko.observable(F.IsError);
	//me.IsOK = ko.computed(function () { return !me.IsError(); });
}

function Model()
{
	var me = this;
	me.News = ko.observableArray([]);
	me.Authors = ko.observableArray([]);
	me.Articles = ko.observableArray([]);
	me.Subjects = ko.observableArray([]);

	me.LoggedAuthor = ko.observable();
	me.LoggedAuthorName = ko.computed(function ()
	{
		var la = me.LoggedAuthor();
		if (!la || typeof la.Name !== "function") return "";
		return la.Name();
	});
	me.LoggedAuthorPictureUrl = ko.computed(function ()
	{
		var la = me.LoggedAuthor();
		if (!la || typeof la.FileUploadState !== "function") return "";
		return la.FileUploadState().FilePath();
	});

	me.AuthorLogged = ko.observable(false);
	me.AuthorUnlogged = ko.computed(function () { return !me.AuthorLogged(); });

	me.Login = function ()
	{
		var un = $("#username").val();
		var pw = $("#password").val();
		$.page.ajax({
			func: "loginout",
			data: {username:un, password:pw},
			type: "GET",
			altSuccess: function (r, f, p)
			{
				if (r && r!="null")
				{
					r.FileUploadState = new FileUploadState({ FilePath: r.FilePath, IsError: false });
					var a = me.Authors().Find(function (e) { return e.ID() == r.ID })
					me.LoggedAuthor(a);
					me.AuthorLogged(true);
					$(".easy-tree-toolbar button").parent().show();
				}
				else
				{
					var instance = $.CPAC.show("שם משתמש או סיסמא לא נכונים", "שגיאה", [new $.CPAC.doer("OK")]);
					if (instance)
					{
						ko.cleanNode(instance[0]);
						ko.applyBindings(new PopupModel(), instance[0]);
					}
				}
			},
			altError: function (r, f, p)
			{
			}
		});
	};

	me.Logout = function ()
	{
		$.page.ajax({
			func: "loginout",
			data: { username: null, password: null },
			type: "GET",
			altSuccess: function (r, f, p)
			{
				me.LoggedAuthor(null);
				me.AuthorLogged(false);
				$(".easy-tree-toolbar button").parent().hide();
				window.model.SetModesOff();
				window.model.Mode_Articles(true);
			},
			altError: function (r, f, p)
			{
			}
		});
	};


	me.SelectedSubjectID = ko.observable(-1);
	me.SelectedSubjectName = ko.computed(function ()
	{
		if (me.SelectedSubjectID() == -1) return "";
		return me.Subjects().Find(function (s) { return s.ID() == me.SelectedSubjectID(); }).Name();
	});
	me.SubjectSelected = ko.computed(function ()
	{
		return me.SelectedSubjectID() > -1;
	});
	me.NewArticle = ko.observable(null);
	me.NewAuthorHolder = {};

	//#region Main Modes
	me.Mode_Articles = ko.observable(true);
	me.Mode_AllArticles = ko.observable(false);
	me.Mode_Authors = ko.observable(false);
	me.Mode_News = ko.observable(true);
	me.Mode_NewArticle = ko.observable(false);

	me.SetModesOff = function ()
	{
		me.Mode_Articles(false);
		me.Mode_AllArticles(false);
		me.Mode_Authors(false);
		me.Mode_News(false);
		me.Mode_NewArticle(false);
	};

	me.SetNewArticleMode = function ()
	{
		me.SetModesOff();
		me.NewArticle(new Article(null));
		me.Mode_NewArticle(true);
	};
	//#endregion
}


function buildSubjects(s)
{
	$('#treeview').html('');

	var ul = $("<ul />");

	function walk(nodes, data)
	{
		if (!nodes) return;
		$.each(nodes, function (id, node)
		{
			if (!node.ID) return;
			var children = s.FindAll(function (e) { return e.ParentID == node.ID; });

			var li = $("<li />").append($("<span />").text(node.Name));
			li.data({ID:node.ID, ParentID: node.ParentID});

			
			if (children.length > 0)
			{
				var ul1 = $("<ul />");
				li.append(ul1);
				walk(children, ul1);
			}
			data.append(li);
		});
	}

	walk(s.FindAll(function (e) { return e.ParentID == null; }), ul);

	$('#treeview').append(ul);

	$('#treeview').EasyTree({
		addable: true, selectable: true, deletable: true, editable: true,
		onItemSelected: function(e)
		{
			window.model.SelectedSubjectID(e.data().ID);

			$("button.newarticle").removeClass("disabled");
			$.page.ajax({
				func: "articles",
				data: { top: null, id: null, authorid: null, subjectid: e.data().ID },
				type: "GET",
				altSuccess: function (r, f, p)
				{
					window.model.Articles([]);
					r.forEach(function (e)
					{
						window.model.Articles.push(new Article(e));
					});
					window.model.SetModesOff();
					window.model.Mode_Articles(true);
					window.model.Mode_AllArticles(true);
				},
				altError: function (r, f, p)
				{
				}
			});
		},
		onItemUnselected: function (e)
		{
			window.model.SelectedSubjectID(-1);
			$("button.newarticle").addClass("disabled");
			$.page.ajax({
				func: "articles",
				data: { top: 6, id: null, authorid: null, subjectid: null },
				type: "GET",
				altSuccess: function (r, f, p)
				{
					window.model.Articles([]);
					r.forEach(function (e)
					{
						window.model.Articles.push(new Article(e));
					});
					window.model.SetModesOff();
					window.model.Mode_Articles(true);
				},
				altError: function (r, f, p)
				{
				}
			});


		},
		onItemAdded: function(parent, item)
		{
			$.page.ajax({
				func: "subjects",
				data: { ParentID: item.data().ParentID, Name: item.text() },
				type: "POST",
				altSuccess: function (r, f, p)
				{
					item.data().ID = r;
				},
				altError: function (r, f, p)
				{
					
				}
			});
		},
		onItemDeleted: function(e)
		{
			$.page.ajax({
				func: "subjects",
				data: { ID: e.data().ID },
				type: "DELETE",
				altSuccess: function (r, f, p)
				{
					for(var i = 0; i< window.model.Subjects().length; i++)
					{
						if (window.model.Subjects()[0].ID() == p.ID)
						{
							window.model.Subjects.splice(i, 1);
							return;
						}
					}
				},
				altError: function (r, f, p)
				{

				}
			});
		},
		onItemEdited: function (e)
		{
			$.page.ajax({
				func: "subjects",
				data: e.data(),
				type: "POST",
				altSuccess: function (r, f, p)
				{

				},
				altError: function (r, f, p)
				{

				}
			});
		}
	});
	if(!window.model.AuthorLogged())
		$(".easy-tree-toolbar button").parent().hide();
}

function restoreFromCache(obj)
{
	if (!obj || !obj.cache) return;

	for (var p in obj.cache)
	{
		obj[p](obj.cache[p]);
	}

	killCache(obj);
}

function killCache(obj)
{
	obj.cache = null;
	delete obj.cache;
}

var cd = {};
$(document).ready(function ()
{
	cd = JSON.parse($("#hidPageData").val());

	$.CPAC.init(
		"<div class='uiPopup mousedragger'><div class='title mousepicker'><span></span><div class='close nomove glyphicon glyphicon-remove' data-bind='event: { click: Close }'></div></div><div class='content container-fluid'></div><div class='buttons'></div></div>",
		".title span",
		".content",
		".buttons"
	);
	$.page.entitle();

	window.model = new Model();
	ko.applyBindings(window.model, document.getElementsByTagName("HTML")[0]);

	if (cd.LoggedAuthor)
	{
		window.model.LoggedAuthor(new Author(cd.LoggedAuthor));
		window.model.AuthorLogged(true);
	}
	
	$.page.ajax({
			func: "news",
			data: { top: 10 },
			type: "GET",
			altSuccess: function (r, f, p)
			{
				r.forEach(function (e)
				{
					window.model.News.push(new News(e));
				});
			},
			altError: function (r, f, p)
			{
			}
		});
	$.page.ajax({
			func: "authors",
			data: null,
			type: "GET",
			altSuccess: function (r, f, p)
			{
				r.forEach(function (e)
				{
					window.model.Authors.push(new Author(e));
				});

				$('#treeview_staff').EasyTree({
					addable: false, selectable: false, deletable: false, editable: false, searchable: false, useExistingHtml:true
				});
			},
			altError: function (r, f, p)
			{
			}
		});
	$.page.ajax({
			func: "subjects",
			data: null,
			type: "GET",
			altSuccess: function (r, f, p)
			{
				r.forEach(function (s)
				{
					window.model.Subjects.push(new Subject(s));
				});
				buildSubjects(r);

				$("#treeview div.search > input").autocomplete("search",
				{
					delay: 10,
					minChars: 3,
					matchSubset: 1,
					autoFill: false,
					matchContains: 1,
					cacheLength: 0,
					selectFirst: false,
					//formatItem:liFormat, 
					maxItemsToShow: 10,
					onItemSelect: function (e)
					{
						if (e.Type == "S")
						{							
							var element = $('#treeview li').filter(function ()
							{
								return $(this).data("ID") == e.ID;
							});
							if (element && element.length > 0)
								$("> span > a", element).click();
						}
						else
						{
							$.page.ajax({
								func: "articles",
								data: { top: null, id: e.ID, authorid: null, subjectid: null },
								type: "GET",
								altSuccess: function (r, f, p)
								{
									window.model.Articles([]);
									r.forEach(function (e)
									{
										window.model.Articles.push(new Article(e));
									});


								},
								altError: function (r, f, p)
								{
								}
							});
						}
					}
				});

				$.page.ajax({
					func: "articles",
					data: { top: 6, id: null, authorid: null, subjectid: null },
					type: "GET",
					altSuccess: function (r, f, p)
					{
						window.model.Articles([]);
						r.forEach(function (e)
						{
							window.model.Articles.push(new Article(e));
						});
					},
					altError: function (r, f, p)
					{
					}
				});
			},
			altError: function (r, f, p)
			{
			}
		});
	
});