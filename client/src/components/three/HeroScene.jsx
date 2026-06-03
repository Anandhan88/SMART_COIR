'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial, Sphere, Torus, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* Spinning Coir Rope Torus */
function CoirRope({ position = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1.8, 0.35, 32, 100]} />
        <meshStandardMaterial
          color="#8B6914"
          roughness={0.7}
          metalness={0.2}
          emissive="#5C4A0E"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

/* Coconut (sphere with texture-like appearance) */
function Coconut({ position }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <MeshDistortMaterial
        color="#5C3A0E"
        roughness={0.9}
        metalness={0.05}
        distort={0.15}
        speed={2}
      />
    </mesh>
  );
}

/* Fiber Particles floating around */
function FiberParticles({ count = 200 }) {
  const meshRef = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      if (t < 0.4) color.set('#C9A84C');
      else if (t < 0.7) color.set('#8B6914');
      else color.set('#D4B896');
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
      const pos = meshRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* Coir Bundle (cylinder) */
function CoirBundle({ position, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.3;
      meshRef.current.rotation.x += 0.003;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <cylinderGeometry args={[0.25, 0.25, 1.8, 16]} />
        <meshStandardMaterial
          color="#A88A3E"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
    </Float>
  );
}

/* Decorative ring */
function GoldRing({ position, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.02, 16, 100]} />
      <meshStandardMaterial
        color="#C9A84C"
        emissive="#C9A84C"
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none', background: '#08080F' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color('#08080F');
        }}
        style={{ background: '#08080F' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#F5E6C8" />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#C9A84C" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#FFD700" distance={10} />

        {/* Main rope torus */}
        <CoirRope position={[2.5, 0.5, 0]} scale={0.9} />

        {/* Coconut */}
        <Coconut position={[-3, -1, -1]} />

        {/* Coir bundles */}
        <CoirBundle position={[-2.5, 1.5, -2]} scale={0.7} />
        <CoirBundle position={[3.5, -1.5, -1.5]} scale={0.5} />

        {/* Decorative rings */}
        <GoldRing position={[0, 0, -2]} scale={1.5} />
        <GoldRing position={[-1, 2, -3]} scale={0.8} />

        {/* Floating particles */}
        <FiberParticles count={300} />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

