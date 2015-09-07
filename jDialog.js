var dialogHTML = {
    shareDialog: '<div id="dlgFileShare"><table class="cmsg" cellpadding="0" cellspacing="0"><tr><td style="width:80px;">Share with:</td><td><div id="shareFile"><div class="inputBox"><div class="shareToBox"><input id="shareTo" class="dialogShareRecipient" type="text" value="" style="width: 100%;"/></div></div></div></td></tr><tr><td colspan="2" style="display:none" class="shareToUsers"><ul class="users"><dt class="hidden"><li class="last"><span class="name">&#160;</span><a class="cw-btn removercpt" data-action="close" href="javascript:void(0);" cw-title="Close">x</a></li></dt></ul></td></tr></table></div>'
};
function jDialog(dialogName, params) {
    //Variables
    this.name = dialogName;
    var title = "";
    var contentHtml = "";
    var okLabel = "OK";
    var cancelLabel = "Cancel";
    var navItems = [];

    this.cached = true;
    if (params.cached != undefined) {
        this.cached = params.cached;
    }


    //Properties
    this.setNavItems = function (value) {
        if (value == undefined) return;
        navItems = value;
    };

    this.getNavItems = function () {
        return navItems;
    };

    this.setContentHtml = function (value) {
        if (value == undefined) return;
        contentHtml = value;
        CwZ("#" + this.name + '_dialog .dialogContent').html(value);
    };

    this.getContentHtml = function () {
        return contentHtml;
    };

    this.setTitle = function (value) {
        if (value == undefined) return;
        title = value;
        CwZ("#" + this.name + '_dialog .dialogTitle h2').html(value);
    };

    this.getTitle = function () {
        return title;
    };

    this.setSubTitle = function (value) {
        if (value == undefined) return;
        title = value;
        this.removeSubTitle();
        CwZ("#" + this.name + '_dialog .dialogTitle h2').after("<p>" + value + "</p>");
    };

    this.removeSubTitle = function () {
        CwZ("#" + this.name + '_dialog .dialogTitle h2').next("p").remove();
    };

    this.setOkLabel = function (value) {
        if (value == undefined) return;
        okLabel = value;
        CwZ("#" + this.name + '_dialog .dialogOk').html(value);
    };

    this.getOkLabel = function () {
        return okLabel;
    };

    this.setCancelLabel = function (value) {
        if (value == undefined) return;
        cancelLabel = value;
        CwZ("#" + this.name + '_dialog .dialogCancel').html(value);
    };

    this.getCancelLabel = function () {
        return cancelLabel;
    };

    this.bindOnOkEvent = function (handler) {
        if (handler == undefined) return;
        var _this = this;
        CwZ("#" + this.name + '_dialog .dialogOk').off("click").on("click", function () {
            handler();
        });
    };

    this.bindOnCancelEvent = function (handler) {
        if (handler == undefined) return;
        var _this = this;
        CwZ("#" + this.name + '_dialog .dialogCancel').off("click").on("click", function () {
            _this.hide();
            handler();
        });
    };

    CwZ("#" + this.name + '_dialog').on("keyup", function (e) {
        jDialog.getActiveObject().hide();
    });

    var _this = this;

    this.setTitle(params.title);
    this.setOkLabel(params.okLabel);
    this.setCancelLabel(params.cancelLabel);
    this.setContentHtml(params.contentHtml);
    this.setNavItems(params.navItems);


    var dialogNavHtml = '<div class="dialogNav" style="display:none;"></div>';
    if (this.getNavItems().length > 0) {
        dialogNavHtml = '<div class="dialogNav" style="display:none;"><ul>';
        for (var i = 0; i < this.getNavItems().length; i++) {
            var item = this.getNavItems()[i];
            var idAttrib = (item.id != undefined) ? (" id='" + item.id + "'") : "";
            var onClickAttrib = (item.onclick != undefined) ? (" onclick='" + item.onclick + "'") : "";
            var icon = (item.icon != undefined) ? item.icon : "";
            var label = (item.label != undefined) ? item.label : "";
            var selected = (item.selected == true) ? " class='selected'" : "";


            dialogNavHtml += '<li ' + selected + '>';
            dialogNavHtml += '<a ' + idAttrib + ' href="javascript:void(0);"' + onClickAttrib + ' title="' + label + '">';
            dialogNavHtml += '<img src="images/spacer.gif" class="' + icon + '"/>';
            dialogNavHtml += '<span>' + label + '</span>';
            dialogNavHtml += '</a></li>'
        }
        dialogNavHtml += '</ul></div>';
    }
    var html = '<div id="' + this.name + '_dialog" class="dialogBox' + ((params.isOldStyle != undefined && params.isOldStyle == true) ? ' oldStyle' : '') + '">' +
        dialogNavHtml + '<div class="dialogWrapper" style="display:none;">' +
        '<div class="dialogHeader"><h2>' + this.getTitle() + '</h2>' + /*'<a href="javascript:void(0);" class="dialogClose"><img src="images/spacer.gif" alt=""/></a>' + */'</div>' +
        '<div class="dialogContent">' + this.getContentHtml() + '</div>';

    var footerStyle = "", okStyle = "", cancelStyle = "";
    if (params.hideButtons == true) {
        footerStyle = "display:none;";
    }
    if (params.hideOk == true) {
        okStyle = "display:none;";
    }
    if (params.hideCancel == true) {
        cancelStyle = "display:none;";
    }

    html += '<div class="dialogFooter" style="' + footerStyle + '">' +
        '<a class="dialogOk cBtn active" href="javascript:void(0);" style="' + okStyle + '">' + this.getOkLabel() + '</a>' +
        '<a class="dialogCancel cBtn" href="javascript:void(0);" style="' + cancelStyle + '">' + this.getCancelLabel() + '</a>' +
        '<span class="sendingDlg hidden">Please wait ...</span>'
    '</div>';
    html += '</div>';

    html += '<div class="dialogLoader" style="' + ((params.isAjax == true) ? '' : 'display:none;') + '"><div class="loader"><img src="images/spacer.gif" class=""></div><div class="loadingText">Loading...</div></div>';
    html += '</div>';

    CwZ("#dialogCurtain").append(html);
    CwZ("#dialogCurtain").addClass("dark").show();
    this.setPosition();

    this.bindOnOkEvent(params.onOk);
    this.bindOnCancelEvent(params.onCancel);
    this.bindOnLoadEvent(params.onLoad);
    this.bindOnShowEvent(params.onShow);
    this.bindOnHideEvent(params.onHide);


    CwZ("#" + this.name + "_dialog .dialogClose").on("click", function () {
        _this.hide('close');
    });
    CwZ("#" + this.name + "_dialog .dialogNav li a").on("click", function () {
        if (params.navHasTitle) {
            _this.setTitle(CwZ(this).text());
        }
        CwZ(this).closest("ul").find("li").removeClass("selected");
        CwZ(this).parent().addClass("selected");
    });

    CwZ("#" + this.name + "_dialog").data("object", this);

    if (params.isAjax != undefined && params.isAjax == true) {
        function handler(dialog) {
            _this.setContentHtml(dialog);
            _this.onLoad();

            setTimeout(function () {
                CwZ("#" + _this.name + "_dialog .dialogLoader").fadeOut(300, function () {
                    _this.show();
                    CwZ("#" + _this.name + "_dialog .dialogWrapper").show();
                    if (_this.getNavItems().length > 0) {
                        CwZ("#" + _this.name + "_dialog .dialogNav").show();
                    }
                    _this.setPosition();
                });
            }, 300);
        }
        handler(dialogHTML.shareDialog);
    }
    else {
        _this.onLoad();
        CwZ("#" + this.name + "_dialog").hide();
        _this.setPosition();
        setTimeout(function () {
            _this.show();
        },50);
        CwZ("#" + this.name + "_dialog .dialogWrapper").show();
        if (_this.getNavItems().length > 0) {
            CwZ("#" + _this.name + "_dialog .dialogNav").show();
        }
    }
};


