import { AnimatedSprite, Assets } from "pixi.js";

export class ExplosionManager {
    constructor(app, parentContainer) {
        this.app = app;
        this.parentContainer = parentContainer;
        this.explosionAnimations = [];
    }

    async initialize() {
        try {
            // Load sprite sheet data và texture
            const explosionSheet = await Assets.load({
                src: "/assets/Explosion.json",
                data: {
                    meta: {
                        image: "/assets/Explosion.png"
                    }
                }
            });

            // Kiểm tra xem textures đã được tạo đúng cách chưa
            if (!explosionSheet.textures) {
                throw new Error("Failed to create textures from sprite sheet");
            }

            // Lấy tất cả các texture từ sprite sheet
            this.explosionAnimations = Object.values(explosionSheet.textures)
                .sort((a, b) => a.frame.x - b.frame.x); // Sắp xếp theo thứ tự

            return true;
        } catch (error) {
            console.error("Failed to load coin animations:", error);
            return false;
        }
    }

    createExplosionAnimation(x, y) {
        if (!this.explosionAnimations || this.explosionAnimations.length === 0) {
            console.warn("Coin animations not loaded");
            return null;
        }

        const explosion = new AnimatedSprite(this.explosionAnimations);
        explosion.animationSpeed = 0.15;
        explosion.loop = false;
        explosion.anchor.set(0.5);
        explosion.position.set(x, y);
        explosion.scale.set(1.5);
        explosion.zIndex = 15;

        explosion.onComplete = () => {
            this.parentContainer.removeChild(explosion);
            explosion.destroy();
        };

        this.parentContainer.addChild(explosion);
        explosion.play();

        return explosion;
    }
}