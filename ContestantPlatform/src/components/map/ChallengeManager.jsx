import { Container, Assets, Sprite, Text, TextStyle } from "pixi.js";
import { BASE_URL, API_CHALLENGE_GET_TOPICS } from "../../constants/ApiConstant";
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
        const api = new ApiHelper(BASE_URL);
        try {
            const response = await api.get(API_CHALLENGE_GET_TOPICS);
            console.log("API Response:", response);
            return response.data;
        } catch (err) {
            console.error("Error fetching challenges:", err);
            return [];
        }
    }

    async initialize() {
        this.challenges = await this.fetchChallenges();
        const texture = await Assets.load(this.challengesTexture);
        this.mapContainer.addChild(this.challengesContainer);

        const savedPositions = this.getSavedChallengePositions();

        if (savedPositions && savedPositions.timestamp && this.isWithin24Hours(savedPositions.timestamp)) {
            this.challenges.forEach((challenge, index) => {
                this.createChallenge(challenge, texture, savedPositions.positions[index]);
            });
        } else {
            const newPositions = this.getChallengePositions(this.challenges);
            this.challenges.forEach((challenge, index) => {
                this.createChallenge(challenge, texture, newPositions[index]);
            });
            this.saveChallengePositions(newPositions);
        }

        return this.challengesContainer;
    }

    getSavedChallengePositions() {
        const savedData = localStorage.getItem("challengePositions");
        return savedData ? JSON.parse(savedData) : null;
    }

    saveChallengePositions(positions) {
        const data = positions.map((pos, index) => ({
            id: this.challenges[index].challengeId,
            x: pos.x,
            y: pos.y,
        }));
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
        const challengeSprite = new Sprite(texture);
        challengeSprite.anchor.set(0.5);
        challengeSprite.scale.set(1);
        challengeSprite.position.set(position.x, position.y);
        challengeSprite.zIndex = 1;
        this.challengesContainer.addChild(challengeSprite);

        const challengeText = new Text({
            text: challenge.topic_name,
            style: this.textStyle
        });
        challengeText.visible = false;
        challengeText.anchor.set(0.5);
        challengeText.position.set(position.x, position.y - 100);
        challengeText.zIndex = 1;
        this.challengesContainer.addChild(challengeText);

        challengeSprite.eventMode = "static";
        challengeSprite.on("pointerover", () => { challengeText.visible = true; });
        challengeSprite.on("pointerout", () => { challengeText.visible = false; });

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
                sprite.x = originalX;
                sprite.y = originalY;
                this.app.ticker.remove(shake);
                return;
            }

            const decay = 1 - progress;
            const offsetX = (Math.random() - 0.5) * intensity * decay * 2;
            const offsetY = (Math.random() - 0.5) * intensity * decay * 2;

            sprite.x = originalX + offsetX;
            sprite.y = originalY + offsetY;
        };

        this.app.ticker.add(shake);
    }

    stopShakeEffect(sprite) {
        if (!sprite || !sprite.position) return;
        sprite.x = Math.round(sprite.x);
        sprite.y = Math.round(sprite.y);
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