jDialog.animated = true;

jDialog.getObject = function (dialogName) {
    var object = CwZ("#" + dialogName + "_dialog").data("object");
    return object;
};

jDialog.getActiveObject = function () {
    var object = CwZ(".dialogBox[id$='_dialog']:visible").eq(0).data("object");
    return object;
};

jDialog.open = function (dialogName, params) {
    var obj = jDialog.getObject(dialogName);
    if (obj == undefined) {
        obj = new jDialog(dialogName, params);
    }
    else {
        obj.setTitle(params.title);
        obj.setContentHtml(params.contentHtml);
        obj.bindOnShowEvent(params.onShow);
        obj.bindOnHideEvent(params.onHide);
        obj.show();
    }
    return obj;
};

jDialog.prototype.onLoad = function () {
};
jDialog.prototype.onShow = function () {
};
jDialog.prototype.onHide = function () {
};

jDialog.prototype.show = function () {
    var _this = this;
    CwZ("#dialogCurtain").addClass("dark").show();
    _this.onShow();
    _this.setPosition();
    WiZ.disableWindowScroll(true);
    if (jDialog.animated == true) {
        CwZ("#" + this.name + "_dialog").fadeIn(500,function(){
            _this.setPosition();
        });
    }
    else {
        CwZ("#" + this.name + "_dialog").show();
    }

};

