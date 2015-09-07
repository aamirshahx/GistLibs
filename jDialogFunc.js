var shareDialog = {
    isInitialized:false,
    sendToList:{},
    selectedPublication:null,
    pubId:null,
    cmnts: false,
    sharedUsersList: [],
    emailRegex:/(?:[a-z0-9!#CwZ%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#CwZ%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
    addItem:function(title,key,role){
        if(typeof role == "undefined"){
            role = true;
        }
        if(title==null)
            title="";
        title=XmL.escapeXml(title);
        if(key==-1)
            key=title.toLowerCase();

      function refocus(){
          $('.dialogShareRecipient').val("").focus();
          shareDialog.hideUsers();
      }


        // check if user is sharing to his own email address
        if(key == CWDataCenter.userEmail){
            var params = {
                msg: "Sharing on your own email is not allowed, please enter valid email address.",
                onOk: function(){
                    refocus();
                }
            };
            CWPDFReaderDialog.show(params);
        }
        // if the contact is already in the selected list
        else if(typeof shareDialog.sendToList[key] == "undefined"){
            var addUser = CwZ('.shareToUsers dt li').clone(true).insertBefore('dt.hidden').removeClass('last').find('.name').text(title).attr('data-id', key);
            role ? addUser.end().find('.allowed-rights').val(role): addUser ;
            CwZ('.shareToUsers').show();
            shareDialog.sendToList[key] = title;
        }
        setTimeout(function(){
          refocus();
        },1)
    },
    initDialog:function () {
        var rRecipientInputBox = CwZ(".dialogShareRecipient");
        shareDialog.isInitialized = true;

        rRecipientInputBox.autocomplete({
            appendTo:"#dialogCurtain",
            source:function (req, add) {
                var queryText = req.term.toLocaleLowerCase(), entityType = ["101","161"];
                UaC.getAutocompleteRecords({"query":queryText, "et":entityType, "onComplete":add, "length": 5, "sender": "shareDialog"});
            },
            minLength:1,
            autoFocus:true,
            select:function (event, ui) {
                var entId = ui.item.type == "101" ? ui.item.userId : ui.item.type == "161" ? ui.item.key : "";
                shareDialog.addItem( ui.item.value, entId);
            }
        }).data("ui-autocomplete")._renderItem = shareDialog.onRender;

        CwZ("#shareFile").off("click").on("click", function () {
            var msgDlg = CwZ(".dialogShareRecipient");
            msgDlg.focus();
        });
        rRecipientInputBox.off('keydown').on("keydown", shareDialog.onautofillekeyup);
        rRecipientInputBox.off('paste').on("paste", shareDialog.onPaste);
    },

    onRender: function(ul, item){
        try {
            var str = "", imgclass = "", entId = "";
            switch (item.type) {
                case "101":
                    imgclass = "userImg";
                    entId = item.userId;
                    break;
                case "161":
                    imgclass = "groupImg";
                    entId = item.key;
                    break;
            }
            item.img = UaC.imageUrl('t', item.type, item.key);
            str = "<li title='Share Publication'>" +
                "<a>" +
                /*"<img  class='"+ imgclass +"' src='" + item.img + "' alt='' />" +*/
                "<span id='" + entId + "'>" + XmL.escapeXml(item.title) + "</span>" +
                "</a>" +
                "</li>";
            var user = CwZ(str).data("item.autocomplete", item);
            return user.appendTo(ul);
        } catch (e) {

        }
    },
    onautofillekeyup:function (evt) {
        var keycode = evt.keyCode;
        var elem = CwZ(this), val= UaC.trim(elem.val());
        var len =val.length;
        if (keycode == 8 && len == 0) {
            elem.parent().find(".name a").last().click();
        }else if(keycode == 13 || keycode == 188 || keycode == 59 || keycode == 186 || keycode == 32){
            if (cwValidate.isEmail(val)){
                shareDialog.addItem(val,-1);
                return false;
            }
        }
    },
    onPaste: function(){
        var elem = CwZ(this);
        setTimeout(function () {
            var str = elem.val();
            var emails = shareDialog.parseMultipleEmails(str);
            if (emails) {
                for (var i = 0; i < emails.length; i++) {
                    if (cwValidate.isEmail(emails[i])){
                        shareDialog.addItem(emails[i],-1);
                    }
                }
            }
        }, 100);
    },
    parseMultipleEmails:function (str) {
        return str.match(shareDialog.emailRegex);
    },
    resetDialog:function () {
        shareDialog.sendToList = {};
        CwZ(".dialogShareRecipient").val("");
        CwZ('.users>li').remove();
        CwZ("#sendToList").html("");
        shareDialog.hideUsers();
    },
    remove:function (link, id) {
        link.remove();
        delete(shareDialog.sendToList[id]);
        shareDialog.hideUsers();
    },
    showDialog:function (container,showPub) {
        shareDialog.resetDialog();
        if(CwZ('#dialogCurtain').length == 0) {
            var dialog = '<div id="dialogCurtain" class="validateDlg" style="display:none;z-index: 9999;">&#160;</div>';
            $(container || 'body').append(dialog);
        }
        jDialog.open("shareFile", {
            title:"Share File",
            isAjax:true,
            isOldStyle: true,
            showPub: showPub ? true : false,
            onLoad:shareDialog.initDialog,
            onShow:shareDialog.dialogOnShow,
            onOk:shareDialog.sendFile,
            onCancel:shareDialog.hideJDialog,
            okLabel:"Share File"
        });
        CWUtils.updateScrollbar(".shareToUsers ul.users");
    },
    hideJDialog:function () {
        var obj = jDialog.getActiveObject();
        if (obj != undefined) {
            obj.hide();
        }
    },
    sendFile:function () {
        var to = "";
        var sendTo=$("#shareTo").val();
        if(sendTo.length>0 && cwValidate.isEmail(sendTo))
            shareDialog.addItem(sendTo,-1);
        for (var id in shareDialog.sendToList) {
            var role = $('span.name[data-id="'+id+'"]').parent().find('.allowed-rights').val() || "0";
            to += id + ":" + role +",";
        }
        to = to.substring(0, to.length - 1);
        if (to.length == 0) {
            shareDialog.statusDlg({msg: "Please add at least one recipient."});
            return;
        }
        function share(cmnts){
            shareDialog.cmnts = cmnts;
            shareDialog.shareFile(to);

        }
        if(CWCommentManager.annotationArr.length){
            shareDialog.statusDlg({
                msg: "File that you are trying to share contains annotations. Would you like to share those annotations as well?",
                okBtnTxt: "Yes", cnclBtnTxt: "No",
                onOk: function(){
                    share(true);
                }, onCancel: function(){
                    share(false)
                }
            });
        } else{
            share(false);
        }
    },
    showFooterBtn: function(){
        CwZ('.dialogFooter .cBtn').removeClass('hidden');
        CwZ('.dialogFooter .sendingDlg').addClass('hidden');
    },
    shareFile: function(users){
        CwZ('.dialogFooter .cBtn').addClass('hidden');
        CwZ('.dialogFooter .sendingDlg').removeClass('hidden');
        function failHandler(){
            shareDialog.statusDlg({msg: "Something went wrong, Please try again."});
            shareDialog.hideJDialog();
            shareDialog.showFooterBtn();
        }
        if(typeof users != "undefined" && CWDataCenter.fileId!=null){
            var param = {
                "objectState":"1",
                "id":"-1",
                "type":"120",
                "title":" ",
                "details":'{"Colwiz":{"description":"","Folders":""}}'
            };
            PbX.post(param, "",function(req0) {
                var response = JSON.parse(req0.responseText);
                if(response.success){
                    var id = response.success.id;
                    var param1 = {
                        "id": id,
                        "objectState": "22",
                        "eusers": users,
                        "eusettings": {"by": CWPDFReaderConfig.uName, "msg": "File has been shared with you"},
                        "cmts": shareDialog.cmnts,
                        "svc": "cl"
                    };
                    PbX.post(param1, "", function (req1){
                        var response1 = JSON.parse(req1.responseText);
                        if(response1.success){
                            var param2 = {
                                "id": id,
                                "objectState": 50,
                                "refId": CWDataCenter.fileId
                            };
                            PbX.post(param2, "", function (req2){
                                var response2 = JSON.parse(req2.responseText);
                                if(response2.success){
                                    shareDialog.statusDlg({msg: "File shared successfully."});
                                    shareDialog.getSharedUsers(id);
                                } else{
                                    failHandler();
                                }
                                shareDialog.hideJDialog();
                                shareDialog.showFooterBtn();
                            }, failHandler);
                        } else {
                            failHandler();
                        }
                    }, failHandler);
                } else{
                    failHandler();
                }
            }, failHandler);
        }
    },
    getSharedUsers: function(folderId){
        PaX.get("/app?x=44e&et=120&rsvp=1&refId=" + folderId + "&svc=cl",'',true,function(req){
            var xml = $($.parseXML(req.responseText));
            var users = xml.find('Colwiz Euser');
            var allRoles = {'4': '0', 'C': '1'}; // 4 - canView - 4 | C - canEdit - 12 | 1C - Owner - 28
            users.each(function(){
                var _this = $(this);
                var isOwner = _this.attr('roles') == "1C";
                if(!isOwner){
                    var title = _this.attr('title') || _this.attr('email'),
                        uId = _this.attr('uId'),
                        roles = allRoles[_this.attr('roles')];
                    shareDialog.addItem(title, uId, roles);
                }
            });
        });
    },
    hideUsers: function(){
        if(CwZ('ul.users>li').length == 0) {
            CwZ('ul.users').addClass('hidden');
        } else {
            CwZ('ul.users').removeClass('hidden');
            CwZ('ul.users').css("display","inline-block");
        }
    },
    statusDlg: function(params){
        var args = {okBtnTxt: "OK",  dontHide: false, title: "", msg: "Something went wrong please reload.", onOk: function(){}};
        $.extend(args, params);
        CWPDFReaderDialog.show(args);
    },
    dialogOnShow:function () {
        shareDialog.resetDialog();
        CwZ('.cw-btn.removercpt').off('click').on('click',function(e){
            var li = $(e.currentTarget).parents('li');
            var id = li.find('span.name').data('id');
            shareDialog.remove(li, id);
        });
        if(shareDialog.selectedPublication!=null){
            shareDialog.pubId=shareDialog.selectedPublication.find("a:eq(0)").attr("href").replace(/^(.*&eId=)(.*)CwZ/,"CwZ2");
            if(shareDialog.pubId)
                shareDialog.pubId=shareDialog.pubId.split("&")[0];
            CwZ(".publicationsContent ul li").html("").append(shareDialog.selectedPublication);
        }else{
            CwZ(".publicationsContent").parents("tr:eq(0)").hide();
        }
        CwZ("#quickRecomend input").focus();
    }
};
var XmL = {
    escapeXml: function(str) {
        if (str == undefined)
            return "";
        str = XmL.unescapeXml(str.toString());

        return str
            .replace(/^\s+/, "")
            .replace(/\s+CwZ/, "")
            .replace(/&/g, "&amp;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    },
    unescapeXml: function(str) {
        return str.toString()
            .replace(/^\s+/, "")
            .replace(/\s+CwZ/, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, "\"")
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
    }
};
var cwValidate = {
    isEmail:function (email) {
        var reg = /^([a-zA-Z0-9_\-\.\+]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        return reg.test(UaC.trim(email));
    }
};
var UaC = {
    updateTimer: {},
    records: {},
    etArray: {},
    recordsLoaded: false,
    recordsParsed: false,
    updateTime:300000, // 5 min
    isInit:false,
    init:function () {
        if(!UaC.isInit){
            UaC.isInit=true;
            UaC.resetAutocompleteRecord();
        }
    },
    imageUrl : function(pictureType, et, eid){
        return '/images/data/' + pictureType + '/' + et + '/' + eid + '.jpg?' + Date.now();
    },
    resetAutocompleteRecord:function () {
        for (var timer in UaC.updateTimer) {
            clearInterval(UaC.updateTimer[timer]);
            UaC.updateTimer[timer] = -1;
        }
        UaC.records = {};
        UaC.updateTimer = {};
    },
    emptyFunction:function () {
    },
    ajaxCompleteCallback:function (jqXHR, handler) {
        var status = jqXHR.status;
        if (status == 0)
            return;
        else if (status >= 200 && status < 300) {
            handler(jqXHR);
        }
        else {
            //TODO: show error message ajaxErrorMessage(status);
        }
    },
    updateAutocompleteRecords:function (args) {
        var entityTypes =  args["et"];
        var response = {};
        if(UaC.recordsLoaded){
            if(!UaC.recordsParsed){
                var proId = UaC.etArray.proId;
                for(var j=0;j<entityTypes.length;j++){
                    var key = entityTypes[j];
                    UaC.records[key] = [];
                    response= CwZ.parseJSON(UaC.etArray[key]||'{"List":"[]"}');
                    var Items = response.List.Item, len = Items ? Items.length : 0;
                    if (len > 0) {
                        for (var i = 0; i < len; i++) {
                            if (Items[i].id == proId)      //Dont show the user itself in the autocomplete list.
                                continue;
                            var item = {
                                key: Items[i].id,
                                title: Items[i].title,
                                value: Items[i].title,
                                userId: Items[i].uId,
                                streamId: Items[i].streamId,
                                roles: Items[i].roles,
                                flags: parseInt(Items[i].flags).toString(2),
                                type: key
                            };

                            if (item.value.length > 40) {
                                item.value = UaC.truncate(item.value, 40);
                            }
                            UaC.records[key].push(item);
                        }
                    }
                    if(j<entityTypes.length-1)
                        UaC.records[entityTypes[j+1]]=[];
                    if(i == len){
                        UaC.recordsParsed = true;
                    }
                }
            }
            args["onComplete"](UaC.filterRecords(args));
        }
    },
    truncate:function (str, length) {
        return str.substr(0, length) + ( (str.length > length) ? "..." : "" );
    },
    trim:function (str) {
        try {
            var newStr = "";
            if (str && str != null && str.length > 0)
                newStr = str;
            newStr = newStr.replace(/^[\xA0\s]+/, '').replace(/[\xA0\s]+CwZ/, '');
        } catch (ex) {}
        return newStr;
    },
    filterRecords:function (args) {
        var entityType = [];
        if(args["et"] instanceof Array){
            entityType = args["et"];
        } else{
            entityType.push(args["et"]);
        }
        var sourceItem = [], query = args["query"];
        for(var j=0,outerlen=entityType.length ; j<outerlen ; j++){
            var et = entityType[j], userRecord = UaC.records[et],
                len = userRecord.length,maxLength=(args["length"]==-1)?len:args["length"],
                isSharedPubGroup = (userRecord[0] && userRecord[0].type) == '161';
            if (query == "") {
                return userRecord;
            } else if (userRecord && userRecord.length > 0) {
                for (var i = 0; i < len; i++) {
                    if(isSharedPubGroup){
                        if(userRecord[i].flags.length != 6){
                            while((6 - userRecord[i].flags.length) > 0){
                                userRecord[i].flags = 0 + userRecord[i].flags;
                            }
                        }
                        //flags [   1      1        1       1      1     /-------  1  -------\  ]
                        //       drive, library, calender, task, secret, [public: 1, private: 0]
                        if((userRecord[i].roles == "12" || userRecord[i].roles == "28") && (userRecord[i].flags[1] != 0)){
                            var entityTitle = userRecord[i].title.toLocaleLowerCase();
                            if (entityTitle.indexOf(query) == -1)  //Search for query string in data.
                                continue;
                            if (sourceItem.length >= maxLength) //Max 10 items should be shown in list.
                                break;
                            sourceItem.push(userRecord[i]);
                        }
                    } else{
                        var entityTitle = userRecord[i].title.toLocaleLowerCase();
                        if (entityTitle.indexOf(query) == -1)  //Search for query string in data.
                            continue;
                        if (sourceItem.length >= maxLength) //Max 10 items should be shown in list.
                            break;
                        sourceItem.push(userRecord[i]);
                    }
                }
            }
        }
        return sourceItem;
    },
    getAutocompleteRecords:function (param) {
        var args = {"length":10, "query":'', "et":"101", "onComplete":function () {}};
        CwZ.extend(args, param);
        if(!(args["et"] instanceof Array)){
            args["et"] = [args["et"]];
        }
        UaC.updateAutocompleteRecords(args);
    }
};
var PbX = {
    noCache: 0,
    ajax:function (json) {
        if (true) {
            if (json.type == undefined) json.type = "get";
            if (json.success == undefined) json.success = UaC.emptyFunction;
            if (json.error == undefined) json.error = UaC.emptyFunction;
            if (json.params == undefined) json.params = "";

            var url = json.url;
            if (url.indexOf('://') < 0)
                url = CWPDFReaderConfig.cwURL + ((url.indexOf('app?') < 0) ? "/app?x=" : "/") + url;
            if (json.async == undefined) json.async = true;
            var param = json.params;
            var yParam = "y=" + CWPDFReaderConfig.uId;
            param = (param == null || param == undefined || param.length < 1) ? yParam : param + "&" + yParam;
            (typeof json.params != "undefined" && typeof json.params == "string" && json.type.toLowerCase() == "get") ? json.params += "&load=" + PaX.nocache : json.params.load = PaX.nocache;
            return CwZ.ajax({
                url:url,
                type:json.type,
                data:json.params,
                async:json.async,
                complete:function (jqXHR) {
                    UaC.ajaxCompleteCallback(jqXHR, json.success);
                },
                error:json.error
            });
        }
    },
    post:function (o, task, handler, failHandler) {
        var failHandler = failHandler || PbX.failHandler;
        var params = {'xTask':task};
        params = this.get('token', CWDataCenter.token, params);
        params = this.get('uId', CWPDFReaderConfig.uId, params);
        params = this.get('id',o.id, params);
        params = this.get('os', o.objectState, params);
        params = this.get('ty', o.type, params);
        params = this.get('ti', o.title, params);
        params = this.get('rf', o.refId, params);
        params = this.get('fg',o.flags, params);
        params = this.get('eu', o.eusers, params);
        params = this.get('euid', o.euId, params);
        params = this.get('eus', o.eusettings, params);
        params = this.get('mts', o.mts, params);
        params = this.get('sts',o.sts, params);
        params = this.get('ets', o.ets, params);
        params = this.get('st', o.settings, params);
        params = this.get('dt', o.details, params);
        params = this.get('rank', o.rank, params);
        params = this.get('pts', o.pts, params);
        params = this.get('cmts', o.cmts,params);
        if(handler==undefined)
            handler=function(){};
        PaX.post(CWPDFReaderConfig.cwURL + "/pbx", function (data, status, xhr) {
            handler(xhr);
        }, failHandler, params);
    },
    failHandler:function (res) {
        if (res.status != 200) {
            shareDialog.statusDlg({msg: "You're not signed in. Please try again later."});
        }
        CwZ('.lnk').removeClass("postDisable");
    },
    get:function (key, val, param) {
        if(val != null)
            param[key] = val;
        return param;
    }
};
var PaX = {
    nocache:0,
    post:function (url, success, failure, params) {
        if (!success) success = function () {
        };
        if (!failure) failure = function () {
        };
        if (!params) params = [];
        PaX.nocache++;
        return CwZ.ajax({
            type:"POST",
            dataType:'text',
            url:url,
            data:params,
            success:success,
            error:failure
        });
    },
    get:function (url, param, async, success, failure) {
        if (CWDataCenter.isLogin) {
            var yParam = "y=" + CWPDFReaderConfig.uId;
            param = (param == null || param == undefined || param.length < 1) ? yParam : param + "&" + yParam;
            if (success == null) success = UaC.emptyFunction;
            if (failure == null) failure = UaC.emptyFunction;
            if (url.indexOf('://') < 0)
                url = CWPDFReaderConfig.cwURL + ((url.indexOf('app?') < 0) ? "/app?x=" : "/") + url;
            if (async == null) async = true;
            (typeof param != "undefined" && typeof param == "string") ? param += "&load=" + PaX.nocache : param.load = PaX.nocache;
            return CwZ.ajax({
                url:url,
                type:"get",
                data:param,
                async:async,
                complete:function (jqXHR) {
                    UaC.ajaxCompleteCallback(jqXHR, success);
                },
                error:failure
            });
        }
    }
};
var WiZ = {
    disableWindowScroll:function (disable, el) {
        var elem = typeof el != "undefined" ? el : "body";
        if (disable) {
            CwZ(elem).on("mousewheel", function () {
                return false;
            });
        } else {
            CwZ(elem).off("mousewheel");
        }
    }
};