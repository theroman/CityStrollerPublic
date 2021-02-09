const app = Vue.createApp({
    data() {
        return {
            actionButtonShowed: true,
            attributes: [
                {"id": "changing_station", "image": "./assets/images/changing_station.png", "type": "positive", "description": "Changing Station"},
                {"id": "playground", "image": "./assets/images/playground.png", "type": "positive", "description": "Playground"},
                {"id": "breastfeed_friendly", "image": "./assets/images/breastfeed_friendly.png", "type": "positive", "description": "Breastfeeding Friendly"},
                {"id": "greenery", "image": "./assets/images/greenery.png", "type": "positive", "description": "Greenery"},
                {"id": "takeaway", "image": "./assets/images/takeaway.png", "type": "positive", "description": "Take Away"},
                {"id": "restroom", "image": "./assets/images/restroom.png", "type": "positive", "description": "Restroom"},
                {"id": "crowded_area", "image": "./assets/images/crowded_area.png", "type": "negative", "description": "Crowded Area"},
                {"id": "smoke_and_pollution", "image": "./assets/images/smoke_and_pollution.png", "type": "negative", "description": "Smoke and Pollution"},
                {"id": "stroller_obstacle", "image": "./assets/images/stroller_obstacle.png", "type": "negative", "description": "Stroller Obstacle"},
            ],
            selectedAttribute: null,
            selectedMarker: null,
            defaultPlaceImages: ["./assets/images/citymock_8.jpg","./assets/images/citymock_1.jpg"],
            savedPoints: this.getSavedPoints(),
        }
    },
    mounted(){
      this.emitter.on("new-attribute-selected", (newSelectedAttribute) => {
        this.handleNewSelectedAttribute(newSelectedAttribute)
      })
      this.emitter.on("marker-selected", (selectedMarker) => {
        this.handleSelectedMarker(selectedMarker)
      })
      this.emitter.on("marker-deselected", () =>{
        this.handleDeselectedMarker()
      })
      this.emitter.on("new-point-added", (pointData) => {
          this.savePointOnServer(pointData)
      })
      this.emitter.on("delete-button-clicked", (pointID) => {
        this.deletePoint(pointID)
      })
      setInterval(() => this.setSavedPoints(), 5 * 1000); // Refresh all markers on map every 5 seconds
    },
    methods: {
      hideActionButton() {
          this.actionButtonShowed = false;
      },
      showActionButton() {
        this.actionButtonShowed = true;
      },
      handleNewSelectedAttribute(attributeId) {
        this.selectedAttribute = attributeId
        document.getElementById('map-el').style.cursor = `url(./assets/images/markers/${attributeId}.png`
      },
      handleSelectedMarker(selectedMarker) {
        this.selectedMarker = selectedMarker
      },
      handleDeselectedMarker() {
        this.selectedMarker = null
      },
      savePointOnServer(pointData) {
        console.log(pointData)
        fetch(`/add_point?id=${pointData.pointID}&data=${JSON.stringify(pointData)}`, {
            method: 'PUT'
        });
      },
      async getSavedPoints(){
        try {
          const result = await fetch('/all_points',{ method: 'GET' })
          return result.json()
        } catch (error) {
          fetch(`/client_exception?exception=${error}`, { method: 'GET' })
        }
      },
      async setSavedPoints() {
        this.savedPoints = await this.getSavedPoints();
      },
      deletePoint(pointID) {
          console.log(pointID)
          this.selectedMarker = null;
          fetch(`/remove_point?id=${pointID}`, {method: 'DELETE'});
          delete this.savedPoints[pointID]
          this.handleDeselectedMarker()
      }
    }
  })
const emitter = mitt()
app.config.globalProperties.emitter = emitter
