import { AnimatedSprite, Assets } from "pixi.js";

export class CoinManager {
    constructor(app, parentContainer) {
        this.app = app;
        this.parentContainer = parentContainer;
        this.coinAnimations = [];
    }

    async initialize() {
        try {
            // Load sprite sheet data và texture
            const coinSheet = await Assets.load({
                src: "/assets/Coin.json",
                data: {
                    meta: {
                        image: "/assets/Coin.png"
                    }
                }
            });

            // Kiểm tra xem textures đã được tạo đúng cách chưa
            if (!coinSheet.textures) {
                throw new Error("Failed to create textures from sprite sheet");
            }

            // Lấy tất cả các texture từ sprite sheet
            this.coinAnimations = Object.values(coinSheet.textures)
                .sort((a, b) => a.frame.x - b.frame.x); // Sắp xếp theo thứ tự

            return true;
        } catch (error) {
            console.error("Failed to load coin animations:", error);
            return false;
        }
    }

    createExplosionAnimation(x, y) {
        if (!this.coinAnimations || this.coinAnimations.length === 0) {
            console.warn("Coin animations not loaded");
            return null;
        }

        const coin = new AnimatedSprite(this.coinAnimations);
        coin.animationSpeed = 0.15;
        coin.loop = false;
        coin.anchor.set(0.5);
        coin.position.set(x, y);
        coin.scale.set(1.5);
        coin.zIndex = 15;

        coin.onComplete = () => {
            this.parentContainer.removeChild(coin);
            coin.destroy();
        };

        this.parentContainer.addChild(coin);
        coin.play();

        return coin;
    }
}