/// <reference path="jquery-3.2.1.min.js" />
/**
 * Easy Tree
 * @Copyright yuez.me 2014
 * @Author yuez
 * @Modifier miromakh
 * @Version 0.1.1
 */
(function ($) {
    $.fn.EasyTree = function (options) {
        var defaults = {
            selectable: true,
            deletable: false,
            editable: false,
            addable: false,
			searchable: true,
			collapsedAtStart: true,
            lables: {
            	deleteNull: 'אנא בחר את הפריט שברצונך למחוק.',
            	deleteConfirmation: 'האם למחוק את הפריט?',
            	confirmButtonLabel: 'אישור',
            	editNull: 'נא ליבחור פריט לעריכה.',
            	editMultiple: 'אפשר לערוך רק פריט אחד',
            	addMultiple: 'אפשר להוסיף רק פריט אחד',
            	collapseTip: 'סגור עץ',
                expandTip: 'פתח עץ',
                selectTip: 'בחר',
                unselectTip: 'בטל בחירה',
                editTip: 'ערוך',
                addTip: 'הוסף',
                deleteTip: 'מחק',
                cancelButtonLabel: 'ביטול'
            },
            onItemSelected: null,
            onItemDeleted: null,
            onItemEdited: null,
            onItemAdded: null,
			useExistingHtml: false
        };

        var warningAlert = $('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong></strong><span class="alert-content"></span> </div> ');
        var dangerAlert = $('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong></strong><span class="alert-content"></span> </div> ');
        var createInput = $('<div class="input-group"><input type="text" class="form-control"><button type="button" class="btn btn-default btn-success confirm"></button><button type="button" class="btn btn-default cancel"></button></div> ');

        options = $.extend(defaults, options);

        this.each(function ()
        {
        	var easyTree = $(this);
        	if (!options.useExistingHtml)
        	{
        		$.each($(easyTree).find('ul > li'), function ()
        		{
        			var text;
        			var hasDataBind = $(this).is("[data-bind]");
        			var dbind = $(this).attr("data-bind");

					if ($(this).is('li:has(ul)'))
					{
						var children = $(this).find(' > ul');
						var not_children = children.siblings();
						text = not_children.text();
						not_children.remove();
						$('<span><span class="glyphicon"></span><a href="javascript: void(0);"></a></span>').insertBefore(children);
						$(this).find(' > span > span').addClass('glyphicon-minus');
						$(this).find(' > span > a').text(text);

					}
					else
					{
						text = $(this).text();

						$(this).html('<span><span class="glyphicon"></span><a href="javascript: void(0);"></a> </span>');
						$(this).find(' > span > span').addClass('glyphicon-asterisk');
						$(this).find(' > span > a').text(text);
						if (hasDataBind)
						{
							$(this).find(' > span > a').attr("data-bind", dbind);
						}
					}
        		});
        	}

            $(easyTree).find('li:has(ul)').addClass('parent_li').find(' > span').attr('title', options.lables.collapseTip);

            // add easy tree toolbar dom
            if (options.deletable || options.editable || options.addable || options.searchable)
            {
            	$(easyTree).prepend('<div class="easy-tree-toolbar container-fluid"><div class="row"></div></div> ');
            }

            var searchColspan = 12 - ((options.deletable ? 1 : 0) + (options.editable ? 1 : 0) + (options.addable ? 1 : 0));

            // addable
            if (options.addable)
            {
            	$(easyTree).find('.easy-tree-toolbar > div.row').append('<div class="create col-sm-1"><button class="btn btn-default btn-sm btn-success"><span class="glyphicon glyphicon-plus"></span></button></div>');
                $(easyTree).find('.easy-tree-toolbar .create > button').attr('title', options.lables.addTip).click(function ()
                {
					var createBlock = $(easyTree).find('.easy-tree-toolbar .create');
                	//$(createBlock.parent()).append(createInput);
                    var sel = $(easyTree).find('li.li_selected:first');
					if(sel.length)
						createInput.insertAfter(sel);
                    else
						$(createBlock.parent()).append(createInput);

                    $(createInput).find('input').focus();
                    $(createInput).find('.confirm').text(options.lables.confirmButtonLabel);
                    $(createInput).find('.confirm').click(function ()
                    {
                        if ($(createInput).find('input').val() === '')
                            return;
                        var selected = getSelectedItems();
                        var item = $('<li><span><span class="glyphicon glyphicon-asterisk"></span><a href="javascript: void(0);">' + $(createInput).find('input').val() + '</a> </span></li>');
                        
                        item.data({ ParentID: selected.length ? $(selected).data().ID : null });

                        $(item).find(' > span > span').attr('title', options.lables.collapseTip);
                        $(item).find(' > span > a').attr('title', options.lables.selectTip);
                        if (selected.length <= 0) {
                            $(easyTree).find(' > ul').append($(item));
                        } else if (selected.length > 1) {
                            $(easyTree).prepend(warningAlert);
                            $(easyTree).find('.alert .alert-content').text(options.lables.addMultiple);
                        } else {
                            if ($(selected).hasClass('parent_li')) {
                                $(selected).find(' > ul').append(item);
                            } else {
                                $(selected).addClass('parent_li').find(' > span > span').addClass('glyphicon-minus').removeClass('glyphicon-asterisk');
                                $(selected).append($('<ul></ul>')).find(' > ul').append(item);
                            }
                        }
                        $(createInput).find('input').val('');
                        if (options.selectable)
                        {
                            $(item).find(' > span > a').attr('title', options.lables.selectTip);
                            $(item).find(' > span > a').click(function (e)
                            {
                                var li = $(this).parent().parent();
                                if (li.hasClass('li_selected'))
                                {
                                    $(this).attr('title', options.lables.selectTip);
                                    $(li).removeClass('li_selected');
                                }
                                else
                                {
                                    $(easyTree).find('li.li_selected').removeClass('li_selected');
                                    $(this).attr('title', options.lables.unselectTip);
                                    $(li).addClass('li_selected');
                                    if (options.onItemSelected)
                                    {
                                    	options.onItemSelected($(li));
                                    }
                                }

                                if (options.deletable || options.editable || options.addable)
                                {
                                    var selected = getSelectedItems();
                                    if (options.editable) {
                                        if (selected.length <= 0 || selected.length > 1)
                                            $(easyTree).find('.easy-tree-toolbar .edit > button').addClass('disabled');
                                        else
                                            $(easyTree).find('.easy-tree-toolbar .edit > button').removeClass('disabled');
                                    }

                                    if (options.deletable) {
                                        if (selected.length <= 0 || selected.length > 1)
                                            $(easyTree).find('.easy-tree-toolbar .remove > button').addClass('disabled');
                                        else
                                            $(easyTree).find('.easy-tree-toolbar .remove > button').removeClass('disabled');
                                    }

                                }

                                e.stopPropagation();
                                return false;
                            });
                        }
                        $(createInput).remove();

                        if (options.onItemAdded)
                        {
                        	options.onItemAdded($(selected)/*parent*/, item/*current*/);
                        }

                        return false;
                    });
                    $(createInput).find('.cancel').text(options.lables.cancelButtonLabel);
                    $(createInput).find('.cancel').click(function () {
                    	$(createInput).remove();
                    	return false;
                    });
                    return false;
                });
            }

            // editable
            if (options.editable)
            {
            	$(easyTree).find('.easy-tree-toolbar > div.row').append('<div class="edit col-sm-1"><button class="btn btn-default btn-sm btn-primary disabled"><span class="glyphicon glyphicon-edit"></span></button></div>');
                $(easyTree).find('.easy-tree-toolbar .edit > button').attr('title', options.lables.editTip).click(function ()
                {
                    $(easyTree).find('input.easy-tree-editor').remove();
                    $(easyTree).find('li > span > a:hidden').show();
                    var selected = getSelectedItems();
                    if (selected.length <= 0) {
                        $(easyTree).prepend(warningAlert);
                        $(easyTree).find('.alert .alert-content').html(options.lables.editNull);
                    }
                    else if (selected.length > 1) {
                        $(easyTree).prepend(warningAlert);
                        $(easyTree).find('.alert .alert-content').html(options.lables.editMultiple);
                    }
                    else {
                        var value = $(selected).find(' > span > a').text();
                        $(selected).find(' > span > a').hide();
                        $(selected).find(' > span').append('<input type="text" class="easy-tree-editor">');
                        var editor = $(selected).find(' > span > input.easy-tree-editor');
                        $(editor).val(value);
                        $(editor).focus();
                        $(editor).keydown(function (e) {
                        	if (e.which == 13)
                        	{
                        		if ($(editor).val() !== '')
                        		{
                        			$(selected).find(' > span > a').text($(editor).val());
                        			$(selected).data().Name = $(editor).val();
                        			$(editor).remove();
                        			$(selected).find(' > span > a').show();

                                    if(options.onItemEdited)
                                    {
                                    	options.onItemEdited($(selected));
                                    }
                                }
                            }
                        });
                    }
                    return false;
                });
            }

            // deletable
            if (options.deletable)
            {
            	$(easyTree).find('.easy-tree-toolbar > div.row').append('<div class="remove col-sm-1"><button class="btn btn-default btn-sm btn-danger disabled"><span class="glyphicon glyphicon-remove"></span></button></div>');
                $(easyTree).find('.easy-tree-toolbar .remove > button').attr('title', options.lables.deleteTip).click(function ()
                {
                    var selected = getSelectedItems();
                    if (selected.length <= 0) {
                        $(easyTree).prepend(warningAlert);
                        $(easyTree).find('.alert .alert-content').html(options.lables.deleteNull);
                    } else {
                    	$(easyTree).find('.easy-tree-toolbar').append(dangerAlert);
                        $(easyTree).find('.alert .alert-content').html(options.lables.deleteConfirmation)
                            .append('<a style="margin-right: 10px;" class="btn btn-default btn-danger confirm"></a>')
                            .find('.confirm').html(options.lables.confirmButtonLabel);
                        $(easyTree).find('.alert .alert-content .confirm').on('click', function ()
                        {
                        	var clone = $(selected).clone(true);
                            $(selected).find(' ul ').remove();
                            if($(selected).parent('ul').find(' > li').length <= 1) {
                                $(selected).parents('li').removeClass('parent_li').find(' > span > span').removeClass('glyphicon-minus').addClass('glyphicon-asterisk');
                                $(selected).parent('ul').remove();
                            }
                            $(selected).remove();
                            $(dangerAlert).remove();
                            if (options.onItemDeleted)
                            {
                            	options.onItemDeleted(clone);
                            	clone.remove();
                            }
                            return false;
                        });
                    }
                    return false;
                });
            }

        	if (options.searchable)
        	{
        		$(easyTree).find('.easy-tree-toolbar > div.row').append('<div class="search col-sm-' + searchColspan + '"><input type="text" class="form-control" placeholder="חפש כתבה ו/או נושה" /></div>');
        	}

            // collapse or expand
            $('li.parent_li > span',$(easyTree)).on('click', function (e)
            {
                var children = $(this).parent('li.parent_li').find(' > ul > li');
                if (children.is(':visible')) {
                    children.hide('fast');
					$(this).find(' > span.glyphicon').attr('title', options.lables.expandTip)
                        .addClass('glyphicon-plus')
                        .removeClass('glyphicon-minus');
                } else {
                    children.show('fast');
					$(this).find(' > span.glyphicon').attr('title', options.lables.collapseTip)
                        .addClass('glyphicon-minus')
                        .removeClass('glyphicon-plus');
                }
                e.stopPropagation();
            });

            // selectable, only single select
            if (options.selectable) {
                $(easyTree).find('li > span > a').attr('title', options.lables.selectTip);
                $(easyTree).find('li > span > a').click(function (e)
				{
					var li = $(this).parent().parent();
					if (li.hasClass('li_selected'))
					{
                        $(this).attr('title', options.lables.selectTip);
                        $(li).removeClass('li_selected');
                        if (options.onItemUnselected) {
                        	options.onItemUnselected($(li));
                        }
                    }
					else
					{
                        $(easyTree).find('li.li_selected').removeClass('li_selected');
                        $(this).attr('title', options.lables.unselectTip);
                        $(li).addClass('li_selected');
                        if(options.onItemSelected)
                        {
                        	options.onItemSelected($(li));
                        }
					}

					//////////////////////////////////////////////////////////////
					var parent = li.parentsUntil("li.parent_li").parent();
					
					while (parent.length)
					{
						var children = parent.find(" > ul > li");
						if (!children.is(":visible"))
						{
							children.show();
							children.parent().parent().find(" > span > span.glyphicon").attr('title', options.lables.collapseTip)
								.addClass('glyphicon-minus')
								.removeClass('glyphicon-plus');
						}
						parent = parent.parent();
					}
					//////////////////////////////////////////////////////////////

					if (options.deletable || options.editable || options.addable)
					{
                        var selected = getSelectedItems();
                        if (options.editable) {
                            if (selected.length <= 0 || selected.length > 1)
                                $(easyTree).find('.easy-tree-toolbar .edit > button').addClass('disabled');
                            else
                                $(easyTree).find('.easy-tree-toolbar .edit > button').removeClass('disabled');
                        }

                        if (options.deletable) {
                            if (selected.length <= 0 || selected.length > 1)
                                $(easyTree).find('.easy-tree-toolbar .remove > button').addClass('disabled');
                            else
                                $(easyTree).find('.easy-tree-toolbar .remove > button').removeClass('disabled');
                        }

                    }

                    e.stopPropagation();

                });
            }

            // Get selected items
            var getSelectedItems = function () {
                return $(easyTree).find('li.li_selected');
            };
        });

        if(options.collapsedAtStart)
        {
        	var parent = $(".easy-tree").find('li.parent_li');
        	var children = parent.find(' > ul > li');
        	if (children.is(':visible')) {
        		children.hide('fast');
        		parent.children('span').attr('title', options.lables.expandTip).find(
						' > span.glyphicon').addClass(
						'glyphicon-plus').removeClass(
						'glyphicon-minus');
        	}
        }
    };
})(jQuery);

