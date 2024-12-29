import axios from 'axios';


// Fonction pour appeler l'API et générer un modèle 3D
export const generateModel3D = async (imageFile: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  // Appel API avec axios, typé avec l'interface Generate3DModelResponse
  const response = await axios.post<Blob>(
    'http://localhost:5000/api/generate', 
    formData, 
    { responseType: 'blob', // Indique qu'on attend un fichier Blob (le fichier OBJ)
   });

  return response.data;
};
