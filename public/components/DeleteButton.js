app.component('delete-button', {
    props: ["pointId"],
    template:
    /*html*/
    `
    <div id="delete-button-container">
        <div @click="DeleteButtonClicked(pointId)" id="delete-button-el">
        </div>
    </div>
    `,
    methods:
        {
            DeleteButtonClicked(pointId) {
                this.emitter.emit("delete-button-clicked", pointId)
            }
        }
})
