/// <reference path="jquery-3.2.1.min.js" />

(function ($)
{
	var zIndex = 9999;
	var handleResize = true;
	$.fn.hasEventHandler = function (event, fn)
	{
		/// <summary>
		/// Check if any event handler is attached to the 'event'
		/// </summary>
		/// <param name="event">The event to check for a handler presence</param>
		/// <param name="fn">The function used as an event handler</param>
		/// <returns type="boolean">true|false</returns>
		if (!event) { return this; }
		var has = { event: false, namespace: false, handler: false },
			events = this.data("events"),
			namespace = event.split(".");
		event = namespace.shift();
		namespace = namespace.join(".");
		if (events)
		{
			if (!namespace) { has.namespace = true; }
			if (!fn) { has.handler = true; }
			if (event in events)
			{
				$.each(events[event], function (i, v)
				{
					if (namespace)
					{
						if (namespace === v.namespace && event === v.type)
						{
							has.namespace = true;
							has.event = true;
							if (fn && fn === v.handler) { has.handler = true; }
						}
					}
					else
					{
						if (event === v.type)
						{
							has.event = true;
							if (fn && fn === v.handler) { has.handler = true; }
						}
					}
				});
			}
		}
		return has.event && has.namespace && has.handler;
	};

	$.fn.firesEvent = function (eventName)
	{
		/// <summary>
		/// Checks whether element fires the 'eventName' event
		/// </summary>
		/// <param name="eventName" type="String">The event name to check for. Eg: 'click', 'change', 'blur' etc.</param>
		/// <returns type="boolean">true|false</returns>
		var el = document.createElement($(this)[0].tagName);
		eventName = 'on' + eventName;
		var isSupported = (eventName in el);
		if (!isSupported)
		{
			el.setAttribute(eventName, 'return;');
			isSupported = typeof el[eventName] == 'function';
		}
		el = null;
		return isSupported;
	};

	$.fn.center = function (_parent)
	{
		/// <summary>
		/// Centers element inside container vertically and hotizontally
		/// </summary>
		/// <param name="_parent" type="jQuery">if present the element is centered to it, otherwise centered to window.</param>
		/// <returns type="jQuery">The element itself</returns>
		var op = !_parent ? $(window) : this.parent().last();

		this.css({ position: "absolute" });

		var lms = $("*", this).filter(function () { return parseInt($(this).css("margin-left"), 10) < 0; }); //left margins
		var mlm = 0; // minimal left margin
		for (var i = 0; i < lms.length; i++)
		{
			if (parseInt($(lms[i]).css("margin-left"), 10) < mlm)
				mlm = parseInt($(lms[i]).css("margin-left"), 10);
		}

		var tms = $("*", this).filter(function () { return parseInt($(this).css("margin-top"), 10) < 0; }); //top margins
		var mtm = 0; // minimal top margin
		for (var i = 0; i < lms.length; i++)
		{
			if (parseInt($(tms[i]).css("margin-top"), 10) < mtm)
				mtm = parseInt($(tms[i]).css("margin-top"), 10);
		}

		this.offset({ left: -mlm, top: -mtm });

		this.css({
			left: (_parent && op.position() ? op.position().left : 0) + (((_parent && op.outerWidth(false) ? op.outerWidth(false) : op.width()) - this.outerWidth(false)) / 2) + op.scrollLeft() + "px",
			top: (_parent && op.position() ? op.position().top : 0) + (((_parent && op.outerHeight(false) ? op.outerHeight(false) : op.height()) - this.outerHeight(false)) / 2) + op.scrollTop() + "px"
		});


		if (this.width() + parseInt(this.css("left"), 10) > op.width())
		{
			this.css("left", (_parent && op.position() ? op.position().left : 0) + (((_parent && op.outerWidth(false) ? op.outerWidth(false) : op.width()) - this.outerWidth(false)) / 2) + "px");
		}

		return this;
	};

	$.fn.corner = function (_parent, isTop, isLeft)
	{
		/// <summary>
		/// Corners element inside container
		/// </summary>
		/// <param name="_parent" type="jQuery">if present the element is cornered inside it, otherwise corneered inside window.</param>
		/// <param name="isTop" type="boolean">If true snapped to the top, otherwise to the bottom</param>
		/// <param name="isLeft" type="boolean">If true snapped to the left, otherwise to the right</param>
		/// <returns type="jQuery">The element itself</returns>
		this.css("position", "absolute");
		this.css("left", 0).css("top", 0);

		var op = !_parent ? $(window) : this.parent().last();

		this.css("left", (isLeft ? 0 : op.width() - this.outerWidth(false)) + op.scrollLeft())
			.css("top", (isTop ? 0 : op.height() - this.outerHeight(false)) + op.scrollTop());

		return this;
	};

	$.fn.showModal = function (_parent, shadowFlow, onHideHandler, hideHandlerData)
	{
		/// <summary>
		/// Shows element as "modal window", centered to _parent or to window.
		/// </summary>
		/// <param name="_parent" type="jQuery">If present the element is centered to it, otherwise element is centered to window</param>
		/// <param name="shadowFlow" type="boolean">If true the shadow is "glued" to the element, otherwise the shadow covers all the _parent or window</param>
		/// <param name="onHideHandler" type="function">A function to execute on windows hide</param>
		/// <returns type="jQuery">The element itself</returns>
		if ($.modals == undefined) $.modals = []; // need this array to handle z-indexes of a few opened modal windows. last opened window will have the highest z-index

		for (var i = 0; i < $.modals.length; i++)
		{
			$.modals[i].shadow.css("visibility", "hidden");
		}

		this.css("position", "absolute");

		var target = (this.selector||"").replace(/#| /gi, "");
		if (target == "")
			target = this.attr("id");
		if (target == "")
			this.attr("id", target = "modalWindow" + $.modals.length);

		var shadowDiv = $("#" + target + "Shadow");

		if (shadowDiv.length == 0)
		{
			shadowDiv = $("<div class='shadow' id='" + target + "Shadow'></div>");
			shadowDiv.insertBefore(this);
		}

		var thisModal = this.selector ? $.modals.Find({ selector: this.selector }) : null;

		var op = _parent ? this.parent().last() : this.offsetParent();

		if (op.length == 0) return;

		if (op.prop("tagName").toLowerCase() == "body") op = op.parent();

		var isHTML = op.prop("tagName").toLowerCase() == "html";

		var zindex = $.modals.length == 0 ? parseInt(op.css("z-index")) || $.page.zIndex() : $.modals[$.modals.length - 1].modalZindex;

		if (isNaN(zindex) || !zindex) zindex = zIndex;
		else zindex++;

		this.show();
		this.center(_parent);

		shadowDiv.show().corner(null, true, true);

		shadowDiv.css("visibility", "visible").css("z-index", thisModal ? thisModal.shadowZindex : zindex);

		this.css("z-index", thisModal ? thisModal.modalZindex : (zindex + 1));

		if (!shadowFlow)
		{
			shadowDiv.height((isHTML ? $(window) : op).height());
			shadowDiv.width((isHTML ? $(window) : op).width());

			shadowDiv.center(_parent);
		}
		else
		{
			shadowDiv.css("left", (this.offset().left + 5) + "px").css("top", (this.offset().top + 10) + "px");
			shadowDiv.width(this.width());
			shadowDiv.height(this.height());
		}

		//if (thisModal) // commented on 2017-05-06. when ajax was called from $.CPAC button event loading image was not removed because modal was removed.
		//{
		//	var _mm = $.modals.Confiscate({ selector: this.selector });
		//	$.modals[$.modals.length] = _mm;

		//	return this;
		//}

		if ($.modals.length == 0)
		{
			$(window).on("resize.modal", jQuery.fn.modalOnResizeHandler);
			$(window).on("scroll.modal", jQuery.fn.modalOnScrollHandler);
			$(document).on("keydown.modal", jQuery.fn.modalOnKeyDownHandler);
		}


		//for (var i = 0; i < $.modals.length; i++)
		//{
		//	if ($.modals[i].modal == this) return this;
		//}

		this.onHide = onHideHandler || function () { return true; };
		this.hideHandlerData = hideHandlerData;
		this.isHiding = false;

		//shadowDiv.bind("click", { m: this }, function (e)
		//{
		//	e.data.m.hideModal();
		//});

		$.modals[$.modals.length] =
			{
				selector: !this.selector || this.selector == "" ? "#" + this.attr("id") : this.selector,
				modal: this,
				shadow: shadowDiv,
				modalZindex: zindex + 1,
				shadowZindex: zindex,
				toParent: _parent,
				hasShadowFlow: shadowFlow,
				parent: op,
				isHTML: isHTML
			};

		if ($.modals.length > 1)
			$.modals[$.modals.length - 2].shadow.css("visibility", "hidden");

		//for (var i = 0; i < $.modals.length - 1; i++)
		//{
		//	$.modals[i].shadow.css("visibility", "hidden");
		//}

		this.startDOMChangeTracking();

		return this;
	};

	$.fn.startDOMChangeTracking = function()
	{
		if (!this.data().TracksDOM)
		{
			if (!!document.addEventListener)
			{
				this.get(0).addEventListener("DOMNodeInserted", $.fn.modalOnResizeHandler, false);
			}
			else
			{	// IE hack. The .htc file doesn't have to exists
				this.data({ behaviour: this.get(0).addBehavior("foo.htc") });
				this.get(0).attachEvent("onreadystatechange", $.fn.modalOnResizeHandler);
			}
			this.data().TracksDOM = true;
		}

		return this;
	}

	$.fn.stopDOMChangeTracking = function()
	{
		if (this.data().TracksDOM)
		{
			if (!!document.removeEventListener)
			{
				this.get(0).removeEventListener("DOMNodeInserted", $.fn.modalOnResizeHandler, false);
			}
			else
			{	// IE hack. The .htc file doesn't have to exists
				this.get(0).removeBehavior(this.data().behaviour);
				this.get(0).dettachEvent("onreadystatechange", $.fn.modalOnResizeHandler);
			}
			this.data().TracksDOM = false;
		}
		return this;
	}

	$.fn.hideModal = function (data)
	{
		/// <summary>
		/// Hides element shown as "modal window"
		/// </summary>
		/// <returns type="jQuery">The element itself</returns>
		var mth; // modal to hide
		if ($.modals)
		{
			mth = $.modals.Find({ selector: !this.selector || this.selector == "" ? "#" + this.attr("id") : this.selector });
			if (!mth || !mth.modal) return;
			var e = mth.modal.hideHandlerData || {};
			if (data != null) $.extend(e, data.data);
			if(!e.sender) e.sender = $(this);
			if (mth.modal.onHide(e) === false)
			{
				return this;
			}
		}
		else return this;

		mth.modal.isHiding = true;

		mth.shadow.hide();
		this.hide();

		if ($.modals.length == 1)
		{
			$(window).off("resize.modal", jQuery.fn.modalOnResizeHandler);
			$(document).off("keydown.modal", jQuery.fn.modalOnKeyDownHandler);
			$(window).off("scroll.modal", jQuery.fn.modalOnScrollHandler);
		}

		$.modals.Remove({ selector: !this.selector || this.selector == "" ? "#" + this.attr("id") : this.selector });

		if ($.modals.length > 0)
			$.modals[$.modals.length - 1].shadow.css("visibility", "visible");

		return this;
	};

	$.fn.modalOnResizeHandler = function (e)
	{
		if (!$.modals || !handleResize) return;
		for (var i = 0; i < $.modals.length; i++)
		{
			if ($.modals[i].isHiding) continue;
			$.modals[i].modal.center($.modals[i].toParent);

			if (!$.modals[i].modal.hasShadowFlow)
			{
				$.modals[i].shadow.hide();
				$.modals[i].shadow.height(($.modals[i].isHTML ? $(window) : $.modals[i].parent).height());
				$.modals[i].shadow.width(($.modals[i].isHTML ? $(window) : $.modals[i].parent).width());
				$.modals[i].shadow.show();
				$.modals[i].shadow.center($.modals[i].toParent);
			}
			else
			{
				$.modals[i].shadow.css("left", ($.modals[i].modal.offset().left + 5) + "px").css("top", ($.modals[i].modal.offset().top + 10) + "px");
				$.modals[i].shadow.width($.modals[i].modal.width());
				$.modals[i].shadow.height($.modals[i].modal.height());
			}

		}
	};

	$.fn.modalOnKeyDownHandler = function (e)
	{
		if (e.keyCode == 27 && $.modals && $.modals.length > 0)
		{
			if (e.target.tagName.toLowerCase() == "select" || e.target.tagName.toLowerCase() == "input" || e.target.tagName.toLowerCase() == "textarea")
			{
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
			$.modals[$.modals.length - 1].modal.hideModal(); //e.data.el.hideModal();
			e.stopPropagation();
			e.preventDefault();
		}
	};

	$.fn.modalOnScrollHandler = function (e)
	{
		if (!$.modals) return;
		for (var i = 0; i < $.modals.length; i++)
		{
			if ($.modals[i].modal.isHiding) continue;
			$.modals[i].modal.center($.modals[i].toParent);

			var shadowDiv = $.modals[i].shadow; // $("#" + $.modals[i].attr("shadowID"));

			if (!$.modals[i].modal.hasShadowFlow)
			{
				$.modals[i].shadow.center($.modals[i].toParent);
			}
			else
			{
				$.modals[i].shadow.css("left", ($.modals[i].modal.offset().left + 5) + "px").css("top", ($.modals[i].modal.offset().top + 10) + "px");
			}
		}
	};

	$.fn.getClasses = function (classesToOmit)
	{
		/// <summary>
		/// Gets CSS classes applied (or not applied) to the element
		/// </summary>
		/// <param name="classesToOmit" type="Array">List of class names to omit</param>
		/// <returns type="Array">List of class names</returns>
		var classes = this.attr("class").split(/\s+/gi);
		if (classesToOmit.length == 0) return classes;

		for (var i = 0; i < classesToOmit.length; i++)
		{
			for (var c = 0; c < classes.length; c++)
			{
				if (classes[c].toLowerCase().indexOf(classesToOmit[i].toLowerCase()) > -1)
				{
					classes.splice(c, 1);
					c--;
				}
			}
		}

		return classes;
	};

	$.fn.fitWidth = function (percentage, includeMargins, parent, minVal, maxVal)
	{
		/// <summary>
		/// Makes elements 'percentage' percents wide 
		/// </summary>
		/// <param name="percentage" type="int">Percentage</param>
		/// <param name="includeMargins" type="bool">Defines whether to include right and left margins to width value</param>
		/// <param name="parent" type="object">Parent element. DOM or jQuery. Pass NULL to get direct parent</param>
		/// <returns></returns>
		$(this).each(function ()
		{
			var p = !parent ? $(this).parent() : (parent instanceof jQuery ? parent : $(parent));

			var inp = {
				padLeft: parseInt($(this).css('padding-left'), 10) || 0,
				padRight: parseInt($(this).css('padding-right'), 10) || 0,
				mrgLeft: includeMargins ? parseInt($(this).css('margin-left'), 10) || 0 : 0,
				mrgRight: includeMargins ? parseInt($(this).css('margin-right'), 10) || 0 : 0,
				brdLeft: parseInt($(this).css('border-left-width'), 10) || 0,
				brdRight: parseInt($(this).css('border-right-width'), 10) || 0
			}

			var fitTo = p.innerWidth() - (parseInt(p.css("padding-left")) || 0) - (parseInt(p.css("padding-right")) || 0);

			var fieldWidth = (fitTo - (inp.padLeft + inp.padRight + inp.mrgLeft + inp.mrgRight + inp.brdLeft + inp.brdRight)) * (percentage / 100);

			//$(this).setWidth(fieldWidth, includeMargins);
			$(this).width(fieldWidth);

			if (minVal && $(this).width() < minVal) $(this).setWidth(minVal);
			if (maxVal && $(this).width() > maxVal) $(this).setWidth(maxVal);
		});

		return this;
	};

	$.fn.fitHeight = function (percentage, includeMargins, parent, minVal, maxVal)
	{
		/// <summary>
		/// Makes elements 'percentage' percents high 
		/// </summary>
		/// <param name="percentage" type="int">Percentage</param>
		/// <param name="includeMargins" type="bool">Defines whether to include top and bottom margins to hight value</param>
		/// <param name="parent" type="object">Parent element. DOM or jQuery. Pass NULL to get direct parent</param>
		/// <returns></returns>
		$(this).each(function ()
		{
			var p = !parent ? $(this).parent() : (parent instanceof jQuery ? parent : $(parent));

			var inp = {
				padTop: parseInt($(this).css('padding-top'), 10) || 0,
				padBot: parseInt($(this).css('padding-bottom'), 10) || 0,
				mrgTop: includeMargins ? parseInt($(this).css('margin-top'), 10) || 0 : 0,
				mrgBot: includeMargins ? parseInt($(this).css('margin-bottom'), 10) || 0 : 0,
				brdTop: parseInt($(this).css('border-top-width'), 10) || 0,
				brdBot: parseInt($(this).css('border-bottom-width'), 10) || 0
			}

			var fitTo = p.innerHeight() - (parseInt(p.css("padding-top")) || 0) - (parseInt(p.css("padding-bottom")) || 0);

			var fieldHeight = (fitTo - (inp.padTop + inp.padBot + inp.mrgTop + inp.mrgBot + inp.brdTop + inp.brdBot)) * (percentage / 100);

			$(this).height(fieldHeight);

			if (minVal && $(this).height() < minVal) $(this).setHeight(minVal);
			if (maxVal && $(this).height() > maxVal) $(this).setHeight(maxVal);
		});

		return this;
	};

	$.fn.fitSize = function (width_percentage, height_percentage, includeMargings, parent, width_minVal, width_maxVal, height_minVal, height_maxVal)
	{
		/// <summary>
		/// Makes elements 'percentage' percents wide and high
		/// </summary>
		/// <param name="width_percentage" type="int">Width percentage</param>
		/// <param name="height_percentage" type="int">Height percentage</param>
		/// <param name="includeMargins" type="bool">Defines whether to include margins to width and height value</param>
		/// <param name="parent" type="object">Parent element. DOM or jQuery. Pass NULL to get direct parent</param>
		/// <returns></returns>
		$(this).each(function ()
		{
			$(this)
				.fitWidth(width_percentage, includeMargings, parent, width_minVal, width_maxVal)
				.fitHeight(height_percentage, includeMargings, parent, height_minVal, height_maxVal);
		});
		return this;
	};

	$.fn.setWidth = function (width, includeMargins)
	{
		/// <summary>
		/// Sets exact width of an element
		/// </summary>
		/// <param name="width" type="int">Desired width</param>
		/// <param name="includeMargins" type="bool">True to include margins within desired width</param>
		$(this).each(function ()
		{
			var inp = {
				padLeft: parseInt($(this).css('padding-left'), 10) || 0,
				padRight: parseInt($(this).css('padding-right'), 10) || 0,
				mrgLeft: includeMargins ? parseInt($(this).css('margin-left'), 10) || 0 : 0,
				mrgRight: includeMargins ? parseInt($(this).css('margin-right'), 10) || 0 : 0,
				brdLeft: parseInt($(this).css('border-left-width'), 10) || 0,
				brdRight: parseInt($(this).css('border-right-width'), 10) || 0
			}

			var w = width - inp.padLeft - inp.padRight - inp.brdLeft - inp.brdRight - (includeMargins ? inp.mrgLeft : 0) - (includeMargins ? inp.mrgRight : 0);

			$(this).width(w);

			var real_width = $(this).outerWidth(false);

			var prev_real_width = real_width;
			while (real_width > width)
			{
				$(this).width(--w);
				real_width = $(this).outerWidth(false);
				if (prev_real_width == real_width) break;
			}

			//$(this).width(width - (inp.padLeft + inp.padRight + inp.mrgLeft + inp.mrgLeft + inp.brdLeft + inp.brdRight));

			//var real_width = $(this).outerWidth(false);

			//if (real_width > width)
			//{
			//	$(this).width(real_width - inp.padLeft - inp.padRight);
			//	real_width = $(this).outerWidth(false);
			//}
			//if (real_width > width)
			//{
			//	$(this).width(real_width - inp.brdLeft - inp.brdRight);
			//	real_width = $(this).outerWidth(false);
			//}
			//if (real_width < width)
			//{
			//	$(this).width(width);
			//	real_width = $(this).outerWidth(false);
			//}
			//if (real_width < width)
			//{
			//	$(this).width(width + (inp.padLeft + inp.padRight + inp.mrgLeft + inp.mrgLeft + inp.brdLeft + inp.brdRight));
			//}
		});

		return this;
	};

	$.fn.setHeight = function (height, includeMargins)
	{
		/// <summary>
		/// Sets exact height of an element
		/// </summary>
		/// <param name="height" type="int">Desired height</param>
		/// <param name="includeMargins" type="bool">True to include margins within desired height</param>
		$(this).each(function ()
		{
			var inp = {
				padTop: parseInt($(this).css('padding-top'), 10) || 0,
				padBot: parseInt($(this).css('padding-bottom'), 10) || 0,
				mrgTop: includeMargins ? parseInt($(this).css('margin-top'), 10) || 0 : 0,
				mrgBot: includeMargins ? parseInt($(this).css('margin-bottom'), 10) || 0 : 0,
				brdTop: parseInt($(this).css('border-top-width'), 10) || 0,
				brdBot: parseInt($(this).css('border-bottom-width'), 10) || 0
			}

			var h = height - inp.padTop - inp.padBot - inp.brdTop - inp.brdBot - (includeMargins ? inp.mrgTop : 0) - (includeMargins ? inp.mrgBot : 0);

			$(this).height(h);

			var real_height = $(this).outerHeight(false);

			var prev_real_height = real_height;
			while (real_height > height)
			{
				$(this).height(--h);
				real_height = $(this).outerHeight(false);
				if (prev_real_height == real_height) break;
			}
		});

		return this;
	};

	$.fn.setSize = function (width, height, includeMargings)
	{
		/// <summary>
		/// Sets exact width and height of an element
		/// </summary>
		/// <param name="width" type="int">Desired width</param>
		/// <param name="height" type="int">Desired height</param>
		/// <param name="includeMargins" type="bool">True to include margins within desired width and height</param>
		$(this).each(function ()
		{
			$(this).setWidth(width, includeMargings).setHeight(height, includeMargings);
		});
		return this;
	};

	$.fn.scrollable = function (settings)
	{
		// settings: { height:int, clear:bool }
		$(this).each(function ()
		{
			if (!settings) settings = { clear: false, height: "auto" };

			var ie = window.navigator.userAgent.indexOf("MSIE ") > 0; // IE < 11  detected :-((
			ie = window.navigator.userAgent.indexOf('Trident/') > 0;// IE 11  detected :-((

			var table = $(this);

			if (ie) table.css("table-layout", "fixed");

			if (table[0].tagName != "TABLE") throw "Bad element. Should be TABLE.";

			var tHead = $(">thead", table);
			if (!tHead.length) throw "Bad table. Should have THEAD.";

			var tBody = $(">tbody", table);
			if (!tBody.length) throw "Bad table. Should have TBODY.";

			if (settings.clear)
			{
				if ($("div.mmscrollable", tbody).length > 0)
				{
					tBody = $("div.mmscrollable tbody", tbody);
					table.remove(">tbody").append(tBody);
					$("tr th:last", tHead).width($("tr th:last", tHead).width() - (settings.height == "auto" ? 0 : $.page.scrollbar.width()));
				}
				return this;
			}

			var columnsCount = $("tr th", tHead).length;
			var originalWidth = table.width();
			var extendedWidth = originalWidth + $.page.scrollbar.width();

			var headerCellsWidths = [];
			for (var i = 0; i < columnsCount && !ie; i++)
			{
				headerCellsWidths[i] = $("th:nth-child(" + (i + 1) + ")", tHead).width();
			}


			$("tr th:last", tHead).width($("tr th:last", tHead).width() + (settings.height == "auto" || ie ? 0 : $.page.scrollbar.width()));

			var scrolltable = $("<table />");
			scrolltable.append(tBody);
			if (ie) scrolltable.css("table-layout", "fixed");

			var scrolldiv = $("<div />").addClass("mmscollable");
			scrolldiv.css({ width: extendedWidth, overflow: "auto", height: settings.height });
			scrolldiv.append(scrolltable);

			tBody = $("<tbody />");
			table.append(tBody);

			tBody.append(($("<tr />").append($("<td />").attr("colspan", columnsCount).append(scrolldiv))));

			for (var i = 0; i < columnsCount && !ie; i++)
			{
				if (i + 1 < columnsCount)
					$("th:nth-child(" + (i + 1) + ")", tHead).width(headerCellsWidths[i]);
				$("tr:first td:nth-child(" + (i + 1) + ")", scrolltable).width(headerCellsWidths[i]);
			}
		});
		return this;
	};

	$.page = {
		scrollbar: {
			isVerticalPresent: function ()
			{
				var docHeight = $(document).height();
				var scroll = $(window).height() + $(window).scrollTop();
				return (docHeight != scroll);
			},
			isHorizontalPresent: function ()
			{
				var docWidth = $(document).width();
				var scroll = $(window).width();// + $(window).scrollLeft();
				return (docWidth != scroll);
			},
			width: function ()
			{
				if (!this._scrollbarWidth)
				{
					if (/(MSIE (\d+\.\d+);)|(Trident (\/\d+\.\d+);)/.test(navigator.userAgent))
					{
						var div = $("<div />").css({ width: 50, height: 50, overflow: "hidden" });
						div.append($("<div />").css({ height: 100 }))
						div.insertBefore($($("body").children().eq(0)));
						var indiv = $("div", div);
						var w = indiv.width();
						div.css({ overflow: "scroll" });
						this._scrollbarWidth = w - indiv.width();
						div.remove();
					}
					else
					{
						var $body = $('html');
						var w = $body.css('overflow', 'hidden').width();
						$body.css('overflow', 'scroll');
						w -= $body.width();
						if (!w) w = $body.width() - $body[0].clientWidth; // IE in standards mode
						$body.css('overflow', '');
						this._scrollbarWidth = w;
					}
				}
				return this._scrollbarWidth;
			}
		},
		zIndex: function ()
		{
			/// <summary>
			/// Gets the highest zIndex on the page. Only checks visible elements
			/// </summary>
			/// <returns type="int">The highest zIndex</returns>
			try
			{
				var zIndex = 0;
				$(':visible').each(function ()
				{
					if ($(this).css && $(this).css("z-index"))
					{
						var z = parseInt($(this).css("z-index"));
						z = isNaN(z) ? 0 : z;
						if (z > zIndex) zIndex = z;
					}
				})

				//var zIndex = parseInt(_el.css("z-index"));
				//while (_el && _el.css && isNaN(zIndex))
				//{
				//	_el = _el.parent();
				//	if (_el && _el.css) zIndex = parseInt(_el.css("z-index"));
				//}
				//if (isNaN(zIndex)) return 0;
				return zIndex;
			}
			catch (err)
			{
				return 0;
			}
		},
		selection: {
			remove: function ()
			{
				/// <summary>
				/// Discards selection.
				/// </summary>
				var selection = window.getSelection ? window.getSelection() : document.selection ? document.selection : null;
				if (!!selection) selection.empty ? selection.empty() : selection.removeAllRanges();
			}
		},
		direction: function ()
		{
			/// <summary>
			/// Gets page direction
			/// </summary>
			/// <returns type="String">ltr|rtl</returns>
			if (!this._pageDir)
			{
				this._pageDir = $("body").css("direction");
				if (!this._pageDir || this._pageDir == "")
					this._pageDir = $("html").css("direction");
				if (!this._pageDir || this._pageDir == "")
					this._pageDir = "ltr";
			}
			return this._pageDir;
		},
		querystring: function (key)
		{
			/// <summary>
			/// Gets parameters from querystring
			/// </summary>
			/// <param name="key" type="String">A key to get value for</param>
			/// <returns type="string">the key value</returns>
			if (!this._querystring)
			{
				this._querystring = {};
				var me = this;
				(function ()
				{
					var match,
						pl = /\+/g,  // Regex for replacing addition symbol with a space
						search = /([^&=]+)=?([^&]*)/g,
						decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
						query = window.location.search.substring(1);

					while (match = search.exec(query))
						me._querystring[decode(match[1])] = decode(match[2]);
				})();
			}
			if (!key || key == "")
				return this._querystring || {};
			return this._querystring[key];
		},
		showLoading: function (el)
		{
			/// <summary>
			/// Shows loading
			/// </summary>
			/// <param name="el">Element to show as "loading"</param>
			(el || $("#mmImgLoading")).showModal(false, false);
		},
		hideLoading: function (el)
		{
			/// <summary>
			/// Hides loading
			/// </summary>
			/// <param name="el">Element shown as "loading"</param>
			(el || $("#mmImgLoading")).hideModal();
		},
		isValid: function (Cslid, toCheck)
		{
			/// <summary>
			/// Checks if page is valid
			/// </summary>
			///<param name="Cslid" type="Array/String">Array or Comma separated list of control IDs to be validated</param>
			///<param name="toCheck" type="boolean">If true then the list of IDs will be checked, otherwise excluded</param>
			/// <returns type="boolean">true|false</returns>

			$.page.setValidators();

			var ids = [];
			var include = true;
			if (arguments.length > 0)
			{
				ids = arguments[0] instanceof Array ? arguments[0] : arguments[0].split(",");
				include = arguments[1] == undefined || arguments[1] == null ? true : arguments[1];
			}
			var is_valid = true;

			var clonedValidators = $.validators.slice(0);

			for (var i = 0; i < clonedValidators.length; i++)
			{
				if (ids.length > 0)
				{
					if (
						(ids.Contains(clonedValidators[i].ControlToValidateID) && !include)
						||
						(!ids.Contains(clonedValidators[i].ControlToValidateID) && include)
					) continue;
				}
				var v = $.page.validateValidators(clonedValidators[i], i);
				is_valid = is_valid && v;
				if (!is_valid)
					clonedValidators.RemoveAll({ ControlToValidateID: clonedValidators[i].ControlToValidateID });
			}
			return is_valid;
		},
		setValidators: function ()
		{
			/// <summary>
			/// Sets all validators on the page
			/// </summary>

			/// <example>
			/// <input type="hidden" class="validator" value="({'ControlToValidateID':'txtPrice','Validators':[{'Type':'RegExp','Expression':'.+','ErrorMessage':'Required field!'},{'Type':'RegExp','Expression':'[0-9.,]*','ErrorMessage':'Numbers only!'}]})" />
			/// </example>

			var inputs = $("input[type=hidden].validator");
			if ($.validators && $.validators.length == inputs.length) return;

			$.validators = new Array();

			var count = 0;
			for (var i = 0; i < inputs.length; i++)
			{
				$.validators[$.validators.length] = eval($(inputs[i]).val());
				var el = $("#" + $.validators[$.validators.length - 1].ControlToValidateID);
				if (el.length == 0)
				{
					$.validators.splice($.validators.length - 1, 1);
					continue;
				}
				if (el.firesEvent("change"))
				{
					el.on("change", { index: count++ }, function (e) { $.page.validateValidators(null, e.data.index); });
				}
				else
				{
					$.validators[$.validators.length - 1].html = el.html();
					$.validators[$.validators.length - 1].interval = setInterval((function (index)
					{
						return function ()
						{
							var el = $("#" + $.validators[index].ControlToValidateID);
							if ($.validators[index].html != el.html())
							{
								$.validators[index].html = el.html();
								//clearInterval($.validators[index].interval);
								$.page.validateValidators(null, index);
							}
						}
					})(count++), 1000);
				}
			}
		},
		validateValidators: function (validator, vid)
		{
			/// <summary>
			/// Validates a validator
			/// </summary>
			/// <param name="validator" type="object">The validator itself</param>
			/// <param name="vid" type="int">Validator index</param>
			/// <returns type="boolean">true|false</returns>
			if (!validator) validator = $.validators[vid];
			var ctv = $("#" + validator.ControlToValidateID);
			if (ctv.length == 0) return true;
			var is_valid = true;
			var v;
			for (var i = 0; i < validator.Validators.length; i++)
			{
				v = validator.Validators[i];
				switch (v.Type.toLowerCase())
				{
					case 'regexp': //regular expression
						var rx = new RegExp(v.Expression);
						var matches = rx.exec(ctv.val());
						is_valid = (matches != null && ctv.val() == matches[0]);
						break;
					case 'uf':
					case 'udf':
					case 'func':
					case 'function':
					case 'userfunc': // user function
						try
						{
							is_valid = v.Expression(ctv);
						}
						catch (err) { }
						break;
					default:
						break;
				}
				if (!is_valid)
				{
					if (ctv.attr("oldTitle") == "")
						ctv.attr("oldTitle", ctv.attr("title") || "");
					ctv.attr("title", v.ErrorMessage);
					break;
				}
				else
				{
					if (ctv.attr("title") == v.ErrorMessage)
						ctv.attr("title", ctv.attr("oldTitle") || "");
					else ctv.attr("title", "");
				}
			}

			if (!is_valid)
				ctv.addClass("validator-error");
			else
				ctv.removeClass("validator-error", "");

			var c = ctv
			while (c.length > 0 && c[0].tagName)
			{
				if (c.css("display") == "none" && !is_valid)
				{
					c.showModal(false, false);
					break;
				}
				c = c.parent();
			}

			return is_valid;
		},
		entitle: function (titleSelector)
		{
			/// <summary>
			/// Adds custom titles to all the document elements
			/// </summary>
			/// <param name="titleSelector" type="string">Class name of the element used as custom title (e.g. some DIV element). The default is ".globalTitle"</param>
			titleSelector = titleSelector || "globalTitle";
			if (titleSelector[0] != '.') titleSelector = "." + titleSelector;
			var gtt = $(titleSelector || ".globalTitle");
			if (gtt.length == 0)
			{
				$("body").append($("<div />").addClass((titleSelector.replace(".", ""))).css({ position: "absolute", display: "none", maxWidth: "250px", padding: "5px", zIndex: 1000 }));
			}
			
			$(document)
				.on( "mousemove","[title]", { s: titleSelector }, function (e)
				{
					var $this = this instanceof jQuery ? this : $(this);
					if ($this.attr("title") != "")
					{
						$this.attr("_title", $this.attr("title"));
						$this.attr("title", "");
					}

					var gtt = $(e.data.s || ".globalTitle");
					var _title = $(this).attr("_title");
					if (!_title) return;
					gtt.html(_title);
					gtt.css({ left: e.pageX - gtt.outerWidth()/2, top: e.pageY + 15 });
					if (!gtt.is(":visible")) gtt.css({ zIndex: $.page.zIndex() + 1 });
					gtt.show();
					gtt.hide();
					if (parseInt(gtt.css("left"), 10) + gtt.outerWidth() > $(window).width())
					{
						gtt.css("left", parseInt(gtt.css("left"), 10) - gtt.outerWidth());
					}
					if (parseInt(gtt.css("left"), 10) < 10)
					{
						gtt.css("left", 10);
					}
					if (parseInt(gtt.css("top"), 10) + gtt.outerHeight() > ($(window).height() + $(window).scrollTop()))
					{
						gtt.css("top", parseInt(gtt.css("top"), 10) - gtt.outerHeight() - 20);
					}
					gtt.show();

					e.stopPropagation();
				})
				.on("mouseout","[title]",  { s: titleSelector }, function (e)
				{
					$(e.data.s || ".globalTitle").hide();
				});

		},
		ajaxService : function(url)
		{
			$.page.ajaxServiceUrl = url;
		},
		ajax: function (e)
		{
			/// <signature>
			/// <summary>
			///  An envelope to jQuery's Ajax.
			/// </summary>
			/// <param name="e" type="object">
			///		<para>.func[type=string] - Name of server side method/controller to be called</para>
			///		<para>.data[type=object] - Object to be passed to 'func'</para>
			///		<para>.selfCall[type=boolean] - True to use call current page</para>
			///		<para>.url[type=string] - or empty to use 'func' as a name of controller to call</para>
			///		<para>.altSuccess[type=function] - A function to be called on callback success. Default success handler is called if NULL or undefined.</para>
			///		<para>.altError[type=function] - A function to be called on callback error. Default error handler is called if NULL or undefined.</para>
			///		<para>.type[type=string] - Request type: GET or POST. Default is POST.</para>
			/// </param>
			/// </signature>
			
			if (!e) e = {};
			
			var _action = (e.selfCall ? $("#form1").attr("action") : (e.url || $.page.ajaxServiceUrl)) || "";
			if (_action.indexOf("?") > -1)
			{
				_action = _action.substring(0, _action.indexOf("?"));
			}
			$.ajax({
				type: e.type || "POST",
				url: _action + (_action?"/":"") + e.func + (e.type == "GET" && e.data ? "?" + $.page.object2qs(e.data) : ""),
				data: e.data && e.type != "GET" ? JSON.stringify(e.data) : null,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function (ret)
				{
					if (e.altSuccess && typeof e.altSuccess == "function")
					{
						e.altSuccess(ret, e.func, this.parameter);
					}
					else
					{
						if (window.onSuccess)
							onSuccess(ret, e.func, this.parameter);
					}
				},
				error: function (ret)
				{
					if (e.altError && typeof e.altError == "function")
					{
						e.altError(ret, e.func, this.parameter);
					}
					else
					{
						if (window.onError)
							onError(ret, e.func, this.parameter);
					}
				},
				parameter: e.data
			});
		},
		iframe: function (id, part)
		{
			/// <signature>
			/// <param name="id" type="string">ID of the iFrame element</param>
			/// <param name="part" type="string">A name of a first letter of a part of the iFrame to get: window (w), document (d), body (b) </param>
			/// </signature>

			var ifr = document.getElementById(id);

			if (!ifr) return null;

			switch (part)
			{
				case "window":
				case "w":
					if (ifr.contentWindow) return ifr.contentWindow;
					else return document.frames[id] ? document.frames[id].window : null;	// IE
					break;
				case "document":
				case "d":
					if (ifr.contentDocument) return ifr.contentDocument;
					else return document.frames[id] ? document.frames[id].document : null;	// IE
					break;
				case "body":
				case "b":
					var doc;
					if (ifr.contentDocument) doc = ifr.contentDocument;
					else doc = document.frames[id] ? document.frames[id].document : null;	// IE
					return doc ? doc.getElementsByTagName(id)[0] : null;
					break;
			}
		},
		setCookie: function (cname, cvalue, exdays)
		{
			/// <signature>
			/// <param name="cname" type="string">Cookie name</param>
			/// <param name="cvalue" type="string">Cookie value</param>
			/// <param name="exdays" type="integer">Days to expire</param>
			/// </signature>
			if (!exdays) exdays = 365;
			var d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			var expires = "expires=" + d.toUTCString();
			document.cookie = cname + "=" + cvalue + "; " + expires;
		},
		getCookie: function (cname)
		{
			/// <signature>
			/// <param name="cname" type="string">Cookie name</param>
			/// </signature>

			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i = 0; i <ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length,c.length);
				}
			}
			return "";
		},
		object2qs: function (obj)
		{
			var str = "";
			for (var key in obj)
			{
				if (str != "")
				{
					str += "&";
				}
				str += key + "=" + encodeURIComponent(obj[key]);
			}
			return str;
		}
	};

	// custom Prompt, Alert, Confirm
	$.CPAC = {
		popupElement: null,
		titleElement: null,
		titleElementSelector: null,
		contentElement: null,
		contentElementSelector: null,
		doersElement: null,
		doersElementSelector: null,
		visible: false,
		instances: [],
		index: 0,
		template: "",
		customPopupElementSize:null,
		init: function (popupTemplate, titleElementSelector, contentElementSelector, doersElementSelector)
		{
			/// <signature>
			/// <param name="popupTemplate" type="html string">an html to be used as a popup</param>
			/// <param name="titleElementSelector" type="string or jQuery">jQuery selector to get or jQuery object of a title element</param>
			/// <param name="contentElementSelector" type="string or jQuery">jQuery selector to get or jQuery object of a content element</param>
			/// <param name="doersElementSelector" type="string or jQuery">jQuery selector to get or jQuery object of an action takers holder element</param>
			/// </signature>

			this.titleElementSelector = titleElementSelector;
			this.contentElementSelector = contentElementSelector;
			this.doersElementSelector = doersElementSelector;

			this.template = popupTemplate;
			this.popupElement = $(this.template); //popupElementSelector instanceof jQuery ? popupElementSelector : $(popupElementSelector);
			this.titleElement = titleElementSelector instanceof jQuery ? titleElementSelector : $(titleElementSelector, this.popupElement);
			this.contentElement = contentElementSelector instanceof jQuery ? contentElementSelector : $(contentElementSelector, this.popupElement);
			this.doersElement = doersElementSelector instanceof jQuery ? doersElementSelector : $(doersElementSelector, this.popupElement);
			//this.instances[this.instances.length] = { popupElement: this.popupElement, titleElement: this.titleElement, contentElement: this.contentElement, doersElement: this.doersElement };
		},

		show: function (content, title, doers, hideHandler, customPopupElementSize)
		{
			/// <signature>
			/// <param name="content" type="String">Content to be prompted to users</param>
			/// <param name="title" type="String">Title of a window</param>
			/// <param name="doers" type="Array">Array of $.CPAC.doer objects</param>
			/// <param name="hideHandler" type="Function">function to be called when prompt is closed. No matter what button was pressed.</param>
			/// <returns></returns>
			/// </signature>
			/// <signature>
			/// <param name="content" type="jQuery">jQuery element to be disposed to users</param>
			/// <param name="title" type="String">Title of a window</param>
			/// <param name="doers" type="Array">Array of $.CPAC.doer objects</param>
			/// <param name="hideHandler" type="Function">function to be called when prompt is closed. No matter what button was pressed.</param>
			/// <returns></returns>
			/// </signature>
			/// <signature>
			/// <param name="content" type="String">Content to be prompted to users</param>
			/// <param name="title" type="String">Title of a window</param>
			/// <param name="doers" type="Array">Array of classes of elements taking action. Class example: {jQueryObject:$(selector), objectEvent:"change", data:{}, handler:function} for any jQuery object with its own event handlers bound to it where 'objectEvent' is object's event to be used to handle user interaction. if 'objectEvent' is null or empty a 'click' event will be used.</param>
			/// <param name="hideHandler" type="Function">function to be called when prompt is closed. No matter what button was pressed.</param>
			/// <param name="customPopupElementSize" type="Object">Custom popup element size. Example: {selector: '.m>div>div', width:100, height: 100}</param>
			/// <returns></returns>
			/// </signature>
			/// <signature>
			/// <param name="content" type="jQuery">jQuery element to be disposed to users</param>
			/// <param name="title" type="String">Title of a window</param>
			/// <param name="doers" type="Array">Array of classes of elements taking action. Class example: {jQueryObject:$(selector), objectEvent:"change", data:{}, handler:function} for any jQuery object with its own event handlers bound to it where 'objectEvent' is object's event to be used to handle user interaction. if 'objectEvent' is null or empty a 'click' event will be used.</param>
			/// <param name="hideHandler" type="Function">function to be called when prompt is closed. No matter what button was pressed.</param>
			/// <param name="customPopupElementSize" type="Object">Custom popup element size. Example: {selector: '.m>div>div', width:100, height: 100}</param>
			/// <returns></returns>
			/// </signature>
			/// <signature>
			/// <param name="content" type="String">Content to be prompted to users</param>
			/// <param name="title" type="String">Title of a window</param>
			/// <param name="doers" type="Array">Array of classes of elements taking action. Class example: {jQueryObject:$(selector), objectEvent:"change", data:{}, handler:function} for any jQuery object with its own event handlers bound to it where 'objectEvent' is object's event to be used to handle user interaction. if 'objectEvent' is null or empty a 'click' event will be used.</param>
			/// <param name="hideHandler" type="Function">function to be called when prompt is closed. No matter what button was pressed.</param>
			/// <param name="customPopupElementSize" type="Object">Custom popup element size. Example: {selector: '.m>div>div', width:100, height: 100}</param>
			/// <param name="trackDOMChange" type="Boolean">If False no DOM changes will be tracked. Default is True.</param>
			/// <returns></returns>
			/// </signature>
			/// <signature>
			/// <param name="content" type="jQuery">jQuery element to be disposed to users</param>
			/// <param name="title" type="String">Title of a window</param>
			/// <param name="doers" type="Array">Array of classes of elements taking action. Class example: {jQueryObject:$(selector), objectEvent:"change", data:{}, handler:function} for any jQuery object with its own event handlers bound to it where 'objectEvent' is object's event to be used to handle user interaction. if 'objectEvent' is null or empty a 'click' event will be used.</param>
			/// <param name="hideHandler" type="Function">function to be called when prompt is closed. No matter what button was pressed.</param>
			/// <param name="customPopupElementSize" type="Object">Custom popup element size. Example: {selector: '.m>div>div', width:100, height: 100}</param>
			/// <param name="trackDOMChange" type="Boolean">If False no DOM changes will be tracked. Default is True.</param>
			/// <returns></returns>
			/// </signature>

			//if (!customPopupElementSize && !(!!(hideHandler && hideHandler.constructor && hideHandler.call && hideHandler.apply)))
			//{
			//	customPopupElementSize = hideHandler;
			//}
			
			if (this.instances.length == 0)
				this.instances[this.instances.length] = { popupElement: this.popupElement, titleElement: this.titleElement, contentElement: this.contentElement, doersElement: this.doersElement, isClone: false, customPopupElementSize: customPopupElementSize };

			if (this.visible)
			{
				this.clone();
			}

			var inst = this.instances[this.instances.length - 1];
			inst.hideHandler = hideHandler;

			if (!inst.popupElement || !(inst.popupElement instanceof jQuery) || inst.popupElement.length == 0)
			{
				alert("User interaction pop up element not initialized");
				return null;
			}

			if (title && title != "" && (!inst.titleElement || !(inst.titleElement instanceof jQuery) || inst.titleElement.length == 0))
			{
				alert("User interaction title element not initialized");
				return null;
			}

			if (content && content != "" && (!inst.contentElement || !(inst.contentElement instanceof jQuery) || inst.contentElement.length == 0))
			{
				alert("User interaction content element not initialized");
				return null;
			}

			//if (inst.doers && inst.doers.length && (!inst.doersElement || !(inst.doersElement instanceof jQuery) || inst.doersElement.length == 0))
			//{
			//	alert("User interaction buttons element not initialized");
			//	return  null;
			//}

			inst.titleElement.html(title);
			inst.contentElement.html("");
			if (content)
			{
				if (content instanceof jQuery) inst.contentElement.append(content);
				else if (content != "") inst.contentElement.html(content);
				//if (!!document.addEventListener)
				//{
				//	inst.contentElement.get(0).addEventListener("DOMNodeInserted", $.fn.modalOnResizeHandler, false);
				//}
				//else
				//{	// IE hack. The .htc file doesn't have to exists
				//	inst.contentElement.get(0).addBehavior("foo.htc");
				//	inst.contentElement.get(0).attachEvent("onreadystatechange", $.fn.modalOnResizeHandler);
				//}
			}
			inst.doersElement.html("");

			for (var i = 0; doers && i < doers.length; i++)
			{
				if (!doers[i]) continue;
				var doer;
				if (doers[i].jQueryObject && doers[i].jQueryObject instanceof jQuery)
				{
					doer = doers[i].jQueryObject;
				}
				else
				{
					doer = $("<input type='button' />").addClass(doers[i].cssclass || "").val(doers[i].title || "");
					doers[i].handler = ($.isFunction(doers[i].data) ? doers[i].data : (doers[i].handler || function (e) { }));
				}

				doer.addClass("cpac-doer-" + i);
				var doerSelector = "#" + (inst.popupElement.attr("id") || "uiModal" + this.instances.length) + " .cpac-doer-" + i;

				$(document).on(doers[i].objectEvent || "click", doerSelector, { ppe: inst.popupElement, ce: inst.contentElement, sender: doer, f: doers[i].handler, udata: $.isFunction(doers[i].data) ? null : doers[i].data, source: doers[i].source, doerSelector: doerSelector, handledEvent: doers[i].objectEvent || "click" }, function (e)
				{
					var ee = {};
					ee.data = e.data.udata || {};
					ee.data.sender = e.data.sender;
					ee.data.source = e.data.source;
					var close = !e.data.f ? true : e.data.f(ee);
					if (close == null || close === true)
					{
						if (e.data.ppe.length)
						{
							$(document).off(e.data.handledEvent, e.data.doerSelector);
							//e.data.ppe.hideModal(ee);
							$.CPAC.hide();
						}
					}
				});
				inst.doersElement.append(doer);
			}

			this.visible = true;
			var self = this;
			$("body").append(inst.popupElement);

			if (customPopupElementSize)
			{
				var el = inst.popupElement;
				if (customPopupElementSize.selector)
					el = $(customPopupElementSize.selector, inst.popupElement);
				if (customPopupElementSize.width) el.setWidth(customPopupElementSize.width);
				if (customPopupElementSize.height) el.setHeight(customPopupElementSize.height);
			}

			if (!inst.popupElement.attr("id")) inst.popupElement.attr("id", "uiModal" + this.instances.length);
			
			inst.popupElement.showModal(false, false, function (data)
			{
				var ret = true;
				var e = data;
				if (self.instances[self.instances.length - 1].hideHandler) ret = self.instances[self.instances.length - 1].hideHandler(e);

				self.instances[self.instances.length - 1].popupElement.remove();
				self.instances.splice(self.instances.length - 1, 1);

				self.bubble = e.bubble || self.bubble;

				if (self.bubble)
				{
					while (self.instances.length)
					{
						self.instances[self.instances.length - 1].popupElement.hideModal();
					}
					self.bubble = false;
				}

				self.visible = self.instances.length > 0;

				return ret;
			});
			
			return inst.popupElement;
		},

		clone: function ()
		{
			var ppeClone = this.popupElement.clone();
			//var ttlClone = $(this.titleElement.selector.replace(this.popupElement.selector, ""), ppeClone);
			//var cntClone = $(this.contentElement.selector.replace(this.popupElement.selector, ""), ppeClone);
			//var atsClone = $(this.doersElement.selector.replace(this.popupElement.selector, ""), ppeClone);

			var ttlClone = $(this.titleElementSelector, ppeClone);
			var cntClone = $(this.contentElementSelector, ppeClone);
			var atsClone = $(this.doersElementSelector, ppeClone);

			this.instances[this.instances.length] = { popupElement: ppeClone, titleElement: ttlClone, contentElement: cntClone, doersElement: atsClone, isClone: true };
			ppeClone.attr("id", "uiModals" + this.instances.length);
		},

		hide: function (all)
		{
			/// <summary>
			/// Hides the popup
			/// </summary>
			/// <param name="all">True to hide all nested PACs, false to hide the top-most PAC</param>
			if (this.instances.length == 0) return;
			while (this.instances.length)
			{
				if (this.instances[this.instances.length - 1].customPopupElementSize)
				{
					var el = this.instances[this.instances.length - 1].popupElement;
					if (this.instances[this.instances.length - 1].customPopupElementSize.selector)
						el = $(this.instances[this.instances.length - 1].customPopupElementSize.selector, el);
					if (this.instances[this.instances.length - 1].customPopupElementSize.width) el.width("inherit");
					if (this.instances[this.instances.length - 1].customPopupElementSize.height) el.height("inherit");
				}
				
				this.instances[this.instances.length - 1].contentElement.html("");
				this.instances[this.instances.length - 1].popupElement.hideModal();
				if (!all) break;
			}
		},

		doer: function (p1, p2, p3, p4, p5)
		{
			/// <signature>
			/// <param name="p1">Element Title</param>
			/// <param name="p2">Element css class</param>
			/// <param name="p3">Object to be passed to the click handler</param>
			/// <param name="p4">Click handler</param>
			/// <param name="p5">Source identifier. A custom string to identify the event source (e.g. "Header X button" or "Footer 'Close' button"). This parameter is passed to the click handler.</param>
			/// </signature>
			/// <signature>
			/// <param name="p1">jQuery object</param>
			/// <param name="p2">Event type ("click","change","mouseover" etc.). Default is "click"</param>
			/// <param name="p3">Object to be passed to the event handler</param>
			/// <param name="p4">Event handler</param>
			/// <param name="p5">Source identifier. A custom string to identify the event source (e.g. "Header X button" or "Footer 'Close' button"). This parameter is passed to the event handler</param>
			/// </signature>
			if (arguments[0] instanceof jQuery)
			{
				this.jQueryObject = arguments[0];
				this.objectEvent = arguments[1];
			}
			else
			{
				this.title = arguments[0];
				this.cssClass = arguments[1];
			}

			this.data = arguments[2];
			this.handler = arguments[3];
			this.source = p5;
		}
	};

	$.mouseMoveData = {};

	$.fn.documentMouseMove = function (e)
	{
		if (!e) e = window.event;

		$.page.selection.remove();

		$.mouseMoveData.iLeft = e.clientX - $.mouseMoveData.iOffsetX;
		$.mouseMoveData.iTop = e.clientY - $.mouseMoveData.iOffsetY;

		$.mouseMoveData.dragger.css("position", "absolute");

		var newLeft = $.mouseMoveData.iOrgLeft + $.mouseMoveData.iLeft;
		var newTop = $.mouseMoveData.iOrgTop + $.mouseMoveData.iTop;

		var sbw = $.page.scrollbar.width();

		if (newLeft < sbw) newLeft = sbw;
		if (newTop < sbw + $(document).scrollTop()) newTop = sbw + $(document).scrollTop();

		if (newLeft + $.mouseMoveData.dragger.outerWidth(false) > $(window).width()) newLeft = $(window).width() - $.mouseMoveData.dragger.outerWidth(false) - sbw;
		if (newTop + $.mouseMoveData.dragger.outerHeight(false) > $(window).height() + $(document).scrollTop()) newTop = $(window).height() - $.mouseMoveData.dragger.outerHeight(false) - sbw + $(document).scrollTop();

		$.mouseMoveData.dragger.offset({ left: newLeft, top: newTop });

		if ($.mouseMoveData.dragger.attr("hasShadowFlow") == "true")
		{
			$("#" + $.mouseMoveData.dragger.attr("id") + "Shadow").css({ left: newLeft + 5, top: newTop + 10 });
		}

		return false;
	}

	$(document).on("mousedown", function (e)
	{
		if (e.which > 1) return;

		handleResize = false;

		$.mouseMoveData.picker = $(e.target);

		var isSelfPicker = $.mouseMoveData.picker.hasClass("mousepicker");

		if (!isSelfPicker && !$.mouseMoveData.picker.parents(".picker").length) return;


		if (!isSelfPicker)
			$.mouseMoveData.picker = $.mouseMoveData.picker.parents(".picker");

		if ($.mouseMoveData.picker.hasClass("nomove") || $.mouseMoveData.picker.parents(".nomove").length) return;

		if ($.mouseMoveData.picker.length == 0) return;

		$.mouseMoveData.picker.css({ cursor: "move" });

		var isSelfDragger = $.mouseMoveData.picker.hasClass("mousedragger");

		$.mouseMoveData.dragger = isSelfDragger ? $.mouseMoveData.picker : $.mouseMoveData.picker.parents(".mousedragger");

		$.mouseMoveData.zIndex = parseInt($.mouseMoveData.dragger.css("zIndex"), 10);

		$.mouseMoveData.dragger.css("zindex", $.mouseMoveData.zIndex > zIndex ? $.mouseMoveData.zIndex + 1 : $.mouseMoveData.zIndex);
		$.mouseMoveData.cursor = $.mouseMoveData.dragger.css("cursor");

		$.mouseMoveData.iframes = $("iframe", $.mouseMoveData.dragger);
		$.mouseMoveData.iframes = $.mouseMoveData.iframes.filter(function (e) { $(this).css("display") == "block"; });
		$.mouseMoveData.iframes.hide();

		$.mouseMoveData.iOffsetX = e.clientX;
		$.mouseMoveData.iOffsetY = e.clientY;
		$.mouseMoveData.iOrgLeft = $.mouseMoveData.dragger.offset().left;
		$.mouseMoveData.iOrgTop = $.mouseMoveData.dragger.offset().top;

		$(document).on("mousemove", $.fn.documentMouseMove);

		return;
	});

	$(document).on("mouseup", function (e)
	{
		if (e.which > 1) return false;

		handleResize = true;

		$(document).off("mousemove", $.fn.documentMouseMove);

		if ($.mouseMoveData.iframes && $.mouseMoveData.iframes.length)
		{
			$.mouseMoveData.iframes.show();
		}

		if ($.mouseMoveData.dragger && $.mouseMoveData.dragger.length && $.mouseMoveData.zIndex > zIndex)
		{
			$.mouseMoveData.dragger.css("z-index", $.mouseMoveData.zIndex);
		}

		if ($.mouseMoveData.picker && $.mouseMoveData.picker.length) $.mouseMoveData.picker.css({ cursor: $.mouseMoveData.cursor });

		return false;
	});

})(jQuery);

