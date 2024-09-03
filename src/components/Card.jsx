import { Text, useFont, useGLTF, useTexture } from "@react-three/drei";
import React from "react";

const CARD_DESCRIPTIONS = {
  attaque: "Frappes l'ennemi et dérobes lui une gemme.",
  defense: "Protège-toi d'une attaque ennemie.",
  saisir: "Attrape une gemme dans le trésor, si il n'y en a plus tu ne reçois rien.",
};

export function Card({ type = "defense", ...props }) {
  const { nodes, materials } = useGLTF(`models/background.glb`);
  const texture = useTexture(`cards/${type}.jpg`);

  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Plane.geometry}>
        <meshStandardMaterial
            {...materials.Front}
            map={texture}
            color="white"
          />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane_1.geometry}
        material={materials.Borders}
      />
      <mesh castShadow receiveShadow geometry={nodes.Plane_2.geometry} material={materials.Back} />
      <Text
        font="/fonts/RubikMonoOne-Regular.ttf"
        fontSize={0.1}
        anchorY={"top"}
        anchorX={"left"}
        position-x={-0.46}
        position-y={-0.3}
        position-z={0.01}
      >
        {type.toUpperCase()}
        <meshStandardMaterial
          color="white"
          roughness={materials.Front.roughness}
        />
      </Text>
      <Text
        font="/fonts/RobotoSlab-VariableFont_wght.ttf"
        fontSize={0.06}
        maxWidth={0.9}
        anchorY={"top"}
        anchorX={"left"}
        position-x={-0.46}
        position-y={-0.44}
        position-z={0.01}
        lineHeight={1}
      >
        {CARD_DESCRIPTIONS[type] || ""}
        <meshStandardMaterial
          color="white"
          roughness={materials.Front.roughness}
        />
      </Text>
    </group>
  )
}

useGLTF.preload("/models/background.glb");
useTexture.preload("/cards/attaque.jpg");
useTexture.preload("/cards/defense.jpg");
useTexture.preload("/cards/saisir.jpg");
useFont.preload("/fonts/RobotoSlab-VariableFont_wght.ttf");
useFont.preload("/fonts/RubikMonoOne-Regular.ttf");