"use client";

import { useRef, useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
// NEW: Import the Three.js post-processing engines
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

interface Graph3DProps {
  data: any;
  onNodeClick: (node: any) => void;
  // NEW: Add the double click prop
  onNodeDoubleClick: (node: any) => void; 
}

export default function Graph3D({ data, onNodeClick, onNodeDoubleClick }: Graph3DProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // NEW: Add a tracker to make sure we only add stars once!
  const initialized = useRef(false);
  // NEW: Track click timing for double-clicks
  const lastClickTime = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isSpinning, setIsSpinning] = useState(true);

  // Measure the container size on load and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // The Hologram Bloom Engine & 3D Starfield
  useEffect(() => {
    // Wait until the graph actually exists AND ensure we only run this once
    if (dimensions.width > 0 && fgRef.current && !initialized.current) {
      const scene = fgRef.current.scene();

      // 1. Generate 1,500 floating stars in the background
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2.5, 
        transparent: true,
        opacity: 0.8
      });
      
      const starVertices = [];
      for (let i = 0; i < 1500; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // 2. Add the Neon Bloom Pass
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.25, 
        0.1, 
        0.1  
      );
      fgRef.current.postProcessingComposer().addPass(bloomPass);

      // 3. Mark as initialized so we never add double stars!
      initialized.current = true;
    }
  }, [dimensions.width, data]); // <-- Listen for dimensions to finish loading! 

  // ... (Keep your physics useEffect exactly the same) ...

  // Physics & Camera Spin Engine
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-250);
      fgRef.current.d3Force('link').distance(80);
    }

    let angle = 0;
    const distance = 300;
    let interval: NodeJS.Timeout;

    if (isSpinning) {
      interval = setInterval(() => {
        if (fgRef.current) {
          fgRef.current.cameraPosition({
            x: distance * Math.sin(angle),
            z: distance * Math.cos(angle)
          });
          angle += Math.PI / 300;
        }
      }, 30);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data, isSpinning]);

  const handleNodeClick = (node: any) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick < 300) {
      // It's a Double Click! Trigger God Mode.
      onNodeDoubleClick(node);
    } else {
      // It's a Single Click! Do the normal camera zoom.
      setIsSpinning(false);
      if (fgRef.current) {
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
          node, 
          2000  
        );
      }
      onNodeClick(node);
    }
    
    lastClickTime.current = now;
  };

  const handleBackgroundClick = () => {
    setIsSpinning(true);
    onNodeClick(null);
  };

  const graphData = {
    nodes: data.nodes,
    links: (data.links || data.edges || []).map((link: any) => ({
      source: link.source,
      target: link.target,
      label: link.label
    }))
  };

  return (
    // 1. Change bg-black to bg-transparent
    <div ref={containerRef} className="w-full h-full overflow-hidden bg-transparent cursor-pointer">
      {dimensions.width > 0 && (
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          // 2. Tell Three.js to render a transparent canvas so the CSS gradient shows
          backgroundColor="rgba(0,0,0,0)" 
          graphData={graphData}
          nodeLabel="id"
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick} 
          
          nodeThreeObject={(node: any) => {
            const sprite = new SpriteText(node.id);
            // The brighter the color, the harder the bloom will hit it!
            sprite.color = node.color || "rgb(237, 95, 13)"; // Changed to a hyper-bright cyan
            sprite.textHeight = 8;
            sprite.fontWeight = "bold";
            return sprite;
          }}
          // Make the connecting lines slightly brighter so they glow too
          linkColor={() => "rgba(255, 255, 255, 0.4)"}
          linkWidth={1.5}
          
          // NEW: The Neural Network Data Particles
          linkDirectionalParticles={3}              // Number of glowing dots per line
          linkDirectionalParticleWidth={2}          // Size of the dots
          linkDirectionalParticleSpeed={0.008}      // How fast they travel
          linkDirectionalParticleColor={() => "rgb(237, 95, 13)"} // Make them bright cyan!
          
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
        />
      )}
    </div>
  );
}