app.component('action-button', {
    template: 
    /*html*/
    `
    <div id="action-button-container">
        <div @click="actionButtonClicked" id="action-button-el">
        </div>
    </div>
    `,

    methods: 
    {
        actionButtonClicked() {
            this.$emit("hide-action-button")

        }
    }
})