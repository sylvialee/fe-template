
// 初始化默认请求数据
var defaultData = {
  devicetype: 1,
  stationId: 1234,
  time: 'today'
}

// 结果数据存储
var infoObj = {
  route: [],
  map:{},
  stationName: '北京火车站',
}

// 列表滚动参数
var speed = 1;
var tbody = document.getElementById('tableTbody');
var loop1;


// 页面初始化
$(document).ready(function() {
  initMap();
  bindTime();
  initCalendar('dt_start', 'dd_start');
  initCalendar('dt_end', 'dd_end');
})



// 绑定查询轨迹事件
function bindEvent(){

  // 关闭详情弹窗
  $("#searchBtn").on('click', function(){
    var val = $("#userId").val();
    if(val.length>=18 && val.length <=19){
      $('#tips').text('请输入正确的身份证号码').hide();
      // 刷新地图
      mapClass.createPersonTwoMap({});
      mapClass.removeOverlaysPostion([menuOverlay])
    }else{
      $('#tips').text('请输入正确的身份证号码').show();
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
  var result = queryData(query, person2Data)

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
            '<img src="' + val.avatar +'">' + 
            '<p>姓名：<span>' + val.name + '</span></p>' +
            '<p>性别：<span>' + val.gender + '</span></p>' + 
            '<p>年龄：<span>' + val.age + '</span></p>' + 
            '<p>身份证号：<span>' + val.id + '</span></p>' + 
            '<p>随行人员：<span>' + val.accompany + '</span></p>' + 
            '<p>时间：<span>' + (val.time || '2018-1-3 20:11:21') + '</span></p>' + 
            '<p>地点：<span>' + val.location + '</span>' + (val.routeBy?('<span data-el="ticket" data-title="票据信息" data-src="'+val.tickets+'" class="ticket-btn">'+val.routeBy+'</span>'):'') + '</p>' + 
            '<p><span data-el="relationBtn" data-title="关系网" data-src="'+ val.relation+'" class="relation-btn">关系网</span></p>' + 
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
var mapClass, menuOverlay, opts;

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













