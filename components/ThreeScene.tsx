'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import System, {
  Emitter,
  Rate,
  Span,
  Mass,
  Radius,
  Life,
  Position,
  Alpha,
  Scale,
  Color,
  Force,
  RandomDrift,
  SpriteRenderer,
} from 'three-nebula';
import { SphereZone } from 'three-nebula';

interface ThreeSceneProps {
  isSpeaking: boolean;
}

export default function ThreeScene({ isSpeaking }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nebulaSystemRef = useRef<System | null>(null);
  const emitterRef = useRef<Emitter | null>(null);
  const prevSpeakingRef = useRef(false);
  const orbRef = useRef<THREE.Mesh | null>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const animationStateRef = useRef({
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

    // Three Nebula particle system
    const nebulaSystem = new System();
    const emitter = new Emitter();

    // IDLE rate — 5–10 particles every 0.3 s
    emitter.setRate(new Rate(new Span(5, 10), new Span(0.3)));

    emitter.addInitializers([
      new Life(1.5, 3),
      new Position(new SphereZone(3)),       // emit from orb surface radius
      new Mass(1),
      new Radius(0.08, 0.25),
    ]);

    emitter.addBehaviours([
      new Alpha(1, 0),                        // fade out over lifetime
      new Scale(1, 0.1),                      // shrink over lifetime
      new Color(
        new THREE.Color(0x0ea5e9),            // primary blue (idle)
        new THREE.Color(0x3b82f6),            // accent blue (end of life)
      ),
      new RandomDrift(1.5, 1.5, 1.5, 0.05),  // gentle organic movement
      new Force(0, 0.03, 0),                 // slow upward drift (idle)
    ]);

    nebulaSystem.addEmitter(emitter);
    nebulaSystem.addRenderer(new SpriteRenderer(scene, THREE));

    emitter.emit();

    nebulaSystemRef.current = nebulaSystem;
    emitterRef.current = emitter;

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
      // Target animation values based on speaking state
      const targetOrbScale = isSpeakingRef.current ? 1.3 : 1;
      const targetEmissiveIntensity = isSpeakingRef.current ? 1 : 0.5;

      // Lerp toward targets
      animationStateRef.current.orbScale +=
        (targetOrbScale - animationStateRef.current.orbScale) * 0.05;
      animationStateRef.current.emissiveIntensity +=
        (targetEmissiveIntensity - animationStateRef.current.emissiveIntensity) * 0.05;

      // Detect speaking state change — update emitter rate only on transitions
      if (isSpeakingRef.current !== prevSpeakingRef.current) {
        prevSpeakingRef.current = isSpeakingRef.current;

        if (isSpeakingRef.current) {
          // SPEAKING — burst mode
          emitterRef.current?.setRate(new Rate(new Span(40, 60), new Span(0.05)));
        } else {
          // IDLE — ambient mode
          emitterRef.current?.setRate(new Rate(new Span(5, 10), new Span(0.3)));
        }
      }

      // Tick Nebula system
      nebulaSystemRef.current?.update();

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
      nebulaSystemRef.current?.destroy();
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
