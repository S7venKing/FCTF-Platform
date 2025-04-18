import { AnimatedSprite, Assets, Text, TextStyle, Texture, Container } from "pixi.js";
import characterTexture from "/assets/Warrior_Blue.png";

export const CharacterState = {
    IDLE: "idle",
    RUN: "run",
    ATTACK_1: "attack_1",
    ATTACK_2: "attack_2",
    ATTACK_3: "attack_3",
    ATTACK_4: "attack_4",
    ATTACK_5: "attack_5",
    ATTACK_6: "attack_6"
}

export class CharacterManager {
    constructor(app, mapContainer, characterTexture, user, challengeManager, globalSpeed = 1) {
        this.app = app;
        this.mapContainer = mapContainer;
        this.characterTexture = characterTexture;
        this.user = user;
        this.challengeManager = challengeManager;
        this.characterContainer = new Container();
        this.characterContainer.label = 'characterContainer';
        this.character = null;
        this.nameTag = null;
        this.animations = {};
        this.characterPosition = JSON.parse(localStorage.getItem("characterPosition")) || { x: 0, y: 0 };
        this.positionSaveInterval = null;
        this.isMoving = false;
        this.isAttacking = false;
        this.attackInterval = null;
        this.stopAttack = null;
        this.positionTicker = null;
        this.currentAnimation = CharacterState.IDLE;
        this.currentTopic = null;
        this.moveTicker = null;
        this.activeChallenge = null;
        this._globalSpeed = globalSpeed;
    }

    async initialize() {
        if (!this.mapContainer) return;
        this.mapContainer.addChild(this.characterContainer);

        const [] = await Promise.all([
            Assets.load(characterTexture),
            Assets.load("/assets/Warrior_Blue.json"),
        ]);

        const frameAnimation = [];
        for (let i = 0; i < 48; i++) {
            const frameName = i.toString().padStart(2, "0") + ".png";
            if (Assets.cache.has(frameName)) {
                frameAnimation.push(Texture.from(frameName));
            } else {
                console.warn(`Missing frame: ${frameName}`);
            }
        }

        this.animations = {
            [CharacterState.IDLE]: this.createAnimationFrames(frameAnimation, 0),
            [CharacterState.RUN]: this.createAnimationFrames(frameAnimation, 1),
            [CharacterState.ATTACK_1]: this.createAnimationFrames(frameAnimation, 2),
            [CharacterState.ATTACK_2]: this.createAnimationFrames(frameAnimation, 3),
            [CharacterState.ATTACK_3]: this.createAnimationFrames(frameAnimation, 4),
            [CharacterState.ATTACK_4]: this.createAnimationFrames(frameAnimation, 5),
            [CharacterState.ATTACK_5]: this.createAnimationFrames(frameAnimation, 6),
            [CharacterState.ATTACK_6]: this.createAnimationFrames(frameAnimation, 7)
        };

        this.createCharacter();
        this.setupPositionSaving();
        return this.characterContainer;
    }

    createAnimationFrames(frames, index) {
        return frames.slice(index * 6, index * 6 + 6);
    }

    createCharacter() {
        this.character = new AnimatedSprite(this.animations[CharacterState.IDLE]);
        const userHash = this.user.id
            .toString()
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const tintColor = 0xFFFFFF ^ ((userHash * 1234567) % 0xFFFFFF);
        this.character.tint = tintColor;
        this.character.anchor.set(0.5);
        this.character.position.set(
            this.user.x || this.characterPosition.x,
            this.user.y || this.characterPosition.y
        );
        this.character.animationSpeed = 0.2 * this.globalSpeed;
        this.character.play();
        this.character.zIndex = 2;
        this.character.metadata = {
            id: this.user.id,
            name: this.user.name
        };

        this.character.eventMode = "static";
        this.character.interactive = true;
        this.character.interactiveChildren = true;
        this.createNameTag();
        this.setupCharacterInteractions();
        this.characterContainer.addChild(this.character);
    }

    createNameTag() {
        const textStyle = new TextStyle({
            fontFamily: "Arial",
            fontSize: 24,
            fill: "#ffffff",
            stroke: { color: "#000000", width: 4 }
        });

        this.nameTag = new Text({
            text: this.user.name,
            style: textStyle
        });
        this.nameTag.anchor.set(0.5);
        this.nameTag.position.set(this.characterPosition.x, this.characterPosition.y - 50);
        this.nameTag.visible = false;
        this.nameTag.zIndex = 3;
        this.characterContainer.addChild(this.nameTag);

        this.app.ticker.add(() => {
            if (this.character && this.nameTag) {
                this.nameTag.position.set(
                    this.character.x,
                    this.character.y - 50
                );
            }
        });
    }

    setupCharacterInteractions() {
        this.character.on("pointerover", () => { this.nameTag.visible = true; });
        this.character.on("pointerout", () => { this.nameTag.visible = false; });
    }

    setupPositionSaving() {
        this.positionSaveInterval = setInterval(() => {
            this.saveCharacterPosition();
        }, 5000);
    }

    saveCharacterPosition() {
        if (!this.character) return;
        this.characterPosition = { x: this.character.x, y: this.character.y };
        localStorage.setItem("characterPosition", JSON.stringify(this.characterPosition));
    }