//#region Date prototypes
if (typeof (Date.prototype.CompareTo) == 'undefined')
{
	Date.prototype.CompareTo = function (date)
	{
		if (!this.valueOf()) return 0;
		if (!(date instanceof Date)) return 'Not a date';
		if (this.getFullYear() == date.getFullYear() && this.getMonth() == date.getMonth() && this.getDate() == date.getDate()) return 0;
		if ((this.getFullYear() > date.getFullYear())
		|| (this.getFullYear() == date.getFullYear() && this.getMonth() > date.getMonth())
		|| (this.getFullYear() == date.getFullYear() && this.getMonth() == date.getMonth() && this.getDate() > date.getDate()))
		{
			return 1;
		}
		if ((this.getFullYear() < date.getFullYear())
		|| (this.getFullYear() == date.getFullYear() && this.getMonth() < date.getMonth())
		|| (this.getFullYear() == date.getFullYear() && this.getMonth() == date.getMonth() && this.getDate() < date.getDate()))
		{
			return -1;
		}
	}
}
if (typeof (Date.prototype.AddDays) == 'undefined')
{
	Date.prototype.AddDays = function (days)
	{
		return new Date(this.getFullYear(), this.getMonth(), this.getDate() + days);
	}
}
if (typeof (Date.prototype.AddMonths) == 'undefined')
{
	Date.prototype.AddMonths = function (months)
	{

		var daysInMonth = [31, this.getFullYear() % 4 == 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var date = new Date(this.getFullYear(), this.getMonth() + months, 1);
		return new Date(date.getFullYear(), date.getMonth(), (this.getDate() > daysInMonth[date.getMonth()]) ? daysInMonth[date.getMonth()] : this.getDate());
	}
}
if (typeof (Date.prototype.AddYears) == 'undefined')
{
	Date.prototype.AddYears = function (years)
	{
		return new Date(this.getFullYear() + years, this.getMonth(), this.getDate());
	}
}
if (typeof (Date.prototype.DaysInMonth) == 'undefined')
{
	Date.prototype.DaysInMonth = function DaysInMonth()
	{
		return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
	}
}
if (typeof (Date.prototype.Format) == 'undefined')
{
	Date.prototype.Format = function (f, localizedMonthNames, localizedDayNames)
	{
		if (!this.valueOf())
			return '';

		var gsMonthNames = localizedMonthNames || "January,February,March,April,May,June,July,August,September,October,November,December".split(",")
		var gsDayNames = localizedDayNames || "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday".split(",");
		
		var d = this;

		return f.replace(/(yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|hh|mm|ss|fff|a\/p)/gi,
			function ($1)
			{
				switch ($1)
				{
					case 'yyyy': return d.getFullYear();
					case 'yy': return d.getFullYear() % 100 < 10 ? '0' + d.getFullYear() % 100 : d.getFullYear() % 100;
					case 'MMMM': return gsMonthNames[d.getMonth()];
					case 'MMM': return gsMonthNames[d.getMonth()].substr(0, 3);
					case 'MM': return (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
					case 'M': return d.getMonth() + 1;
					case 'dddd': return gsDayNames[d.getDay()];
					case 'ddd': return gsDayNames[d.getDay()].substr(0, 3);
					case 'dd': return d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
					case 'd': return d.getDate();
					case 'HH': return d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
					case 'hh': return ((h = d.getHours() % 12) ? h : 12) < 10 ? '0' + ((h = d.getHours() % 12) ? h : 12) : ((h = d.getHours() % 12) ? h : 12);
					case 'mm': return d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
					case 'ss': return d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
					case 'fff': return d.getMilliseconds() < 100 ? ('0' + (d.getMilliseconds() < 10 ? '0' + d.getMilliseconds() : d.getMilliseconds())) : d.getMilliseconds();
					case 'a/p': return d.getHours() < 12 ? 'am' : 'pm';
				}
			}
		);
	}
}
//#endregion

if (typeof (Object.prototype.Value) == 'undefined')
{
	Object.defineProperty(Object.prototype, "Value", {
		value: function ()
		{
			if (this && typeof (this) == "function") return this();
			else return this;
		},
		enumerable: false
	});
}

function SelectSort(select, startIndex)
{
	if (!startIndex) startIndex = 0;
	if (select instanceof jQuery) select = select[0];
	var opts = select.options;
	var list = [];
	for (var i = startIndex; i < opts.length; i++)
	{
		list[list.length] = { text: opts[i].text, value: opts[i].value };
	}
	var sorted = list.sort(SortSelectOptions);
	$("option:gt(" + (startIndex - 1) + ")", select).remove();
	for (var i = 0; i < sorted.length; i++)
	{
		var o = new Option();
		o.text = sorted[i].text;
		o.value = sorted[i].value;
		select.options[select.options.length] = o;
	}
}

function SortSelectOptions(o1, o2)
{
	if (o1.value == "") return -1;
	if (o2.value == "") return 1;
	if (o1.value == "-1") return 1;
	if (o2.value == "-1") return -1;

	if (o1.text.toLowerCase() < o2.text.toLowerCase()) return -1;
	if (o1.text.toLowerCase() == o2.text.toLowerCase()) return 0;
	if (o1.text.toLowerCase() > o2.text.toLowerCase()) return 1;
}

function Clone(item)
{
	/// <summary>
	/// Clones an element
	/// </summary>
	/// <param name="item"></param>
	/// <returns type=""></returns>
	if (!item) { return item; } // null, undefined values check

	var types = [Number, String, Boolean],
		result;

	// normalizing primitives if someone did new String('aaa'), or new Number('444');
	types.forEach(function (type)
	{
		if (item instanceof type)
		{
			result = type(item);
		}
	});

	if (typeof result == "undefined")
	{
		if (Object.prototype.toString.call(item) === "[object Array]")
		{
			result = [];
			item.forEach(function (child, index, array)
			{
				result[index] = Clone(child);
			});
		}
		else if (typeof item == "object")
		{
			// testing that this is DOM
			if (item.nodeType && typeof item.cloneNode == "function")
			{
				var result = item.cloneNode(true);
			} else if (!item.prototype)
			{ // check that this is a literal
				if (item instanceof Date)
				{
					result = new Date(item);
				} else
				{
					// it is an object literal
					result = {};
					for (var i in item)
					{
						result[i] = Clone(item[i]);
					}
				}
			} else
			{
				// depending what you would like here,
				// just keep the reference, or create new object
				if (false && item.constructor)
				{
					// would not advice to do that, reason? Read below
					result = new item.constructor();
				} else
				{
					result = item;
				}
			}
		} else
		{
			result = item;
		}
	}

	return result;
}

//#region Array and String prototypes
if (typeof (Array.prototype.Contains) == 'undefined')
{
	Array.prototype.Contains = function (val)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (val instanceof Object)
			{
				var cont = false;
				for (p in val)
				{
					if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p]))
					{
						cont = true;
						break;
					}
				}
				if (cont) continue;
				return true;
			}
			else
			{
				if (this[i] == val) return true;
			}
		}

		return false;
	};
}
if (typeof (Array.prototype.Find) == 'undefined')
{
	Array.prototype.Find = function (val)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (typeof (val) == "function")
			{
				if (val(this[i]))
					return this[i];
			}
			else
			{
				if (val instanceof Object)
				{
					var c = false;
					for (var p in val)
					{
						//switch(type||"")
						//{
						//	case "ne":
						//	case "!=": if (typeof (this[i][p]) == "function" ? this[i][p]() == val[p] : this[i][p] == val[p]) c = true; break;
						//	case "gt":
						//	case ">": if (typeof (this[i][p]) == "function" ? this[i][p]() <= val[p] : this[i][p] <= val[p]) c = true; break;
						//	case "lt":
						//	case "<": if (typeof (this[i][p]) == "function" ? this[i][p]() >= val[p] : this[i][p] >= val[p]) c = true; break;
						//	case "gte":
						//	case ">=": if (typeof (this[i][p]) == "function" ? this[i][p]() < val[p] : this[i][p] < val[p]) c = true; break;
						//	case "lte":
						//	case "<=": if (typeof (this[i][p]) == "function" ? this[i][p]() > val[p] : this[i][p] > val[p]) c = true; break;
						//	default: if (typeof (this[i][p]) == "function" ? this[i][p]() != val[p] : this[i][p] != val[p]) c = true; break;
						//}
						if (typeof (this[i][p]) == "function" ? this[i][p]() != val[p] : this[i][p] != val[p]) c = true;
					}
					if (c) continue;
					return this[i];
				}
				else
				{
					//switch (type || "")
					//{
					//	case "ne":
					//	case "!=": if (typeof (this[i][p]) == "function" ? this[i]() != val : this[i] != val) return this[i]; break;
					//	case "gt":
					//	case ">": if (typeof (this[i][p]) == "function" ? this[i]() > val : this[i] > val) return this[i]; break;
					//	case "lt":
					//	case "<": if (typeof (this[i][p]) == "function" ? this[i]() < val : this[i] < val) return this[i]; break;
					//	case "gte":
					//	case ">=": if (typeof (this[i][p]) == "function" ? this[i]() >= val : this[i] >= val) return this[i]; break;
					//	case "lte":
					//	case "<=": if (typeof (this[i][p]) == "function" ? this[i]() <= val : this[i] <= val) return this[i]; break;
					//	default: if (typeof (this[i][p]) == "function" ? this[i]() == val : this[i] == val) return this[i]; break;
					//}
					if (typeof (this[i][p]) == "function" ? this[i]() == val : this[i] == val) return this[i];
				}
			}
		}

		return null;
	};
}
if (typeof (Array.prototype.FindAll) == 'undefined')
{
	Array.prototype.FindAll = function (val, startIndex)
	{
		var obj = []
		for (var i = (startIndex||0); i < this.length; i++)
		{
			if (typeof (val) == "function")
			{
				if (val(this[i]))
					obj[obj.length] = this[i];
			}
			else
			{
				if (val instanceof Object)
				{
					var ok = true;
					for (var p in val)
					{
						if (val[p] instanceof Array)
						{
							if (!val[p].Find(typeof (this[i][p]) == "function" ? this[i][p]() : this[i][p]))
							{
								ok = false;
								break;
							}
						}
						else
						{
							if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p]))
							{
								ok = false;
								break;
							}
						}
					}
					if (ok) obj[obj.length] = this[i];
				}
				else
				{
					if (val == null || this[i] == val) obj[obj.length] = this[i];
				}
			}
		}

		return obj;
	};
}
if (typeof Array.prototype.Page == 'undefined')
{
	Array.prototype.Page = function (page, PAGESIZE, xData)
	{
		/// <summary>
		/// 
		/// </summary>
		/// <param name="page">A number of page to retrieve</param>
		/// <param name="PAGESIZE">The number of items on a page</param>
		/// <param name="moreData">an empty object that will be filled with extended data</param>
		/// <returns type="">array containing items of the selected page of the original array</returns>
		var arrayPage = [];
		var pages = Math.ceil(this.length / PAGESIZE);

		if (page < 1) page = 1;
		if (page > pages) page = pages;

		var start = (page - 1) * PAGESIZE;
		var end = (page - 1) * PAGESIZE + PAGESIZE;
		if (end >= this.length) end = this.length;

		if (start < 0) return this;

		arrayPage = this.slice(start, end);

		//for (var i = start; i < end; i++)
		//{
		//	arrayPage[arrayPage.length] = this[i];
		//}

		if (xData)
		{
			xData.fromItem = start + 1;
			xData.toItem = end;
			xData.totalPages = pages;
			xData.totalItems = this.length;
		}
		
		return arrayPage;
	}
}
if (typeof Array.prototype.PagesList == 'undefined')
{
	Array.prototype.PagesList = function (pageNumber, PAGESIZE, PAGES_IN_NAVIGATION)
	{
		/// <summary>
		/// 
		/// </summary>
		/// <param name="pageNumber">Current page</param>
		/// <param name="PAGESIZE">Number of items in the pages</param>
		/// <param name="PAGES_IN_NAVIGATION">Number of pages in navigation</param>
		/// <returns type=""></returns>
		var existPageBefore = false;
		var existPageAfter = false;
		var totalPagesCount = Math.ceil(this.length / PAGESIZE);

		if (!totalPagesCount) return [1];

		var pages = [];

		var maxPages = PAGES_IN_NAVIGATION < totalPagesCount ? PAGES_IN_NAVIGATION : totalPagesCount;

		if (totalPagesCount < PAGES_IN_NAVIGATION)
		{
			for (var i = 0; i < totalPagesCount; i++)
			{
				pages.push(i + 1);
			}
			return pages;
		}
		
		pages.push(pageNumber);
		var countUp = pageNumber;
		var countDown = pageNumber;
		while (pages.length < maxPages)
		{
			if (countUp < totalPagesCount) pages.push(++countUp);
			if (pages.length == maxPages) break;
			if (countDown > 1) pages.splice(0,0,--countDown);
		}

		if (pages[0] > 1)
		{
			pages[0] = 1;
			pages[1] = "...";
		}
		if (pages[pages.length - 1] < totalPagesCount)
		{
			pages[pages.length - 1] = totalPagesCount;
			pages[pages.length - 2] = "...";
		}

		return pages;
	}
}
if (typeof (Array.prototype.Confiscate) == 'undefined')
{
	Array.prototype.Confiscate = function (val)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (typeof (val) == "function")
			{
				if(val(this[i]))
				{
					var item = $.extend(true, {}, this[i]);

					this.splice(i, 1);

					return item;
				}
			}
			else
			{
				if (val instanceof Object)
				{
					var c = false;
					for (var p in val)
					{
						if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p])) c = true;
					}
					if (c) continue;

					var item = $.extend(true, {}, this[i]);

					this.splice(i, 1);

					return item;
				}
				else
				{
					if (this[i] == val)
					{
						var item = $.extend(true, {}, this[i]);

						this.splice(i, 1);

						return item;
					}
				}
			}
		}

		return null;
	}
}
if (typeof (Array.prototype.ConfiscateAll) == 'undefined')
{
	Array.prototype.ConfiscateAll = function (val, startIndex)
	{
		var ret = [];
		for (var i = (startIndex||0); i < this.length; i++)
		{
			if (typeof (val) == "function")
			{
				if (val(this[i]))
				{
					ret.push($.extend(true, {}, this[i]));

					this.splice(i, 1);

					i--;
				}
			}
			else
			{
				if (val instanceof Object)
				{
					var c = false;
					for (var p in val)
					{
						if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p])) c = true;
					}
					if (c) continue;

					ret.push($.extend(true, {}, this[i]));

					this.splice(i, 1);
					i--;
				}
				else
				{
					if (val == null || this[i] == val)
					{
						ret.push($.extend(true, {}, this[i]));
						this.splice(i, 1);
						i--;
					}
				}
			}
		}

		return ret;
	}
}
if (typeof (Array.prototype.Remove) == 'undefined')
{
	Array.prototype.Remove = function (val)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (typeof (val) == "function")
			{
				if(val(this[i]))
				{
					this.splice(i, 1);
					return true;
				}
			}
			else
			{
				if (val instanceof Object)
				{
					var c = false;
					for (var p in val)
					{
						if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p])) c = true;
					}
					if (c) continue;
					this.splice(i, 1);
					return true;
				}
				else
				{
					if (this[i] != val) continue;
					this.splice(i, 1);
					return true;
				}
			}
		}
		return false;
	};
}
if (typeof (Array.prototype.RemoveAll) == 'undefined')
{
	Array.prototype.RemoveAll = function (val, startIndex)
	{
		var length = this.length;
		for (var i = (startIndex||0); i < this.length; i++)
		{
			if (typeof (val) == "function")
			{
				if (val(this[i]))
				{
					this.splice(i, 1);
					i--;
				}
			}
			else
			{
				if (val instanceof Object)
				{
					var ok = true;
					for (var p in val)
					{
						if (val[p] instanceof Array)
						{
							if (!val[p].Find(typeof (this[i][p]) == "function" ? this[i][p]() : this[i][p]))
							{
								ok = false;
								break;
							}
						}
						else
						{
							if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p]))
							{
								ok = false;
								break;
							}
						}
					}
					if (ok)
					{
						this.splice(i, 1);
						i--;
					}
				}
				else
				{
					if (val != null && this[i] != val) continue;
					this.splice(i, 1);
					i--;
				}
			}
		}

		return length != this.length;
	};
}
if (typeof (Array.prototype.Sort) == 'undefined')
{
	var dynamicSort = function (property)
	{
		var sortOrder = 1;
		if (property[0] === "-")
		{
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a, b)
		{
			var aVal = typeof (a[property]) == "function" ? a[property]() : a[property];
			var bVal = typeof (b[property]) == "function" ? b[property]() : b[property];
			var result = (aVal < bVal) ? -1 : (aVal > bVal) ? 1 : 0;
			return result * sortOrder;
		}
	}
	var dynamicSortMultiple = function (props)
	{
		return function (obj1, obj2)
		{
			var i = 0, result = 0, numberOfProperties = props.length;
			/* try getting a different result from 0 (equal)
				* as long as we have extra properties to compare
				*/
			while (result === 0 && i < numberOfProperties)
			{
				result = dynamicSort(props[i])(obj1, obj2);
				i++;
			}
			return result;
		}
	}
	var simpleSort= function (a,b)
	{
		return a < b ? -1 : (a > b ? 1 : 0);
	}

	Array.prototype.Sort = function (val, clone)
	{
		var pars = [];
		if (val && val instanceof Object)
		{
			for (var p in val)
			{
				pars.push((val[p] == -1 ? "-" : "") + p);
			}
		}
		if (clone) return this.slice(0).sort(pars.length ? dynamicSortMultiple(pars) : simpleSort);

		this.sort(pars.length ? dynamicSortMultiple(pars) : simpleSort);
	};
}
if (typeof (Array.prototype.InsertAt) == 'undefined')
{
	Array.prototype.InsertAt = function (index, item, clone)
	{
		if (clone)
		{
			var arrClone = this.slice(0);
			arrClone.splice(index, 0, item);
			return arrClone;
		}
		this.splice(index, 0, item);
	};
}
if (typeof (String.prototype.Capitalize) == 'undefined')
{
	String.prototype.Capitalize = function (allwords)
	{
		if (!allwords)
		{
			return (this.length > 0 ? this.substring(0, 1).toUpperCase() : "") + (this.length > 1 ? this.substring(1).toLowerCase() : "");
		}
		var nstr = "";
		var s = "";
		var strs = this.split(' ');
		for (var i = 0; i < strs.length; i++)
		{
			nstr += s + strs[i].Capitalize(false);
			s = " ";
		}

		return nstr;
	};
}
if (typeof (String.prototype.IsIn) == 'undefined')
{
	String.prototype.IsIn = function ()
	{
		if (arguments.length == 0) return false;

		for (var i = 0; i < arguments.length; i++)
		{
			if (arguments[i] instanceof Array)
			{
				for (var j = 0; j < arguments[i].length; j++)
				{
					if (this == arguments[i][j]) return true;
				}
			}
			else if (this == arguments[i]) return true;
		}

		return false;
	};
}
if (typeof (String.prototype.Contains) == 'undefined')
{
	String.prototype.Contains = function (val)
	{
		return this.indexOf(val) > -1;
	}
}
if (typeof (String.prototype.EmptyToNull) == 'undefined')
{
	String.prototype.EmptyToNull = function ()
	{
		if (this == "") return null;
		return this;
	}
}
//#endregion

