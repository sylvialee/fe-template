
// 获取数据参数
var defaultData = {
  devicetype: 1,
  stationId: 1234,
  time: 'today'
}

// 暂存数据
var infoObj = {
  route: [],
  map:{},
  stationName: '北京火车站',
}

// 列表滚动参数
var speed = 1;
var tbody = document.getElementById('tableTbody');
var loop1;

$(document).ready(function() {
  initMap();
  bindTime();
  initCalendar('dt_start', 'dd_start');
  initCalendar('dt_end', 'dd_end');
})

// 绑定查询事件
function bindEvent(){

  // 关闭详情弹窗
  $("#searchBtn").on('click', function(){
    var val = $("#userId").val();
    if(val.length>=5 && val.length <=9){
      $('#tips').text('请输入正确的车牌号码').hide();
      // 刷新地图
      mapClass.createVehicleTwoMap({});
      mapClass.removeOverlaysPostion([menuOverlay]);
    }else{
      $('#tips').text('请输入正确的车牌号码').show();
    }
  });
}

// 获取数据
function fetchPersonList(data){
  data.routeId = Math.floor(Math.random()*2);
  var query = {
        routeId: data.routeId,
        time: 'today'
      }

  // 根据条件进行请求判读展示数据
  var result = queryData(query, car2Data)

  infoObj.route = result;
  bindEvent();
}

// 筛选数据
function queryData(query, data){
  var route;

  // 获取监控站点类别
  switch(query.routeId){
    case 1:
      route = data.route1;
      break;
    case 2:
      route = data.route2;
      break;
    default:
      route = data.route1;
      break;
  }
  return route;
}

// 获取随机数据
function getRandomData(data, num){
  var a = Math.floor(Math.random()*num);
  var result = data[a];

  return result;
}

// 地图标记弹窗
function pop(){
  var val = getRandomData(infoObj.route, 4);
  var html = '';

  html += '<div class="menu-card">' +
            '<p>车辆型号：<span>' + val.brand + '</span></p>' +
            '<p>车辆颜色：<span>' + val.color + '</span></p>' + 
            '<p>车牌号：<span>' + val.number + '</span></p>' + 
            '<p>经过时间：<span>' + (val.time || '2018-1-3 20:11:21') + '</span></p>' + 
            '<img class="car-pic" src="' + val.pic + '">' + 
          '</div>';

  $("#contextmenu_container").empty().append(html);

}

// 弹窗事件绑定
function bindPop(){
  $('[data-el="relationBtn"], [data-el="ticket"]').on('click', function(){
    // 隐藏信息框
    var src = $(this).attr('data-src');
    $('#infoPop img').attr('src', src);
    $("#infoPop").show();
  })
  $('#closeInfoPopBtn').on('click', function(){
    $("#infoPop").hide();
  })
}


//地图初始化，根据参数不同显示不同的初始化地图
var mapClass, menuOverlay;
//地图初始化
var opts;

function initMap(){
  opts = {
    mapId: 'omap',
    type:2,  //（1:人1 || 2:人2 || 3:车1 || 4:车2)
    clickBack:getClickItem,// 单击事件
    dblclickBack:getdblClickItem// 双击事件
  }

  mapClass = new NucMapClass(opts);
  //eg:弹出卡片需提前初始化   有几个卡片初始化几个
  
  menuOverlay = mapClass.createMenu({
    positioning : 'top-center',
    domId : 'contextmenu_container'  //示例:需根据定义卡片ID确定
  });

  // 初始化数据
  fetchPersonList(defaultData);
}

// 获取点击点的信息
function getClickItem(item) {
  // To things here when singleclick
  if( null != item){
    // 人1.html  ==>item.devicetype  检查站(1)，火车站(2)，飞机场(3)，建筑物数据(4)
    console.log(item);
    // item.geometry = {};
    // item.geometry.coordinates = [85.79584541833503, 43.41830531183845];
    //eg 根据需要给卡片div赋予内容
    pop()
    // 弹出信息框
    mapClass.setOverlaysPostion(menuOverlay, item.geometry.coordinates[0], item.geometry.coordinates[1]);
    bindPop();
  }else{
    mapClass.removeOverlaysPostion([menuOverlay]);
    
  }

  $("#dd_start").hide();
  $("#dd_end").hide();
}
// 获取点击点的信息
function getdblClickItem(item) {
  // To things here  when dblclick
  if( null != item){
    fetchPersonList(item);
  }

  $("#dd_start").hide();
  $("#dd_end").hide();
}

// function bindTime(){
//   $('.time-radio span').on('click', function(){
//     $radio = $(this).find('.radio');

//     $('.time-radio span').find('.radio').removeClass('radio-check');
//     $radio.addClass('radio-check');
//     mapClass.createVehicleTwoMap({});
//     mapClass.removeOverlaysPostion([menuOverlay])
//   })
// }


function bindTime(){
  $('.time-radio span').on('click', function(){
    
    $radio = $(this).find('.radio');
    $('.time-radio span').find('.radio').removeClass('radio-check');
    $radio.addClass('radio-check');

    if($(this).find('.radio').attr('id') != 'customize'){
      mapClass.createPersonTwoMap({});
      mapClass.removeOverlaysPostion([menuOverlay])
      $('.customize').removeAttr('style');
      $("#dt_start").val('');
      $("#dt_end").val('');
      $("#dd_start").hide();
      $("#dd_end").hide();
    }else{
      $('.customize').css({"display": "inline-block",'width':"200px", "height": "24px"});
      setTimeout(function(){$('.customize').css({'overflow':"visible"})}, 500)
    }
  })
}

function initCalendar(input, pop){

  $('#' + pop).calendar({
      width: 280,
      height: 280,
      onSelected: function (view, date, data) {
        $('#' + input).val(formatDate(date));
        $('#' + pop).hide();
        if($("#dt_start").val() && $("#dt_end").val()){
          mapClass.createPersonTwoMap({});
          mapClass.removeOverlaysPostion([menuOverlay])
        }
      }
  });

  $('#' + input).on('focus', function(){
    $('.calendar').hide();
    $('#' + pop).show();
  })

  $('#' + input).on('blur', function(){
    // $('#' + pop).hide();
  })
}


function formatDate(date){
  var day = '';
  day = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  return day;
}















