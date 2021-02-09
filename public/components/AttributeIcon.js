app.component('attribute-icon', {
    props: ["image", "type", "description", "id"],
    template: 
    /*html*/
    `
    <div class="attribute-icon-container">
        <div :id="id" 
             :class="type" 
             class="attribute-icon-background"
             @click="attributeSelected(id)"
        >
            <img class="attribute-icon-el" :src="image">
        </div>
        <p class="attribute-icon-description">{{ this.description }}</p>
    </div>
    `,
    methods: {
        attributeSelected(selectedAttributeID) {
            this.emitter.emit("new-attribute-selected", selectedAttributeID);
        }
    }

})
