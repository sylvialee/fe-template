/**
 * Created by liqingxian on 2017/8/3.
 */
var nucMap = new NucMap();
var earthquakeFill = new ol.style.Fill({
    color : 'rgba(255, 153, 0, 0.8)'
});
var earthquakeStroke = new ol.style.Stroke({
    color : 'rgba(255, 204, 0, 0.2)',
    width : 1
});
var textFill = new ol.style.Fill({
    color : '#fff'
});
var textStroke = new ol.style.Stroke({
    color : 'rgba(0, 0, 0, 0.6)',
    width : 3
});
var invisibleFill = new ol.style.Fill({
    color : 'rgba(255, 255, 255, 0.01)'
});
var _nucvector = null;
//�ۺ� ����ʵ�ֵ��ӵ�ͼͳ��
var NucCluster = function(feasArr) {
    this._features = null;
    this._source = null;
    this._maxFeatureCount = 0;
    this._currentResolution = 0;

    this.cluster(feasArr);
}

NucCluster.prototype = {
    /**
     * ͨ������ִ�оۺ�
     */
    cluster : function(feasArr) {
        var count = 100;
        this._features = new Array(count);
      
        for (var i = 0; i < feasArr.length; ++i) {
        	var coordinates = ismercator? ol.proj.fromLonLat([feasArr[i].geometry.coordinates[0], feasArr[i].geometry.coordinates[1]]):[feasArr[i].geometry.coordinates[0], feasArr[i].geometry.coordinates[1]];
            this._features[i] = new ol.Feature(new ol.geom.Point(coordinates));
            this._features[i].set('attr',feasArr[i])
        }
        
        source = new ol.source.Vector({
            features : this._features
        });

        clusterSource = new ol.source.Cluster({
            distance : 60,
            source : source
        });

        _nucvector = new ol.layer.Vector({
            source : clusterSource,
            style : this.styleFunction
        });
        window.omap.addLayer(_nucvector);
    },

    /**
     * ���ۺ�Ԫ�ظ���ʽ
     * @param feature
     * @param resolution
     * @returns {*}
     */
    styleFunction : function(feature, resolution) {
        if (resolution != this._currentResolution) {
            this.calculateClusterInfo(resolution);
            this._currentResolution = resolution;
        }
        var attr = feature.get('attr')
        var fillStyle
        if(attr){
            if(attr.devicetype==1) fillStyle = 'rgba(255, 50, 50, 0.6)';
            if(attr.devicetype==2) fillStyle = 'rgba(5, 250, 50, 0.6)';
            if(attr.devicetype==3) fillStyle = 'rgba(5, 50, 250, 0.6)';
            if(attr.devicetype==4) fillStyle = 'rgba(255, 250, 10, 0.5)';
        }
        var style;
        var size = feature.get('features').length;
        if (size > 1) {
            var iconsrc
            if (size>=20) iconsrc = "images/m5.png"
            if (size>=16&&size<20) iconsrc = "images/m4.png"
            if (size>=10&&size<16) iconsrc = "images/m3.png"
            if (size>4&&size<10) iconsrc = "images/m2.png"
            if (size<=4) iconsrc = "images/m1.png"
            style = new ol.style.Style(
                {
                    image :
                        /*new ol.style.Circle(
                     {
                     radius : 6,
                     fill : new ol.style.Fill(
                     {
                        color : fillStyle
                     })
                     }),*/
                       new ol.style.Icon(({
                            src : iconsrc,
                            rotation : 0,
                            scale : 1
                        })
                        ),
                    text : new ol.style.Text({
                        text : size.toString(),
                        fill : textFill,
                        stroke : textStroke
                    })
                });
        } else {
            var originalFeature = feature.get('features')[0];
            style = this.createEarthquakeStyle(originalFeature);
        }
        return style;
    }
//    selectStyleFunction : function(feature) {
//        var styles = [ new ol.style.Style({
//            image : new ol.style.Circle({
//                radius : feature.get('radius'),
//                fill : invisibleFill
//            })
//        }) ];
//        var originalFeatures = feature.get('features');
//        var originalFeature;
//        for (var i = originalFeatures.length - 1; i >= 0; --i) {
//            originalFeature = originalFeatures[i];
//            styles.push(this.createEarthquakeStyle(originalFeature));
//        }
//        return styles;
//    }
}

/**
 * ���ݷֱ��ʼ���ۺϷ�Χ
 * @param resolution
 */
function calculateClusterInfo(resolution) {
    this._maxFeatureCount = 0;
    var features = this._nucvector.getSource().getFeatures();
    var feature, radius;
    for (var i = features.length - 1; i >= 0; --i) {
        feature = features[i];
        var originalFeatures = feature.get('features');
        var extent = ol.extent.createEmpty();
        var j, jj;
        for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
            ol.extent.extend(extent, originalFeatures[j].getGeometry()
                .getExtent());
        }
        this._maxFeatureCount = Math.max(this._maxFeatureCount, jj);
        radius = 0.25
            * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent))
            / resolution;
        feature.set('radius', radius);
    }
}
/**
 * ÿ��Ԫ�ظ���ʽ
 * @param feature
 * @returns {*|c|e}
 */
function createEarthquakeStyle(feature) {
//    var name = 'name';
//    var magnitude = parseFloat(Math.random() * 7);
//    var radius = 17;
//
//    return new ol.style.Style({
//        geometry : feature.getGeometry(),
//        image : new ol.style.RegularShape({
//            radius1 : radius,
//            radius2 : 3,
//            points : 5,
//            angle : Math.PI,
//            fill : earthquakeFill,
//            stroke : earthquakeStroke
//        })
//    });
//     var opts = {
//             src: 'images/mt-PACKAGE.gif',
//             rotation: 0,
//             scale: 1,
//             align: 'center',// 文字位置Text alignment. Possible values: 'left',
//             baseline: 'middle',// Possible values: 'bottom', 'top', 'middle',
//             font: '16px serif',// Font style as CSS 'font' value
//             text: 'cluster',// 文字内容
//             fillColor: '#004198',// '#004198',//文字颜色
//             strokeColor: '#fff',// 文字边界颜色
//             strokeWidth: 0,// 文字边界宽度
//             offsetX: -10,// 水平方向文字偏移 Horizontal text offset in pixels. A
//             offsetY: 15, // 竖向文字偏移 Vertical text offset in pixels. A positive
//             rotation: 0
//         }
    var attr = feature.get('attr')
    var fillStyle
    if(attr){
        if(attr.devicetype==1) fillStyle = 'rgba(255, 50, 50, 0.6)';
        if(attr.devicetype==2) fillStyle = 'rgba(5, 250, 50, 0.6)';
        if(attr.devicetype==3) fillStyle = 'rgba(5, 50, 250, 0.6)';
        if(attr.devicetype==4) fillStyle = 'rgba(255, 250, 10, 0.5)';
    }
    var opts = {
        src: 'css/default/images/alarm.gif',
        rotation: 0,
        scale: 1,
        fillStyle:attr.fillStyle,
        lng: attr.geometry.coordinates[0],
        lat: attr.geometry.coordinates[1],
        attr: attr,
        text: "",
        radius : 6,
        offsetX: 5,
        offsetY: 20
    }
    var iconStyle = nucMap.createCircleStyle(opts)
    //this._nucmap.addFeatures2Layer(marker, nucLayer);
  // var iconStyle =  nucMap.createMarkerStyle(opts);
    iconStyle.setGeometry(feature.getGeometry());
    return iconStyle;
}
