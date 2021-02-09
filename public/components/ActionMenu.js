app.component('action-menu', {
    props: ["attributes"],
    template: 
    /*html*/
    `
    <div @click="actionMenuExit" id="action-menu-container">
        <div id="action-menu-el">
        <h2 id="action-menu-header">Let everybody know!</h2>
        <div id="attributes-grid">
            <div id="attributes-grid-item" v-for="attribute in attributes" :key="attribute.id">
                <attribute-icon
                :image="attribute.image"
                :type="attribute.type"
                :description="attribute.description"
                :id="attribute.id"
                >
                </attribute-icon>
            </div>
        </div>
        </div>
    </div>
    `,

    methods: {
        actionMenuExit() {
            this.$emit('show-action-button')
        }
    }
})