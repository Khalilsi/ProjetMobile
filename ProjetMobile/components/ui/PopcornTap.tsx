import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";
import { GAME_IDS } from "../../constants/games";
import { submitScore } from "../../services/scoreService";

const { width, height } = Dimensions.get("window");

// 🎨 popcorn variations
const popcornImages = [
  require("../../assets/images/popcorn.png"),
  require("../../assets/images/popcorn2.png"),
  require("../../assets/images/popcorn3.png"),
  require("../../assets/images/popcorn4.png"),
];

// 💬 messages based on total pops at the end
const getFinalMessage = (totalPops: number) => {
  if (totalPops >= 100) return " INSANE! You're a popping machine! ";
  if (totalPops >= 70) return " Great job! That's impressive! ";
  if (totalPops >= 40) return " Not bad! Keep practicing! ";
  if (totalPops >= 20) return " Meh... you can do better... ";
  return "🐌 Slow poke! Try again! 🐌";
};

// Dynamic popping messages
/*const poppingMessages = [
  "Pop! ",
  "Got one! ",
  "Nice! ",
  "Keep going! ",
  "You're on fire! ",
  "Delicious! ",
  "Another one! ",
  "Fast fingers! ",
];
*/
type Item = {
  id: number;
  x: number;
  y: number;
  image: any;
};

interface GameScreenProps {
  onBackToWelcome?: () => void;
}

