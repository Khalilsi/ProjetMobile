import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { GAME_IDS } from "../constants/games";
import { submitScore } from "../services/scoreService";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Candy = {
  id: number;
  x: number;
  y: number;
  speed: number;
};

type DifficultyPhase = "easy" | "normal" | "moderate" | "hard" | "extreme";

export default function GameScreen({
  onBackToWelcome,
}: {
  onBackToWelcome?: () => void;
}) {
  const [showReady, setShowReady] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const candiesRef = useRef<Candy[]>([]);
  const [renderTick, setRenderTick] = useState(0);
  const [score, setScore] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPausePopup, setShowPausePopup] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [hearts, setHearts] = useState(3);
  const [showHeartLossMessage, setShowHeartLossMessage] = useState(false);
  const [heartLossMessage, setHeartLossMessage] = useState("");
  const [gameTime, setGameTime] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [difficultyPhase, setDifficultyPhase] =
    useState<DifficultyPhase>("easy");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const plusOneAnim = useRef(new Animated.Value(0)).current;
  const heartLossAnim = useRef(new Animated.Value(0)).current;
  const gameTimeInterval = useRef<number | null>(null);

  const basketX = useRef(SCREEN_WIDTH / 2 - 50);
  const basketAnimX = useRef(new Animated.Value(SCREEN_WIDTH / 2 - 50)).current;
  const basketWidth = 100;
  const basketHeight = 60;
  const basketBottomMargin = 60;

  // Track occupied columns for candy spawning
  const occupiedColumns = useRef<Set<number>>(new Set());
  const containerWidth = useRef(SCREEN_WIDTH);
  const containerHeight = useRef(0);
  const candySize = 50;
  // Computed from live container width so they stay correct after layout
  const getColumnsCount = () => Math.floor(containerWidth.current / candySize);
  const getColumnWidth = () => containerWidth.current / getColumnsCount();

  // Refs for intervals and timeouts
  const spawnInterval = useRef<number | null>(null);
  const animationInterval = useRef<number | null>(null);
  const countdownTimeouts = useRef<number[]>([]);
  const heartLossTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate difficulty parameters based on game time
  const calculateDifficultyParameters = (timeInSeconds: number) => {
    let phase: DifficultyPhase = "easy";
    let spawnRate = 1000; // milliseconds
    let speedMultiplier = 1;
    let difficultyPercent = 0;

    // Easy: 0-15 seconds
    if (timeInSeconds < 15) {
      phase = "easy";
      spawnRate = 800; // CHANGED: from 1200 to 800 for faster spawning at start
      speedMultiplier = 1;
      difficultyPercent = (timeInSeconds / 15) * 20;
    }
    // Normal: 15-30 seconds
    else if (timeInSeconds < 30) {
      phase = "normal";
      spawnRate = 700;
      speedMultiplier = 1.2;
      difficultyPercent = 20 + ((timeInSeconds - 15) / 15) * 20;
    }
    // Moderate: 30-60 seconds
    else if (timeInSeconds < 60) {
      phase = "moderate";
      spawnRate = 600;
      speedMultiplier = 1.5 + ((timeInSeconds - 30) / 30) * 0.5;
      difficultyPercent = 40 + ((timeInSeconds - 30) / 30) * 20;
    }
    // Hard: 60-120 seconds
    else if (timeInSeconds < 120) {
      phase = "hard";
      spawnRate = 450;
      speedMultiplier = 2 + ((timeInSeconds - 60) / 60) * 1;
      difficultyPercent = 60 + ((timeInSeconds - 60) / 60) * 20;
    }
    // Extreme: 120+ seconds
    else {
      phase = "extreme";
      spawnRate = 250;
      speedMultiplier = 3 + ((timeInSeconds - 120) / 120) * 0.5;
      difficultyPercent = 80 + Math.min(((timeInSeconds - 120) / 60) * 20, 20);
    }

    return {
      phase,
      spawnRate: Math.max(spawnRate, 200), // minimum spawn rate
      speedMultiplier,
      difficultyPercent: Math.min(difficultyPercent, 100),
    };
  };

  // Clear all intervals
  const clearAllIntervals = () => {
    if (spawnInterval.current) {
      clearInterval(spawnInterval.current);
      spawnInterval.current = null;
    }
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
    }
    if (gameTimeInterval.current) {
      clearInterval(gameTimeInterval.current);
      gameTimeInterval.current = null;
    }
  };

  // Clear all countdown timeouts
  const clearCountdownTimeouts = () => {
    countdownTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    countdownTimeouts.current = [];
  };

  // Get available columns (not occupied)
  const getAvailableColumns = () => {
    const available: number[] = [];
    for (let i = 0; i < getColumnsCount(); i++) {
      if (!occupiedColumns.current.has(i)) {
        available.push(i);
      }
    }
    return available;
  };

  // Get random available column
  const getRandomAvailableColumn = () => {
    const available = getAvailableColumns();
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  // Get X position from column index
  const getXFromColumn = (column: number) => {
    const cw = getColumnWidth();
    return column * cw + cw / 2 - candySize / 2;
  };

  // Trigger vibration
  const triggerVibration = () => {
    Vibration.vibrate(100);
  };

  // Lose heart function
  const loseHeart = () => {
    triggerVibration();

    setHearts((prevHearts) => {
      const newHearts = prevHearts - 1;

      if (newHearts === 2) {
        setHeartLossMessage("💔 Oops!Lost one");
        showHeartLossAnimation();
      } else if (newHearts === 1) {
        setHeartLossMessage(" Be careful!!");
        showHeartLossAnimation();
      }

      if (newHearts <= 0) {
        gameOver(" You lost all your hearts! Game Over! ");
        return 0;
      }

      return newHearts;
    });
  };

  // Show heart loss animation
  const showHeartLossAnimation = () => {
    setShowHeartLossMessage(true);
    heartLossAnim.setValue(0);

    Animated.timing(heartLossAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setShowHeartLossMessage(false);
    });
  };

  // Game over function
  const gameOver = (message: string) => {
    if (!gameActive) return;

    Vibration.vibrate([200, 100, 200]);

    setGameActive(false);
    setIsPaused(false);
    setGameOverMessage(message);
    setShowGameOverPopup(true);
    clearAllIntervals();
    occupiedColumns.current.clear();

    // ✅ Submit score to backend when game ends
    setScore((finalScore) => {
      setScoreSubmitted(false);
      setSubmitError(null);
      submitScore(GAME_IDS.CANDY_CATCHER, finalScore)
        .then(() => setScoreSubmitted(true))
        .catch((err) => setSubmitError(err.message ?? "Failed to save score"));
      return finalScore;
    });
  };

  // Reset game completely
  const resetGame = () => {
    clearAllIntervals();
    clearCountdownTimeouts();

    setGameActive(false);
    setIsPaused(false);
    setShowPausePopup(false);
    setShowGameOverPopup(false);
    candiesRef.current = [];
    setScore(0);
    setHearts(3);
    setShowPlusOne(false);
    setGameOverMessage("");
    setShowHeartLossMessage(false);
    setGameTime(0);
    setDifficulty(0);
    setDifficultyPhase("easy");
    setScoreSubmitted(false);
    setSubmitError(null);
    occupiedColumns.current.clear();

    if (heartLossTimeout.current) {
      clearTimeout(heartLossTimeout.current);
    }

    setTimeout(() => {
      startCountdown();
    }, 50);
  };

  // Back to welcome screen function
  const handleBackToWelcome = () => {
    clearAllIntervals();
    clearCountdownTimeouts();
    if (heartLossTimeout.current) {
      clearTimeout(heartLossTimeout.current);
    }

    setGameActive(false);
    setIsPaused(false);
    setShowPausePopup(false);
    setShowGameOverPopup(false);
    candiesRef.current = [];
    occupiedColumns.current.clear();

    if (onBackToWelcome) {
      onBackToWelcome();
    }
  };

  // Start the countdown sequence
  const startCountdown = () => {
    setShowReady(true);
    setCountdown(3);
    setShowGo(false);
    setGameActive(false);
    setShowGameOverPopup(false);

    clearCountdownTimeouts();

    const readyTimer = setTimeout(() => {
      setShowReady(false);

      const countdown2 = setTimeout(() => {
        setCountdown(2);
      }, 1000);

      const countdown1 = setTimeout(() => {
        setCountdown(1);
      }, 2000);

      const goTimer = setTimeout(() => {
        setShowGo(true);
      }, 3000);

      const startGameTimer = setTimeout(() => {
        setShowGo(false);
        setCountdown(0);
        setGameActive(true);
      }, 3800);

      countdownTimeouts.current.push(
        countdown2,
        countdown1,
        goTimer,
        startGameTimer,
      );
    }, 1200);

    countdownTimeouts.current.push(readyTimer);
  };

  // Initialize game on mount
  useEffect(() => {
    startCountdown();

    return () => {
      clearAllIntervals();
      clearCountdownTimeouts();
      if (heartLossTimeout.current) {
        clearTimeout(heartLossTimeout.current);
      }
    };
  }, []);

  // Game time tracking and difficulty updates
  useEffect(() => {
    if (!gameActive || isPaused) {
      if (gameTimeInterval.current) {
        clearInterval(gameTimeInterval.current);
        gameTimeInterval.current = null;
      }
      return;
    }

    gameTimeInterval.current = setInterval(() => {
      setGameTime((prev) => {
        const newTime = prev + 1;
        const params = calculateDifficultyParameters(newTime);
        setDifficulty(params.difficultyPercent);
        setDifficultyPhase(params.phase);
        return newTime;
      });
    }, 1000);

    return () => {
      if (gameTimeInterval.current) {
        clearInterval(gameTimeInterval.current);
        gameTimeInterval.current = null;
      }
    };
  }, [gameActive, isPaused]);

  // Pan responder for basket movement
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        let newX = gestureState.moveX - basketWidth / 2;
        newX = Math.max(
          10,
          Math.min(newX, containerWidth.current - basketWidth - 10),
        );
        basketX.current = newX;
        basketAnimX.setValue(newX);
      },
    }),
  ).current;

  // Spawn candies with difficulty scaling
  useEffect(() => {
    if (!gameActive || isPaused) return;

    if (spawnInterval.current) clearInterval(spawnInterval.current);

    const params = calculateDifficultyParameters(gameTime);

    spawnInterval.current = setInterval(() => {
      const availableColumn = getRandomAvailableColumn();

      if (availableColumn === null) return;

      occupiedColumns.current.add(availableColumn);

      const newCandy: Candy = {
        id: Date.now() + Math.random(),
        x: getXFromColumn(availableColumn),
        y: 50, // Start from top
        speed: (Math.random() * 2 + 5) * params.speedMultiplier,
      };

      candiesRef.current = [...candiesRef.current, newCandy];
      setRenderTick((t) => t + 1);
    }, params.spawnRate);

    return () => {
      if (spawnInterval.current) {
        clearInterval(spawnInterval.current);
        spawnInterval.current = null;
      }
    };
  }, [gameActive, isPaused, gameTime]);

  // Animate candies falling and collision detection
  useEffect(() => {
    if (!gameActive || isPaused) return;

    if (animationInterval.current) clearInterval(animationInterval.current);

    animationInterval.current = setInterval(() => {
      const prevCandies = candiesRef.current;
      const updatedCandies: Candy[] = [];
      let newScore = 0;
      let heartsLost = 0;

      const h = containerHeight.current;
      const basketTop = h - basketBottomMargin - basketHeight;
      const basketLeft = basketX.current;
      const basketRight = basketX.current + basketWidth;
      const basketBottom = h - basketBottomMargin + 5;

      for (const candy of prevCandies) {
        const newY = candy.y + candy.speed;

        // candy.x is the left edge, candy is candySize×candySize px
        const candyBottom = newY + candySize;
        const candyCenterX = candy.x + candySize / 2;

        if (
          candyBottom >= basketTop &&
          candyCenterX >= basketLeft &&
          candyCenterX <= basketRight &&
          newY < basketBottom
        ) {
          newScore++;
          setShowPlusOne(true);
          plusOneAnim.setValue(0);
          Animated.timing(plusOneAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start(() => setShowPlusOne(false));
          const columnIndex = Math.floor(candy.x / getColumnWidth());
          occupiedColumns.current.delete(columnIndex);
          continue; // caught — do not add to updatedCandies
        }

        const groundLevel = h - 50;
        if (newY + candySize >= groundLevel) {
          const columnIndex = Math.floor(candy.x / getColumnWidth());
          occupiedColumns.current.delete(columnIndex);
          heartsLost++;
          continue;
        }

        if (newY > h - 50) {
          const columnIndex = Math.floor(candy.x / getColumnWidth());
          occupiedColumns.current.delete(columnIndex);
          continue;
        }

        updatedCandies.push({ ...candy, y: newY });
      }

      // Synchronously update the ref so the very next render reflects removals
      candiesRef.current = updatedCandies;

      if (newScore > 0) setScore((prev) => prev + newScore);
      for (let i = 0; i < heartsLost; i++) loseHeart();

      // Trigger re-render
      setRenderTick((t) => t + 1);
    }, 16);

    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
    };
  }, [gameActive, isPaused]);

  const handlePause = () => {
    if (gameActive && !isPaused) {
      setIsPaused(true);
      setShowPausePopup(true);
    }
  };

  const handleResume = () => {
    setShowPausePopup(false);
    setIsPaused(false);
  };

  const handleRetry = () => {
    resetGame();
  };

  const plusOneTranslateY = plusOneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const plusOneOpacity = plusOneAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.7, 0],
  });

  const heartLossOpacity = heartLossAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  // Get difficulty display info
  const getDifficultyDisplay = () => {
    const emojis: Record<DifficultyPhase, string> = {
      easy: "🌱",
      normal: "🌿",
      moderate: "🔥",
      hard: "⚡",
      extreme: "💥",
    };

    const colors: Record<DifficultyPhase, string> = {
      easy: "#4ADE80",
      normal: "#60A5FA",
      moderate: "#FBBF24",
      hard: "#F87171",
      extreme: "#EC4899",
    };

    return {
      emoji: emojis[difficultyPhase],
      color: colors[difficultyPhase],
    };
  };

  // Render hearts
  const renderHearts = () => {
    return (
      <View style={styles.heartsContainer}>
        {[...Array(3)].map((_, index) => (
          <Text key={index} style={styles.heartText}>
            {index < hearts ? "❤️" : "🖤"}
          </Text>
        ))}
      </View>
    );
  };

  // Render difficulty progress panel
  const renderDifficultyPanel = () => {
    const display = getDifficultyDisplay();
    return (
      <View style={[styles.difficultyPanel, { borderColor: display.color }]}>
        <Text style={styles.difficultyEmoji}>{display.emoji}</Text>
        <View style={styles.difficultyProgressBar}>
          <View
            style={[
              styles.difficultyProgressFill,
              {
                width: `${difficulty}%`,
                backgroundColor: display.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.difficultyText, { color: display.color }]}>
          {difficultyPhase.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/images/2.png")}
      style={styles.container}
      resizeMode="cover"
      onLayout={(e) => {
        containerHeight.current = e.nativeEvent.layout.height;
      }}
    >
      {/* Top Container for ready, countdown, and GO */}
      <View style={styles.topContainer}>
        {showReady && <Text style={styles.readyText}>Are you ready?</Text>}
        {!showReady && countdown > 0 && !showGo && (
          <Text style={styles.countdownText}>{countdown}</Text>
        )}
        {showGo && <Text style={styles.goText}>GO!</Text>}
      </View>

      {/* Top Bar with Controls, Hearts, and Score */}
      <View style={styles.topBar}>
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
            <Image
              source={require("../assets/images/p.png")}
              style={styles.controlButtonImage}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleRetry}>
            <Image
              source={require("../assets/images/r.png")}
              style={styles.controlButtonImage}
            />
          </TouchableOpacity>
        </View>

        {/* Hearts with message and difficulty panel below */}
        <View style={styles.heartsWrapper}>
          {renderHearts()}

          {/* Heart Loss Message - appears just under hearts */}
          {showHeartLossMessage && (
            <Animated.View
              style={[
                styles.heartLossMessageContainer,
                { opacity: heartLossOpacity },
              ]}
            >
              <Text style={styles.heartLossMessageText}>
                {heartLossMessage}
              </Text>
            </Animated.View>
          )}

          {/* Difficulty Progress Panel */}
          {gameActive && renderDifficultyPanel()}
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>🍬 {score}</Text>
        </View>
      </View>

      {/* Candies */}
      {candiesRef.current.map((candy) => (
        <Animated.View
          key={candy.id}
          style={[
            styles.candy,
            {
              left: candy.x,
              top: candy.y,
            },
          ]}
        >
          <Text style={styles.candyEmoji}>🍬</Text>
        </Animated.View>
      ))}

      {/* +1 Animation */}
      {showPlusOne && (
        <Animated.View
          style={[
            styles.plusOneContainer,
            {
              transform: [{ translateY: plusOneTranslateY }],
              opacity: plusOneOpacity,
              left: basketX.current + basketWidth / 2 - 25,
              bottom: basketBottomMargin + basketHeight + 10,
            },
          ]}
        >
          <Text style={styles.plusOneText}>+1🍭​</Text>
        </Animated.View>
      )}

      {/* Basket */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.basket,
          {
            left: basketAnimX,
            bottom: basketBottomMargin,
          },
        ]}
      >
        <Image
          source={require("../assets/images/basket.png")}
          style={styles.basketImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Pause Popup Modal */}
      <Modal
        transparent={true}
        visible={showPausePopup}
        animationType="fade"
        onRequestClose={handleResume}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCircle}>
            <Text style={styles.modalTitle}>Why we stopping 🫣</Text>
            <Text style={styles.modalTextCircle}>Hurry up!!</Text>
            <TouchableOpacity
              style={styles.modalButtonCircle}
              onPress={handleResume}
            >
              <Text style={styles.modalButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over Popup Modal */}
      <Modal
        transparent={true}
        visible={showGameOverPopup}
        animationType="fade"
        onRequestClose={() => setShowGameOverPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentGameOver}>
            <Text style={styles.modalTitleGameOver}> GAME OVER </Text>
            <Text style={styles.gameOverMessage}>{gameOverMessage}</Text>
            <Text style={styles.finalScoreText}>
              Your Score: {score} 🍬 (Level: {difficultyPhase})
            </Text>
            {/* ✅ Score submission feedback */}
            {scoreSubmitted && (
              <Text style={{ color: "green", marginBottom: 6, fontSize: 13 }}>
                ✅ Score saved!
              </Text>
            )}
            {submitError && (
              <Text style={{ color: "red", marginBottom: 6, fontSize: 12 }}>
                ⚠️ {submitError}
              </Text>
            )}
            <TouchableOpacity
              style={styles.modalButtonGameOver}
              onPress={resetGame}
            >
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  readyText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: "800",
    color: "#ffafcc",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  goText: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#4ADE80",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFD966",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  controlButtonImage: {
    width: 44.9,
    height: 44.9,
  },

  heartsWrapper: {
    alignItems: "center",
  },
  heartsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heartText: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  heartLossMessageContainer: {
    marginTop: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  heartLossMessageText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B6B",
    textAlign: "center",
  },
  difficultyPanel: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    gap: 4,
  },
  difficultyEmoji: {
    fontSize: 14,
  },
  difficultyProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  difficultyProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scoreContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFD966",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD966",
  },
  candy: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  candyEmoji: {
    fontSize: 40,
  },
  basket: {
    position: "absolute",
    width: 100,
    height: 60,
    //backgroundColor: "rgba(139, 69, 19, 0.9)",
    //borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    /*borderWidth: 2,
    borderColor: "#CD853F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,*/
  },
  basketImage: {
    width: 120,
    height: 80,
    resizeMode: "contain",
  },
  plusOneContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  plusOneText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD966",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentCircle: {
    width: 260,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#FFD966",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4ADE80",
    marginBottom: 8,
    textAlign: "center",
  },
  modalTextCircle: {
    fontSize: 18,
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
  },
  modalButtonCircle: {
    backgroundColor: "#FFD966",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  modalContentGameOver: {
    width: 300,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#FF4444",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitleGameOver: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  gameOverMessage: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginBottom: 12,
  },
  finalScoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD966",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonGameOver: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
