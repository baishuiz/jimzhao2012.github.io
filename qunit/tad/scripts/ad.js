window.onload = function() {

  window.app = {};

  var appInfo = {
    platform: '12'
  };
  var deviceInfo = {};
  var isPreProduction = 0;

  var PATH = '/Vacation/ADList/Query';

  var adView = function(data){
    if($('#adview').length > 0 || !data || !data.Ads || data.Ads.length == 0) return;

    var item = data.Ads[0];

    var $adview = $('<div id="adview"><img src='+ item.imgUrl +' /></div>');

    $('body').append($adview);

    $('#adview').on('click', function(){

      if (item.actUrl.indexOf('ctrip://') > -1) {
        CtripUtil.app_open_url(item.actUrl, 1);
      }else if (item.actUrl.indexOf('ctrip.com') > -1) {
        CtripUtil.app_open_url(item.actUrl, 2);
      }else{
        CtripUtil.app_open_url(item.actUrl, 3);
      }

    });
  };

  var requestAdInfo = function() {
    var preurl = isPreProduction == 0 ? 'http://waptest.ctrip.com/restapi3' : 'http://m.ctrip.com/restapi';
    var url = preurl + PATH;

    var paramstr = window.location.search.split('?')[1];
    var info = {}

    if (paramstr && paramstr != '' ) {
      info = $.deparam(paramstr);
    };

    var params = {
      ver: 0,
      sysCode: appInfo.platform,
      bizType: info.bizType,
      page: info.page,
      deviceInfo: {
        width: info.width,
        height: info.height,
        deviceOsVer: info.deviceOsVer,
        density: info.density
      }
    };

    var successCallback = function(data) {
      // console.log('/---------------success callback-----------------/');
      // console.log(data)

      adView(data);
    };

    var errorCallback = function(data) {
      // console.log('/---------------error callback-----------------/');
      // console.log(data);
    };

    var settings = {
      url: url,
      type: 'post',
      data: JSON.stringify(params),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: successCallback,
      error: errorCallback
    }

    $.ajax(settings);
  };

  window.app.callback = function(options) {
    var _methods = {
      'web_view_finished_load': function() {
        appInfo = options.param;

        CtripUtil.app_init_member_H5_info();
      },

      'init_member_H5_info': function(params) {
        if (window.localStorage && params) {

          if (params && params.device) {
            deviceInfo = {
              device: params.device
            }
          }

          if (params && params.appId) {
            appInfo = {
              version: params.version,
              appId: params.appId,
              serverVersion: params.serverVersion,
              platform: params.platform == '1' ? "12" : "32"
            }
          }

          if (params && params.isPreProduction) {
            isPreProduction = params.isPreProduction;
          }
        }

        requestAdInfo();
      }
    }
  };

  // ------------------
  // 本地测试
  // requestAdInfo();
}