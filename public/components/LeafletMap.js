app.component('leaflet-map', {
  props: ["savedPoints"],

  data() { return {
    "access_token": "",
    "markers_to_create": [{"name": "cat", "size": 38},
                          {"name": "breastfeed_friendly", "size": 90},
                          {"name": "changing_station",  "size": 90},
                          {"name": "playground", "size": 90},
                          {"name": "crowded_area", "size": 90},
                          {"name":"stroller_obstacle", "size": 90} ,
                          {"name": "smoke_and_pollution", "size": 90},
                          {"name": "greenery", "size": 90},
                          {"name": "takeaway", "size": 90},
                          {"name": "restroom", "size": 90},    
                        ],
    "markers_objects": {},
    "active_marker": null,
    "selected_marker": null,
    "all_points_on_map": {},
    "map": null,

  }

  },

  template:
  /*html*/
  `
  <div id="map-container">
    <div id="map-el"></div>
  </div>
  `,
  beforeMount() {
    this.createMarkers()
  },
  mounted() {
    this.map = this.initMap();
    this.loadSavedPoints();
    this.map.on('locationfound', (e) => {
      this.onLocationFound(e, this.map)
    });
    this.map.on('click', (e) => {
      this.onMapClick(e, this.map)
    });
    this.emitter.on("new-attribute-selected", (newSelectedAttribute) => {
      this.handleNewSelectedAttribute(newSelectedAttribute)
    })
    this.emitter.on("delete-button-clicked", (pointID) => {
      this.map.removeLayer(this.all_points_on_map[pointID])
    })
  },
  watch: {
    savedPoints: {
      handler() {
        this.loadSavedPoints()
      }
    }
  },
  methods: {
    initMap() {
      const appMap = L.map('map-el').fitWorld();
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 17,
      minZoom: 10,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: this.access_token
      }).addTo(appMap);
      appMap.setView(new L.LatLng(32.11224, 34.8048))  // Sets map center to TAU
      appMap.locate({setView: true, minZoom: 10});
      return appMap
    },
    async loadSavedPoints() {
      let pointsData = await this.savedPoints;          
      for (const [pointID, pointDataJSON] of Object.entries(pointsData)) {
        if (!this.all_points_on_map[pointID]) {
          const pointData = JSON.parse(pointDataJSON)
          const loadedMarker = L.marker(pointData.coords, {icon: L.icon(pointData.pointIcon.options)}).addTo(this.map);
          loadedMarker.on('click', () => {this.handleMarkerClick(pointData.coords, pointID, loadedMarker)});
          this.all_points_on_map[pointID] = loadedMarker;
        }
      }
      for (const [pointID, pointDataJSON] of Object.entries(this.all_points_on_map)) {
        if (!pointsData[pointID]) {
          this.map.removeLayer(this.all_points_on_map[pointID])
          delete this.all_points_on_map[pointID]
        }
      }
    },
    onLocationFound(e, map) { 
      L.marker(e.latlng, {icon: this.markers_objects["cat"]}).addTo(map).bindPopup("You are here!").openPopup();
    },
    createMarkers() {
      for (markerType in this.markers_to_create) {
        const markerToCreate = this.markers_to_create[markerType]
        const icon = L.icon({
          iconUrl: `./assets/images/markers/${markerToCreate.name}.png`,
          iconSize: [markerToCreate.size, markerToCreate.size],
          popupAnchor: [0, (-markerToCreate.size / 2)],
        })
        this.markers_objects[markerToCreate.name] = icon
      }
    },
    onMapClick(e, map) {

      if (this.active_marker) {
        const coords = e.latlng;
        const pointID = getPointID(coords)
        const pointIcon = this.markers_objects[this.active_marker];
        const marker = L.marker(coords, {icon: pointIcon}).addTo(map);
        const pointData = { pointID, coords, pointIcon };
        this.emitter.emit("new-point-added", pointData)
        this.active_marker = null;
        this.all_points_on_map[pointID] = marker;
        marker.on('click', () => {this.handleMarkerClick(coords, pointID, marker)})
      }
      if (this.selected_marker) {
        this.emitter.emit("marker-deselected")
        this.selected_marker = null
      }
    },
    handleNewSelectedAttribute(newSelectedAttribute) {
      this.active_marker = newSelectedAttribute
    },
    async handleMarkerClick(latlng, pointID, marker) {
      data = await this.getPlaceDetailsFromGoogle(latlng)
      this.selected_marker = {}
      this.selected_marker.name = data.name
      this.selected_marker.address = data.formatted_address
      this.selected_marker.photos = data.photos_urls
      this.selected_marker.id = pointID
      this.selected_marker.marker = marker
      this.emitter.emit("marker-selected", this.selected_marker)
    },

    async getGooglePlaceID(latlng){
      /* TODO: refactor to use google places library */
      const apiKey = ""
      let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng['lat']},${latlng['lng']}&key=${apiKey}`
      const response = await fetch(url)
      const dataFull = await response.json()
      return addressToSearch = dataFull.results[0].place_id
    },

    async getPlaceDetailsFromGoogle(latlng) {
      const placeID = await this.getGooglePlaceID(latlng)
      const request = {
        placeId: placeID,
      };
      const mockMap = new google.maps.Map(document.createElement('div'))
      service = new google.maps.places.PlacesService(mockMap);
      return new Promise(function(resolve, reject) {
        service.getDetails(request, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            // resolve results upon a successful status
            results.photos_urls = []
            if (results.photos) {
              for (const photoIndex in results.photos) {
                if (photoIndex <= 3) {
                  const photoURL = results.photos[photoIndex].getUrl()
                  results.photos_urls.push(photoURL)
                }
              }
            }
            resolve(results);
          } else {
            // reject status upon un-successful status
            reject(status);
          }
        });
      });
    },
  }

})

// Utils
function getPointID(latlng) {
  let lat = (latlng['lat'] * 1000).toFixed(0).toString()
  let lng = (latlng['lng'] * 1000).toFixed(0).toString()
  return lat.concat(lng);
}