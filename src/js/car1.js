
var defaultData = {
  devicetype: 1,
  stationId: 1234,
  time: 'today'
}

// 列表滚动参数
var speed = 1;
var tbody = document.getElementById('tableTbody');
var loop1;
var roadName = '';

$(document).ready(function() {

  fetchCarList(defaultData);

})

var infoObj = {
  allCar: [],
  dangerCar: [],
  map:{},
  stationName: '北京火车站',
}


function bindEvent(){

  // 关闭详情弹窗
  $("#closePopBtn").on('click', hidePop);

  // 监听打开详情点击事件
  $("[data-el='car-info']").on('click', function(){

    var key = $(this).attr("data-id");
    var data = infoObj.map[key];
    showPop(data);

  })
}

function fetchCarList(data){
  data.cameraId = Math.floor(Math.random()*2);
  var query = {
        cameraId: data.cameraId,
        time: 'today'
      }

  // 根据条件进行请求判读展示数据
  var result = queryData(query, car1Data)

  infoObj.allCar = result.carList;
  infoObj.roadName = result.roadName;
  infoObj.map = {};
  infoObj.dangerCar = [];

  initTable(result);
  initnewDanger(infoObj.dangerCar);
}

function queryData(query, data){
  var camera, result;

  // 获取监控站点类别
  switch(query.cameraId){
    case 0:
      camera = data.camera1;
      break;
    case 1:
      camera = data.camera2;
      break;
    default:
      camera = data.camera1;
      break;
  }
  return camera;
}


function initTable(data){

  var html = '';

  $.each(data.carList, function(index, val){
    html += '<tr class="' + (val.isDanger?'danger':'') + '">' + 
              '<td>' + val.car.number + '</td>' + 
              '<td>' + val.car.color +'</td>' + 
              '<td>' + val.car.brand + '</td>' + 
              '<td>' + (val.time || '2018-1-3 20:11:21') +'</td>' + 
              '<td data-id="' + val.id + '" data-el="car-info">详情</td>' + 
            '</tr>';

    infoObj.map[val.id] = val;
    val.isDanger && (infoObj.dangerCar.push(val));

  })
  $("[data-el='roadName']").text(data.roadName);
  roadName = data.roadName;
  $("#tableInfo tbody").empty().append(html);

  if(data.carList.length > 10){
    $('#tableInfo tbody').append(html);
    tbody.scrollTop = 0;
    clearTimeout(loop1);
    bindList();
    setTimeout(animateList, 100);
  }
}


function bindList(){
  $('#tableTbody').off();
  $('#tableTbody').on({
    scroll: function(){
      setTable(infoObj.allCar.length);
    },
    mouseenter: function() {
      clearTimeout(loop1);// Handle mouseenter...
    },
    mouseleave: function() {
      animateList();  // Handle mouseleave...
    },
    click: function(){
      // clearTimeout(loop1);
    }
  })
}
function animateList(){
  if(infoObj.allCar.length > 10){
    tbody.scrollTop = tbody.scrollTop + speed;
    loop1 = setTimeout(function(){
      animateList();
    }, 50);
  }
}

function setTable(len){
  var tbodyHeight = len*36;
  if(tbody.scrollTop == tbodyHeight){
    console.log(tbody.scrollTop);
    tbody.scrollTop = 0;
  };
}


function initDanger(arr){
  
  var html = '';

  $.each(arr, function(index, val){
    html += '<div class="menu-card">' +
              '<img src="' + val.car.pic +'">' + 
              '<p>车牌号：<span>' + val.car.number + '</span></p>' +
              '<p>车型：<span>' + val.car.brand + '</span></p>' + 
              '<p>颜色：<span>' + val.car.color + '</span></p>' + 
              '<p>嫌疑问题：<span>' + val.dangerReason + '</span></p>' + 
              '<p>经过时间：<span>' + (val.time || '2018-1-3 20:11:21') + '</span></p>' + 
              '<p><span class="info" data-id="' + val.id + '" data-el="car-info">详情</span></p>' + 
            '</div>';
  });

  $("#cardList").empty().append(html?html:'暂未发现嫌疑车辆');

}

function initnewDanger(arr){
  
  $("#cardList").empty()

  if(arr.length){
    setTimeout(function(){animateCard(arr, 0)}, settings.carCardDelay);
  }else{
    $("#cardList").append('暂未发现嫌疑车辆');
    // animateList();
  }

}

