import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import mapData from "/assets/map.png";
import characterTexture from "/assets/Warrior_Blue.png";
import challengesTexture from "/assets/Tower_Red.png";
import { useUser } from '../contexts/UserContext';
import { MapManager } from "./MapManager.jsx";
import { ChallengeManager } from "./ChallengeManager.jsx";
import { CharacterManager, CharacterState } from "./CharacterManager.jsx";
import { io } from "socket.io-client";
import { BASE_URL } from "../../constants/ApiConstant";
import { ACCESS_TOKEN_KEY } from "../../constants/LocalStorageKey";
import { actionType } from "../../constants/ActionLogConstant";

const PixiMap = () => {
    const pixiContainer = useRef(null);
    const appRef = useRef(null);
    const { user } = useUser();
    const mapManagerRef = useRef(null);
    const challengeManagerRef = useRef(null);
    const characterManagerRef = useRef(null);
    const otherCharactersRef = useRef({});
    const positionUpdateIntervalRef = useRef(null);
    let targetCharacterCurrent = null;

    const handleLogs = (newLogs) => {
        if (!newLogs || !challengeManagerRef.current || !characterManagerRef.current) {
            console.warn("Invalid logs or missing references.");
            return;
        }

        const filteredLogs = Array.isArray(newLogs)
            ? newLogs.filter((log) => log.userId) : newLogs.userId ? [newLogs] : [];

        if (filteredLogs.length === 0) {
            console.warn("No relevant logs for the current user.");
            return;
        }
        console.log("Filtered Logs:", filteredLogs);

        challengeManagerRef.current.challenges.forEach(challenge => {
            challengeManagerRef.current.stopShakeEffect(challenge.sprite);
        });

        filteredLogs.forEach((log) => {
            if (!log.topicName || log.topicName === "Null" || log.topicName === "None") return;
            if (typeof log.actionType === actionType.UNDEFINED) {
                console.warn("Missing actionType in log:", log);
                return;
            }

            if (log.userId === user?.id) {
                targetCharacterCurrent = characterManagerRef.current;
            } else {
                targetCharacterCurrent = otherCharactersRef.current[log.userId];
                if (!targetCharacterCurrent) return;
            }

            if (!targetCharacterCurrent) return;

            const challengeSprite = challengeManagerRef.current.findChallengeByTopicName(log.topicName);
            if (!challengeSprite) return;

            const relatedLogs = filteredLogs.filter(
                (l) => l.userId === log.userId
            );

            if (relatedLogs.length === 0) return;

            const accessChallenge = relatedLogs.some((l) => l.actionType === actionType.ACCESS_CHALLENGE);
            const correctFlag = relatedLogs.some((l) => l.actionType === actionType.CORRECT_FLAG);
            const incorrectFlag = relatedLogs.some((l) => l.actionType === actionType.INCORRECT_FLAG);

            if (accessChallenge) {
                targetCharacterCurrent.moveToChallenge(challengeSprite, () => {
                    const isChallengeSolved = relatedLogs.some(
                        (l) => l.topicName === log.topicName && l.actionType === actionType.CORRECT_FLAG
                    );

                    if (isChallengeSolved) {
                        console.log(`Challenge "${log.challengeName}" has already been solved.`);
                        return;
                    }

                    targetCharacterCurrent.performAttack(challengeSprite);
                });
            } else if (correctFlag) {
                targetCharacterCurrent.moveToChallenge(challengeSprite, () => {
                    if (targetCharacterCurrent.stopAttack) {
                        targetCharacterCurrent.stopAttack();
                    }
                });
            } else if (incorrectFlag) {
                targetCharacterCurrent.moveToChallenge(challengeSprite, () => {
                    if (targetCharacterCurrent.stopAttack) {
                        targetCharacterCurrent.stopAttack();
                    }
                    setTimeout(() => {
                        targetCharacterCurrent.performAttack(challengeSprite);
                    }, 3000);
                });
            } else {
                console.warn(`Unhandled actionType: ${log.actionType}`);
            }
        });
    };

    useEffect(() => {
        if (!pixiContainer.current || !user || appRef.current) return;

        (async () => {
            const app = new Application();
            appRef.current = app;
            await app.init({ background: "#87CEEB", resizeTo: pixiContainer.current });
            while (pixiContainer.current.firstChild) {
                pixiContainer.current.removeChild(pixiContainer.current.firstChild);
            }
            pixiContainer.current.appendChild(app.canvas);

            mapManagerRef.current = new MapManager(app, mapData);
            const mapContainer = await mapManagerRef.current.initialize();
            if (!mapContainer) {
                console.error("Failed to initialize map container. Retrying...");
                return;
            }

            challengeManagerRef.current = new ChallengeManager(app, mapContainer, challengesTexture);
            challengeManagerRef.current.onChallengeClicked = (challengeSprite) => {
                if (characterManagerRef.current) {
                    characterManagerRef.current.moveToChallenge(challengeSprite, () => { });
                }
            };
            await challengeManagerRef.current.initialize();

            const initialPosition = JSON.parse(localStorage.getItem("characterPosition")) || {
                x: Math.floor(Math.random() * 600 - 300),
                y: Math.floor(Math.random() * 400 - 200)
            };

            characterManagerRef.current = new CharacterManager(
                app,
                mapContainer,
                characterTexture,
                {
                    ...user,
                    x: initialPosition.x,
                    y: initialPosition.y
                },
                challengeManagerRef.current
            );
            await characterManagerRef.current.initialize();

            const onWheel = (event) => {
                mapManagerRef.current.onWheel(event);
            };
            pixiContainer.current.addEventListener("wheel", onWheel, { passive: false });

            return () => {
                pixiContainer.current?.removeEventListener("wheel", onWheel);
                if (mapManagerRef.current) {
                    mapManagerRef.current.destroy();
                    mapManagerRef.current = null;
                }

                if (challengeManagerRef.current) {
                    challengeManagerRef.current.destroy();
                    challengeManagerRef.current = null;
                }

                if (characterManagerRef.current) {
                    characterManagerRef.current.destroy();
                    characterManagerRef.current = null;
                }

                if (appRef.current) {
                    appRef.current.destroy(true);
                    appRef.current = null;
                }
            };
        })();
    }, [user]);

    useEffect(() => {
        let socket;

        const initializeSocket = () => {
            try {
                socket = io(BASE_URL, {
                    auth: { token: localStorage.getItem(ACCESS_TOKEN_KEY) },
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 2000
                });

                socket.on("all-characters", (data) => {
                    data.characters.forEach(addOtherCharacter);
                });
                socket.on("add-character-to-map", addOtherCharacter);
                socket.on("remove-character-from-map", ({ id }) => {
                    if (!otherCharactersRef.current[id]) return;
                    otherCharactersRef.current[id].destroy();
                    delete otherCharactersRef.current[id];
                });

                socket.on("update-character-position", ({ id, position, animation }) => {
                    if (!otherCharactersRef.current[id]) return;
                    otherCharactersRef.current[id].updatePosition(position);
                    otherCharactersRef.current[id].updateAnimation(animation);
                });

                socket.on("update-challenge-positions", (data) => {
                    if (data.positions) {
                        updateChallengePositions(data.positions);
                    }
                });

                socket.on("challenge-selected", (newLogs) => {
                    if (!newLogs) {
                        console.warn("No logs received.");
                        return;
                    }

                    const logsArray = Array.isArray(newLogs) ? newLogs : [newLogs];
                    handleLogs(logsArray);
                });
            } catch (error) {
                console.error("Failed to initialize WebSocket connection:", error);
            }
        };

        const addOtherCharacter = (character) => {
            if (!mapManagerRef.current?.mapContainer) return;

            if (character?.id !== user?.id && !otherCharactersRef.current[character?.id]) {
                const otherCharacter = new CharacterManager(
                    appRef.current,
                    mapManagerRef.current.mapContainer,
                    characterTexture,
                    character,
                    challengeManagerRef.current
                );
                otherCharacter.initialize().then(() => {
                    otherCharactersRef.current[character.id] = otherCharacter;
                    if (character.position) {
                        otherCharacter.updatePosition(character.position);
                    }
                }).catch(error => {
                    console.error("Failed to initialize character:", error);
                });
            }
        };

        positionUpdateIntervalRef.current = setInterval(() => {
            if (characterManagerRef.current?.character && socket.connected) {
                const newPosition = {
                    x: characterManagerRef.current.character.x,
                    y: characterManagerRef.current.character.y
                };
                const newAnimationState = characterManagerRef.current.currentAnimation;

                const prevPosition = JSON.parse(localStorage.getItem("characterPosition"));
                const prevAnimation = localStorage.getItem("characterAnimation");

                if (
                    !prevPosition ||
                    prevPosition.x !== newPosition.x ||
                    prevPosition.y !== newPosition.y ||
                    prevAnimation !== newAnimationState
                ) {
                    socket.emit("update-character-position", {
                        userId: user?.id,
                        position: newPosition,
                        animation: newAnimationState
                    });
                    localStorage.setItem("characterPosition", JSON.stringify(newPosition));
                    localStorage.setItem("characterAnimation", newAnimationState);
                }
            }
        }, 100);

        const updateChallengePositions = (positions) => {
            if (!challengeManagerRef.current) return;

            positions.forEach((position) => {
                const challenge = challengeManagerRef.current.challenges.find(
                    (c) => c.challengeId === position.id
                );
                if (challenge) {
                    challenge.sprite.position.set(position.x, position.y);
                }
            });
        };

        initializeSocket();

        return () => {
            clearInterval(positionUpdateIntervalRef.current);
            if (socket) {
                socket.off("all-characters");
                socket.off("add-character-to-map");
                socket.off("remove-character-from-map");
                socket.off("update-character-position");
                socket.off("challenge-selected");
                socket.disconnect();
            }
            Object.values(otherCharactersRef.current).forEach(character => {
                character.destroy();
            });
            otherCharactersRef.current = {};
        };
    }, [user?.id]);

    useEffect(() => {
        if (targetCharacterCurrent) {
            handleLogs(logs);
        }
    }, []);

    if (!user) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl">Loading map...</div>
            </div>
        );
    }

    return <div ref={pixiContainer} className="w-full h-full overflow-hidden" />;
};

export default PixiMap;