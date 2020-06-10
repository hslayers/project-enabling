'use strict';
import 'toolbar.module';
import 'core.module';
import 'feature-filter.module';
import 'layermanager.module';
import 'map.module';
import 'permalink.module';
import 'query.module';
import 'angular-material';
import { Vector, Tile } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Style, Icon } from 'ol/style';
import { transform } from 'ol/proj';
import View from 'ol/View';
import {unByKey} from 'ol/Observable';

import Logo from './enabling_logo.png';
import EUFlag from './img/eu_flag.jpg';
import help_01_0676x0180 from './img/help_01_0676x0180.png';
import help_02_0475x0518 from './img/help_02_0475x0518.png';
import help_03_0475x0518 from './img/help_03_0475x0518.png';
import help_04_1083x0940 from './img/help_04_1083x0940.png';
import help_05_1083x0937 from './img/help_05_1083x0937.png';
import help_06_0203x0120 from './img/help_06_0203x0120.png';

var module = angular.module('hs', [
	'hs.toolbar',
	'hs.layermanager',
	'hs.map',
	'hs.query',
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

var caturl = '/php/metadata/csw/index.php';

module.value('HsConfig', {
	appLogo: Logo,
	design: 'md',
	query: {
		multi: true
	},
	queryPoint: 'hidden',
	directiveTemplates: {
		'md-sidenav': require('sidenav.html'),
		layout: require('layoutmd.html'),
		'md-overlay': require('overlay.html'),
		'md-toolbar': require('toolbar.html'),
		// infopanel: 'satelliteMetadataQuery.html',
		help: require('help.html'),
		acknowledgement: require('acknowledgement.html')
	},
	images: {
		'eu_flag': EUFlag,
		'help_01_0676x0180': help_01_0676x0180,
		'help_02_0475x0518': help_02_0475x0518,
		'help_03_0475x0518': help_03_0475x0518,
		'help_04_1083x0940': help_04_1083x0940,
		'help_05_1083x0937': help_05_1083x0937,
		'help_06_0203x0120': help_06_0203x0120
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
					src: 'enabling_logo_2_relief12_stin.png',
					anchor: [0.5, 0.5],
					scale: 0.5,
				}))
			}),
			featureURI: 'bp_uri',
			hsFilters: [
				{
					title: 'Country',
					valueField: 'SU_A3',
					type: {
						type: 'fieldset',
					},
					selected: undefined,
					values: [],
					// values: ['CZ', 'DE', 'NL'],
					gatherValues: true
				},
				// {
				//     title: 'Practice type',
				//     valueField: 'type',
				//     type: {
				//         type: 'fieldset',
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
		units: 'm',
		maxZoom: 9,
		minZoom: 2,
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

module.controller('Main', ['$scope', '$rootScope', 'HsCore', 'HsQueryBaseService', 'HsCompositionsParserService', 'HsFeatureFilterService', 'HsLayermanagerService',
	function($scope, $rootScope, HsCore, BaseService, composition_parser, HsFeatureFilter, LayMan) {
		$scope.HsCore = HsCore;
		$rootScope.$on('layermanager.layer_added', function (e, layer) {
			if (layer.hsFilters) LayMan.currentLayer = layer;
			HsFeatureFilter.prepLayerFilter(layer);

			if (layer.layer instanceof Vector) {
			    var source = layer.layer.getSource();
			    console.log(source.getState());
			    var listenerKey = source.on('change', function (e) {
			        if (source.getState() === 'ready') {
			            console.log(source.getState());
			            unByKey(listenerKey);
			            HsFeatureFilter.prepLayerFilter(layer);
			            HsFeatureFilter.applyFilters(layer);
			        }
			    });
			}
			BaseService.activateQueries();
		});

        const customSidenav = () => {
            return {
                template: require('test.html')
            };
        }

        $scope.$on('scope_loaded', (event, args) => {
            if (args === 'Layout') {
        let existing = angular.module('hs.layout');
        let newModule = angular.module('hs.layout', existing.requires);
        existing['_invokeQueue'].forEach(function (def) {
            // console.log(def[2][0]);
            // console.log(def);
            switch(def[2][0]){
                case 'hs.mdSidenav.directive':
                    newModule.component('hs.mdSidenav.directive', customSidenav);
                    break;
                default:
                    // def[1] containes: 'service', 'directive', 'component' etc.
                    // def[2][0] contains name of the directive comonent etc.
                    // def[2][1] is directives dependecies and the last is function as usual
                    let method = def[1];

                    if (def[0] === '$controllerProvider') method = 'controller';

                    newModule[method](def[2][0], def[2][1]);
            }
        });

		// $scope.$apply();
		}});

		HsCore.setMainPanel('composition_browser');
		//composition_parser.load('http://www.whatstheplan.eu/wwwlibs/statusmanager2/index.php?request=load&id=972cd7d1-e057-417b-96a7-e6bf85472b1e');
		$scope.$on('query.dataUpdated', function(event) {
			if (console) console.log('Attributes', BaseService.data.attributes, 'Groups', BaseService.data.groups);
		});
	}
]);
