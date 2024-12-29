from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import torch
from torchvision import transforms
from PIL import Image
import trimesh
import numpy as np
import traceback
import skimage
from classVAE import VAE

app = Flask(__name__, static_folder='static')
CORS(app)  # Pour permettre les requêtes du frontend React

# Initialiser le modèle VAE
device = torch.device('cpu') 
vae = VAE().to(device)
vae_folder = "VAE/"
model_path = os.path.join(vae_folder, "vae_model.pth")

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}")

vae.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
vae.eval()

# Transformation pour préparer l'image
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Resize((64, 64)),
    transforms.Normalize((0.5,), (0.5,))
])

# Vérifier que le dossier de sortie existe
output_dir = 'output'
os.makedirs(output_dir, exist_ok=True)

# Fonction pour sauvegarder le fichier OBJ
def save_as_obj_with_trimesh(voxel_tensor, output_path):
    voxel_tensor = voxel_tensor.squeeze().cpu().numpy()
    voxel_tensor = (voxel_tensor > 0.1).astype(np.uint8)

    print(f"Voxel tensor shape: {voxel_tensor.shape}")  # Log de la forme du tenseur de voxels
    
    mesh = trimesh.voxel.ops.matrix_to_marching_cubes(voxel_tensor)

    # Vérifier que le mesh généré n'est pas vide
    if not mesh.vertices.any() or not mesh.faces.any():
        raise ValueError("The generated 3D mesh is empty. Check your voxel data.")

    mesh.export(output_path)
    print(f"3D model saved to {output_path}")  # Log du fichier exporté


@app.route('/api/generate', methods=['POST'])
def generate():
    # Vérifier si une image a été envoyée
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    try:
        # Lire et transformer l'image
        image_file = request.files['image']
        image = Image.open(image_file.stream).convert("RGB")
        image_tensor = transform(image).unsqueeze(0).to(device)

        # Générer le modèle 3D
        with torch.no_grad():
            generated_voxel, _, _ = vae(image_tensor)

        # Sauvegarder le fichier OBJ
        output_path = os.path.join(output_dir, 'generated_model.obj')
        save_as_obj_with_trimesh(generated_voxel, output_path)

        # Retourner le fichier OBJ au frontend
        return send_file(output_path, as_attachment=True)

    except Exception as e:
        # Log détaillé de l'erreur
        print(f"Erreur lors de la génération du modèle 3D: {str(e)}")
        print(traceback.format_exc())  # Afficher le traceback de l'exception
        return jsonify({'error': 'An error occurred during 3D model generation: ' + str(e)}), 500


# Servir les fichiers React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(f"static/{path}"):
        return send_from_directory('static', path)
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
