import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  score: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 100,
    color: "#000",
  },

  item: {
    position: "absolute",
  },

  popcorn: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },

  characterContainer: {
    position: "absolute",
    bottom: 99,
    alignSelf: "center",
    alignItems: "center",
    marginLeft: 22,
  },

  character: {
    width: 110,
    height: 110,
    resizeMode: "contain",
  },

  bubble: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 15,
    marginBottom: 2,
    elevation: 5,
  },

  bubbleText: {
    fontSize: 14,
  },

  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
    marginRight: 7,
  },

  scoreIcon: {
    width: 80,
    height: 80,
    marginRight: -1,
    resizeMode: "contain",
  },

  scoreText: {
    fontSize: 23,
    marginTop: 14,
    fontWeight: "bold",
    color: "#000",
  },

  timerControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },

  controlIcon: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  iconText: {
    fontSize: 32,
  },

  iconImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },

  timerContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFD966",
    marginHorizontal: 15,
  },

  countdownContainer: {
    position: "absolute",
    top: 150,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#ffbb00",
    zIndex: 10,
  },

  countdownText: {
    fontSize: 52,
    fontWeight: "900",
    color: "#f57c00",
  },

  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD966",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "80%",
    elevation: 10,
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 12,
    textAlign: "center",
  },

  modalTitlePause: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 12,
    textAlign: "center",
  },

  modalTitleSuccess: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 12,
    textAlign: "center",
  },

  modalText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  resultScore: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 10,
    textAlign: "center",
  },

  modalButton: {
    backgroundColor: "#FFD966",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },

  modalButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  homeButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    //backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    padding: 12,
    zIndex: 100,
    marginRight: 157,
  },

  homeIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});
