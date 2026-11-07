const fs = require('fs');
const path = require('path');

const classChangesPath = './discord_class_update/classChanges_2026-11-07.json';
const loaderFilePath = './awkglass/loader.css';
const repoBaseUrl = 'https://ungiglio.github.io/DiscordDiscordia/';
const MIN_CONFIDENCE = 0.5;

const rawData = fs.readFileSync(classChangesPath);
const classChanges = JSON.parse(rawData).filter(c => c[2] >= MIN_CONFIDENCE);

const loaderContent = fs.readFileSync(loaderFilePath, 'utf8');

const importRegex = /@import\s+url\(['"]?(https:\/\/[^'"]+)['"]?\);/g;
const filesToUpdate = [];
let match;

while ((match = importRegex.exec(loaderContent)) !== null) {
    const url = match[1];
    if (url.startsWith(repoBaseUrl)) {

        const localPath = './' + url.replace(repoBaseUrl, '');
        filesToUpdate.push(localPath);
    }
}

filesToUpdate.push(loaderFilePath);

console.log(`Trovati ${filesToUpdate.length} file da scansionare...`);

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