    moveToChallenge(challengeSprite, onComplete) {
        if (!this.character || this.isMoving || !this.characterContainer) return;

        if (this.activeChallenge && this.activeChallenge !== challengeSprite) {
            this.challengeManager.stopShakeEffect(this.activeChallenge);
            this.activeChallenge.tint = 0xFFFFFF;
        }

        this.activeChallenge = challengeSprite;
        this.isMoving = true;

        const baseSpeed = 3;
        const speed = baseSpeed * this.globalSpeed;
        const attackRange = 100;

        this.updateAnimation(CharacterState.RUN);

        const target = {
            x: challengeSprite.position.x,
            y: challengeSprite.position.y
        };

        const moveCharacterToTarget = () => {
            const dx = target.x - this.character.x;
            const dy = target.y - this.character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (dx !== 0) {
                this.character.scale.x = Math.sign(dx) * Math.abs(this.character.scale.x);
            }

            if (distance > attackRange) {
                this.character.position.x += (dx / distance) * speed;
                this.character.position.y += (dy / distance) * speed;
            } else {
                this.app.ticker.remove(moveCharacterToTarget);
                this.isMoving = false;
                this.updateAnimation(CharacterState.IDLE);

                if (onComplete) onComplete();
            }
        };

        this.moveTicker = moveCharacterToTarget;
        this.app.ticker.add(this.moveTicker);
    }

    pauseMovement() {
        if (this.moveTicker) {
            this.app.ticker.remove(this.moveTicker);
        }
    }

    resumeMovement() {
        if (this.moveTicker && this.isMoving) {
            this.app.ticker.add(this.moveTicker);
        }
    }

    resumeAttack() {
        if (this.isAttacking && this.activeChallenge) {
            this.performAttack(this.activeChallenge, this.attackOnComplete, this.attackOptions);
        }
    }

    setSpeed(newSpeed) {
        this.globalSpeed = newSpeed;
        if (this.character && this.currentAnimation) {
            this.character.animationSpeed = newSpeed * 0.1;
            if (this.character.playing) {
                this.character.play();
            }
        }
        if (this.moveTween) {
            this.moveTween.timeScale(newSpeed);
        }
        if (this.attackTween) {
            this.attackTween.timeScale(newSpeed);
        }
    }

    updatePosition(newPosition) {
        if (!this.character) return;

        if (this.positionTicker) {
            this.app.ticker.remove(this.positionTicker);
        }

        const lerp = (start, end, amt) => {
            return (1 - amt) * start + amt * end;
        };

        this.positionTicker = () => {
            if (!this.character) return;

            this.character.x = lerp(this.character.x, newPosition.x, 0.1);
            this.character.y = lerp(this.character.y, newPosition.y, 0.1);

            if (this.nameTag) {
                this.nameTag.position.set(this.character.x, this.character.y - 50);
            }

            const dx = newPosition.x - this.character.x;
            const dy = newPosition.y - this.character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
                if (this.currentAnimation !== CharacterState.RUN) {
                    this.updateAnimation(CharacterState.RUN);
                }
            } else {
                this.updateAnimation(CharacterState.IDLE);
                this.app.ticker.remove(this.positionTicker);
            }
        };

        this.app.ticker.add(this.positionTicker);
    }

    updateAnimation(state) {
        if (!Object.values(CharacterState).includes(state)) {
            console.warn(`Invalid animation state: ${state}`);
            return;
        }
        if (this.currentAnimation === state) return;
        if (!this.character || !this.animations[state]) return;

        this.character.textures = this.animations[state];
        this.character.animationSpeed = 0.2 * this.globalSpeed;
        this.character.play();
        this.currentAnimation = state;
    }

    set globalSpeed(value) {
        this._globalSpeed = value;
        if (this.character) {
            this.character.animationSpeed = 0.2 * value;
        }
    }

    get globalSpeed() {
        return this._globalSpeed;
    }

    performAttack(challengeSprite, onComplete, options = { shake: false }) {
        if (!challengeSprite || !challengeSprite.position || typeof challengeSprite.position.set !== "function") {
            console.error("Invalid challengeSprite passed to performAttack:", challengeSprite);
            return;
        }

        this.stopAttack?.();
        this.isAttacking = true;
        this.activeChallenge = challengeSprite;
        this.attackOptions = options;
        this.attackOnComplete = onComplete;

        this.updateAnimation(CharacterState.ATTACK_2);

        if (options.shake && this.challengeManager?.createShakeEffect) {
            const intervalTime = 300 / this.globalSpeed;
            const shakeInterval = setInterval(() => {
                this.challengeManager.createShakeEffect(challengeSprite, 4, 500);
            }, intervalTime);

            this.attackInterval = shakeInterval;
        }

        this.stopAttack = () => {
            this.isAttacking = false;
            if (this.attackInterval) {
                clearInterval(this.attackInterval);
                this.attackInterval = null;
            }

            this.challengeManager?.stopShakeEffect(challengeSprite);
            this.updateAnimation(CharacterState.IDLE);

            if (typeof onComplete === "function") {
                onComplete();
            }
        };
    }

    destroy() {
        if (this.positionSaveInterval) {
            clearInterval(this.positionSaveInterval);
            this.positionSaveInterval = null;
        }

        if (this.positionTicker) {
            this.app.ticker.remove(this.positionTicker);
            this.positionTicker = null;
        }

        if (this.characterContainer) {
            this.characterContainer.destroy({ children: true });
            this.characterContainer = null;
        }

        this.character = null;
    }
}