function animateCard(arr, idx){
  var val = arr[idx];
  var html = '';
    html += '<div class="menu-card">' +
              '<img src="' + val.car.pic +'">' + 
              '<p>车牌号：<span>' + val.car.number + '</span></p>' +
              '<p>车型：<span>' + val.car.brand + '</span></p>' + 
              '<p>颜色：<span>' + val.car.color + '</span></p>' + 
              '<p>嫌疑问题：<span>' + val.dangerReason + '</span></p>' + 
              '<p>经过时间：<span>' + (val.time || '2018-1-3 20:11:21') + '</span><span class="info" data-id="' + val.id + '" data-el="car-info">详情</span></p>' + 
            '</div>';

  $("#cardList").append(html);
  setTimeout(function(){
    $("#cardList .menu-card").eq(idx).addClass('flowIn');
  }, 10);
  setTimeout(function(){
    if(idx < arr.length-1){
      var idx1 = idx+1;
      animateCard(arr, idx1);
    }else{
      // 
      bindEvent();
    }
  }, settings.carCardDelay);
}

function showPop(data){

  $("[data-el='popCarPic']").attr('src', data.car.pic);
  $("[data-el='popNumber']").text(data.car.number);
  $("[data-el='popColor']").text(data.car.color);
  $("[data-el='popBrand']").text(data.car.brand);
  $("[data-el='popTime']").text(data.time || '2018-1-3 20:11:21');
  $("[data-el='popRoadName']").text(roadName);
  $("[data-el='popDangerReason']").text(data.dangerReason);
  $("#popContainer").show();

}

function hidePop(){
  $("#popContainer").hide();
}



//地图初始化
var opts = {
  mapId: 'omap',
  type:3,  //（1:人1 || 2:人2 || 3:车1 || 4:车2)
  clickBack:getClickItem,// 单击事件
  dblclickBack:getdblClickItem// 双击事件
}
//地图初始化，根据参数不同显示不同的初始化地图
var mapClass = new NucMapClass(opts)


//eg:弹出卡片需提前初始化   有几个卡片初始化几个
var menuOverlay = mapClass.createMenu({
  positioning : 'center-center',
  domId : 'contextmenu_container'  //示例:需根据定义卡片ID确定
});

// 获取点击点的信息
function getClickItem(item) {
  // To things here when singleclick
  // console.log(item);
  // if( null != item){
  //   window.open('video.html', 'newwindow', 'width=600, height=450, directories=no, location=no, resizable=yes')
  // }

  if( null != item){
    // 人1.html  ==>item.devicetype  检查站(1)，火车站(2)，飞机场(3)，建筑物数据(4)
    console.log(item)
    //eg 根据需要给卡片div赋予内容
    $('#contextmenu_container').html('<ul><li>平台</li><li>视频<span>视频1</span><span>视频2</span><span>视频3</span></li></ul>')
    // 弹出信息框
    mapClass.setOverlaysPostion(menuOverlay, item.geometry.coordinates[0], item.geometry.coordinates[1]);

    $('#contextmenu_container ul li').eq(0).addClass('pop-list1');
    $('#contextmenu_container ul li').eq(1).addClass('pop-list2');
    bindPop();
  }else{
    // 隐藏信息框
    $('#contextmenu_container ul li').eq(0).removeClass('pop-list1');
    $('#contextmenu_container ul li').eq(1).removeClass('pop-list2');
    setTimeout('mapClass.removeOverlaysPostion([menuOverlay])', 200);
    
  }
}

// 获取点击点的信息
function getdblClickItem(item) {
  // To things here  when dblclick
  console.log(item)
  if( null != item){
    fetchCarList(item);
  }
}


function bindPop(){
  $('#contextmenu_container ul li').eq(0).on('click', function(){
    // 隐藏信息框
    $('#contextmenu_container ul li').eq(0).removeClass('pop-list1');
    $('#contextmenu_container ul li').eq(1).removeClass('pop-list2');
    setTimeout('mapClass.removeOverlaysPostion([menuOverlay])', 200);
    $('body').append('<a id="plat" href="http://www.baidu.com" target="_blank"></a>');
    $("#plat").get(0).click();

  })
  $('#contextmenu_container ul li').eq(1).on('click', function(){
    // $('#contextmenu_container ul li span').eq(0).addClass('dot1');
    // $('#contextmenu_container ul li span').eq(1).addClass('dot2');
    // $('#contextmenu_container ul li span').eq(2).addClass('dot3');
    window.open('video.html', 'newwindow', 'width=600, height=450, directories=no, location=no, resizable=yes')
  })
  // $('#contextmenu_container ul li span').on('click', function(){
  //   // $("#videoPop").show();
  // })
  $('#closeVideoPopBtn').on('click', function(){
    document.getElementById("myVideo").currentTime = 0;
    document.getElementById("myVideo").pause();
    $("#videoPop").hide();
  })
}