jDialog.prototype.hide = function (mode) {
    WiZ.disableWindowScroll(false);
    var _this = this;
    var hideFunc = function () {
        CwZ("#" + _this.name + "_dialog").hide(1, function () {
            _this.onHide();
            var activeObj = jDialog.getActiveObject();
            if (activeObj == undefined || activeObj.name == _this.name) {
                CwZ("#dialogCurtain").removeClass("dark").hide();
            }
            if (_this.cached == false) {
                CwZ("#" + _this.name + "_dialog").remove();
            }
            if(CwZ('#thoughtBar').length > 0 && typeof mode != "undefined" && mode == "close" && !EqE.editMode && !Polls.editMode){
                SyT.activeThTab();
            }
        });
    };

    if (jDialog.animated == true) {
        CwZ("#" + this.name + "_dialog").fadeOut(200, function () {
            hideFunc();
        });
    }
    else {
        hideFunc();
    }

};

jDialog.prototype.hideOkButton = function () {
    CwZ("#" + this.name + '_dialog .dialogOk').hide();
};

jDialog.prototype.showOkButton = function () {
    CwZ("#" + this.name + '_dialog .dialogOk').show();
};

jDialog.prototype.hideCancelButton = function () {
    CwZ("#" + this.name + '_dialog .dialogCancel').hide();
};

jDialog.prototype.showCancelButton = function () {
    CwZ("#" + this.name + '_dialog .dialogCancel').show();
};

jDialog.prototype.hideButtons = function () {
    CwZ("#" + this.name + "_dialog").find(".dialogOk, .dialogCancel").hide();
};

jDialog.prototype.showButtons = function () {
    CwZ("#" + this.name + "_dialog").find(".dialogOk, .dialogCancel").show();
};

jDialog.prototype.setPosition = function () {
    var dlg = CwZ("#" + this.name + "_dialog");
    var dWidth = dlg.outerWidth();
    var dHeight = dlg.outerHeight();

    var wWidth = CwZ(window).width();
    var wHeight = CwZ(window).height();

    var left = Math.round((wWidth / 2) - (dWidth / 2));
    var top = Math.round((wHeight / 2) - (dHeight / 2));

    dlg.css({
        left:left,
        top:top
    });
};

jDialog.prototype.bindOnLoadEvent = function (handler) {
    if (handler == undefined) return;
    this.onLoad = handler;
};

jDialog.prototype.bindOnShowEvent = function (handler) {
    if (handler == undefined) return;
    this.onShow = handler;
};

jDialog.prototype.bindOnHideEvent = function (handler) {
    if (handler == undefined) return;
    this.onHide = handler;
};

jDialog.prototype.selectFirstNavItem = function () {
    CwZ("#" + this.name + "_dialog").find(".dialogNav a").first().click();
};