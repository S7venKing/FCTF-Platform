import { Assets, Sprite, Container } from "pixi.js";

export class MapManager {
    constructor(app, mapData) {
        this.app = app;
        this.mapData = mapData;
        this.mapContainer = new Container();
        this.mapSprite = null;
        this.isDraggable = false;
        this.isDragging = false;
        this.lastPosition = null;
    }

    async initialize() {
        const mapTexture = await Assets.load(this.mapData);
        this.mapSprite = new Sprite(mapTexture);
        this.mapSprite.anchor.set(0.5);
        this.mapContainer.addChild(this.mapSprite);
        this.app.stage.addChild(this.mapContainer);
        this.mapContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

        this.setupEventListeners();
        return this.mapContainer;
    }

    setupEventListeners() {
        this.mapContainer.eventMode = "static";
        this.mapContainer
            .on("pointerdown", this.onPointerDown.bind(this))
            .on("pointermove", this.onPointerMove.bind(this))
            .on("pointerup", this.onPointerUp.bind(this));
    }

    updateDraggableState() {
        const scaledWidth = this.mapSprite.width * this.mapContainer.scale.x;
        const scaledHeight = this.mapSprite.height * this.mapContainer.scale.y;
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        this.isDraggable = scaledWidth > screenWidth || scaledHeight > screenHeight;
        this.mapContainer.cursor = this.isDraggable ? "grab" : "default";

        if (!this.isDraggable) {
            this.mapContainer.position.set(screenWidth / 2, screenHeight / 2);
        }
    }

    clampPosition() {
        if (!this.isDraggable) return;

        const scaledWidth = this.mapSprite.width * this.mapContainer.scale.x;
        const scaledHeight = this.mapSprite.height * this.mapContainer.scale.y;
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        const minX = screenWidth / 2 - (scaledWidth - screenWidth) / 2;
        const maxX = screenWidth / 2 + (scaledWidth - screenWidth) / 2;
        const minY = screenHeight / 2 - (scaledHeight - screenHeight) / 2;
        const maxY = screenHeight / 2 + (scaledHeight - screenHeight) / 2;

        this.mapContainer.x = Math.min(Math.max(this.mapContainer.x, minX), maxX);
        this.mapContainer.y = Math.min(Math.max(this.mapContainer.y, minY), maxY);
    }

    onPointerDown(event) {
        if (!this.isDraggable) return;
        this.isDragging = true;
        this.lastPosition = event.global.clone();
        this.mapContainer.cursor = "grabbing";
    }

    onPointerMove(event) {
        if (!this.isDragging) return;
        const newPosition = event.global.clone();
        this.mapContainer.position.set(
            this.mapContainer.x + (newPosition.x - this.lastPosition.x),
            this.mapContainer.y + (newPosition.y - this.lastPosition.y)
        );
        this.lastPosition = newPosition;
        this.clampPosition();
    }

    onPointerUp() {
        this.isDragging = false;
        this.mapContainer.cursor = "grab";
    }

    onWheel(event) {
        event.preventDefault();
        requestAnimationFrame(() => {
            const scaleFactor = event.deltaY > 0 ? 0.4 : 1.1;
            this.mapContainer.scale.set(
                Math.max(0.4, Math.min(2, this.mapContainer.scale.x * scaleFactor))
            );
            this.updateDraggableState();
            this.clampPosition();
        });
    }

    destroy() {
        this.mapContainer.off("pointerdown", this.onPointerDown);
        this.mapContainer.off("pointermove", this.onPointerMove);
        this.mapContainer.off("pointerup", this.onPointerUp);
    }
}