/**
 * Created by liqingxian on 2017/6/26.
 */

var Omap = null;
var selectFeature = null;
var highlight;
var select, modifySelect;
var modify;
var draw; // global so we can remove it later
// 墨卡托投影和WGS84坐标系需要区分
// 采用墨卡托投影地图不会变形但经纬度坐标在程序中需要转换
// WGS84坐标系坐标为经纬度不需要转换但是底图会变形
var ismercator = true;
var NucMap = function() {
	// 定义map对象
	this._map = null;
	// 被选中的元素,用户记录当前被选中元素
	this._selectFea = null;
}
NucMap.prototype = {
	/**
	 * 地图初始化
	 * 
	 * @param _opts
	 * @returns {null|ol.Map|*}
	 */
	init : function(_opts) {
		var opts = {
			isFeaChange : true,
			isZoomchange : false,
			popupId : 'popup',
			mapId : 'omap',
			mapurl : 'css/default/images/miyun.png',
			zoomlevel : 11,
			zoomOnWheel : false,
			isCluster : true,
			isModify : true,
			isFeaHover : false,
			centerlng : 116.6890,
			centerlat : 39.6890,
			extent : [ -180, -90, 180, 90 ],
			selectBack : null,
			dblselectBack:null,
			mondifyback : null,
			zoomchangeback : null
		};
		$.extend(opts, _opts);
		// 初始化大地图
		var projection = new ol.proj.Projection({
			code : 'xkcd-image',
			units : 'degrees',
		// extent: extent
		});

		if (opts.isModify) {
			this._select = new ol.interaction.Select({
				condition : ol.events.condition.doubleClick,
			});
			// 点击获取点feature，可用于与该要素相关的信息展示
			this._select.on('select', function(e) {
				// 判断是否选中要素
				if (e.selected.length > 0) {
					// modify.setActive(true);
				}
			});
			// 新建元素编辑组件
			modify = new ol.interaction.Modify({
				features : this._select.getFeatures(),
			})
			if (isNotEmpty(opts.mondifyback)) {
				// 编辑结束，获取坐标信息，对坐标进行保存，与数据库交互，关闭此次编辑状态
				modify.on('modifyend', function(event) {
					var feas = event.features.getArray();
					// 关闭编辑工具
					// modify.setActive(false);
					// 返回编辑的第一个元素
					return opts.mondifyback(feas[0]);
				})
			}
		}
		var arcLayer1 = new ol.layer.Tile({
		    projection:'EPSG:3857',
			source : new ol.source.TileArcGISRest({
				crossOrigin : 'anonymous',
				url : "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer"
			})
		});
		//nucMap.addNucLayer(arcLayer);
		// osm地图
		var osm = new ol.layer.Tile({
			source : new ol.source.OSM()
		});
		// openlayers添加Google在线地图
		var googleMapLayer = new ol.layer.Tile(
				{
					source : new ol.source.XYZ(
							{
								url : 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2sen-US!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
							})
				});
		var googleSatelliteLayer = new ol.layer.Tile({  
	        source: new ol.source.XYZ({  
	            url:'http://mt2.google.cn/vt/lyrs=y&hl=en-US&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'//谷歌卫星地图 混合  
	        }),  
	        projection: 'EPSG:4326'  
	    })  
		var tiandituSatelliteLayer = new ol.layer.Tile({  
		       source: new ol.source.XYZ({  
		           url:'http://t3.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}'//天地图影像  
		       }),  
		       projection: 'EPSG:4326'  
		   }) 
		var arcLayer = new ol.layer.Tile({
		    projection:'EPSG:3857',
			source : new ol.source.TileArcGISRest({
				crossOrigin : 'anonymous',
				url : "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
			})
		});
		var projection = ol.proj.get("EPSG:3857");
		var resolutions = [];
		for (var i = 0; i < 19; i++) {
			resolutions[i] = Math.pow(2, 18 - i);
		}
		bLayer = new ol.layer.Tile({
			source : new ol.source.TileImage({
				crossOrigin : 'anonymous',
				projection : projection,
				tileGrid : new ol.tilegrid.TileGrid({
					origin : [0, 0],
					resolutions : resolutions
				}),
				tileUrlFunction : function(tileCoord, pixelRatio, proj) {
					if (!tileCoord) {
						return "";
					}
					var z = tileCoord[0];
					var x = tileCoord[1];
					var y = tileCoord[2];

					if (x < 0) {
						x = x;
					}
					if (y < 0) {
						y = y;
					}
					return "http://api2.map.bdimg.com/customimage/tile?&x="+x+"&y="+y+"&z="+z+"&udt=20171229&scale=1&ak=1XjLLEhZhQNUzd93EjU5nOGQ&styles=t%3Awater%7Ce%3Aall%7Cc%3A%23044161%2Ct%3Aland%7Ce%3Aall%7Cc%3A%23091934%2Ct%3Aboundary%7Ce%3Ag%7Cc%3A%23064f85%2Ct%3Arailway%7Ce%3Aall%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%7Cc%3A%23004981%2Ct%3Ahighway%7Ce%3Ag.f%7Cv%3Aoff%7Cc%3A%23005b96%7Cl%3A1%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aon%2Ct%3Aarterial%7Ce%3Ag%7Cc%3A%23004981%7Cl%3A-39%2Ct%3Aarterial%7Ce%3Ag.f%7Cc%3A%2300508b%2Ct%3Apoi%7Ce%3Aall%7Cv%3Aoff%2Ct%3Agreen%7Ce%3Aall%7Cv%3Aoff%7Cc%3A%23056197%2Ct%3Asubway%7Ce%3Aall%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Aall%7Cv%3Aoff%2Ct%3Alocal%7Ce%3Aall%7Cv%3Aoff%2Ct%3Aarterial%7Ce%3Al%7Cv%3Aoff%2Ct%3Aboundary%7Ce%3Ag.f%7Cc%3A%23029fd4%2Ct%3Abuilding%7Ce%3Aall%7Cc%3A%231a5787%2Ct%3Alabel%7Ce%3Aall%7Cv%3Aoff%2Ct%3Apoi%7Ce%3Al.t.f%7Cv%3Aoff%7Cc%3A%23ffffff%2Ct%3Apoi%7Ce%3Al.t.s%7Cv%3Aoff%7Cc%3A%231e1c1c%2Ct%3Aadministrative%7Ce%3Al%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al%7Cv%3Aoff";
					//http://api1.map.bdimg.com/customimage/tile?&x=8&y=-1&z=5&udt=20171229&scale=1&ak=1XjLLEhZhQNUzd93EjU5nOGQ&styles=t%3Awater%7Ce%3Aall%7Cc%3A%23044161%2Ct%3Aland%7Ce%3Aall%7Cc%3A%23091934%2Ct%3Aboundary%7Ce%3Ag%7Cc%3A%23064f85%2Ct%3Arailway%7Ce%3Aall%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%7Cc%3A%23004981%2Ct%3Ahighway%7Ce%3Ag.f%7Cv%3Aoff%7Cc%3A%23005b96%7Cl%3A1%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aon%2Ct%3Aarterial%7Ce%3Ag%7Cc%3A%23004981%7Cl%3A-39%2Ct%3Aarterial%7Ce%3Ag.f%7Cc%3A%2300508b%2Ct%3Apoi%7Ce%3Aall%7Cv%3Aoff%2Ct%3Agreen%7Ce%3Aall%7Cv%3Aoff%7Cc%3A%23056197%2Ct%3Asubway%7Ce%3Aall%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Aall%7Cv%3Aoff%2Ct%3Alocal%7Ce%3Aall%7Cv%3Aoff%2Ct%3Aarterial%7Ce%3Al%7Cv%3Aoff%2Ct%3Aboundary%7Ce%3Ag.f%7Cc%3A%23029fd4%2Ct%3Abuilding%7Ce%3Aall%7Cc%3A%231a5787%2Ct%3Alabel%7Ce%3Aall%7Cv%3Aoff%2Ct%3Apoi%7Ce%3Al.t.f%7Cv%3Aoff%7Cc%3A%23ffffff%2Ct%3Apoi%7Ce%3Al.t.s%7Cv%3Aoff%7Cc%3A%231e1c1c%2Ct%3Aadministrative%7Ce%3Al%7Cv%3Aoff%2Ct%3Aroad%7Ce%3Al%7Cv%3Aoff
				//http://api0.map.bdimg.com/customimage/tile?&x=26&y=7&z=7&udt=20171229&scale=1&ak=1XjLLEhZhQNUzd93EjU5nOGQ&styles=t%3Awater%7Ce%3Aall%7Cc%3A%23044161%2Ct%3Aland%7Ce%3Aall%7Cc%3A%23091934%2Ct%3Aboundary%7Ce%3Ag%7Cc%3A%23064f85%2Ct%3Arailway%7Ce%3Aall%7Cv%3Aoff%2Ct%3Ahighway%7Ce%3Ag%7Cv%3Aoff%7Cc%3A%23004981%2Ct%3Ahighway%7Ce%3Ag.f%7Cv%3Aoff%7Cc%3A%23005b96%7Cl%3A1%2Ct%3Ahighway%7Ce%3Al%7Cv%3Aon%2Ct%3Aarterial%7Ce%3Ag%7Cc%3A%23004981%7Cl%3A-39%2Ct%3Aarterial%7Ce%3Ag.f%7Cc%3A%2300508b%2Ct%3Apoi%7Ce%3Aall%7Cv%3Aoff%2Ct%3Agreen%7Ce%3Aall%7Cv%3Aoff%7Cc%3A%23056197%2Ct%3Asubway%7Ce%3Aall%7Cv%3Aoff%2Ct%3Amanmade%7Ce%3Aall%7Cv%3Aoff%2Ct%3Alocal%7Ce%3Aall%7Cv%3Aoff%2Ct%3Aarterial%7Ce%3Al%7Cv%3Aoff%2Ct%3Aboundary%7Ce%3Ag.f%7Cc%3A%23029fd4%2Ct%3Abuilding%7Ce%3Aall%7Cc%3A%231a5787%2Ct%3Apoi%7Ce%3Al.t.f%7Cc%3A%23ffffff%2Ct%3Apoi%7Ce%3Al.t.s%7Cc%3A%231e1c1c%2Ct%3Aroad%7Ce%3Al%7Cv%3Aoff
				}
			})
		});
		 // 地图投影
        var projection = ol.proj.get('EPSG:3857');  
        // 瓦片地址  
       // 瓦片地址格式：http://localhost:6080/arcgis/rest/services/Test/Beijing/MapServer/tile/{z}/{y}/{x}  
        var tileUrl = "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}";  
        // 原点  
        var origin = [-2.0037508342787E7 , 2.0037508342787E7];  
        // 分辨率  
        var resolutions = [  
            156543.03392800014,  
            78271.51696399994,  
            39135.75848200009,  
            19567.87924099992,  
            9783.93962049996,  
            4891.96981024998,  
            2445.98490512499,  
            1222.992452562495,  
            611.4962262813797,  
            305.74811314055756,  
            152.87405657041106,  
            76.43702828507324,  
            38.21851414253662,  
            19.10925707126831,  
            9.554628535634155,  
            4.77731426794937,  
            2.388657133974685,  
            1.654343435,  
            0.85464647468219,  
            0.4411118121060625  
        ];  
        // 地图范围  
        var fullExtent = [-2.00375070672E7,-3.02409719584E7,2.00375070672E7,3.0240971958400004E7];  
        var tileGrid = new ol.tilegrid.TileGrid({  
            tileSize: 256,  
            origin: origin,  
            extent: fullExtent,  
            resolutions: resolutions  
        });  
        // 瓦片数据源  
        var tileArcGISXYZ = new ol.source.XYZ({  
            tileGrid: tileGrid,  
            projection: projection,  
            url: tileUrl,  
        });  
        // 瓦片图层  
        var tileArcGIS = new ol.layer.Tile({  
            source: tileArcGISXYZ  
        });
        var stamenLayer = new ol.layer.Tile({  
	        source: new ol.source.Stamen({  
	            layer: 'watercolor'  
	        })  
	    }); 
        gaodeLayer = new ol.layer.Tile({
			source : new ol.source.XYZ({
				crossOrigin : 'anonymous',
				url : 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=en&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
			})
		});
		this._map = new ol.Map({
			// mouseWheelZoom: false{}
			interactions : ol.interaction.defaults({
				attribution : false
			}).extend([this._select]),
			target : opts.mapId,
			layers : [ bLayer ],
			controls : ol.control.defaults({
				attribution : false
			}).extend([ new ol.control.ScaleLine({
				units : 'degrees'
			}), new ol.control.MousePosition({
				undefinedHTML : 'outside',
				projection : 'EPSG:3857',
				coordinateFormat : function(coordinate) {
					return ol.coordinate.format(coordinate, '{x}, {y}', 4);
				}
			}) ]),
			view : new ol.View({
				// 视图范围，根据墨卡托投影变幻范围
				extent : ismercator ? ol.proj.transformExtent(opts.extent,
						"EPSG:4326", "EPSG:3857") : opts.extent,
				// 坐标系，根据墨卡托投影选择坐标系
				projection : ismercator ? 'EPSG:3857' : 'EPSG:4326',
				// 中心点
				center : ismercator ? ol.proj.fromLonLat([ opts.centerlng,
						opts.centerlat ]) : [ opts.centerlng, opts.centerlat ],// ol.extent.getCenter(opts.extent),
				zoom : opts.zoomlevel,
				minZoom : 1,
				maxZoom : opts.zoomlevel + 20,
				zoomFactor : 1.5
			}),

		});
		// if(window.statusRecord!=''){
		// 	this._map.addInteraction(this._select);
		// 	this._map.addInteraction(modify);
		// }
		window.omap = this._map;
		Omap = this._map;
		// this._map.addControl(new ol.control.Attribution());
		if (opts.isCluster) {
			// 启动ol3选择功能
			var selectStyleFunction = this._selectStyleFunction
			modifySelect = new ol.interaction.Select({
				condition : ol.events.condition.singleClick,
				style : selectStyleFunction
			});
			this._map.addInteraction(modifySelect);
		}
		// 缩放级别是否回调
		if (isNotEmpty(opts.zoomchangeback)) {
			this._map.getView().on('change:resolution', function() {
				opts.zoomchangeback(window.omap.getView().getZoom());
			});// 监听缩放级别
		}
		// 监听缩放级别，根据缩放级别进行其他操作
		if (opts.isZoomchange) {
			// Omap.getView().on('change:resolution',checkZoom);//监听缩放级别
			this._map.on('singleclick', checkZoom)
		}
		// 地图单击事件判断是否选中元素，并可进行回调
		if(window.statusRecord == ''){
			this._map.on('singleclick', function(evt) {
				var pixel = window.omap.getEventPixel(evt.originalEvent);
				var feature = window.omap.forEachFeatureAtPixel(pixel, function(
					feature, layer) {
					return feature;
				});
				if (isNotEmpty(feature) && opts.selectBack != null) {
					var feas = feature.get('features');
					if(isNotEmpty(feas)&&feas.length==1){
						var fea = feature.get('features')[0]
						// 回调函数，返回选中要素
						opts.selectBack(fea.get('attr'));
					}else{
						opts.selectBack(feature.get('attr'));
					}
				}else{
					opts.selectBack(null);
				}
			})
			this._map.on('dblclick', function(evt) {
				var pixel = window.omap.getEventPixel(evt.originalEvent);
				var feature = window.omap.forEachFeatureAtPixel(pixel, function(
					feature, layer) {
					return feature;
				});
				if (isNotEmpty(feature) && opts.dblselectBack != null&&window.statusRecord == '') {
					var feas = feature.get('features');
					if(isNotEmpty(feas)&&feas.length==1){
						var fea = feature.get('features')[0]
						// 回调函数，返回选中要素
						opts.dblselectBack(fea.get('attr'));
					}else{
						opts.dblselectBack(feature.get('attr'));
					}
				}else{
					opts.selectBack(null);
				}
			})
		}

		// 是否开启元素选择图标变化
		if (opts.isFeaChange) {
			this._map.on('singleclick', function(evt) {

				// displayOverLayInfo(pixel);
				if (isNotEmpty(selectFeature)
						&& null !== selectFeature.getStyle().getImage()) {
					selectFeature.setStyle(new ol.style.Style({
						image : new ol.style.Icon(({
							src : selectFeature.getStyle().getImage().getSrc(),
							rotation : 0,
							scale : 1
						}))
					}))
				}
			})

		}
		// hover可实现叠加图标叠加顺序变化
		this._map.on('pointermove', function(evt) {
			if (evt.dragging) {
				return;
			}
			var pixel = Omap.getEventPixel(evt.originalEvent);
			var hit = Omap.hasFeatureAtPixel(pixel);
			if (hit) {
				Omap.getTargetElement().style.cursor = 'pointer';
			} else {
				Omap.getTargetElement().style.cursor = '';
			}
			if (opts.isFeaHover) {
				displayFeatureInfo(pixel);
			}
		});
		// 添加缩放控件
		// this._map.addControl(new ol.control.ZoomSlider());
		return this._map;
	},
	_selectStyleFunction : function(feature) {
		var styles = [ new ol.style.Style({
			image : new ol.style.Circle({
				radius : feature.get('radius'),
				fill : invisibleFill
			})
		}) ];
		var originalFeatures = feature.get('features');
		var originalFeature;
		for (var i = originalFeatures.length - 1; i >= 0; --i) {
			originalFeature = originalFeatures[i];
			styles.push(this.createEarthquakeStyle(originalFeature));
		}
		return styles;
	},
	getRotate: function(px,py, mx,my) {
		//console.log(prePos);console.log(curPos);

		// var me = this;
        //
		// var curPos = window.omap.getPixelFromCoordinate(ol.proj.fromLonLat(curPos1, 'EPSG:3857'));
		// var targetPos = window.omap.getPixelFromCoordinate(ol.proj.fromLonLat(targetPos1, 'EPSG:3857'));
        //
		// curPos = {
		// 	x : curPos[0],
		// 	y : curPos[1]
		// };
		// targetPos = {
		// 	x : targetPos[0],
		// 	y : targetPos[1]
		// }
		var x = Math.abs(px-mx);
		var y = Math.abs(py-my);
		var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
		var cos = y/z;
		var radina = Math.acos(cos);//用反三角函数求弧度
		var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

		if(mx>px&&my>py){//鼠标在第四象限
			angle = 180 - angle;
		}

		if(mx==px&&my>py){//鼠标在y轴负方向上
			angle = 180;
		}

		if(mx>px&&my==py){//鼠标在x轴正方向上
			angle = 90;
		}

		if(mx<px&&my>py){//鼠标在第三象限
			angle = 180+angle;
		}

		if(mx<px&&my==py){//鼠标在x轴负方向
			angle = 270;
		}

		if(mx<px&&my<py){//鼠标在第二象限
			angle = 360 - angle;
		}




		return angle;
		// var x = Math.abs(targetPos.x - curPos.x);
		// var y = Math.abs(targetPos.y - curPos.y);
		// var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
		// var cos = y/z;
		// var radina = Math.acos(cos);//用反三角函数求弧度
		// var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度
		// var z = Math.sqrt(x * x + y * y);
		// //var ration = Math.round((Math.asin(y / z) / Math.PI * 180));
		// var a = 0;
		// if (targetPos.y < curPos.y && targetPos.x == curPos.x) {
		// 	a = 270; // (180 - ration);
		// } else if (targetPos.y > curPos.y && targetPos.x == curPos.x)
		// 	a = 90///ration;
		// else if (targetPos.y == curPos.y && targetPos.x < curPos.x)
		// 	a = 180//(180 - ration);
		// else if (targetPos.y == curPos.y && targetPos.x > curPos.x)
		// 	a = 0//ration;
		// else if (targetPos.y > curPos.y && targetPos.x > curPos.x)
		// 	a = ration;
		// else if (targetPos.y > curPos.y && targetPos.x < curPos.x)
		// 	a = 180 - ration;
		// else if (targetPos.y < curPos.y && targetPos.x < curPos.x)
		// 	a = 90 + ration;
		// else if (targetPos.y < curPos.y && targetPos.x > curPos.x)
		// 	a = 360 - ration;
		// //this._marker.setRotation(a);
		// //console.log(a)
		// return a;

	},
	/**
	 * 根据坐标集合获取范围
	 * 
	 * @param coods
	 *            坐标集合
	 */
	getBoundExtent : function(coods) {
		return ol.extent.boundingExtent(coods);
	},
	/**
	 * 弹性定位
	 * 
	 * @param lng
	 * @param lat
	 */
	elasticTo : function(lnglat) {
		this._map.getView().animate({
			center : ismercator ? ol.proj.fromLonLat(lnglat) : lnglat,
			duration : 2000,
			easing : elastic
		});
	},

	/**
	 * 跳跃定位
	 * 
	 * @param lng
	 * @param lat
	 */
	bounceTo : function(lnglat) {
		this._map.getView().animate({
			center : ismercator ? ol.proj.fromLonLat(lnglat) : lnglat,
			duration : 2000,
			easing : bounce
		});
	},

	/**
	 * 旋转定位
	 * 
	 * @param lng
	 * @param lat
	 */
	spinTo : function(lnglat) {
		var center = this._map.getView().getCenter();
		this._map.getView().animate(
				{
					center : [ center[0] + (lnglat[0] - center[0]) / 2,
							center[1] + (lnglat[1] - center[1]) / 2 ],
					rotation : Math.PI,
					easing : ol.easing.easeIn
				}, {
					center : lnglat,
					rotation : 2 * Math.PI,
					easing : ol.easing.easeOut
				});
	},
	/**
	 * 视图自适应
	 * 
	 * @param _opts
	 */
	fitView : function(_opts) {
		var opts = {
			// 自适应范围
			extent : [ -180, -90, 180, 90 ],
			// 地图的尺寸
			size : 10,
			// 过渡时间
			duration : 2000,
			// 边缘距离
			padding : [ 0, 0, 0, 0 ],
			constrainResolution : false
		}
		$.extend(opts, _opts);
		var extentTransfer;
		// 若显示墨卡托投影 范围需转换
		if (ismercator) {
			extentTransfer = ol.proj.transformExtent(opts.extent, "EPSG:4326",
					"EPSG:3857")
		} else {
			extentTransfer = opts.extent;
		}
		this._map.getView().fit(extentTransfer, {
			maxZoom : opts.maxZoom,
			size : this._map.getSize(),
			duration : opts.duration,
			padding : opts.padding,
			constrainResolution : opts.constrainResolution
		});
	},
	/**
	 * 删除所有图层
	 */
	removeAllLayers : function() {
		var layers = this._map.getLayers();
		$.each(layers.getArray(), function(index, layer) {
			window.omap.removeLayer(layer);
		})
	},
	/**
	 * 删除图层
	 * 
	 * @param layer
	 */
	removeNucLayer : function(layer) {
		this._map.removeLayer(layer);
	},
	/**
	 * 设置图层显隐
	 */
	setNucVisible : function(layer, flag) {
		layer.setVisible(flag);
	},
	/**
	 * 获取缩放级别
	 */
	getZoomLevel : function() {
		return this._map.getView().getZoom();
	},
	/**
	 * 设置缩放级别
	 */
	setZoomLevel : function(zoomLevel) {
		this._map.getView().setZoom(zoomLevel);
	},
	/**
	 * 给map添加事件并返回回调函数
	 * 
	 * @param event
	 * @param callback
	 */
	addNucEvent : function(evt, callback) {
		this._map.on(evt, callback(this._map));// 监听缩放级别
	},

	/**
	 * 定位
	 * 
	 * @param coords|Array
	 */
	setCenter : function(coords) {
		try {
			coords = ismercator ? ol.proj.fromLonLat(coords) : coords,
					this._map.getView().setCenter(coords);
		} catch (err) {
			alert(err.description)
		}
	},
	/**
	 * 缩放级别
	 * 
	 * @param coords|number
	 */
	setView : function(zoom) {
		try {
			this._map.getView().setZoom(zoom);
		} catch (err) {
			alert(err.description)
		}
	},
	/**
	 * 创建地图修改组件
	 */
	createNucModify : function(_opts) {
		var opts = {
			features : [],
			layers : []
		};
		$.extend(opts, _opts);
		try {
			var select = new ol.interaction.Select({
				condition : ol.events.condition.singleClick,
				features : opts.features
			});
			select.setMap(this._map);
			var modify = new ol.interaction.Modify({
				features : select.getFeatures(),
			})
			modify.setActive(true);
			return modify;
		} catch (err) {
			console.log(err);
		}
	},
	/**
	 * 创建画图工具
	 * 
	 * @param type
	 *            //Point Polygon Circle LineString none
	 */
	createDrawTool : function(_opts) {
		var opts = {
			type : "Point",
			style : ol.style.Style({
				image : new ol.style.Circle({
					radius : 5,
					fill : new ol.style.Fill({
						color : [ 0, 0, 255, 0.6 ]
					})
				})
			}),
			callback : null
		};
		$.extend(opts, _opts);
		var typeArr = [ "Point", "Polygon", "Circle", "LineString" ];
		// 每次绘制之前
		this._map.removeInteraction(draw);
		if (!(typeArr.indexOf(opts.type) >= 0))
			return;
		// 矢量图层资源集合
		var source = new ol.source.Vector({
			wrapX : false
		});
		// 矢量图层 用于添加绘制的元素
		var vector = new ol.layer.Vector({
			source : source
		});
		// 地图添加该图层
		this._map.addLayer(vector);
		draw = new ol.interaction.Draw({
			source : source,
			type : opts.type,
			/** @type {ol.geom.GeometryType} */
			style : opts.style
		});
		this._map.addInteraction(draw);
		// 若需要回调函数
		if (opts.callback) {
			draw.on('drawend', function(event) {
				opts.callback(event.feature);
			});
		}
	},
	/**
	 * 飞向
	 * 
	 * @param location
	 * @param done
	 */
	flyTo : function(location, done) {
		var duration = 1000;
		var zoom = this._map.getView().getZoom();
		var parts = 2;
		var called = false;
		function callback(complete) {
			--parts;
			if (called) {
				return;
			}
			if (parts === 0 || !complete) {
				called = true;
				done(complete);
			}
		}
		this._map.getView().animate({
			center : location,
			duration : duration
		}, callback);
		this._map.getView().animate({
			zoom : zoom - 1,
			duration : duration / 2
		}, {
			zoom : zoom,
			duration : duration / 2
		}, callback);
	},

	/**
	 * 获取加载图片底图的范围
	 * 
	 * @param image
	 * @returns {*[]}
	 */
	getExtendFromImg : function(image) {
		var sizeRatio = image.width / image.height;
		var boundheight = 6;
		var boundwidth = 6 * sizeRatio;
		var extend = [ 0, 0, boundwidth, boundheight ];
		return extend;
	},
	/**
	 * 创建图片底图
	 * 
	 * @param _opts
	 */
	createImageLayer : function(_opts) {
		var opts = {
			imageExtent : [ -180, -90, 180, 90 ]
		}
		$.extend(opts, _opts);
		var imageLayer = new ol.layer.Image({
			source : new ol.source.ImageStatic({
				url : opts.url,
				// projection: opts.projection,
				imageExtent : ismercator ? ol.proj.transformExtent(
						opts.imageExtent, "EPSG:4326", "EPSG:3857")
						: opts.imageExtent,
			})
		})
		this._map.addLayer(imageLayer);
		return imageLayer;
	},
	/**
	 * 获取图层范围
	 */
	getLayerExtent : function(layer) {
		if (isNotEmpty(layer)) {
			return layer.getExtent();
		}
	},
	/**
	 * 创建离线图层
	 * 
	 * @param options
	 * @returns {ol.layer.Tile}
	 */
	createOffLineLayer : function(options) {
		var layer = new ol.layer.Tile({
			// extent: ol.proj.transformExtent(options.mapExtent,
			// "EPSG:4326", "EPSG:3857"),
			source : new ol.source.XYZ({
				attributions : [ options.attribution ],
				url : options.url,
				tilePixelRatio : options.tilePixelRatio, // THIS IS IMPORTANT
				minZoom : options.mapMinZoom,
				maxZoom : options.mapMaxZoom
			})
		});
		this._map.addLayer(layer);
		return layer;
	},
	/**
	 * 创建图层
	 * 
	 * @returns {ol.layer.Vector}
	 */
	createNucLayer : function() {
		var layer = new ol.layer.Vector();
		this._map.addLayer(layer);
		return layer;
	},
	/**
	 * 删除a元素
	 * 
	 * @param layer
	 * @param feature
	 */
	removeFeature : function(feature, layer) {
		if (layer.getSource().getFeatures().length > 0) {
			layer.getSource().removeFeature(feature);
		}
	},
	/**
	 * 清除图层上的所有marker
	 * 
	 * @param layer
	 */
	clearLayerMarkers : function(layer) {
		if (layer.getSource()) {
			var fs = layer.getSource().getFeatures();
			for (var i = 0; i < fs.length; i++) {
				if (fs[i]) {
					layer.getSource().removeFeature(fs[i]);
				}
			}
		}
	},
	/**
	 * 图层中添加元素
	 * 
	 * @param features
	 * @param nuclayer
	 */
	addFeatures2Layer : function(features, nuclayer) {
		var featureArr = new Array();
		if (Object.prototype.toString.call(features) === '[object Array]') {
			featureArr = features;
		} else {
			featureArr.push(features);
		}
		if (null == nuclayer.getSource()) {
			nuclayer.setSource(new ol.source.Vector({
				features : featureArr
			}))
		} else {
			nuclayer.getSource().addFeatures(featureArr);
		}
	},
	/**
	 * 创建元素类型
	 * 
	 * @param _opts
	 */
	createMarkerStyle : function(_opts) {
		var opts = {
			src : 'css/default/images/alarm.gif',
			rotation : 0,
			scale : 1,
			align : 'center',// 文字位置Text alignment. Possible values: 'left',
			baseline : 'middle',// Possible values: 'bottom', 'top', 'middle',
			font : '12px serif',// Font style as CSS 'font' value
			text : '',// 文字内容
			fillColor : '#004198',// '#004198',//文字颜色
			strokeColor : '#fff',// 文字边界颜色
			strokeWidth : 0,// 文字边界宽度
			offsetX : -10,// 水平方向文字偏移 Horizontal text offset in pixels. A
			offsetY : 15, // 竖向文字偏移 Vertical text offset in pixels. A positive
			rotation : 0
		}
		$.extend(opts, _opts);
		var txtStyle = new ol.style.Text({
			textAlign : opts.align,
			textBaseline : opts.baseline,
			font : opts.font,
			text : opts.text,
			fill : new ol.style.Fill({
				color : opts.fillColor
			}),
			stroke : new ol.style.Stroke({
				color : opts.strokeColor,
				width : opts.strokeWidth
			}),
			offsetX : opts.offsetX,
			offsetY : opts.offsetY,
			rotation : opts.rotation
		});
		// 创建点图层样式
		var iconStyle = new ol.style.Style({
			image : new ol.style.Icon(({
				src : opts.src,
				rotation : opts.rotate,
				scale : opts.scale
			})),
			text : txtStyle
		});
		return iconStyle;
	},
	/**
	 * 创建线样式
	 * 
	 * @param _opts
	 */
	createLineStyle : function(_opts) {
		var opts = {
			fillcolor : "#00ff00",
			strokecolor : "rgba(0, 255, 0, 0.4)",
			strokewidth : 2
		}
		$.extend(opts, _opts);
		return new ol.style.Style({
			fill : new ol.style.Fill({
				color : opts.fillcolor
			}),
			stroke : new ol.style.Stroke({
				color : opts.strokecolor,
				width : opts.strokewidth
			})
		});

	},
	/**
	 * 创建多边形样式
	 * 
	 * @param _opts
	 */
	createPolygonStyle : function(_opts) {
		var opts = {
			fillcolor : "rgba(255,255,255,0.3)",
			strokecolor : "#ffcc33",
			strokewidth : 2
		}
		$.extend(opts, _opts);
		return new ol.style.Style({
			fill : new ol.style.Fill({
				color : opts.fillcolor
			}),
			stroke : new ol.style.Stroke({
				color : opts.strokecolor,
				width : opts.strokewidth
			}),
			image : new ol.style.Circle({
				radius : 7,
				fill : new ol.style.Fill({
					color : '#ffcc33'
				}),
			}),
		});

	},
	/**
	 * 元素赋样式
	 * 
	 * @param style
	 * @param feature
	 */
	setStyle2Feature : function(style, feature) {
		feature.setStyle(style);
	},
	/**
	 * 创建圆
	 * 
	 * @param centerlng中心点经度
	 * @param centerlat
	 *            中心点纬度
	 * @param radius
	 *            半径
	 */
	createCircle : function(centerlng, centerlat, radius) {
		if (isNotEmpty(centerlng) && isNotEmpty(centerlat)) {
			// var circlegeo = new ol.geom.Circle([centerlng,centerlat],radius);
			var wgs84Sphere = new ol.Sphere(6378137);
			var center = ismercator ? ol.proj
					.fromLonLat([ centerlng, centerlat ]) : [ centerlng,
					centerlat ];
			var circle = new ol.geom.Circle(ol.proj.transform([ centerlng,
					centerlat ], 'EPSG:4326', 'EPSG:3857'), radius, 'XY')

			var circularPolygon = ol.geom.Polygon.circular(wgs84Sphere, center,
					radius, 64);
			return new ol.Feature({
				geometry : circle
			})
		}
	},
	/**
	 * 创建覆盖物
	 * 
	 * @param _opts
	 * @returns {ol.Overlay}
	 */
	createOverlay : function(_opts) {
		var opts = {
			positioning : 'center-center',
			domId : 'domId'
		}
		$.extend(opts, _opts);
		var overlay = new ol.Overlay({
			element : document.getElementById(opts.domId),
			positioning : opts.positioning
		});
		overlay.setMap(this._map);
		return overlay;
	},
	/**
	 * 隐藏overlay
	 */
	removeOverlays : function(overlays) {
		for (var int = 0; int < overlays.length; int++) {
			overlays[int].setPosition(null);
		}
	},
	/**
	 * 覆盖物位置变化
	 */
	setOverlaysPostion : function(overlay, lng, lat) {
		var position = ismercator ? ol.proj.fromLonLat([ lng, lat ]) : [ lng,
				lat ]
		overlay.setPosition(position);
	},
	/**
	 * marker点设置新位置
	 * 
	 * @param feature
	 *            元素
	 * @param longitude
	 *            经度
	 * @param latitude
	 *            纬度
	 */
	setMarkerPositon : function(feature, longitude, latitude) {
		var position = ismercator ? ol.proj.fromLonLat([ lng, lat ]) : [ lng,
				lat ]
		feature.setGeometry(new ol.geom.Point(position));
	},
	/**
	 * 改变选中元素样式
	 * 
	 * @param feature
	 * @param _opts
	 */
	changeFeature : function(feature, _opts) {
		if (null != this._selectFea && typeof (this._selectFea) != 'undefined') {
			this._selectFea.setStyle(this.createMarkerStyle({
				rotation : 0,
				scale : 1,
				src : this._selectFea.getStyle().getImage().getSrc()
			}));
		}
		if (feature.length > 0) {
			for (var i = 0; i < feature.length; i++) {
				var fea = feature[i];
				this._selectFea = fea;
				selectFeature = this._selectFea;
				var opts = {
					rotation : 0,
					scale : 1.5,
					src : fea.getStyle().getImage().getSrc()
				};
				$.extend(opts, _opts);
				var style = this.createMarkerStyle(opts);
				fea.setStyle(style);
			}
		}
	},
	/**
	 * 获取图层所有元素
	 */
	getFeatures : function(layer) {
		if (layer) {
			return layer.getSource().getFeatures();
		}
	},
	/**
	 * 获取元素属性
	 * 
	 * @param feature
	 */
	getFeatureAttr : function(feature) {
		if (feature) {
			// 'attr'为根据实际情况
			return feature.get('attr');
		}
	},
	/**
	 * 获取元素坐标集合 fea 元素
	 */
	getCoodsByFeature : function(fea) {
		var coods = [];
		if (!isNotEmpty(fea))
			return coods;
		// 根据元素类型判断
		if (fea.getGeometry().getType() == "Point") {
			// 返回点的坐标
			coods = ol.proj.toLonLat(fea.getGeometry().getCoordinates());
			// 线元素
		} else if (fea.getGeometry().getType() == "LineString") {
			$.each(fea.getGeometry().getCoordinates(), function(index,
					coodinate) {
				coods.push(ol.proj.toLonLat(coodinate));
			});
			// 多边形元素
		} else if (fea.getGeometry().getType() == "Polygon") {
			// 多边形有可能会有很多块组成 首先遍历循环多边形个数
			$.each(fea.getGeometry().getCoordinates(), function(index,
					coodinate) {
				// 然后遍历循环每个多边形的元素集合
				$.each(coodinate, function(index, cood) {
					coods.push(ol.proj.toLonLat(cood));
				});
			});
		}
		// 圆
		else if (fea.getGeometry().getType() == "Circle") {
			// 圆相对特殊 获取的是中心点和半径
			coods = ol.proj.toLonLat(fea.getGeometry().getCenter());
			var radius = fea.getGeometry().getRadius();
		}
		return coods;
	},
	/**
	 * 添加图层（离线||在线）
	 * 
	 * @param layer
	 */
	addNucLayer : function(layer) {
		this._map.addLayer(layer);
	},
	/**
	 * 创建gifmarker
	 * 
	 * @param _opts
	 */
	createGifMarker : function(_opts) {
		var opts = {
			src : 'css/default/images/alarm.gif',
			rotation : 0,
			scale : 1,
			dom : "<div id = 'uuid' class = 'omarker'></div>"
		}
		$.extend(opts, _opts);
		$("#omap").after(opts.dom);
		var overlay = new ol.Overlay({
			// 给每一个overlay赋值dom元素
			element : document.getElementById(opts.domId),
			positioning : "center-center"
		});
		// 给dom元素附属性
		if (opts.attr) {
			overlay.set('attr', opts.attr);
		}
		overlay.setMap(this._map);
		var position = ismercator ? ol.proj.fromLonLat([ opts.lng, opts.lat ])
				: [ opts.lng, opts.lat ]
		overlay.setPosition(position);
		$(("#" + opts.domId)).on('click', function(evt) {
			var overs = window.omap.getOverlays().getArray();
			var coordinate = window.omap.getEventCoordinate(evt);
			opts.callback(overlay);
		})
		return overlay;

	},
	/**
	 * 创建marker点
	 * 
	 * @param _opts
	 * @returns
	 */
	createMarker : function(_opts) {
		var opts = {
			src : 'css/default/images/alarm.gif',
			rotation : 0,
			scale : 1
		}
		$.extend(opts, _opts);
		var iconStyle = this.createMarkerStyle(opts);
		var iconFeature = new ol.Feature({
			geometry : ismercator ? new ol.geom.Point(ol.proj.fromLonLat([
					opts.lng, opts.lat ])) : new ol.geom.Point([ opts.lng,
					opts.lat ]),
		});
		if (opts.attr) {
			iconFeature.set('attr', opts.attr);
		}
		iconFeature.setStyle(iconStyle);
		return iconFeature;
	},
	/**
	 * 创建线元素
	 * 
	 * @param _opts
	 * @returns {gr.http://www.opengis.net/wfs.Feature}
	 */
	createNucline : function(_opts) {
		var opts = {
			// 线坐标集合默认值
			paths : [],
			// 填充颜色 暂时没用
			fillcolor : "#00ff00",
			// 边界颜色默认值
			strokecolor : "rgba(0, 255, 0, 0.4)",
			// 边界宽度默认值
			strokewidth : 2
		}
		$.extend(opts, _opts);
		var paths = [];
		// 若为墨卡托投影 需要转换
		if (ismercator) {
			$.each(opts.paths, function(index, value) {
				paths.push(ol.proj.fromLonLat([ value.lng, value.lat ]));
			})
		} else {
			$.each(opts.paths, function(index, value) {
				paths.push([ value.lng, value.lat ]);
			})
			//paths = opts.paths;
		}
		var featureLine1 = new ol.Feature({
			geometry : new ol.geom.LineString(paths),
		});
		if (opts.attr) {
			featureLine1.set('attr', opts.attr);
		}
		// 创建线样式
		var lineStyle = this.createLineStyle(opts);
		featureLine1.setStyle(lineStyle);
		return featureLine1;
	},
	/**
	 * 创建多边形
	 */
	createNucPolygon : function(_opts) {
		var opts = {
			// 多边形坐标集合
			paths : [],
			// 填充颜色默认值
			fillcolor : "#00ff00",
			// 边框颜色默认值
			strokecolor : "rgba(0, 255, 0, 0.4)",
			// 边框宽度默认值
			strokewidth : 2
		}
		$.extend(opts, _opts);
		var paths = [];
		var polygon;
		$.each(opts.paths, function(index, value) {
			paths.push([ value.lng, value.lat ]);
		})
		// 若为墨卡托投影 需要转换
		if (ismercator) {
			polygon = new ol.Feature({
				geometry : new ol.geom.Polygon([ paths ]).transform(
						'EPSG:4326', 'EPSG:3857'),
			});
		} else {
			polygon = new ol.Feature({
				geometry : new ol.geom.Polygon([ paths ])
			});
		}
		if (opts.attr) {
			polygon.set('attr', opts.attr);
		}
		// 创建多边形样式
		var Style = this.createPolygonStyle(opts);
		polygon.setStyle(Style);
		return polygon;
	},
	/**
	 * 创建待处理事件个数显示
	 * @param _opts
	 */
	createCircleFeature:function(_opts) {
		var opts = {
			src: 'css/default/images/alarm.gif',
			rotation: 0,
			scale: 1,
			fillStyle:'rgba(250,233,0,0.5)'
		}
		$.extend(opts, _opts);
		var style = new ol.style.Style({
			image: new ol.style.Circle({
				radius: opts.radius||5,
				fill: new ol.style.Fill({
					color: opts.fillStyle
				})
			}),
			text: new ol.style.Text({
				text: opts.text+"",
				fill: new ol.style.Fill({
					color: '#004198'
				}),
				stroke: new ol.style.Stroke({
					color: '#ffffff',
					width: 0
				}),
				offsetX: 5,
				offsetY: 20,
				font: '12px serif',// Font style as CSS 'font' value
			})

		});
		var iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([opts.lng , opts.lat])),
		});
		if (opts.attr) {
			iconFeature.set('attr', opts.attr);
		}
		iconFeature.setStyle(style);
		return iconFeature;
	},
	createCircleStyle:function(_opts) {
		var opts = {
			src: 'css/default/images/alarm.gif',
			rotation: 0,
			scale: 1,
			fillStyle:'rgba(250,233,0,0.5)'
		}
		$.extend(opts, _opts);
		var style = new ol.style.Style({
			image: new ol.style.Circle({
				radius: opts.radius||5,
				fill: new ol.style.Fill({
					color: opts.fillStyle
				})
			}),
			text: new ol.style.Text({
				text: opts.text+"",
				fill: new ol.style.Fill({
					color: '#004198'
				}),
				stroke: new ol.style.Stroke({
					color: '#ffffff',
					width: 0
				}),
				offsetX: 5,
				offsetY: 20,
				font: '12px serif',// Font style as CSS 'font' value
			})

		});

		return style;
	},
	/**
	 * 创建文字样式
	 * 
	 * @param _opts
	 * @returns {xj}
	 */
	createTextStyle : function(_opts) {
		var opts = {
			align : 'center',// 文字位置Text alignment. Possible values: 'left',
			// 'right', 'center', 'end' or 'start'. Default is
			// 'start'.
			baseline : 'middle',// Possible values: 'bottom', 'top', 'middle',
			// 'alphabetic', 'hanging', 'ideographic'.
			// Default is 'alphabetic'.
			font : '16px serif',// Font style as CSS 'font' value
			text : 'undefined',// 文字内容
			fillColor : '#004198',// '#004198',//文字颜色
			strokeColor : '#fff',// 文字边界颜色
			strokeWidth : 0,// 文字边界宽度
			offsetX : -10,// 水平方向文字偏移 Horizontal text offset in pixels. A
			// positive will shift the text right. Default is 0.
			offsetY : 15, // 竖向文字偏移 Vertical text offset in pixels. A positive
			// will shift the text down. Default is 0.
			rotation : 0
		// 旋转角度 Rotation in radians (positive rotation clockwise). Default is 0.
		};
		$.extend(opts, _opts);
		return new ol.style.Text({
			textAlign : opts.align,
			textBaseline : opts.baseline,
			font : opts.font,
			text : opts.text,
			fill : new ol.style.Fill({
				color : opts.fillColor
			}),
			stroke : new ol.style.Stroke({
				color : opts.strokeColor,
				width : opts.strokeWidth
			}),
			offsetX : opts.offsetX,
			offsetY : opts.offsetY,
			rotation : opts.rotation
		});
	},
	/**
	 * 创建弹出框
	 * 
	 * @param _opts
	 */
	createPopup : function(_opts) {
		var opts = {
			autoPanAnimation : 250, // 自动偏移时间
			positioning : 'center-center',// 显示位置
			domId : 'domId',// 弹出框div的id
			closedomId : 'closedomId' // 弹出框关闭按钮
		}
		$.extend(opts, _opts);
		var pop_container = document.getElementById(opts.domId);
		var pop_closer = document.getElementById(opts.closedomId);
		var overlay = new ol.Overlay({
			element : pop_container,
			autoPan : true,
			autoPanAnimation : {
				duration : opts.autoPanAnimation
			}
		});
		pop_closer.onclick = function() {
			overlay.setPosition(undefined);
			pop_closer.blur();
			return false;
		};
		this._map.addOverlay(overlay);
		return overlay;

	}

}


// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
	return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3)
			+ 1;
}
// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
	var s = 7.5625, p = 2.75, l;
	if (t < (1 / p)) {
		l = s * t * t;
	} else {
		if (t < (2 / p)) {
			t -= (1.5 / p);
			l = s * t * t + 0.75;
		} else {
			if (t < (2.5 / p)) {
				t -= (2.25 / p);
				l = s * t * t + 0.9375;
			} else {
				t -= (2.625 / p);
				l = s * t * t + 0.984375;
			}
		}
	}
	return l;
}
/**
 * 改变选中元素大小
 * 
 * @param feature
 */
//function selectStyleFunction(feature) {
//	var styles = [ new ol.style.Style({
//		image : new ol.style.Circle({
//			radius : feature.get('radius'),
//			fill : invisibleFill
//		})
//	}) ];
//	var originalFeatures = feature.get('features');
//	var originalFeature;
//	for (var i = originalFeatures.length - 1; i >= 0; --i) {
//		originalFeature = originalFeatures[i];
//		styles.push(this.createEarthquakeStyle(originalFeature));
//	}
//	return styles;
//}

/**
 *模拟唯一标识符
 */
function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
/**
 * 判断参数是否为空
 *
 * @param ex
 */
function isNotEmpty(exp) {
	if (exp && typeof (exp) != "undefined" && exp != '') {
		return true;
	}
	return false;
}