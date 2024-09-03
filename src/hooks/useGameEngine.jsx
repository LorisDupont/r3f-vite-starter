import { useControls } from "leva";
import {
  getState,
  isHost,
  onPlayerJoin,
  useMultiplayerState,
  usePlayersList,
} from "playroomkit";
import React, { useEffect, useRef } from "react";
import { randInt } from "three/src/math/MathUtils";

const GameEngineContext = React.createContext();

const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 3;
export const NB_ROUNDS = 3;
const NB_GEMS = 3;
const CARDS_PER_PLAYER = 4;

export const GameEngineProvider = ({ children }) => {
  const [timer, setTimer] = useMultiplayerState("timer", 0);
  const [round, setRound] = useMultiplayerState("round", 1);
  const [phase, setPhase] = useMultiplayerState("phase", "lobby");
  const [playerTurn, setPlayerTurn] = useMultiplayerState("playerTurn", 0);
  const [playerStart, setPlayerStart] = useMultiplayerState("playerStart", 0);
  const [deck, setDeck] = useMultiplayerState("deck", []);
  const [gems, setGems] = useMultiplayerState("gems", NB_GEMS);
  const [actionSuccess, setActionSuccess] = useMultiplayerState(
    "actionSuccess",
    true
  );

  const players = usePlayersList(true);
  players.sort((a, b) => a.id.localeCompare(b.id));

  const gameState = {
    timer,
    round,
    phase,
    playerTurn,
    playerStart,
    players,
    gems,
    deck,
    actionSuccess,
  };

  const distributeCards = (nbCards) => {
    const newDeck = [...getState("deck")];
    players.forEach((player) => {
      const cards = player.getState("cards") || [];
      for (let i = 0; i < nbCards; i++) {
        const randomIndex = randInt(0, newDeck.length - 1);
        cards.push(newDeck[randomIndex]);
        newDeck.splice(randomIndex, 1);
      }
      player.setState("cards", cards, true);
      player.setState("selectedCard", 0, true);
      player.setState("playerTarget", -1, true);
    });
    setDeck(newDeck, true);
  };

  const startGame = () => {
    if (isHost()) {
      console.log("Start game");
      setTimer(TIME_PHASE_CARDS, true);
      const randomPlayer = randInt(0, players.length - 1);
      setPlayerStart(randomPlayer, true);
      setPlayerTurn(randomPlayer, true);
      setRound(1, true);
      setDeck(
        [
          ...new Array(16).fill(0).map(() => "attaque"),
          ...new Array(24).fill(0).map(() => "saisir"),
          ...new Array(8).fill(0).map(() => "defense"),
        ],
        true
      );
      setGems(NB_GEMS, true);
      players.forEach((player) => {
        console.log("Initialisation du joueur", player.id);
        player.setState("cards", [], true);
        player.setState("gems", 0, true);
        player.setState("defense", false, true);
        player.setState("winner", false, true);
      });
      distributeCards(CARDS_PER_PLAYER);
      setPhase("cards", true);
    }
  };

  useEffect(() => {
    startGame();
    onPlayerJoin(startGame);
  }, []);

  const performPlayerAction = () => {
    const player = players[getState("playerTurn")];
    console.log("Action du joueur", player.id);
    const selectedCard = player.getState("selectedCard");
    const cards = player.getState("cards");
    const card = cards[selectedCard];
    let success = true;
    if (card !== "defense") {
      player.setState("defense", false, true);
    }
    switch (card) {
      case "attaque":
        let target = players[player.getState("playerTarget")];
        if (!target) {
          let targetIndex = (getState("playerTurn") + 1) % players.length;
          player.setState("Joueur cible", targetIndex, true);
          target = players[targetIndex];
        }
        console.log("Joueur attaquer", target.id);
        if (target.getState("defense")) {
          console.log("Le joueur est protéger");
          success = false;
          break;
        }
        if (target.getState("gems") > 0) {
          target.setState("gems", target.getState("gems") - 1, true);
          setGems(getState("gems") + 1, true);
          console.log("Gemme disponible");
        }
        break;
      case "saisir":
        if (getState("gems") > 0) {
          player.setState("gems", player.getState("gems") + 1, true);
          setGems(getState("gems") - 1, true);
          console.log("Gemme attrapée");
        } else {
          console.log("Pas de gemme disponible");
          success = false;
        }
        break;
      case "defense":
        console.log("Bouclier");
        player.setState("defense", true, true);
        break;
      default:
        break;
    }
    setActionSuccess(success, true);
  };

  const removePlayerCard = () => {
    const player = players[getState("playerTurn")];
    const cards = player.getState("cards");
    const selectedCard = player.getState("selectedCard");
    cards.splice(selectedCard, 1);
    player.setState("cards", cards, true);
  };

  const getCard = () => {
    const player = players[getState("playerTurn")];
    if (!player) {
      return "";
    }
    const cards = player.getState("cards");
    if (!cards) {
      return "";
    }
    const selectedCard = player.getState("selectedCard");
    return cards[selectedCard];
  };

  const phaseEnd = () => {
    let newTime = 0;
    switch (getState("phase")) {
      case "cards":
        if (getCard() === "attaque") {
          setPhase("playerChoice", true);
          newTime = TIME_PHASE_PLAYER_CHOICE;
        } else {
          performPlayerAction();
          setPhase("playerAction", true);
          newTime = TIME_PHASE_PLAYER_ACTION;
        }
        break;
      case "playerChoice":
        performPlayerAction();
        setPhase("playerAction", true);
        newTime = TIME_PHASE_PLAYER_ACTION;
        break;
      case "playerAction":
        removePlayerCard();
        const newPlayerTurn = (getState("playerTurn") + 1) % players.length;
        if (newPlayerTurn === getState("playerStart")) {
          if (getState("round") === NB_ROUNDS) {
            console.log("Partie terminée");
            let maxGems = 0;
            players.forEach((player) => {
              if (player.getState("gems") > maxGems) {
                maxGems = player.getState("gems");
              }
            });
            players.forEach((player) => {
              player.setState(
                "Gagnant",
                player.getState("gems") === maxGems,
                true
              );
              player.setState("cards", [], true);
            });
            setPhase("end", true);
          } else {
            console.log("Tour suivant");
            const newPlayerStart =
              (getState("playerStart") + 1) % players.length;
            setPlayerStart(newPlayerStart, true);
            setPlayerTurn(newPlayerStart, true);
            setRound(getState("round") + 1, true);
            distributeCards(1); 
            setPhase("cards", true);
            newTime = TIME_PHASE_CARDS;
          }
        } else {
          console.log("Joueur suivant");
          setPlayerTurn(newPlayerTurn, true);
          if (getCard() === "attaque") {
            setPhase("playerChoice", true);
            newTime = TIME_PHASE_PLAYER_CHOICE;
          } else {
            performPlayerAction();
            setPhase("playerAction", true);
            newTime = TIME_PHASE_PLAYER_ACTION;
          }
        }
        break;
      default:
        break;
    }
    setTimer(newTime, true);
  };

  const { paused } = useControls({
    paused: false,
  });

  const timerInterval = useRef();

  const runTimer = () => {
    timerInterval.current = setInterval(() => {
      if (!isHost()) return;
      if (paused) return;
      let newTime = getState("timer") - 1;
      console.log("Timer", newTime);

      if (newTime <= 0) {
        phaseEnd();
      } else {
        setTimer(newTime, true);
      }
    }, 1000);
  };

  const clearTimer = () => {
    clearInterval(timerInterval.current);
  };

  useEffect(() => {
    runTimer();
    return clearTimer;
  }, [phase, paused]);

  return (
    <GameEngineContext.Provider
      value={{
        ...gameState,
        startGame,
        getCard,
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
};

export const useGameEngine = () => {
  const context = React.useContext(GameEngineContext);
  if (context === undefined) {
    throw new Error("useGameEngine must be used within a GameEngineProvider");
  }
  return context;
};