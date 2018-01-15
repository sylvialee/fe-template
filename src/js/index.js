/**
 * openlayers 4.0
 */
//var imgprefix = "omap/images/";//图标路径
var MAP_PERSON_ONE = 1
var MAP_PERSON_TWO = 2
var MAP_VEHICLE_ONE = 3
var MAP_VEHICLE_TWO = 4
var citys = ["北京","天津","上海","重庆","石家庄","太原","呼和浩特","哈尔滨","长春","沈阳","济南","南京","合肥","杭州","南昌","福州","郑州","武汉","长沙","广州","南宁","西安","银川","兰州","西宁","乌鲁木齐","成都","贵阳","昆明","拉萨","海口"];
var deviceData = [];
var stationData = [];
/**
 * 初始化地图
 * @constructor
 */
var nucLayer = null
var NucMapClass = function (_opts) {
	this._map = null
	// 定义map对象
	this._nucmap = new NucMap()
    //地图初始化
	this.init(_opts)

}

/**
 *
 * @type {{}}
 */
NucMapClass.prototype = {
	/**
	 * 初始化地图方法根据opts类型判断
	 * @param _opts
     */
	init : function(_opts) {
		var opts = {
			type : 1,
		}
		$.extend(opts, _opts);
		if(opts.type == MAP_PERSON_ONE){
			window.statusRecord = 'person1';
		}else{
			window.statusRecord = '';
		}

		if(opts.clickBack){
			opts.selectBack = opts.clickBack
		}
		if(opts.dblclickBack){
			opts.dblselectBack = opts.dblclickBack
		}
		this._map = window._omap = this.initMap(opts);
		this.createMapLabel.bind(this)();
		if(opts.type == MAP_PERSON_ONE){
           this.createPersonOneMap(opts)
		}else if(opts.type == MAP_PERSON_TWO){
			this.createPersonTwoMap(opts)
		}else if(opts.type == MAP_VEHICLE_ONE){
			this.createVehicleOneMap(opts)
		}else if(opts.type == MAP_VEHICLE_TWO){
			this.createVehicleTwoMap(opts)
		}
	},
	drawChinaOutLine: function () {
		var  nucLayer = this._nucmap.createNucLayer();
			var lineOpts = {
			paths : path,
			//线填充颜色
			fillcolor : "blue", //blue || "#ff0000" ||rgba(237, 212, 0, 0.7)
			//线颜色
			strokecolor : "rgba(255, 255, 0, 0.5)",
			//线宽度
			strokewidth : 4
		};
		//创建线
		var line = this._nucmap.createNucline(lineOpts);
		this._nucmap.addFeatures2Layer(line, nucLayer);
	},
	initMap: function (_opts) {
		var opts = {
			//中心点经度
			centerlng:120.297125,
			//中心点经维度
			centerlat:38.417445,
			//缩放级别
			zoomlevel: 8,
			mapId: 'omap'
		};
		$.extend(opts, _opts);
		// 地图初始化
		this._map = window._omap = this._nucmap.init(opts);

		return this._map;
	},
	createMenu: function(_opts){
		var opts = {
			positioning : 'center-center',
			domId : 'domId'
		}
		$.extend(opts, _opts);
		var menuoverlay;
		//创建右击菜单
		menuoverlay = this._nucmap.createOverlay({
			domId : opts.domId,
			positioning : opts.positioning
		});
		return menuoverlay
	},
	setOverlaysPostion:function(popou,lng,lat){
		this._nucmap.setOverlaysPostion(popou, lng, lat);
	},
	removeOverlaysPostion:function (overlays) {
		this._nucmap.removeOverlays(overlays)
	},
	createPersonOneMap: function (_opts) {
		var opts = {
			callback:null
		};
		$.extend(opts, _opts);
		var stationArr = [];
		this._map.once('postrender', function() {
			var fillStyle;
			for(var i = 1; i < 5; i++) {
				if(i==1) fillStyle = 'rgba(255, 50, 50, 0.6)';
				if(i==2) fillStyle = 'rgba(5, 250, 50, 0.6)';
				if(i==3) fillStyle = 'rgba(5, 50, 250, 0.6)';
				if(i==4) fillStyle = 'rgba(255, 250, 10, 0.5)';
				var data = this._createMapOneData({
					type:i,
					count:75,
					fillStyle:fillStyle
				})
				$.merge(stationArr,data);
			}
			var dataSet = new mapv.DataSet(stationArr);
			var options = {
				fillStyle: fillStyle,
				shadowColor: 'rgba(255, 250, 0, 1)',
				shadowBlur: 30,
				globalCompositeOperation: 'lighter',
				methods: {
					click: function (item) {
						if(opts.clickBack){
							opts.clickBack(item)
						}
					},
					dblclick: function (item) {
						opts.dblclickBack(item)
					}
				},
				size: 5,
				draw: 'simple'
			}

			var mapvLayer = new mapv.baiduMapLayer(window._omap, dataSet, options);
		}.bind(this));
	},
	createPersonTwoMap: function (_opts) {
		var opts = {
			callback:null
		};
		$.extend(opts, _opts);
		var stationArr = [];
		var personArr = [];
		var fillStyle;
		for(var i = 1; i < 5; i++) {
			if(i==1) fillStyle = 'rgba(255, 50, 50, 0.9)';
			if(i==2) fillStyle = 'rgba(5, 250, 50, 0.9)';
			if(i==3) fillStyle = 'rgba(5, 50, 250, 0.9)';
			if(i==4) fillStyle = 'rgba(255, 250, 10, 0.9)';
			var data = this._createMapOneData({
				type:i,
				count:3,
				fillStyle:fillStyle
			})
			$.merge(stationArr,data);
		}
		//创建线
		if(isNotEmpty(nucLayer )){
			this._nucmap.clearLayerMarkers(nucLayer );
		}else{
			nucLayer = this._nucmap.createNucLayer();
		}
		for(var i = 0; i < stationArr.length; i++) {
			var station = stationArr[i];
			personArr.push({
				lng: station.geometry.coordinates[0],
				lat: station.geometry.coordinates[1]
			})
			var opts = {
				src: 'css/default/images/alarm.gif',
				rotation: 0,
				scale: 1,
				fillStyle:station.fillStyle,
				lng: station.geometry.coordinates[0],
				lat: station.geometry.coordinates[1],
				attr: station,
				text: "",
				radius : 6,
				offsetX: 5,
				offsetY: 20
			}
			var marker = this._nucmap.createCircleFeature(opts)
			this._nucmap.addFeatures2Layer(marker, nucLayer);
		}


		var lineOpts = {
			paths : personArr,
			//线填充颜色
			fillcolor : "yellow", //blue || "#ff0000" ||rgba(237, 212, 0, 0.7)
			//线颜色
			strokecolor : "rgba(255, 255, 5, 0.5)",
			//线宽度
			strokewidth : 4
		};


		var line = this._nucmap.createNucline(lineOpts);
		this._nucmap.addFeatures2Layer(line, nucLayer );
	},
	/**
	 * 创建车1地图
	 * @param _opts
     */
	createVehicleOneMap: function (_opts) {
		var opts = {
			callback:null
		};
		$.extend(opts, _opts);
		var stationArr = [];
		var personArr = [];
		var fillStyle;
		for(var i = 1; i < 5; i++) {
			if(i==1) fillStyle = 'rgba(255, 50, 50, 0.7)';
			if(i==2) fillStyle = 'rgba(5, 250, 50, 0.7)';
			if(i==3) fillStyle = 'rgba(5, 50, 250, 0.7)';
			if(i==4) fillStyle = 'rgba(255, 250, 10, 0.7)';
			var data = this._createMapOneData({
				type:i,
				count:100,
				fillStyle:fillStyle
			})
			$.merge(stationArr,data);
		}

		//创建线
		if(isNotEmpty(nucLayer )){
			this._nucmap.clearLayerMarkers(nucLayer );
		}else{
			nucLayer = this._nucmap.createNucLayer();
		}
		for(var i = 0; i < stationArr.length; i++) {
			var station = stationArr[i];
			personArr.push({
				lng: station.geometry.coordinates[0],
				lat: station.geometry.coordinates[1]
			})
			var opts = {
				src: 'css/default/images/alarm.gif',
				rotation: 0,
				scale: 1,
				fillStyle:station.fillStyle,
				lng: station.geometry.coordinates[0],
				lat: station.geometry.coordinates[1],
				attr: station,
				text: "",
				attr:station,
				radius : 6,
				offsetX: 5,
				offsetY: 20
			}
			//var marker = this._nucmap.createCircleFeature(opts)
			//this._nucmap.addFeatures2Layer(marker, nucLayer);
		}
		this._cluster = new NucCluster(stationArr)


	},
	/**
	 * 创建车2地图
	 * @param _opts
	 */
	createVehicleTwoMap: function (_opts) {
		var opts = {
			callback:null
		};
		$.extend(opts, _opts);
		//this._map.once('postrender', function() {
			var stationArr = [];
			var personArr = [];
			var fillStyle;
			for(var i = 1; i < 5; i++) {
				if(i==1) fillStyle = 'rgba(255, 50, 50, 0.9)';
				if(i==2) fillStyle = 'rgba(5, 250, 50, 0.9)';
				if(i==3) fillStyle = 'rgba(5, 50, 250, 0.9)';
				if(i==4) fillStyle = 'rgba(255, 250, 10, 0.9)';
				var data = this._createMapOneData({
					type:i,
					count:3,
					fillStyle:fillStyle
				})
				$.merge(stationArr,data);
			}
			for(var i = 0; i < stationArr.length; i++) {
				var value = stationArr[i];
				if(i>=0&&i!=stationArr.length-1){
					var curPos = value.geometry.coordinates;
					var nextPos = stationArr[i+1].geometry.coordinates
					rotate = this._nucmap.getRotate(curPos[0],curPos[1],nextPos[0],nextPos[1]);
					value.geometry.rotate =rotate
				}else if(i==stationArr.length-1){
					var curPos = stationArr[i-1].geometry.coordinates;
					var nextPos = value.geometry.coordinates
					rotate = this._nucmap.getRotate(curPos[0],curPos[1],nextPos[0],nextPos[1]);
					value.geometry.rotate =rotate
				}

			}
			//创建线
			if(isNotEmpty(nucLayer )){
				this._nucmap.clearLayerMarkers(nucLayer );
			}else{
				nucLayer = this._nucmap.createNucLayer();
			}
			for(var i = 0; i < stationArr.length; i++) {
				var station = stationArr[i];
				personArr.push({
					lng: station.geometry.coordinates[0],
					lat: station.geometry.coordinates[1]
				})
				var opts = {
					src: 'http://webapi.amap.com/images/car.png',
					rotation: 0,
					scale: 1,
					fillStyle:station.fillStyle,
					lng: station.geometry.coordinates[0],
					lat: station.geometry.coordinates[1],
					attr: station,
					rotate: station.geometry.rotate,
					//text: i+"",
					radius : 6,
					offsetX: 5,
					offsetY: 20
				}
				var marker = this._nucmap.createMarker(opts)
				this._nucmap.addFeatures2Layer(marker, nucLayer);
			}


			var lineOpts = {
				paths : personArr,
				//线填充颜色
				fillcolor : "yellow", //blue || "#ff0000" ||rgba(237, 212, 0, 0.7)
				//线颜色
				strokecolor : "rgba(255, 255, 5, 0.5)",
				//线宽度
				strokewidth : 4
			};


			var line = this._nucmap.createNucline(lineOpts);
			this._nucmap.addFeatures2Layer(line, nucLayer );
		//}.bind(this));



	},
	/**
	 * 创建检查站(1)，火车站(2)，飞机场(3)，建筑物数据(4)
	 */
	_createMapOneData: function (_opts) {
		var fillStyle = {
			type:1,
			count:75,
			fillStyle:'rgba(255, 50, 50, 0.6)'
		};
		$.extend(opts, _opts);
		var randomCount = opts.count;
		var data = [];
		// 构造数据
		while (randomCount--) {
			var cityCenter = mapv.utilCityCenter.getCenterByCityName(citys[parseInt(Math.random() * citys.length)]);
			var coordinates = [cityCenter.lng - 2 + Math.random() * 4, cityCenter.lat - 2 + Math.random() * 4];
			if(data.length>0){
				//var pixel = window.omap.getPixelFromCoordinate(ol.proj.fromLonLat(coordinates, 'EPSG:3857'));
				//var curPos = [data[data.length-1].geometry.coordinates[0],data[data.length-1].geometry.coordinates[1]];
				//var nextPos = coordinates
				//rotate = this._nucmap.getRotate(curPos,nextPos);
			}
			data.push({
				geometry: {
					type: 'Point',
					coordinates: coordinates
				},
				count: 30 * Math.random(),
				devicetype:opts.type,
				fillStyle:opts.fillStyle
			});
		}

		return data
	},
	createMapLabel: function (_opts) {
		this._map.once('postrender', function() {
			var textData = [];
			for (var i = 0; i < citys.length; i++) {
				var fromCenter = mapv.utilCityCenter.getCenterByCityName(citys[i]);
				var toCenter = mapv.utilCityCenter.getCenterByCityName(citys[i]);
				if (!fromCenter || !toCenter) {
					continue;
				}
				textData.push(
					{
						geometry: {
							type: 'Point',
							coordinates: [fromCenter.lng, fromCenter.lat]
						},
						text: citys[i]
					}
				);
			}
			var textDataSet = new mapv.DataSet(textData);

			var textOptions = {
				draw: 'text',
				font: '14px Arial',
				fillStyle: 'white',
				shadowColor: 'yellow',
				shadowBlue: 10,
				zIndex: 11,
				shadowBlur: 10
			}

			var textMapvLayer = new mapv.baiduMapLayer(window._omap, textDataSet, textOptions);
		});

	}

}