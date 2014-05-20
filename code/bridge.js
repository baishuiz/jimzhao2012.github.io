
var __CTRIP_JS_PARAM = "?jsparam="
var __CTRIP_URL_PLUGIN = "ctrip://h5/plugin" + __CTRIP_JS_PARAM;

/**
* @class Internal
* @description bridge.js内部使用的工具类
* @brief 内部使用工具类
* @private
*/ 
var Internal = {
    /**
     * @brief 是否是iOS设备
     * @description  bridge.js内部使用，判断是否是iOS
     * @type Bool
     * @property isIOS
     */
    isIOS:false,

    /**
     * @brief 是否是Android设备
     * @description  bridge.js内部使用，判断是否是Android设备
     * @type Bool
     * @property isAndroid
     */
    isAndroid:false,

     /**
     * @brief 是否是WinPhone设备
     * @description  bridge.js内部使用，判断是否是Windows Phone设备
     * @type Bool
     * @property isWinOS
     */
    isWinOS:false,

    /**
     * @brief 当前是否是App环境
     * @description  bridge.js内部使用，判断当前是否是App环境
     * @type Bool
     * @property isInApp
     */
    isInApp:false,
    
    /**
     * @brief 当前携程旅行App版本
     * @description bridge.js内部使用，存储当前携程旅行App版本
     * @type String
     * @property appVersion
     */     
    appVersion:"",

    /**
     * @brief 当前操作系统版本
     * @description bridge.js内部使用，存储当前操作系统版本
     * @type String
     * @property osVersion
     */ 
    osVersion:"",
    
    /**
     * @brief 判断版本大小
     * @description 判断当前版本号是否大于传入的版本号
     * @param {String} verStr 版本号
     * @method isAppVersionGreatThan
     * @return {Bool} 是否大于该版本号
     * @since v5.2
     * @example
     
     * var isLarger = isAppVersionGreatThan(5.2); <br />
     * alert(isLarger); // depends
     */
    isAppVersionGreatThan:function(verStr) {

        var ua = navigator.userAgent;
        if (ua.indexOf("Youth_CtripWireless") > 0) { //青春版不做校验
            return true;
        }

        if ((typeof verStr == "string") && (verStr.length > 0)) {
            var inVer = parseFloat(verStr);
            var nowVer = parseFloat(Internal.appVersion);
            if (isNaN(nowVer) || nowVer - inVer >= 0) {
                return true;
            }
        }

        return false;
    },

   /**
     * @brief app版本过低回调
     * @description 回调H5页面，告知API开始支持的版本号及当前App的版本
     * @param {String} supportVer API支持的版本号
     * @method appVersionNotSupportCallback
     * @since v5.2
     * @author jimzhao
     */
    appVersionNotSupportCallback:function(supportVer) {
        var jsonObj = {"tagname":"app_version_too_low","start_version":supportVer,"app_version":Internal.appVersion};
        CtripTool.app_log(JSON.stringify(jsonObj));
        window.app.callback(jsonObj);
    },

    /**
     * @brief 参数错误回调
     * @description 回调H5页面，所调用的JS 参数有错误
     * @param {String} description 错误原因描述
     * @method paramErrorCallback
     * @since v5.2
     * @author jimzhao
     */
    paramErrorCallback:function(description) {
        var jsonObj = {"tagname":"app_param_error","description":description};
        CtripTool.app_log(JSON.stringify(jsonObj));
        window.app.callback(jsonObj);
    },

   /**
     * @brief 判断字符串是否为空
     * @description 判断字符串是否为空
     * @method isNotEmptyString
     * @param {String} str 需要判断的字符串
     * @since v5.2
     */
    isNotEmptyString:function(str) {
        if ((typeof str == "string") && (str.length > 0)) {
            return true;
        }

        return false;
    },


   /**
     * @brief 内部URL跳转
     * @description 内部隐藏iframe，做URL跳转
     * @method loadURL
     * @param {String} url 需要跳转的链接
     * @since v5.2
     */
    loadURL:function(url) {
        var iframe = document.createElement("iframe");
        var cont = document.body || document.documentElement;

        iframe.style.display = "none";
        iframe.setAttribute('src', url);
        cont.appendChild(iframe);

        setTimeout(function(){
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        }, 200);
    },

   /**
     * @brief 内部组装URL参数
     * @description  内部使用，组装URL参数
     * @return 返回序列化之后的字符串
     * @method makeParamString
     * @param {String} service app响应的plugin的名字
     * @param {String} action 该plugin响应的函数
     * @param {JSON} param 扩展参数，json对象
     * @param {String} callbackTag app回调给H5页面的tagname
     * @since v5.2
     */
    makeParamString:function(service, action, param, callbackTag) {

        if (!Internal.isNotEmptyString(service) || !Internal.isNotEmptyString(action)) {
            return "";
        }

        if (!param) {
            param = {};
        };

        param.service = service;
        param.action = action;
        param.callback_tagname = callbackTag;

        return JSON.stringify(param);
    },

    /**
     * @brief 内部组装URL
     * @description  内部使用，组装URL
     * @return {String} encode之后的URL
     * @method makeURLWithParam
     * @param {String} paramString 拼接URL参数
     * @since v5.2
     */
    makeURLWithParam:function(paramString) {
        if (paramString == null) {
            paramString = "";
        }

        paramString = encodeURIComponent(paramString);

        return  __CTRIP_URL_PLUGIN + paramString;
    },

     /**
     * @brief JS调用Win8 native
     * @description  内部使用，用于js调用win8
     * @param {String} 传递给win8的参数
     * @method callWin8App
     * @since v5.3
     */
    callWin8App:function(paramString) {
        window.external.notify(paramString);
    },
};

/**
 * @brief app回调bridge.js
 * @description 将native的callback数据转换给H5页面的app.callback(JSON)
 * @method __bridge_callback
 * @param {String} param native传给H5的字符串,该字符串在app组装的时候做过URLEncode
 * @since v5.2
 * @author jimzhao
 */
function __bridge_callback(param) {
    param = decodeURIComponent(param);

    var jsonObj = JSON.parse(param);

    if (jsonObj != null) {
        if (jsonObj.param != null && jsonObj.param.hasOwnProperty("platform")) {
            platform = jsonObj.param.platform;
            if (typeof platform == "number") {
                if (platform == 1 || platform == 2 || platform == 3) {
                    Internal.isIOS = (platform == 1);
                    Internal.isAndroid = (platform == 2);
                    Internal.isWinOS = (platform == 3);                    
                }
            }

            Internal.isInApp = true;
            Internal.appVersion = jsonObj.param.version;
            Internal.osVersion = jsonObj.param.osVersion;
        }

        return window.app.callback(jsonObj);
    }

    return -1;
};

/**
 * @brief app写localstorage
 * @description 写key/value数据到H5页面的local storage
 * @method __writeLocalStorage
 * @param {String} key 需要写入数据库的key
 * @param {String} value 需要写入数据库的value
 * @since v5.2
 * @author jimzhao
 */
function __writeLocalStorage(key, jsonValue) {
    if (Internal.isNotEmptyString(key)) {
        localStorage.setItem(key, jsonValue);
    }
};

/**
 * @class CtripTool
 * @brief 工具类
 * @description 工具类,和App无交互，纯JS处理
 */
var CtripTool = {

    /**
     * @brief 判断当前是否是在App内
     * @description  判断当前H5页面是否是在App内
     * @since 5.2
     * @method app_is_in_ctrip_app
     * @author jimzhao
     * @return bool, true代表在app环境，false表示不在app环境
     * @example 

     * var ret = CtripTool.app_is_in_ctrip_app();
     * alert("isInApp=="+ret);
     */
    app_is_in_ctrip_app:function() {
        if (Internal.isInApp) {
            return true;
        }

        var isInCtripApp = false;

         var ua = navigator.userAgent;
         if (ua.indexOf("CtripWireless")>0) {
            Internal.isAndroid = true;
            isInCtripApp = true;
         }
         else if (( ua.indexOf("iPhone") > 0 || ua.indexOf("iPad") > 0 || ua.indexOf("iPhone")) && 
            ua.indexOf("Safari") < 0) {
            isInCtripApp = true;
            Internal.isIOS = true;
         }
        
        return isInCtripApp;
    },

    /**
     * @description 将log写入到native的日志界面，该函数已移动到CtripUtil类，此处只做兼容。具体参考CtripUtil.app_log()函数
     * @brief H5写日志到app(兼容，移动至CtripUtil)
     * @method app_log(Deprecated)
     * @param {String} log 需要打印打log
     * @param {String} result 上一句log执行的结果，可以为空,打印的时候会自动换行，加入时间
     * @since v5.2
     * @author jimzhao
     * @example 

     CtripUtil.app_log("execute script xxxxx", "result for script is oooooo");
     */
    app_log:function(log, result) {
        CtripUtil.app_log(log, result);
    }
};

