import { useState } from 'react'; // Garder seulement les hooks nécessaires
import { Box } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { Preview3D } from './components/Preview3D';
import { generateModel3D } from './services/api'; // Importer la fonction API
import DownloadButton from './components/DownloadButton';   // Importer le bouton personnalisé

// Types


function App() {
  const [image, setImage] = useState<string | null>(null); // Pour l'image uploadée
  const [objFile, setObjFile] = useState<Blob | null>(null); // Stocker le fichier OBJ généré
  const [loading, setLoading] = useState<boolean>(false); // Pour afficher le chargement


  const handleImageUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setImage(url); // Afficher l'image uploadée en preview

    setLoading(true);
    try {
      // Appeler l'API pour générer le fichier OBJ
      const objBlob = await generateModel3D(file);
      setObjFile(objBlob); // Stocker le fichier OBJ
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        // Assurez-vous que l'erreur a une propriété `message` (pouvant être une instance d'Error)
        const err = error as { message: string };
        console.error('Erreur lors de la génération du modèle 3D:', err.message);
        alert(`Échec de la génération du modèle 3D: ${err.message}`);
      } else {
        // Dans le cas où l'erreur n'a pas de message ou est d'un type inconnu
        console.error('Erreur inconnue:', error);
        alert('Échec de la génération du modèle 3D: Une erreur inconnue est survenue.');
      }
    } finally {
      setLoading(false);
    }
    
  };

  // Fonction pour télécharger le fichier OBJ
  const handleDownload = () => {
    if (!objFile) return;
    const objURL = URL.createObjectURL(objFile);

    const link = document.createElement('a');
    link.href = objURL;
    link.download = 'generated_model.obj'; // Nom du fichier téléchargé
    link.click();

    // Libérer l'URL Blob après téléchargement
    URL.revokeObjectURL(objURL);
  };

  



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Box className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3D Image Converter</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your 2D images into stunning 3D models using advanced AI technology.
            Simply upload your image and watch the magic happen.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Image</h2>
              <ImageUpload onImageUpload={handleImageUpload} />
              {image && (
                <div className="mt-8 w-full max-w-xl">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">3D Preview</h2>
              {loading ? (
                <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Processing your 3D model...</p>
                  </div>  
              ): objFile ?  (
                <>
                <Preview3D objFile={objFile} />

                
                <DownloadButton handleDownload={handleDownload} />
                </>
              ) : (
                <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Upload an image to see the 3D preview</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Copyright 2024 R3D-2D team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;