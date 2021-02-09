app.component('marker-details', {
    props: ["marker", "defaultPlaceImages"],
    
    template: 
    /*html*/
    `
    <div v-if="marker.name" id="marker-details-container">
        <div id="marker-details-el">
        <div id="gallery">
            <div class="place-image-wrapper" v-for="imageSrc in marker.photos">
                <img class="place-image" :src="imageSrc">
            </div>
            <div class="place-image-wrapper" v-for="img in defaultPlaceImages" v-if="!marker.photos.length">
                <img class="place-image" :src="img">
            </div>
        </div>
        
        <div id="place-name">
            {{ this.marker.name }}
        </div>
        <div id="place-address">
            {{ this.marker.address }}
        </div>
        <div id="place-controls-container"></div>
        <delete-button 
        :point-id="marker.id"
        >
        
        </delete-button>
        </div>
     </div>
    `,
    methods: {
       
    },
})
