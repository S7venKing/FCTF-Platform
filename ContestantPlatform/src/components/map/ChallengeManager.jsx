import { Container, Assets, Sprite, Text, TextStyle } from "pixi.js";
import { BASE_URL, API_PUBLIC_CHALLENGE_GET_TOPICS } from "../../constants/ApiConstant";
import ApiHelper from "../../utils/ApiHelper";

export class ChallengeManager {
    constructor(app, mapContainer, challengesTexture) {
        this.app = app;
        this.mapContainer = mapContainer;
        this.challengesTexture = challengesTexture;
        this.challengesContainer = new Container();
        this.challenges = [];
        this.textStyle = new TextStyle({
            fontFamily: "Arial",
            fontSize: 24,
            fill: "#ffffff",
            stroke: { color: "#000000", width: 4 }
        });
    }

    async fetchChallenges() {
        const api = new ApiHelper(BASE_URL, false);
        try {
            const response = await api.get(API_PUBLIC_CHALLENGE_GET_TOPICS);
            console.log("API Response:", response);
            return response.data;
        } catch (err) {
            console.error("Error fetching challenges:", err);
            return [];
        }
    }

    async initialize() {
        const texture = await Assets.load(this.challengesTexture);
        this.challenges = await this.fetchChallenges();

        const savedPositions = this.getSavedChallengePositions();
        const positions = (savedPositions && savedPositions.positions &&
            savedPositions.positions.length === this.challenges.length)
            ? savedPositions.positions
            : this.generateNewPositions();

        this.mapContainer.addChild(this.challengesContainer);
        // Tạo challenges với vị trí đã xác định
        this.challenges.forEach((challenge, index) => {
            this.createChallenge(challenge, texture, positions[index]);
        });

        // Nếu là vị trí mới, lưu vào localStorage
        if (!savedPositions || savedPositions.positions.length !== this.challenges.length) {
            this.saveChallengePositions(positions);
        }

        return this.challengesContainer;
    }

    generateNewPositions() {
        const positions = this.getChallengePositions(this.challenges);
        this.saveChallengePositions(positions);
        return positions;
    }

    getSavedChallengePositions() {
        try {
            const savedData = localStorage.getItem("challengePositions");
            if (!savedData) return null;

            const parsed = JSON.parse(savedData);
            // Kiểm tra cấu trúc dữ liệu
            if (parsed && Array.isArray(parsed.positions)) {
                return parsed;
            }
            return null;
        } catch (e) {
            console.error("Error parsing saved positions:", e);
            return null;
        }
    }

    saveChallengePositions(positions) {
        const data = {
            timestamp: Date.now(),
            positions: positions.map((pos, index) => ({
                id: this.challenges[index].id,
                x: pos.x,
                y: pos.y
            }))
        };
        localStorage.setItem("challengePositions", JSON.stringify(data));
    }

    isWithin24Hours(timestamp) {
        const currentTime = Date.now();
        const timeDifference = currentTime - timestamp;
        return timeDifference < 24 * 60 * 60 * 1000;
    }

    getChallengePositions(challenges) {
        const padding = 150;
        const maxAttempts = 100;
        const newPositions = [];
        const screenWidth = 800;
        const screenHeight = 600;

        for (let i = 0; i < challenges.length; i++) {
            let attempt = 0;
            let positionFound = false;
            let newX, newY;

            while (attempt < maxAttempts && !positionFound) {
                attempt++;
                positionFound = true;

                newX = Math.random() * screenWidth - screenWidth / 2;
                newY = Math.random() * screenHeight - screenHeight / 2;

                for (const pos of newPositions) {
                    const dx = newX - pos.x;
                    const dy = newY - pos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < padding) {
                        positionFound = false;
                        break;
                    }
                }
            }

            if (!positionFound) {
                console.warn(`Failed to find a valid position for challenge ${i}. Using fallback position.`);
                newX = Math.random() * screenWidth - screenWidth / 2;
                newY = Math.random() * screenHeight - screenHeight / 2;
            }

            newPositions.push({
                x: newX,
                y: newY
            });
        }

        return newPositions;
    }

    createChallenge(challenge, texture, position) {
        if (!texture || !position) {
            console.error("Missing texture or position for challenge", challenge);
            return null;
        }
        const challengeSprite = new Sprite(texture);
        challengeSprite.anchor.set(0.5);
        challengeSprite.scale.set(1);
        challengeSprite.position.set(position.x, position.y);
        challengeSprite.zIndex = 1;
        challengeSprite.metadata = {
            challengeId: challenge.id,
            topicName: challenge.topic_name
        };
        this.challengesContainer.addChild(challengeSprite);

        const challengeText = new Text({
            text: challenge.topic_name,
            style: this.textStyle
        });
        challengeText.visible = true;
        challengeText.anchor.set(0.5);
        challengeText.position.set(position.x, position.y - 100);
        challengeText.zIndex = 1;
        this.challengesContainer.addChild(challengeText);

        this.challenges.push({
            challengeId: challenge.id,
            sprite: challengeSprite,
            topicName: challenge.topic_name
        });

        return challengeSprite;
    }

    createShakeEffect(sprite, intensity = 4, duration = 500) {
        if (!sprite || !sprite.position) return;

        const originalX = sprite.x;
        const originalY = sprite.y;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                sprite.position.set(originalX, originalY);
                this.app.ticker.remove(shake);
                return;
            }

            const decay = 1 - progress;
            const offsetX = (Math.random() - 0.5) * intensity * decay * 2;
            const offsetY = (Math.random() - 0.5) * intensity * decay * 2;

            sprite.position.set(
                originalX + offsetX,
                originalY + offsetY
            );
        };

        this.app.ticker.add(shake);
    }

    stopShakeEffect(sprite) {
        if (!sprite || !sprite.position) return;
        sprite.position.set(Math.round(sprite.x), Math.round(sprite.y));
    }

    findChallengeByTopicName(topicName) {
        if (!topicName || topicName === "Null" || topicName === "None") {
            console.warn("Invalid or ignored topicName provided:", topicName);
            return null;
        }

        if (!this.challenges || this.challenges.length === 0) {
            console.warn("No challenges available to search.");
            return null;
        }

        const challenge = this.challenges.find(
            (c) => c.topicName && c.topicName.toLowerCase() === topicName.toLowerCase()
        );

        if (!challenge || !challenge.sprite || typeof challenge.sprite.position.set !== "function") {
            console.warn(`Challenge with topicName "${topicName}" not found or invalid.`);
            return null;
        }

        return challenge.sprite;
    }

    destroy() {
        this.challengesContainer.destroy({ children: true });
    }
}