import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import * as THREE from 'three'; // Import de Three.js

interface Preview3DProps {
  objFile: Blob; // Accepter un Blob représentant le fichier OBJ
}


function Scene({ objFile }: Preview3DProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (objFile) {
      const loader = new OBJLoader();
      const url = URL.createObjectURL(objFile); // Créer une URL temporaire pour le Blob

      loader.load(
        url,
        (loadedModel) => {
          loadedModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0xffffff, // Couleur blanche
                wireframe: false,
              });
            }
          });

          // Mettre à l'échelle le modèle pour qu'il soit visible
          loadedModel.scale.set(0.5, 0.5, 0.5);  // Redimensionner à 50%

          // Centrer le modèle
          const box = new THREE.Box3().setFromObject(loadedModel);
          const center = new THREE.Vector3();
          box.getCenter(center);
          loadedModel.position.sub(center); // Centrer le modèle

          setModel(loadedModel);
        },
        undefined,
        (error) => {
          console.error('Erreur lors du chargement du modèle OBJ :', error);
        }
      );


      // Nettoyer l'URL temporaire
      return () => URL.revokeObjectURL(url);
    }
  }, [objFile]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {model && <primitive object={model} />}
    </>
  );
}

export function Preview3D({ objFile }: Preview3DProps) {
  return (
    <div className="w-full h-[400px] bg-gray-900 rounded-xl overflow-hidden">
      <Canvas>
        <Suspense fallback={<div>Chargement...</div>}>
          <PerspectiveCamera makeDefault position={[0, -20, 15]} near={0.1} far={1000} />
          <Scene objFile={objFile} />
          <OrbitControls enableDamping />
        </Suspense>
      </Canvas>
    </div>
  );
}
