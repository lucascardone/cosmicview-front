import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Mapeo de tipos de planetas a colores
const planetColors = {
  Mercury: 'lightgray',
  Venus: 'yellow',
  Earth: 'blue',
  Mars: 'red',
  Jupiter: 'orange',
  Saturn: 'gold',
  Uranus: 'lightblue',
  Neptune: 'darkblue',
};

// Velocidades de órbita de cada planeta
const orbitSpeeds = {
  Mercury: 0.02,
  Venus: 0.015,
  Earth: 0.01,
  Mars: 0.008,
  Jupiter: 0.005,
  Saturn: 0.003,
  Uranus: 0.002,
  Neptune: 0.001,
};

const Planet = ({ planet, orbitPoints, orbitSpeed }) => {
  const meshRef = useRef();
  const angleRef = useRef(0); // Ángulo inicial

  useFrame(() => {
    // Incrementa el ángulo según la velocidad orbital
    angleRef.current += orbitSpeed;

    // Calcula el índice de puntos en la órbita basado en el ángulo
    const index = Math.floor((angleRef.current % (2 * Math.PI)) / (2 * Math.PI) * orbitPoints.length);
    const position = orbitPoints[index];

    // Actualiza la posición del planeta usando los puntos de órbita
    if (position) {
      meshRef.current.position.set(position.x, position.y, position.z);
    }

    // Rotación propia del planeta
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[planet.radius, 32, 32]} />
      <meshStandardMaterial color={planetColors[planet.name] || 'white'} />
    </mesh>
  );
};

const Orbit = ({ orbitPoints }) => {
  // Convierte los puntos de órbita en un array de THREE.Vector3
  const points = orbitPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
  return (
    <Line
      points={points}
      color="white"
      lineWidth={1}
      transparent
      opacity={0.7}
    />
  );
};

const Sun = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[30, 32, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
};

const App = () => {
  const [planetData, setPlanetData] = useState([]);

  useEffect(() => {
    const fetchPlanetData = async () => {
      try {
        const response = await fetch('https://cosmicview-back.onrender.com/all/');
        const data = await response.json();
        setPlanetData(data.planets);
      } catch (error) {
        console.error('Error fetching planet data:', error);
      }
    };

    fetchPlanetData();
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 600], fov: 50, near: 0.1, far: 100000 }} style={{ height: "100vh", width: "100vw" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} />

      <Sun />

      {planetData.map((planet, index) => (
        <React.Fragment key={index}>
          <Planet
            planet={planet}
            orbitPoints={planet.orbit}
            orbitSpeed={orbitSpeeds[planet.name] || 0.01}
          />
          <Orbit orbitPoints={planet.orbit} />
        </React.Fragment>
      ))}

      <OrbitControls />
    </Canvas>
  );
};

export default App;