/**
 * @class CtripUtil
 * @description 常用Util
 * @brief 常用Util
 */
var CtripUtil = {

    /**
     * @description Native收集用户行为,该日志会被上传
     * H5页面调用该函数，需要将增加的event_name告知native，native需要整理纪录
     * @brief 收集ActionLog
     * @method app_log_event
     * @param {String} event_name 需要纪录的事件名
     * @since v5.2
     * @author jimzhao
     * @example 

     Util.app_log_event('GoodDay')
     */
    app_log_event:function(event_name) {
        if (Internal.isNotEmptyString(event_name)) {
            var params = {};
            params.event = event_name;
            paramString =  Internal.makeParamString("Util", "logEvent", params, "log_event");

            if (Internal.isIOS) {
                url = Internal.makeURLWithParam(paramString);
                Internal.loadURL(url);
            }
            else if (Internal.isAndroid) {
                window.Util_a.logEvent(paramString);
            }
            else if (Internal.isWinOS) {
                Internal.callWin8App(paramString);
            }
        }
    },


    /**
     * @description 进入H5模块，初始化数据
     * H5接收到web_view_did_finished_load的回调之后，调用该函数，初始化数据会通过callback传递给H5
     * @brief 初始化H5模块数据
     * @method app_init_member_H5_info
     * @since version 5.2
     * @author jimzhao
     * @callback tagname="init_member_H5_info"
     * @example

     CtripUtil.app_init_member_H5_info();
     //调用完成，H5页面会收到如下返回数据
     var json_obj =
     {
        tagname:"init_member_H5_info",
        timestamp:135333222,
        version:"5.2",
        device:"iPhone4S",
        appId:"com.ctrip.wrieless",
        osVersion:"iOS_6.0",
        serverVersion:"5.3",
        platform:1, //区分平台，iPhone为1, Android为2
        userInfo={USERINFO},//USERINFO内部结构参考CtripUser.app_member_login();    
     }
     app.callback(json_obj);
     */
    app_init_member_H5_info:function() {
        paramString = Internal.makeParamString("User", "initMemberH5Info", null, "init_member_H5_info");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if(Internal.isAndroid) {
            window.User_a.initMemberH5Info(paramString);
        }
        else if (Internal.isWinOS) {
                Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 拨打电话
     * @brief 拨打电话
     * @param {String} phone 需要拨打的电话号码，为空时候，会拨打ctrip呼叫中心号码
     * @method app_call_phone
     * @since v5.2
     * @author jimzhao
     * @example 

     CtripUtil.app_call_phone("13800138000");
     //或者直接拨打呼叫中心
     CtripUtil.app_call_phone();
     */
    app_call_phone:function(phone) {  

        if(!phone) {
            phone = "";
        }
        
        var params = {};
        
        params.phone = phone;

        paramString = Internal.makeParamString("Util", "callPhone", params, "call_phone")
        if (Internal.isIOS) {
            var fixedFlag = false;

            if (Internal.isNotEmptyString(phone)) {
                if (!Internal.appVersion || (Internal.appVersion == "5.2")) {
                    fixedFlag = true;
                    url = "tel://"+phone;
                    window.location.href = url;
                }
            } 

            if (!fixedFlag) {
                url = Internal.makeURLWithParam(paramString);
                Internal.loadURL(url);
            }
        }
        else if (Internal.isAndroid){
            window.Util_a.callPhone(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 退回到首页，离开H5
     * @brief 回到首页
     * @since v5.2
     * @method app_back_to_home
     * @author jimzhao
     * @example 

     CtripUtil.app_back_to_home();
     */
    app_back_to_home:function() {
        paramString = Internal.makeParamString("Util", "backToHome", null, "back_to_home");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            CtripUtil.app_open_url("ctrip://wireless/", 1, "  ");
            // window.Util_a.backToHome(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 退回到H5页面的上一个页面，离开H5. v5.3开始支持带参数给上一个H5页面
     * @brief 离开H5回上一个页面
     * @method app_back_to_last_page
     * @param {String} callbackString 离开H5页面，需要传递给上一个H5页面的数据，上一个H5页面在web_view_did_appear回调里面将会收到该数据
     * @param {Bool} isDeleteH5Page 是否是直接删除该H5页面。直接删除H5页面时候，页面切换会没有动画效果
     * @since v5.2
     * @author jimzhao
     * @example 

     CtripUtil.app_back_to_last_page("This is a json string for my previous H5 page", false);
     */
    app_back_to_last_page:function(callbackString, isDeleteH5Page) {
        var params = {};
        if(!callbackString) {
            callbackString = "";
        }

        params.callbackString = callbackString;
        params.isDeleteH5Page = isDeleteH5Page;
        paramString = Internal.makeParamString("Util", "backToLast", params, "back_to_last_page");

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.backToLast(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 定位(兼容，已经移动到CtripMap)
     * @brief 定位(兼容，移动到CtripMap)
     * @param {Bool} is_async, true标识是异步定位，false标识为同步定位
     * @method app_locate(Deprecated)
     * @example

        CtripMap.app_locate(true);
        //定位完成后H5页面会收到回调数据
        var json_obj =
        {
            tagname:'locate',
            param:{
                "value":{
                    ctyName: '上海',
                    addrs:'上海市浦东南路22号',
                    lat:'121.487899',
                    lng:'31.249162'
                },
                'timeout': '2013/09/12 12:32:36',
                'locateStatus':0,//iOS新增字段:-1网络不通，当前无法定位,-2定位没有开启
            }
        }
        app.callback(json_obj);
     * 
     */
    app_locate:function(is_async) {
        CtripMap.app_locate(is_async);
    },

    /**
     * @description 刷新顶部条按钮和文字(兼容，已移动至CtripBar)
     * @brief 刷新顶部条按钮和文字(兼容，移动至CtripBar)
     * @param (String) nav_bar_config_json 顶部条配置json串
     * @method app_refresh_nav_bar(Deprecated)
     * @author jimzhao
     * @since v5.2
     * @example

        请参考 CtripBar.app_refresh_nav_bar(json_str)的使用;
     */
    app_refresh_nav_bar:function(nav_bar_config_json) {
        CtripBar.app_refresh_nav_bar(nav_bar_config_json);
    },


    /**
     * @description Hybrid页面，打开链接URL地址，兼容App和浏览器
     * @brief Hybrid页面打开链接URL
     * @param {String} openUrl 需要打开的URL，可以为ctrip://,http(s)://,file://等协议的URL
     * @param {int} targetMode 
     0.当前页面刷新url;
     1.处理ctrip://协议;
     2.开启新的H5页面,title生效;
     3.使用系统浏览器打开;
     4.开启本地新的H5页面，title生效，此时URL为相对路径；5.6版本加入
     * @param {String} title 当targetMode＝2时候，新打开的H5页面的title
     * @param {String} pageName 当targetMode＝0、2、4时候，本页面，或者新打开的H5页面，此时pageName有效，pageName当作H5页面唯一标识，可用于刷新页面；5.6版本加入
     * @method app_open_url
     * @since v5.2
     * @author jimzhao
     * @example 

     //当前H5页面打开ctrip.com
     CtripUtil.app_open_url("http://www.ctrip.com", 0);
     //进入App的酒店详情页
     CtripUtil.app_open_url("ctrip://wireless/hotel?id=1234", 1);
     //开启新的H5页面，进入m.ctrip.com
     CtripUtil.app_open_url("http://m.ctrip.com", 2, "Ctrip H5首页", "ctrip_home_page_id");
     //开启新的H5页面，进入webapp/car/index.html
     CtripUtil.app_open_url("car/index.html", 4, "用车首页", "car_index_page_id");

     */
     app_open_url:function(openUrl, targetMode, title, pageName) {
        var params = {};
        if(!openUrl) {
            openUrl = "";
        }
        if (!title) {
            title = "";
        }
        if (!pageName) {
            pageName = "";
        }

        params.openUrl = openUrl;
        params.title = title;
        params.targetMode = targetMode;
        params.pageName = pageName;
        paramString = Internal.makeParamString("Util", "openUrl", params, "open_url");
        
        if (Internal.appVersion) { //有AppVersion，为5.3及之后版本，或者5.2本地H5页面
            if (Internal.isIOS) {
                url = Internal.makeURLWithParam(paramString);
                Internal.loadURL(url);
            }
            else if (Internal.isAndroid) {
                window.Util_a.openUrl(paramString);
            }
            else if (Internal.isWinOS) {
                Internal.callWin8App(paramString);
            }
        } 
        else
        {
            var ua = navigator.userAgent;
            var isAndroid52Version = (ua.indexOf("Android")>0) && (ua.indexOf("CtripWireless")>0);
            if(isAndroid52Version) {
                try {
                    window.Util_a.openUrl(paramString);
                } 
                catch(e){
                    window.location.href = openUrl;
                }
            } 
            else {
                window.location.href = openUrl;
            }
        }
    },


    /**
     * @description 检查App的版本更新
     * @brief 检查App的版本更新
     * @since v5.2
     * @method app_check_update
     * @author jimzhao
     * @example 

     CtripUtil.app_check_update();
     *
     */
    app_check_update:function() {
        paramString = Internal.makeParamString("Util", "checkUpdate", null, "check_update");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.checkUpdate(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 推荐携程旅行给好友
     * @brief 推荐携程旅行给好友
     * @since v5.2
     * @method app_recommend_app_to_friends
     * @author jimzhao
     * @example CtripUtil.app_recommend_app_to_friends();
     *
     */
    app_recommend_app_to_friends:function() {
        paramString = Internal.makeParamString("Util", "recommendAppToFriends", null, "recommend_app_to_friends");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.recommendAppToFriends(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 添加微信好友
     * @brief 添加微信好友
     * @since v5.2
     * @method app_add_weixin_friend
     * @author jimzhao
     * @example 

     CtripUtil.app_add_weixin_friend();
     */
    app_add_weixin_friend:function() {
        paramString = Internal.makeParamString("Util", "addWeixinFriend", null, "add_weixin_friend");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.addWeixinFriend(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description H5跨模块/站点跳转
     * @brief H5跨模块/站点跳转
     * @param {String} path 模块名称，如hotel, car, myctrip,
     * @param {String} param 作为URL，拼接在path后面的页面和其它参数 index.html#cashcouponindex?cash=xxxx
     * @method app_cross_package_href
     * @since v5.2
     * @author jimzhao
     * @example
     *
      //跳转到我的携程首页
      CtripUtil.app_cross_package_href("myctrip", "index.html?ver=5.2"); 

     */
    app_cross_package_href:function(path, param) {
        var params = {};
        if (!path) {
            path = "";
        }
        if (!param) {
            param = "";
        }

        params.path = path;
        params.param = param;

        paramString = Internal.makeParamString("Util", "crossPackageJumpUrl", params, "cross_package_href");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.crossPackageJumpUrl(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 查看最新版本功能介绍
     * @brief 查看最新版本功能介绍
     * @since v5.2
     * @method app_show_newest_introduction
     * @author jimzhao
     * @example 

     CtripUtil.app_show_newest_introduction();
     */
    app_show_newest_introduction:function() {
        paramString = Internal.makeParamString("Util", "showNewestIntroduction", null, "show_newest_introduction");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.showNewestIntroduction(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 检查当前App网络状况
     * @brief 检查当前App网络状况
     * @since v5.2
     * @method app_check_network_status
     * @author jimzhao
     * @example 

     CtripUtil.app_check_network_status();
     //调用完成后，H5页面会收到如下回调数据
     var json_obj = 
     {
        tagname:"check_network_status",
        hasNetwork:true,//布尔值返回是否有网络
     }
     app.callback(json_obj);
     
     */
    app_check_network_status:function() {
        paramString = Internal.makeParamString("Util", "checkNetworkStatus", null, "check_network_status");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.checkNetworkStatus(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 检查是否安装App
     * @brief 检查是否安装App
     * @param {String} openUrl 尝试打开的URL，iOS使用
     * @param {String} packageName app的包名，android使用
     * @method app_check_app_install_status
     * @since v5.2
     * @author jimzhao
     * @example 

     CtripUtil.app_check_app_install_status("ctrip://wireless", "com.ctrip.view");
     //调用完成后，H5页面会收到如下回调数据
     var json_obj = 
     {
        tagname:"check_app_install_status",
        isInstalledApp:true,//布尔值返回是否有安装
     }
     app.callback(json_obj);
     */
    app_check_app_install_status:function(openUrl, packageName) {
        var params = {};
        if (!openUrl) {
            openUrl = "";
        }
        if (!packageName) {
            packageName = "";
        }
        params.openUrl = openUrl;
        params.packageName = packageName;

        paramString = Internal.makeParamString("Util", "checkAppInstallStatus", params, "check_app_install_status");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.checkAppInstallStatus(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description H5通知Native刷新
     * @brief H5通知Native刷新
     * @param {String} pageName 要刷新的页面名字,该字段需要H5和native共同约定，H5调用之后，native需要捕获该名字的boardcast/notification
     * @param {String} jsonStr 刷新该页面需要的参数
     * @method app_refresh_native_page
     * @since v5.2
     * @author jimzhao
     * @example 
        
        5.6新增说明：刷新app_open_url打开的H5页面
        CtripUtil.app_open_url();函数打开的H5页面，设置pagename:h5_page_identify
        CtripUtil.app_refresh_native_page("h5_page_identify", "xxxx_json_string");
        
        先前版本，刷新Native的页面
        //H5调用
        
        CtripUtil.app_refresh_native_page("xxxxPageName", "xxxx_json_string");

        //Native需要处理的地方
     
        //iOS:
        //1. 添加Notification的关注
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(refresh:) name:kH5NativeShouldReloadNotification object:nil];
        
        //2. 实现方法
        - (void)refresh:(NSNotification *)notification {
             NSDictionary *dic = [notification userInfo];
             NSString *value = [dic objectForKey:@"pageName"];
             if ([value isEqualToString:@"xxxxPageName"])
             {
                 NSLog("Do Something here");      
             }
        }
        
        //3. 移除Notification的关注
        [[NSNotificationCenter defaultCenter] removeObserver:self];

       // Android:
       // 1. 创建BroadcastReceiver;
        private BroadcastReceiver mFocusNewStateReceiver = new BroadcastReceiver() {
            //@Override
            public void onReceive(Context context, Intent intent) {

                if (H5UtilPlugin.TAG_UPDATE_NATIVE_PAGE.equals(intent.getAction())) {
                    String info = intent.getStringExtra("info");
                    if (!StringUtil.emptyOrNull(info)) {
                        try {
                            JSONObject jsonObject = new JSONObject(info);
                            String value = jsonObject.getString("pageName");
                            if (!StringUtil.emptyOrNull(value)) {
                                if (value.equalsIgnoreCase("xxxxPageName")) {
                                    //TODO: do your job here
                                }
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        } finally {

                        }
                    }
                }
            }
        };
    
        //2. 注册创建BroadcastReceiver;
            IntentFilter filter = new IntentFilter();
            filter.addAction(H5UtilPlugin.TAG_UPDATE_NATIVE_PAGE);
            LocalBroadcastManager.getInstance(getApplicationContext()).registerReceiver(mFocusNewStateReceiver, filter);
            registerReceiver(mFocusNewStateReceiver, filter);

        //3. 使用完成，移除BroadcastReceiver
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(mFocusNewStateReceiver);
            unregisterReceiver(mFocusNewStateReceiver);

     */
    app_refresh_native_page:function(pageName, jsonStr) {
        var params = {};
        if (!pageName) {
            pageName = "";
        }
        if (!jsonStr) {
            jsonStr = "";
        }

        params.pageName = pageName;
        params.jsonStr = jsonStr;

        paramString = Internal.makeParamString("Util", "refreshNativePage", params, "refresh_native_page");
        if(Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.refreshNativePage(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 复制文字到粘贴板
     * @brief 复制文字到粘贴板
     * @param {String} toCopyStr, 需要复制的文字
     * @method app_copy_string_to_clipboard
     * @since v5.3
     * @author jimzhao
     * @example CtripUtil.app_copy_string_to_clipboard("words_to_be_copy_xxxxxx");

     */
    app_copy_string_to_clipboard:function(toCopyStr) {
        var startVersion = "5.3";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }
        var params = {};
        if (!toCopyStr) {
            toCopyStr = "";
        }
        params.copyString = toCopyStr;

        paramString = Internal.makeParamString("Util", "copyToClipboard", params, "copy_string_to_clipboard");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.copyToClipboard(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 从粘贴板读取复制的文字
     * @brief 从粘贴板读取复制的文字
     * @callback tagname="read_copied_string_from_clipboard";//返回当前粘贴板中的文字key=copiedString
     * @method app_read_copied_string_from_clipboard
     * @since v5.3
     * @author jimzhao
     * @example 

        Ctrip.app_read_copied_string_from_clipboard();
        //调用该函数之后，H5会收到如下回调
        var json_obj = 
        {
            tagname:"read_copied_string_from_clipboard",
            copiedString:"words_copied_xxxxxx";
        }
        app.callback(json_obj);
     */
    app_read_copied_string_from_clipboard:function() {
        var startVersion = "5.3";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        paramString = Internal.makeParamString("Util", "readCopiedStringFromClipboard", null, "read_copied_string_from_clipboard");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.readCopiedStringFromClipboard(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 调用App的分享, 可以支持iOS6系统的分享
     * @brief 调用App的分享
     * @param {String} imageRelativePath 将要分享的图片相对路径，相对webapp的路径
     * @param {String} text 需要分享的文字
     * @param {String} title 需要分享的标题, v5.4开始支持该字段，微信和email支持；
     * @param {String} linkUrl 需要分享的链接, v5.4开始支持该字段
     * @param {boolean} isIOSSystemShare  是否是iOS6以上使用系统分享功能,对于先前门票分享功能，需要为true，其它都是false
     * @method app_call_system_share
     * @since v5.3
     * @author jimzhao
     * @example

     *  微信(微信朋友/微信朋友圈)分享说明：
        1. 图片分享，只能分享图片，所传的文字，title都无效；
        2. 链接分享，所传的图片为分享网页的缩略图，title有效；
        3. 纯文本分享，只能分享text，title无效；
        4. 优先级 链接分享>图片分享>纯文本分享。
           a. 如果有linkUrl，会被当作网页分享，图片作为缩略图；
           b. 如果没有linkUrl，有图片，当作图片分享，text,title无效;
           c. 如果没有linkUrl，没有图片，当作纯文本分享；
        
        微博分享：
        1. 图片为所分享的图片；
        2. 分享title不起作用；
        3. 如果linkUrl有， 分享的text后面会自动添加linkUrl
    
        Email分享：
        1. 图片为所分享的图片；
        2. 分享title作为Email标题；
        3. 如果有linkUrl，分享的text后面会自动添加linkUrl;

        短信分享：
        1. 图片为所分享的图片；注：iOS7.0之后才支持；
        2. 分享title不起作用；
        3. 如果有linkUrl，分享的text后面会自动添加linkUrl;

        复制分享：
        1. 分享的图片不起作用;
        2. 分享的title不起作用;
        3. 如果有linkUrl，分享的text后面会自动添加linkUrl;

      CtripUtil.app_call_system_share("../wb_cache/pkg_name/md5_url_hash", "text to share weibo", "this is titile", "http://www.ctrip.com/", false);

     */
    app_call_system_share:function(imageRelativePath, text, title, linkUrl, isIOSSystemShare) {
        var startVersion = "5.3";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }
        var params = {};
        if(!imageRelativePath) {
            imageRelativePath = "";
        }

        if (!title) {
            title = "";
        }
        
        if (!text) {
            text = "";
        }

        if (!linkUrl) {
            linkUrl = "";
        }

        params.title = title;
        params.text = text;
        params.linkUrl = linkUrl;
        params.imageRelativePath = imageRelativePath;
        params.isIOSSystemShare = isIOSSystemShare;

        paramString = Internal.makeParamString("Util", "callSystemShare", params, "call_system_share");

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.callSystemShare(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 根据URL下载数据
     * @brief 根据URL下载数据
     * @param {String} download_url 需要下载内容的URL
     * @param {String} suffix 保存的文件后缀
     * @param {Boolean} isIgnoreHttpsCertification 是否忽略非法的HTTPS证书
     * @method app_download_data
     * @since v5.3
     * @author jimzhao
     * @example

     CtripUtil.app_download_data("http://www.baidu.com/img/bdlogo.gif", "gif");
     //调用该函数后，native会返回H5内容
     var json_obj = {
        tagname:"download_data",
        error_code:"xxxxx",//param_error,download_faild
        param:{downloadUrl:"http://www.baidu.com/bdlogo.gif", savedPath:"../wb_cache/pkg_name/md5_url_hash", false}
     };
     app.callback(json_obj);
     */
    app_download_data:function(download_url, suffix, isIgnoreHttpsCertification) {
        var startVersion = "5.3";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        var params = {};
        if (!download_url) {
            download_url = "";
        }
        if (!suffix) {
            suffix = "";
        }
        params.downloadUrl = download_url;
        params.suffix = suffix;
        params.pageUrl = window.location.href;
        params.isIgnoreHttpsCertification = isIgnoreHttpsCertification;

        var paramString = Internal.makeParamString("Util", "downloadData",params,"download_data");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.downloadData(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 打开其它App，android可以根据包名和URL跳转，iOS只支持URL跳转
     * @brief 打开其它App
     * @param {String} packageId 需要打开的app的包名，android使用
     * @param {String} jsonParam 打开指定包名的app，所带的参数，json字符串
     * @param {String} url 需要打开的app支持的URL协议，如ctrip://xxx
     * @method app_open_other_app
     * @since v5.3
     * @author jimzhao
     * @example

     CtripUtil.app_open_other_app("com.tencent.mm", null, "weixin://xxxxx");
     //优先级说明：
     //1. android有packageId的时候，使用packageId＋jsonParam做跳转;
     //2. 无包名时候，android使用URL协议跳转;
     //3. iOS， winPhone OS都使用URL协议跳转;
     */
    app_open_other_app:function(packageId, jsonParam, url) {
       var startVersion = "5.3";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        var params = {};
        if (!packageId) {
            packageId = "";
        }
        if (!jsonParam) {
            jsonParam = "";
        }
        if (!url) {
            url = "";
        }
        params.packageId = packageId;
        params.jsonParam = jsonParam;
        params.url = url;
        var paramString = Internal.makeParamString("Util", "openOtherApp", params, "open_other_app");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Util_a.openOtherApp(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 将log写入到native的日志界面
     * @brief H5写日志到app
     * @method app_log
     * @param {String} log 需要打印打log
     * @param {String} result 上一句log执行的结果，可以为空,打印的时候会自动换行，加入时间
     * @since v5.2
     * @author jimzhao
     * @example

      CtripUtil.app_log("execute script xxxxx", "result for script is oooooo");
     */
    app_log:function(log, result) {
        if (!Internal.isNotEmptyString(log)) {
            return;
        }
        if (!Internal.isNotEmptyString(result)) {
            result = "";
        }
        var params = {};
        params.log = log;
        params.result = result;
        paramString = Internal.makeParamString("Util", "h5Log", params, "log");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid)
        {
            window.Util_a.h5Log(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

   /**
     * @description 打开Hybrid广告页面，会自动显示底部栏，且右上角有分享安妮
     * @brief 打开Hybrid广告页面
     * @method app_open_adv_page
     * @param {String} advUrl 广告URL， URL参数带title=xxx,设置xxx为标题
     * @since v5.4
     * @author jimzhao
     * @example

      CtripUtil.app_open_adv_page("http://pages.ctrip.com/adv.html?title=标题xxx");
     */
    app_open_adv_page:function(advUrl) {
        var startVersion = "5.4";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }   

        var params = {};
        params.advUrl = advUrl;
        paramString = Internal.makeParamString("Util", "openAdvPage", params, "open_adv_page");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) 
        {
            window.Util_a.openAdvPage(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};

/**
 * @class CtripUser
 * @description 用户相关类
 * @brief 用户相关类
 */
var CtripUser = {

    /**
     * @description 会员登录,native未登录时候，会显示会员登录界面，native会员已登录，直接完成，返回登录的用户信息
     * @brief 会员登录
     * @since 5.2
     * @method app_member_login
     * @author jimzhao
     * @example 

     CtripUser.app_member_login();
     //调用完成后，H5会收到如下数据
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
    }

    var json_obj =
    {
        tagname:"member_login",
        param:userInfo,
    }
    app.callback(json_obj);
     
     */
    app_member_login:function() {
        paramString =  Internal.makeParamString("User", "memberLogin", null, 'member_login');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.memberLogin(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
      * @description 非会员登录
      * @brief 非会员登录
      * @since 5.2
      * @method app_non_member_login
      * @author jimzhao
      * @see app_member_login
      * @example 

      CtripUser.app_non_member_login();
      //调用后，H5会收到native回调的数据
      //回调的数据格式参考app_member_login()
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
        }

        var json_obj =
        {
            tagname:"member_login",
            param:userInfo,
        }
        app.callback(json_obj);
      
      */
    app_non_member_login:function() {
        paramString =  Internal.makeParamString("User", "nonMemberLogin", null, 'non_member_login');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.nonMemberLogin(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

 
     /**
      * @description 会员自动登录,对于已经在native登陆的用户，app会通过调用callback回传登录数据，H5页面需要处理用户信息， 不显示输入用户名密码界面
      * @brief 会员自动登录
      * @since 5.2
      * @method app_member_auto_login
      * @author jimzhao
      * @see app_member_login
      * @example 

      CtripUser.app_member_auto_login();
      //调用后，H5会收到native回调的数据
      //回调的数据格式参考app_member_login()
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
        }

        var json_obj =
        {
            tagname:"member_login",
            param:userInfo,
        }
        app.callback(json_obj);
      
      */
    app_member_auto_login:function() {
        paramString =  Internal.makeParamString("User", "memberAutoLogin", null, 'member_auto_login');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.memberAutoLogin(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


     /**
      * @description 用户注册
      * @brief 用户注册
      * @since 5.2
      * @method app_member_register
      * @author jimzhao
      * @see app_member_login
      * @example 

      CtripUser.app_member_register();
      //调用后，H5会收到native回调的数据
      //回调的数据格式参考app_member_login()
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
        }

        var json_obj =
        {
            tagname:"member_login",
            param:userInfo,
        }
        app.callback(json_obj);
          
      */
    app_member_register:function() {
        paramString = Internal.makeParamString("User", "memberRegister", null, 'member_register');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.memberRegister(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

};


/**
 * @class CtripEncrypt
 * @description 加解密/HASH/编码相关类
 * @brief 提供给H5试用，通用加解密/HASH/编码相关类
 */

 var CtripEncrypt = {
    /**
      * @description  base64 UTF8编码
      * @brief base64 UTF8编码
      * @since 5.4
      * @method app_base64_encode
      * @param {String} toIncodeString 需要做base64 encode的字符串
      * @author jimzhao
      * @example 

      CtripEncrypt.app_base64_encode("xxxxxx");
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"base64_encode",
            param:
            {
                inString:"xxxxxx",
                encodedString:"eHh4eHh4",
            },
        }
        app.callback(json_obj);
          
      */
    app_base64_encode:function(toIncodeString) {
        var startVersion = "5.3";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!toIncodeString) {
            toIncodeString = "";
        }

        params = {};
        params.toIncodeString = toIncodeString;

        paramString = Internal.makeParamString("Encrypt", "base64Encode", params, 'base64_encode');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Encrypt_a.base64Encode(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
      * @description MD5 哈希算法，长度32，大写
      * @brief MD5 哈希算法
      * @since 5.4
      * @method app_md5_hash
      * @param {String} inString 需要做MD5 哈希的字符串
      * @author jimzhao
      * @example 

      CtripEncrypt.app_md5_hash("abcdxxxx");
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"md5_hash",
            param:
            {   
                inString:"abcdxxxx"
                outString:"FDA820BA864415E2451BE1C67F1F304A",
            },
        }
        app.callback(json_obj);
          
      */
    app_md5_hash:function(inString) {
        var startVersion = "5.5";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!inString) {
            inString = "";
        }

        params = {};
        params.inString = inString;

        paramString = Internal.makeParamString("Encrypt", "md5Hash", params, 'md5_hash');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Encrypt_a.md5Hash(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
      * @description Ctrip私有加解密算法
      * @brief Ctrip私有加解密算法
      * @since 5.5
      * @method app_ctrip_encrypt
      * @param {String} inString 需要做加解密的字符串
      * @param {String} encType 加解密类型，加密为1， 解密为2，其它不处理
      * @author jimzhao
      * @example 

      CtripEncrypt.app_ctrip_encrypt("abcdxxxx",1);
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"ctrip_encrypt",
            param:
            {
                inString:"abcdxxxx",
                outString:"ABScdXkYZunwXVF5kQpffnY+oL/MFmJGkn8ra8Ab5cI=",
                encType:1
            },
        }
        app.callback(json_obj);
          
      */
    app_ctrip_encrypt:function(inString, encType) {
        var startVersion = "5.5";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!inString) {
            inString = "";
        }

        params = {};
        params.inString = inString;
        params.encType = encType;
        paramString = Internal.makeParamString("Encrypt", "ctripEncrypt", params, 'ctrip_encrypt');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Encrypt_a.ctripEncrypt(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

 };


/**
 * @class CtripPay
 * @description Ctrip相关支付控件
 * @brief 提供Ctrip业务相关的支付功能
 */
 var CtripPay = {

     /**
      * @description  检查支付相关App安装情况
      * @brief  检查支付相关App安装情况
      * @since 5.4
      * @method app_check_pay_app_install_status
      * @author jimzhao
      * @example 

      CtripPay.app_check_pay_app_install_status();
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"check_pay_app_install_status",
            param:
            {
                platform:"iOS", //Android
                weixinPay:true,
                aliWalet:true,
                aliQuickPay:true,
            },
        }

        app.callback(json_obj);
      */
    app_check_pay_app_install_status:function() {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        var paramString = Internal.makeParamString("Pay","checkPayAppInstallStatus",null,'check_pay_app_install_status');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pay_a.checkPayAppInstallStatus(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
      * @description  根据URL打开支付App
      * @brief  根据URL打开支付App
      * @param {String} payAppName 支付App的URL，暂固定为以下4个， aliWalet/aliQuickPay/wapAliPay/weixinPay(微信支付暂未支持)
      * @param {String} payMeta 服务器返回的支付配置信息，ali相关为URL，微信支付为xml
      * @param {String} successRelativeURL 支付成功跳转的URL
      * @param {String} detailRelativeURL  支付失败或者支付
      * @since 5.4
      * @method app_open_pay_app_by_url
      * @author jimzhao
      * @example 

      CtripPay.app_open_pay_app_by_url("aliWalet","alipay://orderId=123","car/paySuccess.html", "car/payDetail.html");
      //调用后，App会做相应的页面跳转

      */
    app_open_pay_app_by_url:function(payAppName, payMeta, successRelativeURL, detailRelativeURL) {

        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }
        if (!payMeta) {
            payMeta = "";
        }
        
        if (!payAppName) {
            payAppName = "";
        }

        if (!successRelativeURL) {
            successRelativeURL = "";
        }

        if (!detailRelativeURL) {
            detailRelativeURL = "";
        }

        var params = {};
        params.payMeta = payMeta;
        params.payAppName = payAppName;
        params.successRelativeURL = successRelativeURL;
        params.detailRelativeURL = detailRelativeURL;

        var paramString = Internal.makeParamString("Pay","openPayAppByURL",params,'open_pay_app_by_url');

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pay_a.openPayAppByURL(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
 };

/**
 * @class CtripPipe
 * @description App给H5提供的通讯管道
 * @brief 提供标准HTTP和H5管道服务
 */
var CtripPipe = {

    /**
     * @description H5通过App发送服务
     * @brief H5通过App发送服务
     * @method app_send_HTTP_pipe_request
     * @param {String} baseURL HTTP请求发送的URL地址     
     * @param {String} path HTTP请求发送的URL的路径
     * @param {String} method HTTP请求方式GET/POST
     * @param {String} header HTTP头，JSON字符串格式key/value，cookie作为一个key存储再HEADER内部
     * @param {Array}  parameters key=value形式的字符串数组,请做好参数的Encode，app端只负责拼接
     * @param {Boolean}  isIgnoreHTTPSCertification 是否忽略HTTPS证书
     * @param {String} sequenceId 发送服务的序列号，随机生存即可
     * @since v5.4
     * @author jimzhao
     * @example 

     //GET http://www.baidu.com/s?wd=good+day&rsv_bp=0&ch=&tn=baidu&bar=&rsv_spt=3&ie=utf-8&rsv_sug3=4&rsv_sug4=469&rsv_sug1=2&rsv_sug2=0&inputT=166
    
      var paramArr = new Array();
      paramArr[0]="wd=good+day";
      paramArr[1]="rsv_bp=0";
      paramArr[2]="ch=";
      paramArr[3]="tn=";
      paramArr[4]="baidu=";
      paramArr[5]="bar=";
      paramArr[6]="rsv_spt=3";
      paramArr[7]="ie=utf-8";
      paramArr[8]="rsv_sug3=4";
      paramArr[9]="rsv_sug4=469";
      //。。。。其它参数依次类推，请做好参数的Encode，app端只负责拼接

      CtripPipe.app_send_HTTP_pipe_request("http://www.baidu.com", "/s","GET",null,paramArr, false, "13222222");

     //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"send_http_pipe_request",
            param:
            {
                responseString:"eHh4eHh4",
                responseCookie : {
                     "BAIDUID":"2959D035E2F5D7C979687934D558DCD3:FG=1",
                     "BDSVRTM":10,
                     "BD_CK_SAM":1,
                     "H_PS_PSSID":"1429_5225_5287_5722_5848_4261_5830_4759_5659_5857"
                },

                sequenceId:"13222222"
            },
        }
        app.callback(json_obj);

     */
    app_send_HTTP_pipe_request:function(baseURL, path, method, header, parameters, isIgnoreHTTPSCertification, sequenceId) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!baseURL) {
            baseURL = "";
        }
        if (!path) {
            path = "";
        }
        if (!method) {
            method = "";
        }
        if (!header) {
            header = "";
        }
        if (!parameters) {
            parameters = "";
        }

        if (!sequenceId) {
            sequenceId = "";
        }
        var params = {};
        params.baseURL = baseURL;
        params.path = path;
        params.method = method;
        params.header = header;
        params.parameters = parameters;
        params.sequenceId = sequenceId;
        params.isIgnoreHTTPSCertification = isIgnoreHTTPSCertification;

        paramString = Internal.makeParamString("Pipe", "sendHTTPPipeRequest", params, 'send_http_pipe_request');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pipe_a.sendHTTPPipeRequest(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }

    },

     /**
     * @description 根据发送的sequenceId，终止正在发送的HTTP请求
     * @brief 终止正在发送的HTTP请求
     * @method app_abort_HTTP_pipe_request
     * @param {String} sequenceId 发送服务的序列号，随机生存即可
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripPipe.app_abort_HTTP_pipe_request("13523333333");

     */
    app_abort_HTTP_pipe_request:function(sequenceId) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }
        if (!sequenceId) {
            sequenceId = "";
        }

        var params = {};
        params.sequenceId = sequenceId;
        paramString = Internal.makeParamString("Pipe", "abortHTTPRequest", params, 'abort_http_pipe_request');
        
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Pipe_a.abortHTTPRequest(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description H5通过App发送服务
     * @brief H5通过App发送服务
     * @method app_send_H5_pipe_request
     * @param {String} serviceCode 需要发送服务的服务号
     * @param {String} header 服务的header
     * @param {String} data 服务所需要的数据部分，各个服务都不同
     * @param {String} sequenceId 发送服务的序列号，随机生存即可
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripUtil.app_send_H5_pipe_request("9500001", "H5Agent","{}","13523333333");
     //调用后，H5会收到native回调的数据

        //成功 
        var json_obj =
        {
            tagname:"send_h5_pipe_request",
            param:
            {
                sequenceId:"13523333333",
                resultMessage:"eHh4eHh4",
                resultHead:"eHh4eHh4",
                resultBody:"eHh4eHh4",
                result:1,
            },
        }

        //失败
        var json_obj =
        {
            tagname:"send_h5_pipe_request",
            param:
            {
                sequenceId:"13523333333",
                errorInformation:"eHh4eHh4",
                serverErrorCode:"eHh4eHh4",
            },
        }
        app.callback(json_obj);

     */
    app_send_H5_pipe_request:function(serviceCode,header,data, sequenceId) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!serviceCode) {
            serviceCode = "";
        }
        if (!header) {
            header = "";
        }
        if (!data) {
            data = "";
        }
        if (!sequenceId) {
            sequenceId = "";
        }

        var params = {};
        params.serviceCode = serviceCode;
        params.header = header;
        params.data = data;
        params.sequenceId = sequenceId;

        paramString = Internal.makeParamString("Pipe", "sendH5PipeRequest", params, 'send_h5_pipe_request');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pipe_a.sendH5PipeRequest(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};



/**
 * @class CtripSumSungWallet
 * @description 三星钱包相关API
 * @brief 三星钱包相关API
 */
var CtripSumSungWallet = {

     /**
     * @description 检查ticket是否在三星钱包app中
     * @brief 检查ticket是否在三星钱包app中
     * @method app_check_ticket_in_samsung_wallet
     * @param {String} ticketID ticket的ID，服务器返回
     * @since v5.3.2
     * @author jimzhao
     * @example 
     * 
     * CtripSumSungWallet.app_check_ticket_in_samsung_wallet("ID123333");

       //调用之后会收到
        var json_obj = {
            tagname : "check_ticket_in_samsung_wallet",
            param : {
                insInSamSungWallet: false, //true
            }
        }
        
        app.callback(json_obj);
     */
    app_check_ticket_in_samsung_wallet:function(ticketID) {
        if (!ticketID) {
            ticketID = "";
        }

        var param = {};
        param.ticketID = ticketID;

        paramString = Internal.makeParamString("SamSungWallet", "checkTicketInSamSungWallet", param, 'check_ticket_in_samsung_wallet');
        if (Internal.isAndroid) {
            window.SamSungWallet_a.checkTicketInSamSungWallet(paramString);
        }
    },

     /**
     * @description 到三星钱包中下载ticket
     * @brief 到三星钱包中下载ticket
     * @method app_download_ticket_in_samsung_wallet
     * @param {String} ticketID ticket的ID，服务器返回
     * @since v5.32
     * @author jimzhao
     * @example 
     * 
     * CtripSumSungWallet.app_download_ticket_in_samsung_wallet("ID123333");
    
        //调用之后会收到
        var json_obj = {
            tagname : "download_ticket_in_samsung_wallet",
            param : {
                isDownloadSuccess: false, //true，下载成功的时候没有errorInfo
                errorInfo: "网络故障", 
            }
        }

        app.callback(json_obj);
     */
    app_download_ticket_in_samsung_wallet:function(ticketID) {
        if (!ticketID) {
            ticketID = "";
        }

        var param = {};
        param.ticketID = ticketID;

        paramString = Internal.makeParamString("SamSungWallet", "downloadTicketInSamSungWallet", param, 'download_ticket_in_samsung_wallet');
        if (Internal.isAndroid) {
            window.SamSungWallet_a.downloadTicketInSamSungWallet(paramString);
        }
    },

     /**
     * @description 在三星钱包app中查看Ticket
     * @brief 在三星钱包app中查看Ticket
     * @method app_show_ticket_in_samsung_wallet
     * @param {String} ticketID ticket的ID，服务器返回
     * @since v5.32
     * @author jimzhao
     * @example 
     
      CtripSumSungWallet.app_show_ticket_in_samsung_wallet("ID123333");

     //调用之后会收到
        var json_obj = {
            tagname : "show_ticket_in_samsung_wallet",
            param : {
                errorInfo: "Ticket ID不存在", //true
            }
        }
        
        app.callback(json_obj);
     */
    app_show_ticket_in_samsung_wallet:function(ticketID) {
        if (!ticketID) {
            ticketID = "";
        }

        var param = {};
        param.ticketID = ticketID;

        paramString = Internal.makeParamString("SamSungWallet", "showTicketInSamSungWallet", param, 'show_ticket_in_samsung_wallet');
        if (Internal.isAndroid) {
            window.SamSungWallet_a.showTicketInSamSungWallet(paramString);
        }
    }

};

/**
 * @class CtripFile
 * @description 文件IO操作相关API
 * @brief 文件IO操作相关API
 */

var CtripFile  = {
    /**
     * @description 获取当前web页面的sandbox目录，在webapp/wb_cache/xxxx/目录下xxxx即为当前sandbox的名字
     * @brief 获取当前web页面的sandbox目录
     * @method app_get_current_sandbox_name
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_get_current_sandbox_name();

     //调用之后会收到
        var json_obj = {
            tagname : "get_current_sandbox_name",
            param : {
                sandboxName: "car", 
            }
        }
        
        app.callback(json_obj);
     */
    app_get_current_sandbox_name:function() {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        var params = {};
        params.pageUrl = window.location.href;

        paramString = Internal.makeParamString("File", "getCurrentSandboxName", params, 'get_current_sandbox_name');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.File_a.getCurrentSandboxName(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
     /**
     * @description 文本写入文件中，UTF8编码。可以指定文件名，或者相对路径
     * @brief 写文本到本地文件
     * @method app_write_text_to_file
     * @param {String} text 需要写入文件的文本内容
     * @param {String} fileName 写入的文件路径
     * @param {String} relativeFilePath 写入的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @param {BOOL} isAppend 是否是将当前文件append到已有文件
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_write_text_to_file("Hello,世界", "log.txt", null, false); //文件存储在本地的/webapp/wb_cache/car/log.txt
      CtripFile.app_write_text_to_file("Hello2,世界", null, /car/mydir/log.txt, false); //文件存储在本地的/webapp/wb_cache/car/mydir/log.txt

     //调用之后会收到
        var json_obj = {
            tagname : "write_text_to_file",
            param : {
                isSuccess: true, 
            }
        }
        
        app.callback(json_obj);
     */
    app_write_text_to_file:function(text, fileName, relativeFilePath, isAppend) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }
        if (!text) {
            text = "";
        }
        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }
        var params = {};
        params.pageUrl = window.location.href;
        params.text = text;
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.isAppend = isAppend;
        paramString = Internal.makeParamString("File", "writeTextToFile", params, 'write_text_to_file');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.writeTextToFile(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 删除文件/目录。可以指定文件名，或者相对路径
     * @brief 删除文件/目录
     * @method app_delete_file
     * @param {String} fileName 需要删除的文件路径
     * @param {String} relativeFilePath 需要删除的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_delete_file("log.txt", null); //删除文件/webapp/wb_cache/car/log.txt
      CtripFile.app_delete_file(null,"/car/mydir/log.txt"; //删除文件/webapp/wb_cache/car/mydir/log.txt

     //调用之后会收到
        var json_obj = {
            tagname : "delete_file",
            param : {
                isSuccess: true, 
            }
        }
        
        app.callback(json_obj);
     */    
    app_delete_file:function(fileName, relativeFilePath) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.pageUrl = window.location.href;
        paramString = Internal.makeParamString("File", "deleteFile", params, 'delete_file');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.File_a.deleteFile(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
    /**
     * @description 读取文本文件内容，UTF-8编码。可以指定文件名，或者相对路径
     * @brief 读取文本文件内容
     * @method app_read_text_from_file
     * @param {String} fileName 需要读取内容的文件路径
     * @param {String} relativeFilePath 需要读取内容的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_read_text_from_file("log.txt", null); //从文件/webapp/wb_cache/car/log.txt读取内容
      CtripFile.app_read_text_from_file(null,"/car/mydir/log.txt"; //从文件/webapp/wb_cache/car/mydir/log.txt读取内容

     //调用之后会收到
        var json_obj = {
            tagname : "read_text_from_file",
            param : {
                text: "Hello,世界", 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_read_text_from_file:function(fileName, relativeFilePath) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.pageUrl = window.location.href;
        params.relativeFilePath = relativeFilePath;
        paramString = Internal.makeParamString("File", "readTextFromFile", params, 'read_text_from_file');

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.readTextFromFile(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
    /**
     * @description 读取文件大小。可以指定文件名，或者相对路径
     * @brief 读取文件大小
     * @method app_get_file_size
     * @param {String} fileName 需要读取文件大小的文件路径
     * @param {String} relativeFilePath 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_get_file_size("log.txt", null); //从文件/webapp/wb_cache/car/log.txt读取内容
      CtripFile.app_get_file_size(null,"/car/mydir/log.txt"; //从文件/webapp/wb_cache/car/mydir/log.txt读取内容

     //调用之后会收到
        var json_obj = {
            tagname : "get_file_size",
            param : {
                fileSize: 8 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_get_file_size:function(fileName, relativeFilePath) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.pageUrl = window.location.href;
        paramString = Internal.makeParamString("File", "getFileSize", params, 'get_file_size');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.getFileSize(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
      /**
     * @description 检查文件是否存在。可以指定文件名，或者相对路径
     * @brief 检查文件是否存在
     * @method app_check_file_exist
     * @param {String} fileName 需要读取文件大小的文件路径
     * @param {String} relativeFilePath 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_check_file_exist("log.txt", null); //从文件/webapp/wb_cache/car/log.txt读取内容
      CtripFile.app_check_file_exist(null,"/car/mydir/log.txt"; //从文件/webapp/wb_cache/car/mydir/log.txt读取内容

     //调用之后会收到
        var json_obj = {
            tagname : "check_file_exist",
            param : {
                isExist: true 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_check_file_exist:function(fileName, relativeFilePath) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.pageUrl = window.location.href;
        paramString = Internal.makeParamString("File", "checkFileExist", params, 'check_file_exist');
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.checkFileExist(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
    /**
     * @description 创建文件夹。可以指定文件名，或者相对路径
     * @brief 创建文件夹
     * @method app_make_dir
     * @param {String} dirName 需要创建的文件夹路径
     * @param {String} relativeDirPath 需要创建的文件夹相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_make_dir("mydir2", null); //创建文件夹/webapp/wb_cache/car/mydir2/
      CtripFile.app_make_dir(null,"/car/mydir/innerDir"; //创建文件夹/webapp/wb_cache/car/mydir/innerDir/

     //调用之后会收到
        var json_obj = {
            tagname : "make_dir",
            param : {
                isSuccess: true 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_make_dir:function(dirName,relativeDirPath) {
        var startVersion = "5.4";
        if(!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!dirName) {
            dirName = "";
        }
        if (!relativeDirPath) {
            relativeDirPath = "";
        }

        var params = {};
        params.dirName = dirName;
        params.pageUrl = window.location.href;
        params.relativeDirPath = relativeDirPath;

        paramString = Internal.makeParamString("File", "makeDir", params, 'make_dir');

         if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.makeDir(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
    
};

/**
 * @class CtripBar
 * @description H5页面顶部导航栏和底部工具栏的控制
 * @brief H5页面顶部/底部导航栏控制
 */

var CtripBar = {
     /**
     * @description 刷新顶部条按钮和文字
     * @brief 刷新顶部条按钮和文字
     * @param {String} nav_bar_config_json 顶部条配置json串
     * @method app_refresh_nav_bar
     * @author jimzhao
     * @since v5.2
     * @example

        //导航栏总共分为3部分，1.左侧，返回按钮，不能修改; 2. 中间title，可以任意设置; 3.右侧按钮，定义格式为{tagname:"xxxx",value:"btn_title"}
        var nav_json = {
            "center": [{"tagname": "title", "value":"携程"},{"tagname":"subtitle", value:"上海到北京"}],
            "centerButtons": [{"tagname": "cityChoose", "value":"上海", "a_icon":"icon_arrowx", "i_icon":"icon_arrowx.png"}], //from 5.5version
            "right": [{"tagname": "click_tag_name", "value":"Click"}]
        }
        //nav_json参数配置说明：
        //1. 支持的key有3个： center/right 从app 5.1之后版本支持， centerButton 从app 5.4版本之后支持
        //2. center配置辅助标题： 5.4 之后app支持, 举例："center": [{"tagname": "title", "value":"携程"},{"tagname":"subtitle", value:"上海到北京"}], 辅助标题为数组第二项，且tagname必须为subtitle；
        //3. centerButton按钮支持：5.4之后app支持，举例："centerButtons": [{"tagname": "cityChoose", "value":"上海", "a_icon":"icon_arrowx", "i_icon":"icon_arrowx.png"}], a_icon为android中按钮右侧图片名字，android文件名不需要带后缀，i_icon为iOS中按钮右侧图片名字。注意centerButton和center所占用的是同样的界面元素，app默认优先级centerButton>center,因此为了兼容先前版本centerButton和center可以同时设置
        //4. right配置：tagname=call时候显示app中的默认拨号icon，tagname=home时候显示app中默认的主页icon，当right只有这两者之一，都只显示一个按钮，如果right有2项，且tagname分别为call/home,则显示2个按钮图标，其它情况均显示value配置的文字；

        var json_str = JSON.stringify(nav_json);
        CtripBar.app_refresh_nav_bar(json_str);

        //调用完成，顶部条title为携程，右侧有一个按钮，按钮文字为Click，用户点击按钮后，H5页面会收到如下回调
        var cb_json = {tagname:"click_tag_name"};
        app.callback(cb_json);
        //H5页面需要处理tagname为click_tag_name的事件

     */
    app_refresh_nav_bar:function(nav_bar_config_json) {
        if (Internal.isNotEmptyString(nav_bar_config_json)) {
            jsonObj = JSON.parse(nav_bar_config_json);

            jsonObj.service = "NavBar";
            jsonObj.action = "refresh";
            jsonObj.callback_tagname = "refresh_nav_bar";
            
            paramString = JSON.stringify(jsonObj);

            if (Internal.isIOS) {
                url = Internal.makeURLWithParam(paramString);
                Internal.loadURL(url);
            }
            else if (Internal.isAndroid) {
                window.NavBar_a.refresh(paramString);
            }
            else if (Internal.isWinOS) {
                Internal.callWin8App(paramString);
            }
        }
    },


      /**
     * @description 设置顶部导航栏隐藏／显示，使用该函数的隐藏顶部栏之后，必须保证页面有离开H5页面的功能，否则用户无法离开，必须要kill掉app。
     * @brief 顶部导航隐藏／显示
     * @param {boolean} isHidden 是否隐藏顶部导航栏
     * @since 5.4
     * @method app_set_navbar_hidden
     * @author jimzhao
     * @example 

     CtripBar.app_set_navbar_hidden(false);
     */
    app_set_navbar_hidden:function(isHidden) {
        var startVersion = "5.4";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }    

        var params = {};
        params.isHidden = isHidden;
        paramString = Internal.makeParamString("NavBar","setNavBarHidden",params,"set_navbar_hidden");
        
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.NavBar_a.setNavBarHidden(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }   
    },

      /**
     * @description 设置底部工具栏隐藏／显示
     * @brief 底部工具栏隐藏／显示
     * @param {boolean} isHidden 是否隐藏底部工具栏
     * @since 5.4
     * @method app_set_toolbar_hidden
     * @author jimzhao
     * @example 

     CtripBar.app_set_toolbar_hidden(false);
     */
    app_set_toolbar_hidden:function(isHidden) {
        var startVersion = "5.4";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }    
        var params = {};
        params.isHidden = isHidden;
        paramString = Internal.makeParamString("NavBar","setToolBarHidden",params,"set_toolbar_hidden");
        
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.NavBar_a.setToolBarHidden(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }   
    }
};


/**
 * @class CtripMap
 * @description 地图相关类，定位/导航
 * @brief 地图相关类，定位/导航
 */

var CtripMap = {
 /**
     * @description 定位
     * @brief 定位
     * @param {Bool} is_async true标识是异步定位，false标识为同步定位
     * @method app_locate
     * @author jimzhao
     * @since v5.1
     * @example

        CtripUtil.app_locate(true);
        //定位完成后H5页面会收到回调数据
        var json_obj =
        {
            tagname:'locate',
            param:{
                "value":{
                    ctyName: '上海',
                    addrs:'上海市浦东南路22号',
                    lat:'121.487899',
                    lng:'31.249162'
                },
                'timeout': '2013/09/12 12:32:36',
                'locateStatus':0,//iOS新增字段:-1网络不通，当前无法定位,-2定位没有开启
            }
        }
        app.callback(json_obj);
     * 
     */
    app_locate:function(is_async) {
        var params = {};
        params.is_async = is_async;

        paramString = Internal.makeParamString("Locate", "locate", params, 'locate')
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.locate(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 在地图上显示某个位置
     * @brief 在地图上显示某个位置/导航
     * @param {double} latitude, 纬度
     * @param {double} longitude, 经度
     * @param {String} title, 在地图上显示的点的主标题
     * @param {String} subtitle, 在地图上显示点的附标题
     * @method app_show_map
     * @author jimzhao
     * @since v5.5
     * @example
        
        CtripMap.app_show_map(31.3222323, 121.32232332, "上海野生动物园", "浦东新区陆家嘴1234号");
     *
     */
    app_show_map:function(latitude, longitude, title, subtitle) {
        var startVersion = "5.5";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!title) {
            title = "";
        }
        if (!subtitle) {
            subtitle = "";
        }

        var params = {};
        params.latitude = latitude;
        params.longitude = longitude;
        params.title = title;
        params.subtitle = subtitle;
        paramString = Internal.makeParamString("Locate", "showMap",params, 'show_map');

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.showMap(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

};

/**
 * @class CtripBusiness
 * @description Ctrip业务相关，需要返回数据给H5页面
 * @brief Ctrip业务相关，需要返回数据给H5页面
 */
var CtripBusiness = {

    /**
     * @description 选择常用发票title
     * @brief 选择常用发票title
     * @param {String} selectedInvoiceTitle 当前已经选择好的发票title
     * @method app_choose_invoice_title
     * @author jimzhao
     * @since v5.6
     * @example
     *
     * 
        CtripBusiness.app_choose_invoice_title("上次选择的发票title，或者为空，用于标记已选title");
        
        //调用之后，H5页面会收到回调数据
        var json_obj =
        {
            tagname:'locate',
            param:{
                selectedInvoiceTitle:"所选择的发票title"
            }
        }
        
        app.callback(json_obj);
     */
    app_choose_invoice_title:function(selectedInvoiceTitle) {
        var startVersion = "5.6";
        var ua = navigator.userAgent;
        if (ua.indexOf("Youth_CtripWireless") > 0) { //青春版不做校验
           alert("true:"+ua);
        } else {
            alert("false:"+ua);
        }

        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!selectedInvoiceTitle) {
            selectedInvoiceTitle = "";
        }
        var params = {};
        params.selectedInvoiceTitle = selectedInvoiceTitle;
        paramString = Internal.makeParamString("Business", "chooseInvoiceTitle", params, 'choose_invoice_title');

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Business_a.chooseInvoiceTitle(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

};

/**
 * @class CtripPage
 * @description 页面跳转，导航，刷新相关API
 * @brief 页面跳转，导航，刷新相关API
 */
var CtripPage = {

    /**
     * @description 设置当前页面名，可用于页面导航，刷新
     * @brief 设置当前页面名，可用于页面导航，刷新
     * @param {String} pageName 设置当前页面名
     * @method app_set_page_name
     * @author jimzhao
     * @since v5.6
     * @example
     *
     * 
        CtripPage.app_set_page_name("USE_CAR_PAGE_IDENTIFY");

     */
    app_set_page_name:function(pageName) {
        var startVersion = "5.6";
        if (!Internal.isAppVersionGreatThan(startVersion)) {
            Internal.appVersionNotSupportCallback(startVersion);
            return;
        }

        if (!pageName) {
            pageName = "";
        }

        var params = {};
        params.pageName = pageName;

        paramString = Internal.makeParamString("Page", "setPageName", params, "set_page_name");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Page_a.setPageName(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};

//获取当前app环境
 CtripTool.app_is_in_ctrip_app();