export default function GameScreen({ onBackToWelcome }: GameScreenProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showPausePopup, setShowPausePopup] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Grid system for popcorn spawning
  const gridSize = 90;
  const topMargin = 180;
  const bottomMargin = 350;
  const leftMargin = 30;
  const rightMargin = 30;

  const getAvailableGridPositions = (existingItems: Item[]) => {
    const positions: { x: number; y: number }[] = [];

    for (let x = leftMargin; x < width - rightMargin; x += gridSize) {
      for (let y = topMargin; y < height - bottomMargin; y += gridSize) {
        const isFarEnough = existingItems.every((item) => {
          const distance = Math.sqrt(
            Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2),
          );
          return distance >= gridSize;
        });

        if (isFarEnough) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  };

  // Countdown before game starts
  useEffect(() => {
    if (countdown > 0) {
      const id = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(id);
    }
    setGameActive(true);
  }, [countdown]);

  // Resume countdown effect
  useEffect(() => {
    if (resumeCountdown > 0) {
      const id = setTimeout(() => setResumeCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(id);
    } else if (
      resumeCountdown === 0 &&
      isPaused === false &&
      gameActive === false
    ) {
      setGameActive(true);
    }
  }, [resumeCountdown, isPaused, gameActive]);

  // Timer effect - show results when time runs out
  useEffect(() => {
    if (gameActive && timeLeft > 0 && !isPaused) {
      timerInterval.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            clearInterval(timerInterval.current!);
            setGameActive(false);
            setShowResultPopup(true);
            // ✅ Submit score to backend when game ends
            setScore((finalScore) => {
              setScoreSubmitted(false);
              setSubmitError(null);
              submitScore(GAME_IDS.POPCORN_TAP, finalScore)
                .then(() => setScoreSubmitted(true))
                .catch((err) =>
                  setSubmitError(err.message ?? "Failed to save score"),
                );
              return finalScore;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [gameActive, isPaused]);

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      itemTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    } else if (gameActive && !isPaused && items.length > 0) {
      itemTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      itemTimeouts.current.clear();

      items.forEach((item) => {
        const timeoutId = setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          itemTimeouts.current.delete(item.id);
        }, 2000);
        itemTimeouts.current.set(item.id, timeoutId);
      });
    }

    return () => {
      itemTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, [isPaused, gameActive]);

  // Spawn popcorns
  useEffect(() => {
    if (!gameActive || isPaused || countdown > 0) return;

    const interval = setInterval(() => {
      setItems((currentItems) => {
        const availablePositions = getAvailableGridPositions(currentItems);

        if (availablePositions.length === 0) {
          return currentItems;
        }

        let updatedItems = [...currentItems];
        const spawnCount = 4;

        for (let i = 0; i < spawnCount && availablePositions.length > 0; i++) {
          const randomIndex = Math.floor(
            Math.random() * availablePositions.length,
          );
          const position = availablePositions.splice(randomIndex, 1)[0];

          const randomImage =
            popcornImages[Math.floor(Math.random() * popcornImages.length)];

          const newItem: Item = {
            id: Date.now() + i,
            x: position.x,
            y: position.y + 30,
            image: randomImage,
          };

          updatedItems.push(newItem);

          const timeoutId = setTimeout(() => {
            setItems((prev) => prev.filter((item) => item.id !== newItem.id));
            itemTimeouts.current.delete(newItem.id);
          }, 2000);

          itemTimeouts.current.set(newItem.id, timeoutId);
        }

        return updatedItems;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [gameActive, isPaused, countdown]);

  const handlePress = (item: Item) => {
    if (!gameActive || isPaused || countdown > 0) return;

    const newScore = score + 1;
    setScore(newScore);

    // Show random popping message with current score
    //const randomMessage =
    //poppingMessages[Math.floor(Math.random() * poppingMessages.length)];
    //setMessage(`${randomMessage} (${newScore})`);

    if (messageTimeout.current) {
      clearTimeout(messageTimeout.current);
    }

    messageTimeout.current = setTimeout(() => {
      setMessage("");
    }, 600);

    // Clear the timeout for this item
    const timeoutId = itemTimeouts.current.get(item.id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      itemTimeouts.current.delete(item.id);
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handlePause = () => {
    if (gameActive && !isPaused) {
      setIsPaused(true);
      setShowPausePopup(true);
    }
  };

  const handleResume = () => {
    setShowPausePopup(false);
    setIsPaused(false);
    setGameActive(false);
    setResumeCountdown(3);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setShowResultPopup(false);
    setShowPausePopup(false);
    setGameActive(false);
    setItems([]);
    setMessage("");
    setCountdown(3);
    setIsPaused(false);
    setResumeCountdown(0);
    setScoreSubmitted(false);
    setSubmitError(null);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    itemTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    itemTimeouts.current.clear();
  };

  const handleHomePress = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    itemTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    itemTimeouts.current.clear();
    if (messageTimeout.current) {
      clearTimeout(messageTimeout.current);
    }
    onBackToWelcome?.();
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.container}
    >
      {/* Score */}
      <View style={styles.scoreContainer}>
        <Image
          source={require("../../assets/images/jesus.png")}
          style={styles.scoreIcon}
        />
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      {/* Timer & Controls */}
      <View style={styles.timerControlsContainer}>
        <TouchableOpacity style={styles.controlIcon} onPress={handlePause}>
          <Image
            source={require("../../assets/images/pause.png")}
            style={styles.iconImage}
          />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        </View>

        <TouchableOpacity style={styles.controlIcon} onPress={resetGame}>
          <Image
            source={require("../../assets/images/retry.png")}
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>

      {/* Initial Countdown */}
      {countdown > 0 && !resumeCountdown && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Resume Countdown */}
      {resumeCountdown > 0 && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{resumeCountdown}</Text>
        </View>
      )}

      {/* POPCORN */}
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, { top: item.y, left: item.x }]}
          onPress={() => handlePress(item)}
        >
          <Image source={item.image} style={styles.popcorn} />
        </TouchableOpacity>
      ))}

      {/* CHARACTER */}
      <View style={styles.characterContainer}>
        {message !== "" && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}

        <Image
          source={require("../../assets/images/character1.png")}
          style={styles.character}
        />
      </View>

      {/* Home Button at Bottom */}
      <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
        <Image
          source={require("../../assets/images/home.png")}
          style={styles.homeIcon}
        />
      </TouchableOpacity>

      {/* Pause Popup Modal */}
      <Modal
        transparent={true}
        visible={showPausePopup}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitlePause}>What? tired already! 😏</Text>
            <Text style={styles.modalText}>Hurry up!!</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleResume}>
              <Text style={styles.modalButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Result Popup Modal - Shows total pops when time runs out */}
      <Modal
        transparent={true}
        visible={showResultPopup}
        animationType="fade"
        onRequestClose={() => setShowResultPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Time's Up! ⏰</Text>
            <Text style={styles.resultScore}>
              You popped {score} popcorn{score !== 1 ? "s" : ""}!
            </Text>
            <Text style={styles.modalText}>{getFinalMessage(score)}</Text>
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
            <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
