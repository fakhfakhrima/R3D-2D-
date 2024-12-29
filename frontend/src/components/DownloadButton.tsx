import './DownloadButton.css';  // Importer le fichier CSS

// Définir le type pour les props
type DownloadButtonProps = {
  handleDownload: () => void;  // La prop handleDownload est une fonction
}

const DownloadButton = ({ handleDownload }: DownloadButtonProps) => {
  return (
    <div className="download-container">
      {/* Ajouter le heading */}
      <h1>Télécharger le modèle 3D</h1>
    <div className='space'></div>
      {/* Bouton de téléchargement */}
      <button onClick={handleDownload} className="button">
        <span className="button-content">Download </span>
        {/* Icone de téléchargement */}
        <i className="fas fa-download"></i>
      </button>
    </div>
  );
}

export default DownloadButton;
