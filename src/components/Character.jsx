import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";

const CHARACTERS = ["ganjaarl", "lizard", "prayerful", "knight"];

export const Character = ({ character = 0, animation='', ...props }) => {
  const characterName = CHARACTERS[character] || CHARACTERS[0];

  const { scene, animations } = useGLTF(`/models/Characters_${characterName}.glb`);

  const ref = useRef();
  const { actions } = useAnimations(animations, ref);

  console.log(actions);

  useEffect(() => {
    if (animation && actions[animation]) {
      actions[animation].reset().fadeIn(0.5).play();
      return () => actions[animation]?.fadeOut(0.5);
    }
  }, [animation, actions]);

  return (
    <group {...props} ref={ref}>
      <primitive object={scene} />
    </group>
  );
};
