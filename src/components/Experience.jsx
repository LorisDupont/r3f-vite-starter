import { Environment, OrbitControls } from "@react-three/drei";
import { Card } from "./Card";

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      <Card />
      <Card position-x={-2} type="attaque" />
      <Card position-x={2} type="saisir" />
      <Environment preset="park" background blur={2} />
    </>
  );
};
