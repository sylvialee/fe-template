
var defaultData = {
  devicetype: 1,
  stationId: 1234,
  time: 'today'
}

// 列表滚动参数
var speed = 1;
var tbody = document.getElementById('tableTbody');
var loop1;

$(document).ready(function() {

  fetchPersonList(defaultData);

})

var infoObj = {
  allPerson: [],
  dangerPerson: [],
  map:{},
  stationName: '北京火车站',
}


function bindEvent(){

  // 关闭详情弹窗
  $("#closePopBtn").on('click', hidePop);

  // 监听打开详情点击事件
  $("[data-el='person-info']").on('click', function(){

    var key = $(this).attr("data-id");
    var data = infoObj.map[key];
    showPop(data);

  })
}

function fetchPersonList(data){
  var query = {
        type: data.devicetype,
        stationId: data.stationId,
        time: 'today'
      }

  // 根据条件进行请求判读展示数据
  var result = queryData(query, personData)

  infoObj.allPerson = result.personList;
  infoObj.stationName = result.stationName;
  infoObj.map = {};
  infoObj.dangerPerson = [];

  initTable(result);
  initnewDanger(infoObj.dangerPerson);
}
// function fetchPersonList(data){
//   var query = {
//         type: data.devicetype,
//         stationId: data.stationId,
//         time: 'today'
//       }

//   $.ajax({
//     type: 'get',
//     dataType: "json",
//     url: '/mock/person.json',
//     data: query, 
//     success: function(res){

//       // 根据条件进行请求判读展示数据
//       var result = queryData(query, res)

//       infoObj.allPerson = result.personList;
//       infoObj.stationName = result.stationName;

//       initTable(infoObj.allPerson);
//       initDanger(infoObj.dangerPerson);

//     }, 
//     error: function(e) {
//       console.log('请求不成功哦，请联系后台服务人员吧！');
//     }
//   })
// }

function queryData(query, data){
  var station, result;

  // 获取监控站点类别
  switch(query.type){
    case 1:
      station = data.checkStation;
      break;
    case 2:
      station = data.trainStation;
      break;
    case 3:
      station = data.airport;
      break;
    case 4:
      station = data.buildings;
      break;
    default:
      station = data.checkStation;
      break;
  }

  // 获取检查站信息，此处为在4个里随机取数
  var idx = Math.floor(Math.random()*4);

  result = station[idx];
  return result;
}


function initTable(data){

  var html = '';

  $.each(data.personList, function(index, val){
    html += '<tr class="' + (val.isDanger?'danger':'') + '">' + 
              '<td>' + val.name + '</td>' + 
              '<td>' + val.gender +'</td>' + 
              '<td>' + val.age + '岁</td>' + 
              '<td>' + (val.time || '2018-1-3 20:11:21') +'</td>' + 
              '<td>' + val.dangerReason + '</td>' + 
              '<td data-id="' + val.id + '" data-el="person-info">详情</td>' + 
            '</tr>';

    infoObj.map[val.id] = val;
    val.isDanger && (infoObj.dangerPerson.push(val));

  })
  $("[data-el='checkStation']").text(data.stationName);
  $("#tableInfo tbody").empty().append(html);

  if(data.personList.length > 10){
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
      setTable(infoObj.allPerson.length);
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
  if(infoObj.allPerson.length > 10){
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
              '<img src="' + val.avatar +'">' + 
              '<p>姓名：<span>' + val.name + '</span></p>' +
              '<p>性别：<span>' + val.gender + '</span></p>' + 
              '<p>年龄：<span>' + val.age + '</span></p>' + 
              '<p>身份证号：<span>' + val.id + '</span></p>' + 
              '<p>时间：<span>' + (val.time || '2018-1-3 20:11:21') + '</span></p>' + 
              '<p>嫌疑内容：<span>' + val.dangerReason + '</span><span class="info" data-id="' + val.id + '" data-el="person-info">详情</span></p>' + 
            '</div>';
  });

  $("#cardList").empty().append(html?html:'暂未发现嫌疑人');

}

function initnewDanger(arr){
  
  $("#cardList").empty()

  if(arr.length){
    setTimeout(function(){animateCard(arr, 0)}, settings.personCardDelay);
  }else{
    $("#cardList").append('暂未发现嫌疑人');
    // animateList();
  }

}

function animateCard(arr, idx){
  var val = arr[idx];
  var html = '';
  html = '<div class="menu-card">' +
            '<img src="' + val.avatar +'">' + 
            '<p>姓名：<span>' + val.name + '</span></p>' +
            '<p>性别：<span>' + val.gender + '</span></p>' + 
            '<p>年龄：<span>' + val.age + '</span></p>' + 
            '<p>身份证号：<span>' + val.id + '</span></p>' + 
            '<p>时间：<span>' + (val.time || '2018-1-3 20:11:21') + '</span></p>' + 
            '<p>嫌疑内容：<span>' + val.dangerReason + '</span><span class="info" data-id="' + val.id + '" data-el="person-info">详情</span></p>' + 
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
      // setTimeout(animateList, 300);
      bindEvent();
    }
  }, settings.personCardDelay);
}

function showPop(data){

  $("[data-el='popAvatar']").attr('src', data.avatar);
  $("[data-el='popXRayPic']").attr('src', data.XRayPic);
  $("[data-el='popMmRayPic']").attr('src', data.mmRayPic);
  $("[data-el='popName']").text(data.name);
  $("[data-el='popAge']").text(data.age);
  $("[data-el='popGender']").text(data.gender);
  $("[data-el='popId']").text(data.id);
  $("[data-el='popTime']").text(data.time || '2018-1-3 20:11:21');
  $("[data-el='popCheckStation']").text(data.checkStation);
  $("[data-el='popDangerReason']").text(data.dangerReason);
  $("#popContainer").show();

}

function hidePop(){
  $("#popContainer").hide();
}



//地图初始化
var opts = {
  mapId: 'omap',
  type:1,  //（1:人1 || 2:人2 || 3:车1 || 4:车2)
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
    $('#contextmenu_container ul li span').eq(0).addClass('dot1');
    $('#contextmenu_container ul li span').eq(1).addClass('dot2');
    $('#contextmenu_container ul li span').eq(2).addClass('dot3');
  })
  $('#contextmenu_container ul li span').on('click', function(){
    // $("#videoPop").show();
    window.open('video.html', 'newwindow', 'width=600, height=450, directories=no, location=no, resizable=yes')
  })
  $('#closeVideoPopBtn').on('click', function(){
    document.getElementById("myVideo").currentTime = 0;
    document.getElementById("myVideo").pause();
    $("#videoPop").hide();
  })
}

// 获取点击点的信息
function getdblClickItem(item) {
  // To things here  when dblclick
  if( null != item){
    fetchPersonList(item);
  }
}















