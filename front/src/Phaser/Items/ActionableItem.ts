/**
 * An actionable item represents an in-game object that can be activated using the space-bar.
 * It has coordinates and an "activation radius"
 */
import Sprite = Phaser.GameObjects.Sprite;
import {OutlinePipeline} from "../Shaders/OutlinePipeline";
import {GameScene} from "../Game/GameScene";

type EventCallback = (state: unknown, parameters: unknown) => void;

export class ActionableItem {
    protected readonly activationRadiusSquared : number;
    protected isSelectable: boolean = false;
    protected callbacks: Map<string, Array<EventCallback>> = new Map<string, Array<EventCallback>>();

    public constructor(protected id: number, protected sprite: Sprite, protected eventHandler: GameScene, protected activationRadius: number, protected onActivateCallback: (item: ActionableItem) => void) {
        this.activationRadiusSquared = activationRadius * activationRadius;
    }

    public getId(): number {
        return this.id;
    }

    /**
     * Returns the square of the distance to the object center IF we are in item action range
     * OR null if we are out of range.
     */
    public actionableDistance(x: number, y: number): number|null {
        const distanceSquared = (x - this.sprite.x)*(x - this.sprite.x) + (y - this.sprite.y)*(y - this.sprite.y);
        if (distanceSquared < this.activationRadiusSquared) {
            return distanceSquared;
        } else {
            return null;
        }
    }

    /**
     * Show the outline of the sprite.
     */
    public selectable(): void {
        if (this.isSelectable) {
            return;
        }
        this.isSelectable = true;
        this.sprite.setPipeline(OutlinePipeline.KEY);
        this.sprite.pipeline.setFloat2('uTextureSize',
            this.sprite.texture.getSourceImage().width, this.sprite.texture.getSourceImage().height);
    }

    /**
     * Hide the outline of the sprite
     */
    public notSelectable(): void {
        if (!this.isSelectable) {
            return;
        }
        this.isSelectable = false;
        this.sprite.resetPipeline();
    }

    /**
     * Triggered when the "space" key is pressed and the object is in range of being activated.
     */
    public activate(): void {
        this.onActivateCallback(this);
    }

    public emit(eventName: string, state: unknown, parameters: unknown = null): void {
        this.eventHandler.emitActionableEvent(this.id, eventName, state, parameters);
        // Also, execute the action locally.
        this.fire(eventName, state, parameters);
    }

    public on(eventName: string, callback: EventCallback): void {
        let callbacksArray: Array<EventCallback>|undefined = this.callbacks.get(eventName);
        if (callbacksArray === undefined) {
            callbacksArray = new Array<EventCallback>();
            this.callbacks.set(eventName, callbacksArray);
        }
        callbacksArray.push(callback);
    }

    public fire(eventName: string, state: unknown, parameters: unknown): void {
        const callbacksArray = this.callbacks.get(eventName);
        if (callbacksArray === undefined) {
            return;
        }
        for (const callback of callbacksArray) {
            callback(state, parameters);
        }
    }
}
