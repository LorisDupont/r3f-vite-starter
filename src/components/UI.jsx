import { isHost, isStreamScreen, myPlayer } from "playroomkit";
import { useEffect, useState } from "react";
import { NB_ROUNDS, useGameEngine } from "../hooks/useGameEngine";

export const UI = () => {
    const {
      phase,
      startGame,
      timer,
      playerTurn,
      players,
      round,
      getCard,
      actionSuccess,
    } = useGameEngine();

    const currentPlayer = players[playerTurn];
    const me = myPlayer();
    const currentCard = getCard();
    const target =
      phase === "playerAction" &&
      currentCard === "attaque" &&
      players[currentPlayer.getState("playerTarget")];

        let label = "";
        switch (phase) {
            case "cards":
                label = "Choisi la carte que tu veux jouer"
                break;
            case "playerChoice":
                label =
                    currentPlayer.id === me.id
                        ? "Choisi le joueur que tu veux attaquer"
                        : `${currentPlayer?.state.profile?.name} est en train d'attaquer quelqu'un`;
                break;
            case "playerAction":
                switch (currentCard) {
                    case "attaque":
                        label = actionSuccess
                            ? `${currentPlayer?.state.profile?.name} attaque ${target?.state.profile?.name}`
                            : `${currentPlayer?.state.profile?.name} a rater son attaque sur ${target?.state.profile?.name}`;
                        break;
                    case "saisir":
                        label = actionSuccess
                            ? `${currentPlayer?.state.profile?.name} attrape une gemme !`
                            : `Pas de gemme disponible pour ${currentPlayer?.state.profile?.name}`;
                        break;
                    case "defense":
                        label = `${currentPlayer?.state.profile?.name} ne peut pas être attaqué avant le prochain tour`;
                        break;                      
                    default:
                        break;
                    }
                break;
                case "end":
                    label = "Game Over";
                    break;
                  default:
                    break;
                }

    return (
        <div className="text-white drop-shadow-xl fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col pointer-events-none">
            <div className="p-4 w-full flex items-center justify-between">
            <h2 className="text-2xl font-bold text-center uppercase">
                Tour {round}/{NB_ROUNDS}
            </h2>
    
            <div className=" flex items-center gap-1 w-14">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
                </svg>
                <h2 className="text-2xl font-bold text-center uppercase">{timer}</h2>
            </div>
            </div>
            <div className="flex-1" />
            <div className="p-4 w-full">
            <h1 className="text-2xl font-bold text-center">{label}</h1>
    
            {phase === "end" && (
                <p className="text-center">
                Gagnant:{" "}
                {players
                    .filter((player) => player.getState("winner"))
                    .map((player) => player.state.profile.name)
                    .join(", ")}
                !
                </p>
            )}
            {isHost() && phase === "end" && (
                <button
                onClick={startGame}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto"
                >
                Rejouer
                </button>
            )}
            </div>
        </div>
    );
};