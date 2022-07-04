import {Component, OnInit} from '@angular/core';
import {SharedService} from "../../../../shared.service";
import {HttpParams} from "@angular/common/http";
import {center, helpers} from "@turf/turf";
import {parse} from "wellknown";

declare const Metro: any;
declare const $: any;
declare const mapboxgl: any;
declare const MapboxGeocoder: any;

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    constructor(private data: SharedService) {
    }
    isGridVisible = false;
    is3D = false;
    isTerrain = false;
    deedId = '';
    deedAvailableForBid = false;
    currentGroupCenter: any = {lat: 0, lng: 0};
    ownProperty = false;
    map: any;
    allBidIds: any = [];
    bidDetails: any = {
        banner_path: 'assets/logo.jpg',
        picture: 'assets/logo.jpg',
        code: "no-flag",
        country_name: "",
        first_name: "",
        last_name: "",
        price: "0",
        sale_price: "0",
        sale_text: "",
        for_sale: false,
        location_name: null
    };
    currentBidDetails: any = {'status': false, 'data': null};
    userSaveIds: any = [];
    tempUserIds: any = [];
    newGridClick = false;
    newGridPoint: any;
    userPointCenters: any = {};
    sideInfoExpand = false
    settings: any = {
        settings: {
            country_flag_id: null,
            id: -1,
            is_allowed_bid_low_price: false,
            is_send_email: false,
            is_shown_profile_for_activity: false,
            map_view: -1,
            user_id: -1,
            google2fa_enable: false,
            google2fa: false
        },
        mapViews: [{id: 1, url: 'mapbox://styles/mapbox/streets-v11', view: 'Mapbox Streets', icon: 'street'},
            {id: 2, url: 'mapbox://styles/mapbox/outdoors-v11', view: 'Mapbox Outdoors', icon: 'outdoors'},
            {id: 3, url: 'mapbox://styles/mapbox/light-v10', view: 'Mapbox Light', icon: 'light'},
            {id: 4, url: 'mapbox://styles/mapbox/dark-v10', view: 'Mapbox Dark', icon: 'dark'},
            {id: 5, url: 'mapbox://styles/mapbox/satellite-streets-v11', view: 'Mapbox Satellite Streets', icon: 'satellite'},
            {id: 6, url: 'mapbox://styles/mapbox/navigation-day-v1', view: 'Mapbox Navigation Day', icon: 'day'},
            {id: 7, url: 'mapbox://styles/mapbox/navigation-night-v1', view: 'Mapbox Navigation Night', icon: 'night'}]
    };
    currentView = 'mapbox://styles/mapbox/satellite-streets-v11';
    tileUrl = '';

    ngOnInit(): void {
      setTimeout(() => {
        this.initMap();
      }, 2000);
        if (!this.data.checkLogin()) {
            setTimeout(() => {
                this.initMap();
            }, 2000);
            return;
        }
        if (SharedService.settings.settings.id === -1) {
            this.data.currentMessage.subscribe(message => {
                if (message === 'fetch-settings') {
                    if ($('#map').length > 0) {
                        setTimeout(() => {
                            this.initMap();
                        }, 2000);
                    }

                }
            });
        } else {
            setTimeout(() => {
                this.initMap();
            }, 2000);
        }
    }

    changeBaseMap(url: any): void {
        this.currentView = url
        this.map.setStyle(this.currentView);
    }
    setGridVisibility(): void {
        if (this.map.getLayoutProperty('sub-sub-maine', 'visibility') == 'none' ) {
            this.map.setLayoutProperty('sub-sub-maine', 'visibility', 'visible');
            this.map.setLayoutProperty('sub-sub-grid-highlighted', 'visibility', 'visible');
            this.isGridVisible = true
        } else {
            this.map.setLayoutProperty('sub-sub-maine', 'visibility', 'none');
            this.map.setLayoutProperty('sub-sub-grid-highlighted', 'visibility', 'none');
            this.isGridVisible = false;
        }
    }
    set3D(): void {
        if (this.map.getLayoutProperty('add-3d-buildings', 'visibility') == 'none' ) {
            this.map.setLayoutProperty('add-3d-buildings', 'visibility', 'visible');
            this.is3D = true
        } else {
            this.map.setLayoutProperty('add-3d-buildings', 'visibility', 'none');
            this.is3D = false;
        }
    }

    setTerrain(): void {
        if (this.map.getTerrain() == null ) {
            this.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            this.isTerrain = true
        } else {
            this.map.setTerrain(null);
            this.isTerrain = false;
        }
    }
    initMap(): void {
        this.settings = SharedService.settings;
        let mapview: any = this.settings.mapViews.filter((v: any) => {
            return v.id == this.settings.settings.map_view
        });
        if (mapview.length > 0) {
            this.currentView = mapview[0].url
        }
        this.map = new mapboxgl.Map({
            container: 'map', // container id
            center: [26,5], // starting position
            zoom: 5,
            accessToken: SharedService.accessToken,
            style: this.currentView,
          // projection: 'equalEarth'
        });
        this.map.addControl(
            new MapboxGeocoder({
                accessToken: SharedService.accessToken,
                mapboxgl: mapboxgl
            }), "top-left"
        );
        if (SharedService.getCookie('userTiles') === "" || SharedService.getCookie('userTilesLatLngs') === "") {
            SharedService.setCookie('userTiles', JSON.stringify({data: []}), 1)
            SharedService.setCookie('userTilesLatLngs', JSON.stringify({data: {}}), 1)
        } else {
            var sd = JSON.parse(SharedService.getCookie('userTiles'));
            var sdLngs = JSON.parse(SharedService.getCookie('userTilesLatLngs'));
            if (sd.data.length > 0 && Object.keys(sdLngs.data).length > 0) {
                this.userSaveIds = sd.data;
                this.userPointCenters = sdLngs.data;
            } else {
                SharedService.setCookie('userTiles', JSON.stringify({data: []}), 1)
                SharedService.setCookie('userTilesLatLngs', JSON.stringify({data: {}}), 1)
            }
        }
        this.map.on('styleimagemissing', (e: any) => {
            this.map.loadImage(`assets/countries/${e.id}.png`, (error: any, image: any) => {
                if (error) {
                    return;
                }
                this.map.addImage(e.id, image);
            });
        });
        this.map.on('style.load', (event: any) => {
            const layers = this.map.getStyle().layers;
            const labelLayerId = layers.find(
                (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
            );

            this.map.addSource('data-source', {
              type: 'vector',
              tiles: [SharedService.server + 'data/{z}/{x}/{y}']
            });

            this.map.addLayer({
              'id': 'sub-sub-maine', // Layer ID
              'type': 'fill',
              'source': 'data-source', // ID of the tile source created above
  // Source has several layers. We visualize the one with name 'sequence'.
              'source-layer': 'default',
              'paint': {
                'fill-color': 'red', // blue color fill
                'fill-opacity': 0.6,
                'fill-outline-color': 'red'
              }
            })

// The 'building' layer in the Mapbox Streets
// vector tileset contains building height data
// from OpenStreetMap.
            const buildingVisib = this.is3D ? 'visible':'none';
            if (labelLayerId !== undefined) {
                this.map.addLayer(
                    {
                        'id': 'add-3d-buildings',
                        'source': 'composite',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                            'fill-extrusion-color': '#aaa',

// Use an 'interpolate' expression to
// add a smooth transition effect to
// the buildings as the user zooms in.
                            'fill-extrusion-height': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'height']
                            ],
                            'fill-extrusion-base': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'min_height']
                            ],
                            'fill-extrusion-opacity': 0.9
                        },
                        'layout': {
                            'visibility': buildingVisib
                        }
                    },
                    labelLayerId.id
                );
            } else {
                this.map.addLayer(
                    {
                        'id': 'add-3d-buildings',
                        'source': 'composite',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                            'fill-extrusion-color': '#aaa',

// Use an 'interpolate' expression to
// add a smooth transition effect to
// the buildings as the user zooms in.
                            'fill-extrusion-height': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'height']
                            ],
                            'fill-extrusion-base': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'min_height']
                            ],
                            'fill-extrusion-opacity': 0.9
                        },
                        'layout': {
                            'visibility': buildingVisib
                        }
                    }
                );
            }

            this.map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });
            if (this.isTerrain) {
                this.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            }

        });
    }
    saveSelections(): void {
        SharedService.setCookie('userTiles', JSON.stringify({data: this.userSaveIds}), 1)
        SharedService.setCookie('userTilesLatLngs', JSON.stringify({data: this.userPointCenters}), 1)
        this.map.setFilter('sub-sub-grid-highlighted', this.buildFilter());
    }

    buildFilter(): any {
        const filter = ['in', 'id'];
        for (let i = 0; i < this.userSaveIds.length; i += 1) {
            filter.push(this.userSaveIds[i]);
        }
        for (let i = 0; i < this.tempUserIds.length; i += 1) {
            filter.push(this.tempUserIds[i]);
        }

        return filter;
    }

    buildFilterForBid(): any {
        const filter = ['in', 'id'];

        if (this.allBidIds.length === 0) {
            return filter;
        }

        for (let i = 0; i < this.allBidIds.length; i += 1) {
            filter.push(this.allBidIds[i].grid_id);
        }

        return filter;
    }

    buyLand(): void {
        if (!this.data.checkLogin()) {
            this.data.redirect('login');
            return;
        }
        const ctx = this;
        const html = `<div id="property-error-div"></div><div class="form-group">
<input type="text" id="property-name" data-role="materialinput"
       placeholder="Enter property name"
       data-icon="<span class='mif-info'>"
       data-label="Property name"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
></div>`;
        Metro.dialog.create({
            title: "Please enter this property name",
            content: html,
            clsDialog: 'buy-land-dialog',
            actions: [
                {
                    caption: "Buy",
                    cls: "success",
                    onclick: function(){
                        const name = $('#property-name').val();
                        if (name.length < 2) {
                            $('#property-error-div').empty().append("Property name must be at least 2 characters");
                            SharedService.invalidForm('#property-error-div');
                            return;
                        }
                        Metro.dialog.close('.buy-land-dialog');
                        ctx.buyLandRequest(name);
                    }
                },
                {
                    caption: "No",
                    cls: "js-dialog-close light",
                    onclick: function(){

                    }
                }
            ]
        });
    }

    buyLandRequest(name: string): void {
        const ftData: any = [];
        const fts: any = [];
        this.userSaveIds.forEach((id: any) => {
            const ft = helpers.feature(parse(this.userPointCenters[id]));
            fts.push(ft);
            ftData.push({id: id, latlng: this.userPointCenters[id]})
        });
        const cntr = center(helpers.featureCollection(fts));
        const latlng = {lat: cntr.geometry.coordinates[1], lng: cntr.geometry.coordinates[0]};
        SharedService.loading('location');
        this.data.apiGetService(`https://api.mapbox.com/geocoding/v5/mapbox.places/${latlng.lng},${latlng.lat}.json?access_token=${SharedService.accessToken}&limit=1&types=address`, true, new HttpParams())
            .subscribe(
                (result: any) => {
                    SharedService.loading('location', true);
                    try {
                        const form: any = {fts: ftData, center: cntr.geometry.coordinates.join(","), name: name, location: result.features[0].place_name};
                        SharedService.loading("land");
                        this.data.apiService(`buy/land`, form).subscribe(
                            (results: any) => {
                                SharedService.loading("land", true);
                                if (results.hasOwnProperty('status')) {
                                    SharedService.fire(results.message, !results.status);
                                    if (results.status) {
                                        this.clearSelection();
                                        this.data.changeMessage('get-profile');
                                        this.tileUrl =  `${SharedService.server}grids/{z}/{x}/{y}?dt=${Date.now()}&token=` + SharedService.getCookie('access_token');
                                        this.map.getSource('grid-source').setTiles([this.tileUrl])
                                    }
                                }
                            },
                            (err: any) => {
                                SharedService.fire("Unable to process. Internal Error", true);
                                SharedService.loading("land", true);
                            }
                        )
                    } catch (e) {
                        SharedService.loading("land", true);
                    }
                },
                (error: any) => {
                    SharedService.loading('location', true);
                }
            )
    }

    clearSelection(): void {
        SharedService.setCookie('userTiles', JSON.stringify({data: []}), 1)
        SharedService.setCookie('userTilesLatLngs', JSON.stringify({data: []}), 1)
        this.userSaveIds = [];
        this.tempUserIds = [];
        this.userPointCenters = {};
        this.map.setFilter('sub-sub-grid-highlighted', this.buildFilter());
    }

    clearBidSelection(): void {
        this.currentGroupCenter = {lat: 0, lng: 0};
        this.allBidIds = [];
        this.bidDetails = {
            banner_path: 'assets/logo.jpg',
            picture: 'assets/logo.jpg',
            code: "no-flag",
            country_name: "",
            first_name: "",
            last_name: "",
            price: "0",
            sale_price: "0",
            sale_text: "",
        };
        this.map.setFilter('grids-for-bid', this.buildFilterForBid());
        Metro.bottomsheet.close('#group-view', 'list');
    }

    getPropertInfo(deedId: any): void {
        this.clearBidSelection();
        SharedService.loading("bid");
        this.deedId = deedId;
        this.deedAvailableForBid = false;
        this.data.apiGetService(SharedService.server + `get/property/${deedId}`, true).subscribe(
            (results: any) => {
                SharedService.loading("bid", true);
                if (results.grids.length > 0) {
                    const fts: any = [];
                    results.grids = results.grids.map((g: any) => {
                        g.point = JSON.parse(g.point);
                        fts.push(helpers.feature(g.point));
                        return g;
                    });
                    const ftCollection = helpers.featureCollection(fts);
                    const gCenter = center(ftCollection);
                    const latlng = {lat: gCenter.geometry.coordinates[1], lng: gCenter.geometry.coordinates[0]};
                    this.currentGroupCenter = latlng;
                    this.allBidIds = results.grids;
                    this.map.setFilter('grids-for-bid', this.buildFilterForBid());
                }
                if (results.detail.picture != null) {
                    results.detail.picture = SharedService.server + results.detail.picture;
                }
                if (results.detail.banner_path != null) {
                    results.detail.banner_path = SharedService.server + results.detail.banner_path;
                }
                this.bidDetails = results.detail;
                this.currentBidDetails = results.bid_details;
                if (this.bidDetails.location_name == null) {
                    this.data.updateLocationName(this.currentGroupCenter, this.deedId).then((result) => {
                        this.bidDetails.location_name = result;
                        Metro.bottomsheet.open('#group-view', 'list')
                    })
                } else {
                    Metro.bottomsheet.open('#group-view', 'list')
                }

            },
            (err: any) => {
                SharedService.fire("Unable to fetch. Internal Error", true);
                SharedService.loading("bid", true);
            }
        )
    }

    viewProperty(): void {
        this.data.redirect('dashboard/app/property', this.deedId);
    }

    openBidDialog(): void {
        const ctx = this;
        const html = `<div id="bid-error-div" class="fg-red text-small"></div><div class="form-group">
<input type="number" id="bid-price" value="0.0" data-role="materialinput"
                       placeholder="Enter your bid price"
                       data-icon="<span class='mif-dollars'>"
                       data-label="Bid Price"
                       data-cls-line="bg-cyan"
                       data-cls-label="fg-cyan"
                       data-cls-informer="fg-lightCyan"
                       data-cls-icon="fg-darkCyan"
                ></div>`;
        Metro.dialog.create({
            title: "Enter Bid Details",
            content: html,
            clsDialog: 'bid-dialog fg-amber',
            actions: [
                {
                    caption: "Submit",
                    cls: "warning",
                    onclick: function(){
                        let bid = $('#bid-price').val();
                        if (!isNaN(bid)){
                            bid = Number(bid);
                            if (bid > 0) {
                                ctx.submitBid(bid);
                                Metro.dialog.close('.bid-dialog');
                                return;
                            }
                        }
                        $('#bid-error-div').empty().append("Invalid bid details. It should be valid digit or number");
                        setTimeout(()=>{$('#bid-error-div').empty();}, 3000);
                        SharedService.invalidForm('#bid-error-div');
                    }
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close alert",
                    onclick: function(){

                    }
                }
            ]
        });
    }

    submitBid(price: any): void {
        const form = new FormData();
        form.append('gid',this.deedId);
        form.append('price',price);
        SharedService.loading('biddo');
        this.data.apiService('bid/do', form).subscribe(
            (results: any) => {
                SharedService.loading('biddo', true);
                if (results.hasOwnProperty('status')){
                    SharedService.fire(results.message, !results.status);
                    if (results.status) {
                        this.data.changeMessage('get-profile');
                    }
                } else {
                    SharedService.fire('Invalid request. Please try again later', true);
                }
            },
            (err: any) => {
                SharedService.loading('biddo', true);
                SharedService.fire('Invalid request. Please try again later', true);
            }
        )
    }

    doBid(): void {
        if (!this.data.checkLogin()) {
            this.data.redirect('login');
            return;
        }
        this.openBidDialog();
    }

    cancelBid(): void {
        const ctx = this;
        Metro.dialog.create({
            title: "Bid",
            content: "Do you want to cancel your bid?",
            actions: [
                {
                    caption: "Yes cancel",
                    cls: "js-dialog-close alert",
                    onclick: function(){
                        ctx.cancelBidRequest();
                    }
                },
                {
                    caption: "No",
                    cls: "js-dialog-close success",
                    onclick: function(){

                    }
                }
            ]
        });
    }

    cancelBidRequest(): void {
        SharedService.loading('bidcancel');
        this.data.apiGetService('bid/cancel/'+this.currentBidDetails.data.id).subscribe(
            (results: any) => {
                SharedService.loading('bidcancel', true);
                if (results.hasOwnProperty('status')){
                    SharedService.fire(results.message, !results.status);
                    if (results.status) {
                        this.data.changeMessage('get-profile');
                    }
                } else {
                    SharedService.fire('Invalid request. Please try again later', true);
                }
            },
            (err: any) => {
                SharedService.loading('bidcancel', true);
                SharedService.fire('Invalid request. Please try again later', true);
            }
        )
    }

}
