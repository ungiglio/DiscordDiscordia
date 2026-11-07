const fs = require('fs');
const path = require('path');

// --- Configurazione ---
const classChangesPath = './discord_class_update/classChanges_2026-11-07.json';
const loaderFilePath = './awkglass/loader.css';
const repoBaseUrl = 'https://ungiglio.github.io/DiscordDiscordia/';
const MIN_CONFIDENCE = 0.5;

// Carica e filtra il JSON
const rawData = fs.readFileSync(classChangesPath);
const classChanges = JSON.parse(rawData).filter(c => c[2] >= MIN_CONFIDENCE);

// Leggi il file del loader
const loaderContent = fs.readFileSync(loaderFilePath, 'utf8');

// Trova tutti gli URL importati
const importRegex = /@import\s+url\(['"]?(https:\/\/[^'"]+)['"]?\);/g;
const filesToUpdate = [];
let match;

while ((match = importRegex.exec(loaderContent)) !== null) {
    const url = match[1];
    // Filtra solo gli URL che appartengono al tuo repository
    if (url.startsWith(repoBaseUrl)) {
        // Converte l'URL assoluto in un percorso relativo locale
        // Es: https://ungiglio.github.io/DiscordDiscordia/awkglass/core/variables.css -> ./awkglass/core/variables.css
        const localPath = './' + url.replace(repoBaseUrl, '');
        filesToUpdate.push(localPath);
    }
}

// Aggiungi anche il loader stesso (se contiene classi direttamente)
filesToUpdate.push(loaderFilePath);

console.log(`Trovati ${filesToUpdate.length} file da scansionare...`);

// Applica le sostituzioni su tutti i file mappati
filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let replacedCount = 0;

        classChanges.forEach(([oldClass, newClass]) => {
            const regex = new RegExp(oldClass, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, newClass);
                replacedCount++;
            }
        });

        if (replacedCount > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[AGGIORNATO] ${filePath}: ${replacedCount} sostituzioni.`);
        } else {
            console.log(`[NESSUNA MODIFICA] ${filePath}.`);
        }
    } else {
        console.warn(`[ATTENZIONE] File non trovato nel repository: ${filePath}`);
    }
});