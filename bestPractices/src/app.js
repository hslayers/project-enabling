import 'toolbar.module';
import 'core.module';
import 'feature-filter.module';
import 'layermanager.module';
import 'map.module';
import 'permalink.module';
import 'query.module';
import 'gallery.module';
import 'angular-material';
import { Vector, Tile } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Style, Icon } from 'ol/style';
import { transform } from 'ol/proj';
import View from 'ol/View';
import {unByKey} from 'ol/Observable';

import Attribution from 'ol/control/Attribution';

import 'angular-material/angular-material.css';
import 'ol/ol.css';
import 'css/app.css';
import 'css/whhg-font/css/whhg.css';
import './app.css';

const module = angular.module('hs', [
	'hs.toolbar',
	'hs.layermanager',
	'hs.map',
	'hs.query',
	'hs.gallery',
	'hs.permalink',
	'hs.core',
	'hs.featureFilter',
	'ngMaterial'
])

	.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('brown', {
				'default': '700',
				'hue-1': '400'
			})
			.accentPalette('brown');
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

const caturl = '/php/metadata/csw/index.php';

module.value('HsConfig', {
	proxyPrefix: '/proxy/',
	appLogo: require('./img/enabling_logo.png').default,
	design: 'md',
	importCss: false,
	permalinkParameters: {
	  center: false,
	  featureURI: true,
		hs_panel: false,
		language: false,
		layers: false
	},
	query: {
		multi: false
	},
	queryPoint: 'hidden',
	sidebarToggleable: false,
	panelWidths: {
		default: '60%',
	},
	mapControls: [
		new Attribution(),
	],
	componentsEnabled: {
		'geolocationButton': false,
	},
	directiveTemplates: {
		'md-sidenav': require('sidenav.html'),
		layout: require('layoutmd.html'),
		'md-overlay': require('overlay.html'),
		'md-toolbar': require('toolbar.html'),
		'feature-list': require('feature-list-md.html'),
		'query-info-panel-md': require('infopanel-md.html'),
		help: require('help.html'),
		policies: require('policies.html'),
		acknowledgement: require('acknowledgement.html')
	},
	default_layers: [
		new Tile({
			source: new XYZ({
				attributions: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
				url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en'
			}),
			title: 'Base layer',
			base: true
		}),
		new Vector({
			title: 'Farming Best Practices',
			source: new VectorSource({
				format: new GeoJSON(),
				url: 'https://db.atlasbestpractices.com/project-geo-json/2/',
			}),
			style: new Style({
				image: new Icon(({
					crossOrigin: 'anonymous',
					src: require('./img/enabling_logo_2_relief12_stin.png').default,
					anchor: [0.5, 0.5],
					scale: 0.5,
				}))
			}),
			selectedStyle: new Style({
				image: new Icon(({
					crossOrigin: 'anonymous',
					src: require('img/enabling_logo_2_relief11_stin.png').default,
					anchor: [0.5, 0.5],
					scale: 0.5,
				}))
			}),
			highlightedStyle: new Style({
				image: new Icon(({
					crossOrigin: 'anonymous',
					src: require('img/enabling_logo_2_relief11_stin.png').default,
					anchor: [0.5, 0.5],
					scale: 0.5,
				}))
			}),
			featureURI: 'bp_uri',
			ordering: {
				primary: 'position',
				secondary: 'bp_id',
				defaultReverse: ['position', 'bp_id'],
			},
			hsFilters: [
				{
					title: 'Country',
					valueField: 'SU_A3',
					type: {
						type: 'fieldset',
					},
					selected: undefined,
					values: [],
					gatherValues: true
				},
				{
					title: "Collected By",
					valueField: "partner",
					type: {
						type: "fieldset",
					},
					selected: undefined,
					values: [],
					gatherValues: true
				}
			]
		})
	],
	//project_name: 'hslayers',
	project_name: 'Material',
	default_view: new View({
		center: transform([8.3927408, 46.9205358], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude	to Spherical Mercator
		zoom: 4,
		units: 'm',
		maxZoom: 9,
		minZoom: 2,
		constrainResolution: true,
	}),
	hostname: {
		'default': {
			'title': 'Default',
			'type': 'default',
			'editable': false,
			'url': 'http://atlas.kraj-lbc.cz'
		}, /*,
		'compositions_catalogue': {
			'title': 'Compositions catalogue',
			'type': 'compositions_catalogue',
			'editable': true,
			'url': 'http://foodie-dev.wirelessinfo.cz'
		},*/
		'status_manager': {
			'title': 'Status manager',
			'type': 'status_manager',
			'editable': true,
			'url': 'http://foodie-dev.wirelessinfo.cz'
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

module.controller('Main', ['$scope', '$rootScope', 'HsCore', 'HsQueryBaseService', 'HsQueryVectorService', 'HsCompositionsParserService', 'HsFeatureFilterService', 'HsLayermanagerService', '$mdBottomSheet',
	function($scope, $rootScope, HsCore, BaseService, VectorService, composition_parser, HsFeatureFilter, LayMan, $mdBottomSheet) {
		function getCookie(name) {
			const COOKIE = document.cookie
				.split('; ')
				.find(cookie => cookie.startsWith(`${name}=`));

			return COOKIE ? COOKIE
				.split('=')[1]
				: undefined;
		}

		if (getCookie('do_not_track') !== 'false') {
			window[`ga-disable-${GA_ID}`] = true;

			$mdBottomSheet.show({
				template: require('cookies_consent.html'),
				scope: $scope,
				preserveScope: true,
				parent: angular.element(document).find('body'),
				isLockedOpen: true
			});
		} else {
			gtag('js', new Date());
			gtag('config', GA_ID);
		}


		function gtag(){dataLayer.push(arguments);}

		$scope.acceptCookies = function() {
			document.cookie = 'do_not_track=false';
			window[`ga-disable-${GA_ID}`] = false;

			gtag('js', new Date());
			gtag('config', GA_ID);

			$mdBottomSheet.hide();
		};

		$scope.rejectCookies = function() {
			document.cookie = 'do_not_track=true';

			$mdBottomSheet.hide();
		};

		$scope.HsCore = HsCore;
		$rootScope.$on('layermanager.layer_added', function (e, layer) {
			if (layer.hsFilters || layer.ordering) LayMan.currentLayer = layer;
			BaseService.activateQueries();
		});

		$scope.$on('query.dataUpdated', function(event) {
			if (console) console.log('Attributes', BaseService.data.attributes, 'Groups', BaseService.data.groups);
		});
	},
]);
