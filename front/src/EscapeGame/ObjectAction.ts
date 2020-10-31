import {ActionableItem} from "../Phaser/Items/ActionableItem";
import Sprite = Phaser.GameObjects.Sprite;
import {GameScene} from "../Phaser/Game/GameScene";
import {ItemFactoryInterface} from "../Phaser/Items/ItemFactoryInterface";
import {HtmlUtils} from "../WebRtc/HtmlUtils";
import {ITiledMapObject} from "../Phaser/Map/ITiledMap";
import {UserInputManager} from "../Phaser/UserInput/UserInputManager";
import {layoutManager} from "../WebRtc/LayoutManager";

class ActionableItemExt extends ActionableItem{
    /**
     * Returns the square of the distance to the object center IF we are in item action range
     * OR null if we are out of range.
     */
    public constructor(
        id: number,
        sprite: Sprite,
        eventHandler: GameScene,
        activationRadius: number,
        onActivateCallback: (item: ActionableItem) => void,
        private onDisabledCallback: (item: ActionableItem) => void
    ) {
        super(id, sprite, eventHandler, activationRadius, onActivateCallback)
    }
    public actionableDistance(x: number, y: number): number|null {
        if (Math.abs(x - this.sprite.x) <= 32 && Math.abs(y - this.sprite.y) <= 32) {
            this.onActivateCallback(this);
            return null;
        } else {
            this.onDisabledCallback(this);
            return null;
        }
    }
}

export class ObjectAction implements ItemFactoryInterface{
    divHtmlElement: HTMLDivElement;
    constructor(public name: string, public img: string, public description: string) {

        this.divHtmlElement = document.createElement('div');
        this.divHtmlElement.classList.add('object');
        this.divHtmlElement.id = name;
        this.divHtmlElement.style.display = 'none';

        const pTitle: HTMLParagraphElement = document.createElement('p');
        pTitle.classList.add('title');
        pTitle.innerText = name;
        this.divHtmlElement.appendChild(pTitle);

        const imgCarte: HTMLImageElement = document.createElement('img');
        imgCarte.src = img;
        this.divHtmlElement.appendChild(imgCarte);

        const pDescription: HTMLParagraphElement = document.createElement('p');
        pDescription.classList.add('body');
        pDescription.innerText = description;
        this.divHtmlElement.appendChild(pDescription);

        const main = HtmlUtils.getElementByIdOrFail('main-container');
        main.appendChild(this.divHtmlElement);
    }

    public active(){
        this.divHtmlElement.style.display = 'block';
    }

    public disable(){
        this.divHtmlElement.style.display = 'none';
    }

    public preload(loader: Phaser.Loader.LoaderPlugin){};
    public create(scene: GameScene){};
    public factory(
        scene: GameScene,
        object: ITiledMapObject,
        initState: unknown,
        userInputManager?: UserInputManager
    ){
        const sprite = new Sprite(scene, object.x, object.y, '');
        sprite.visible = false;
        if(!userInputManager){
            return new ActionableItemExt(object.id, sprite, scene, 32, (item: ActionableItem) => {}, (item: ActionableItem) => {});
        }
        return new ActionableItemExt(object.id, sprite, scene, 32, (item: ActionableItem) => {
            layoutManager.addActionButton(`openObject-${this.name}`, 'Clik on SPACE to show object', () => {
                this.active();
                layoutManager.removeActionButton(`openObject-${this.name}`, userInputManager);
            }, userInputManager);
        }, (item: ActionableItem) => {
            layoutManager.removeActionButton(`openObject-${this.name}`, userInputManager);
            this.disable();
        });
    }
}