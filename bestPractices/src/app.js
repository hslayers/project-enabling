'use strict';
import 'toolbar.module';
import 'compositions.module';
import 'core.module';
import 'feature-filter.module';
import 'layermanager.module';
import 'legend.module';
import 'map.module';
import 'measure.module';
import 'permalink.module';
import 'print.module';
import 'query.module';
import 'search.module';
import 'angular-material';
import { Vector, Tile } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Style, Icon } from 'ol/style';
import { transform } from 'ol/proj';
import View from 'ol/View';

var module = angular.module('hs', [
	'hs.toolbar',
	'hs.layermanager',
	'hs.map',
	'hs.query',
	'hs.search', 'hs.print', 'hs.permalink', 'hs.measure',
	'hs.legend', 'hs.geolocation', 'hs.core',
	'gettext',
	'hs.compositions',
	'hs.featureFilter',
	'ngMaterial'
])

.config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('brown', {
			'default': '700',
			'hue-1': '400'
		})
		.accentPalette('brown')
});

module.directive('hs', function(HsMapService, HsCore) {
	'ngInject';
	return {
        template: HsCore.hslayersNgTemplate,
		link: function(scope, element) {
			HsCore.fullScreenMap(element);
		}
	};
});

var caturl = "/php/metadata/csw/index.php";

module.value('HsConfig', {
	design: 'md',
	query: {
		multi: true
	},
	queryPoint: 'hidden',
	sidenav_template: "sidenav.html",
	overlay_template: "overlay.html",
	toolbar_template: "toolbar.html",
	// infopanel_template: "satelliteMetadataQuery.html",
	help_template: "help.html",
	acknowledgement_template: "acknowledgement.html",
	default_layers: [
		new Tile({
			source: new XYZ({
				attributions: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
				url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en'
			}),
			title: "Base layer",
			base: true
		}),
		new Vector({
			title: "Farming Best Practices",
			source: new VectorSource({
				format: new GeoJSON(),
				url: 'https://db.atlasbestpractices.com/project-geo-json/2/',
			}),
			style: new Style({
				image: new Icon(({
					crossOrigin: 'anonymous',
					src: 'enabling_logo_2_relief12_stin.png',
					anchor: [0.5, 0.5],
					scale: 0.5,
				}))
			}),
			featureURI: 'bp_uri',
			hsFilters: [
				{
					title: "Country",
					valueField: "SU_A3",
					type: {
						type: "fieldset",
					},
					selected: undefined,
					values: [],
					// values: ["CZ", "DE", "NL"],
					gatherValues: true
				},
				// {
				//     title: "Practice type",
				//     valueField: "type",
				//     type: {
				//         type: "fieldset",
				//     },
				//     selected: undefined,
				//     values: [],
				//     gatherValues: true
				// }
			]
		})
	],
	//project_name: 'hslayers',
	project_name: 'Material',
	default_view: new View({
		center: transform([8.3927408, 46.9205358], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude    to Spherical Mercator
		zoom: 4,
		units: "m",
		maxZoom: 9,
		minZoom: 2,
	}),
	hostname: {
		"default": {
			"title": "Default",
			"type": "default",
			"editable": false,
			"url": 'http://atlas.kraj-lbc.cz'
		}, /*,
		"compositions_catalogue": {
			"title": "Compositions catalogue",
			"type": "compositions_catalogue",
			"editable": true,
			"url": 'http://foodie-dev.wirelessinfo.cz'
		},*/
		"status_manager": {
			"title": "Status manager",
			"type": "status_manager",
			"editable": true,
			"url": 'http://foodie-dev.wirelessinfo.cz'
		}
	},
	social_hashtag: 'via @opentnet',
	//compositions_catalogue_url: '/p4b-dev/cat/catalogue/libs/cswclient/cswClientRun.php',
	//compositions_catalogue_url: 'http://erra.ccss.cz/php/metadata/csw/index.php',
	//status_manager_url: '/wwwlibs/statusmanager2/index.php',

	'catalogue_url': caturl || '/php/metadata/csw/',
	'compositions_catalogue_url': caturl || '/php/metadata/csw/',
	status_manager_url: '/wwwlibs/statusmanager/index.php'
});

module.controller('Main', ['$scope', '$rootScope', 'HsCore', 'HsQueryBaseService', 'HsCompositionsParserService', 'HsFeatureFilterService', 'HsLayermanagerService',
	function($scope, $rootScope, HsCore, BaseService, composition_parser, FeatureFilter, LayMan) {
		$scope.HsCore = HsCore;
		$rootScope.$on('layermanager.layer_added', function (e, layer) {
			if (layer.hsFilters) LayMan.currentLayer = layer;
			// me.prepLayerFilter(layer);

			// if (layer.layer instanceof Vector) {
			//     var source = layer.layer.getSource();
			//     console.log(source.getState());
			//     var listenerKey = source.on('change', function (e) {
			//         if (source.getState() === 'ready') {
			//             console.log(source.getState());
			//             ol.Observable.unByKey(listenerKey);
			//             me.prepLayerFilter(layer);
			//             me.applyFilters(layer);
			//         }
			//     });
			// }
			BaseService.activateQueries();
		});
		HsCore.setMainPanel('composition_browser');
		//composition_parser.load('http://www.whatstheplan.eu/wwwlibs/statusmanager2/index.php?request=load&id=972cd7d1-e057-417b-96a7-e6bf85472b1e');
		$scope.$on('query.dataUpdated', function(event) {
			if (console) console.log('Attributes', BaseService.data.attributes, 'Groups', BaseService.data.groups);
		});
	}
]);
