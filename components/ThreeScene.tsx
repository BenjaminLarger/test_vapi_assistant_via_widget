'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  isSpeaking: boolean;
}

export default function ThreeScene({ isSpeaking }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const orbRef = useRef<THREE.Mesh | null>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const animationStateRef = useRef({
    particleSpeed: 0.001,
    orbScale: 1,
    emissiveIntensity: 0.5,
  });

  // Update isSpeaking ref when prop changes
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0f1419, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particle field
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;

      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 0.2,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Central orb
    const orbGeometry = new THREE.IcosahedronGeometry(2, 4);
    const orbMaterial = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5,
      shininess: 100,
    });

    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);
    orbRef.current = orb;

    // Lighting
    const light = new THREE.PointLight(0x0ea5e9, 1.5);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.4);
    scene.add(ambientLight);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animationFrameId = requestAnimationFrame(function animate() {
      const positionAttribute = particleGeometry.getAttribute('position');
      const velocityAttribute = particleGeometry.getAttribute('velocity');
      const positions = positionAttribute.array as Float32Array;
      const velocities = velocityAttribute.array as Float32Array;

      // Target animation values based on speaking state
      const targetParticleSpeed = isSpeakingRef.current ? 0.01 : 0.001;
      const targetOrbScale = isSpeakingRef.current ? 1.3 : 1;
      const targetEmissiveIntensity = isSpeakingRef.current ? 1 : 0.5;

      // Lerp toward targets
      animationStateRef.current.particleSpeed +=
        (targetParticleSpeed - animationStateRef.current.particleSpeed) * 0.05;
      animationStateRef.current.orbScale +=
        (targetOrbScale - animationStateRef.current.orbScale) * 0.05;
      animationStateRef.current.emissiveIntensity +=
        (targetEmissiveIntensity - animationStateRef.current.emissiveIntensity) * 0.05;

      // Update particles
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i] * animationStateRef.current.particleSpeed;
        positions[i + 1] += velocities[i + 1] * animationStateRef.current.particleSpeed;
        positions[i + 2] += velocities[i + 2] * animationStateRef.current.particleSpeed;

        // Wrap around bounds
        const bounds = 50;
        if (Math.abs(positions[i]) > bounds) velocities[i] *= -1;
        if (Math.abs(positions[i + 1]) > bounds) velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > bounds) velocities[i + 2] *= -1;
      }

      positionAttribute.needsUpdate = true;

      // Update orb
      if (orbRef.current) {
        orbRef.current.rotation.x += 0.001;
        orbRef.current.rotation.y += 0.002;
        orbRef.current.scale.set(
          animationStateRef.current.orbScale,
          animationStateRef.current.orbScale,
          animationStateRef.current.orbScale
        );
        (orbRef.current.material as THREE.MeshPhongMaterial).emissiveIntensity =
          animationStateRef.current.emissiveIntensity;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      particleGeometry.dispose();
      particleMaterial.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
