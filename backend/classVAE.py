import torch
import torch.nn as nn

class VAE(nn.Module):
    def __init__(self):
        super(VAE, self).__init__()

        # Encodeur
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 256, 4, stride=2, padding=1),
            nn.ReLU()
        )

        self.fc_mu = nn.Linear(256 * 8 * 8, 256)  # Moyenne latente
        self.fc_logvar = nn.Linear(256 * 8 * 8, 256)  # Variance latente

        # Décodeur
        self.fc_decode = nn.Linear(256, 256 * 4 * 4 * 4)
        self.decoder = nn.Sequential(
            nn.ConvTranspose3d(256, 128, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose3d(128, 64, 4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose3d(64, 1, 4, stride=2, padding=1),
            nn.Sigmoid()
        )

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def forward(self, x):
        # Encode
        encoded = self.encoder(x)
        encoded = encoded.view(encoded.size(0), -1)
        mu = self.fc_mu(encoded)
        logvar = self.fc_logvar(encoded)

        # Reparamétrisation
        z = self.reparameterize(mu, logvar)

        # Decode
        decoded = self.fc_decode(z)
        decoded = decoded.view(-1, 256, 4, 4, 4)
        output = self.decoder(decoded)
        return output, mu, logvar


def vae_loss(recon_x, x, mu, logvar):
    recon_loss = nn.BCELoss()(recon_x, x)
    kld_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    return recon_loss + kld_loss