//#region Knockout extenders
if (window.ko)
{
	ko.observableArray.fn.find = function (val)
	{
		return ko.pureComputed(function ()
		{
			for (var i = 0; i < (this()||[]).length; i++)
			{
				if (val instanceof Object)
				{
					var c = false;
					for (var p in val)
					{
						//switch(type||"")
						//{
						//	case "ne":
						//	case "!=": if (typeof (this()[i][p]) == "function" ? this()[i][p]() == val[p] : this()[i][p] == val[p]) c = true; break;
						//	case "gt":
						//	case ">": if (typeof (this()[i][p]) == "function" ? this()[i][p]() <= val[p] : this()[i][p] <= val[p]) c = true; break;
						//	case "lt":
						//	case "<": if (typeof (this()[i][p]) == "function" ? this()[i][p]() >= val[p] : this()[i][p] >= val[p]) c = true; break;
						//	case "gte":
						//	case ">=": if (typeof (this()[i][p]) == "function" ? this()[i][p]() < val[p] : this()[i][p] < val[p]) c = true; break;
						//	case "lte":
						//	case "<=": if (typeof (this()[i][p]) == "function" ? this()[i][p]() > val[p] : this()[i][p] > val[p]) c = true; break;
						//	default: if (typeof (this()[i][p]) == "function" ? this()[i][p]() != val[p] : this()[i][p] != val[p]) c = true; break;
						//}
						if (typeof (this()[i][p]) == "function" ? this()[i][p]() != val[p] : this()[i][p] != val[p]) c = true;
					}
					if (c) continue;
					return this()[i];
				}
				else
				{
					//switch (type || "")
					//{
					//	case "ne":
					//	case "!=": if (typeof (this()[i][p]) == "function" ? this()[i]() != val : this()[i] != val) return this()[i]; break;
					//	case "gt":
					//	case ">": if (typeof (this()[i][p]) == "function" ? this()[i]() > val : this()[i] > val) return this()[i]; break;
					//	case "lt":
					//	case "<": if (typeof (this()[i][p]) == "function" ? this()[i]() < val : this()[i] < val) return this()[i]; break;
					//	case "gte":
					//	case ">=": if (typeof (this()[i][p]) == "function" ? this()[i]() >= val : this()[i] >= val) return this()[i]; break;
					//	case "lte":
					//	case "<=": if (typeof (this()[i][p]) == "function" ? this()[i]() <= val : this()[i] <= val) return this()[i]; break;
					//	default: if (typeof (this()[i][p]) == "function" ? this()[i]() == val : this()[i] == val) return this()[i]; break;
					//}
					if (typeof (this()[i][p]) == "function" ? this()[i]() == val : this()[i] == val) return this()[i];
				}
			}

			return null;
		}, this);
	}
	ko.observableArray.fn.findAll = function (val, startIndex)
	{
		return ko.pureComputed(function ()
		{
			var obj = []
			for (var i = (startIndex || 0) ; i < (this || []).length; i++)
			{
				if (val instanceof Object)
				{
					var ok = true;
					for (var p in val)
					{
						if (val[p] instanceof Array)
						{
							if (!val[p].Find(typeof (this[i][p]) == "function" ? this[i][p]() : this[i][p]))
							{
								ok = false;
								break;
							}
						}
						else
						{
							if (typeof (this[i][p]) == "function" ? (this[i][p]() != val[p]) : (this[i][p] != val[p]))
							{
								ok = false;
								break;
							}
						}
					}
					if (ok) obj[obj.length] = this[i];
				}
				else
				{
					if (val == null || this[i] == val) obj[obj.length] = this[i];
				}
			}

			return obj;

		}, this);
	}
}
//#endregion

$(document).ready(function ()
{
	$(document).on("click", "button", function () { $(this).blur(); return false; });
	
}).ajaxStart(function ()
{
	$.page.showLoading();
}).ajaxStop(function ()
{
	$.page.hideLoading()
});