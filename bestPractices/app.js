'use strict';

define(['angular', 'ol', 'sidebar', 'toolbar', 'layermanager', 'map', 'query', 'search', 'print', 'permalink', 'measure', 'legend', 'geolocation', 'core', 'api', 'angular-gettext', 'bootstrap', 'translations', 'compositions', 'status_creator', 'ows', 'feature_filter', 'angular-material'],

	function(angular, ol, toolbar, layermanager) {
		var module = angular.module('hs', [
			'hs.toolbar',
			'hs.layermanager',
			'hs.map',
			'hs.query',
			'hs.search', 'hs.print', 'hs.permalink', 'hs.measure',
			'hs.legend', 'hs.geolocation', 'hs.core',
			'hs.api',
			'hs.ows',
			'gettext',
			'hs.compositions', 'hs.status_creator',
			'hs.sidebar',
			'hs.feature_filter',
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

		module.directive('hs', ['hs.map.service', 'Core', function(OlMap, Core) {
			return {
				templateUrl: hsl_path + 'hslayers.html',
				link: function(scope, element) {
					Core.fullScreenMap(element);
				}
			};
		}]);

		var caturl = "/php/metadata/csw/index.php";

		module.value('config', {
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
			policy_template: "policies.html",
			default_layers: [
				new ol.layer.Tile({
					source: new ol.source.XYZ({
						attributions: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
						url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en'
					}),
					title: "Base layer",
					base: true
				}),
				new ol.layer.Vector({
					title: "Farming Best Practices",
					source: new ol.source.Vector({
						format: new ol.format.GeoJSON(),
						url: 'https://db.atlasbestpractices.com/project-geo-json/2/',
						// url: './bp_features.json',
					}),
					style: new ol.style.Style({
						image: new ol.style.Icon(({
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
						//	 title: "Product",
						//	 valueField: "product",
						//	 type: {
						//		 type: "fieldset",
						//	 },
						//	 selected: undefined,
						//	 values: [],
						//	 gatherValues: true
						// },
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
						// {
						//	 title: "Practice type",
						//	 valueField: "type",
						//	 type: {
						//		 type: "fieldset",
						//	 },
						//	 selected: undefined,
						//	 values: [],
						//	 gatherValues: true
						// }
					]
				})
			],
			//project_name: 'hslayers',
			project_name: 'Material',
			default_view: new ol.View({
				center: ol.proj.transform([8.3927408, 46.9205358], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude	to Spherical Mercator
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
			status_manager_url: '/wwwlibs/statusmanager/index.php',

			createExtraMenu: function($compile, $scope, element) {
				$scope.uploadClicked = function() {
					alert("UPLOAD!")
				}
				var el = angular.element("<li class=\"sidebar-item\" ng-click=\"uploadClicked()\" ><a href=\"#\"><span class=\"menu-icon glyphicon icon-cloudupload\"></span><span class=\"sidebar-item-title\">Upload</span></a></li>");
				element.find('ul').append(el);
				$compile(el)($scope);
			}
		});

		module.controller('Main', ['$scope', '$rootScope', 'Core', 'hs.query.baseService', 'hs.compositions.service_parser', 'hs.feature_filter.service', 'hs.layermanager.service', '$mdBottomSheet', '$mdDialog',
			function($scope, $rootScope, Core, BaseService, composition_parser, FeatureFilter, LayMan, $mdBottomSheet, $mdDialog) {
				function getCookie(name) {
					const COOKIE = document.cookie
						.split('; ')
						.find(cookie => cookie.startsWith(name));

					return COOKIE ? COOKIE
						.split('=')[1]
						: undefined;
				}

				if (getCookie('do_not_track') !== "false") {
					window['ga-disable-UA-171782968-1'] = true;

					$mdBottomSheet.show({
						templateUrl: 'cookies_consent.html',
						scope: $scope,
						preserveScope: true,
						parent: angular.element(document.body),
						isLockedOpen: true
					});
				} else {
					gtag('js', new Date());
					gtag('config', 'UA-171782968-1');
				}
					

				function gtag(){dataLayer.push(arguments);}

				$scope.acceptCookies = function() {
					document.cookie = "do_not_track=false";
					window['ga-disable-UA-171782968-1'] = false;
					
					gtag('js', new Date());
					gtag('config', 'UA-171782968-1');

					$mdBottomSheet.hide();
				};

				$scope.rejectCookies = function() {
					document.cookie = "do_not_track=true";

					$mdBottomSheet.hide();
				};

				$scope.showPolicyDialog = function(ev) {
					$mdDialog.show({
						scope: this,
						preserveScope: true,
						templateUrl: 'policies.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						clickOutsideToClose: true
					});
				};

				$scope.cancelDialog = function() {
					$mdDialog.cancel();
				};

				$scope.hsl_path = hsl_path; //Get this from hslayers.js file
				$scope.Core = Core;
				$rootScope.$on('layermanager.layer_added', function (e, layer) {
					if (layer.hsFilters) LayMan.currentLayer = layer;
					// me.prepLayerFilter(layer);

					// if (layer.layer instanceof ol.layer.Vector) {
					//	 var source = layer.layer.getSource();
					//	 console.log(source.getState());
					//	 var listenerKey = source.on('change', function (e) {
					//		 if (source.getState() === 'ready') {
					//			 console.log(source.getState());
					//			 ol.Observable.unByKey(listenerKey);
					//			 me.prepLayerFilter(layer);
					//			 me.applyFilters(layer);
					//		 }
					//	 });
					// }
					BaseService.activateQueries();
				});
				Core.setMainPanel('composition_browser');
				//composition_parser.load('http://www.whatstheplan.eu/wwwlibs/statusmanager2/index.php?request=load&id=972cd7d1-e057-417b-96a7-e6bf85472b1e');
				$scope.$on('query.dataUpdated', function(event) {
					if (console) console.log('Attributes', BaseService.data.attributes, 'Groups', BaseService.data.groups);
				});
			}
		]);

		return module;
	});
