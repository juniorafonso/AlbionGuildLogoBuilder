const https = require('https');
const fs = require('fs');
const path = require('path');

const renderServerBaseUrl = "https://render.albiononline.com/v1/guild/logo.png";
const symbolToDownload = "GUILDSYMBOL_SEX_AND_FLEX"; // The specific symbol you want
const outputFolder = 'albion_logo_type_variations'; // New folder for these typed logos

// Fixed parameters for consistency (can be adjusted if needed)
const schema = "SCHEMA_01";
const primarySchemaColor = "3";
const secondarySchemaColor = "1";
const symbolColor = "2"; // Color of the symbol/icon itself
const imageSize = "128"; // Desired size for these variations

const logoTypeParameters = [
    "ACTIVE_ALLIANCE", "ACTIVE_GUILD_CRYSTAL", "ACTIVE_GUILD_CRYSTAL_LEADER",
    "ACTIVE_GUILD_GOLD", "ACTIVE_GUILD_GOLD_LEADER", "ACTIVE_GUILD_SILVER",
    "ACTIVE_GUILD_SILVER_LEADER", "ACTIVE_GUILD_BRONZE", "ACTIVE_GUILD_BRONZE_LEADER",
    "ACTIVE_GUILD_IRON", "ACTIVE_GUILD_IRON_LEADER", "ACTIVE_GUILD_UNRANKED",
    "PASSIVE_ALLIANCE", "PASSIVE_GUILD_CRYSTAL", "PASSIVE_GUILD_GOLD",
    "PASSIVE_GUILD_SILVER", "PASSIVE_GUILD_BRONZE", "PASSIVE_GUILD_IRON",
    "PASSIVE_GUILD_UNRANKED"
];

// Create the output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`Pasta '${outputFolder}' criada.`);
}

// Function to download a single image variation
async function downloadImageVariation(symbolName, typeName, retries = 3) {
    const imageUrl = `${renderServerBaseUrl}?schema=${schema}&primarySchemaColor=${primarySchemaColor}&secondarySchemaColor=${secondarySchemaColor}&symbol=${symbolName}&type=${typeName}&size=${imageSize}&symbolColor=${symbolColor}`;
    const fileName = `${symbolName}_TYPE_${typeName}.png`; // e.g., GUILDSYMBOL_SEX_AND_FLEX_TYPE_ACTIVE_ALLIANCE.png
    const filePath = path.join(outputFolder, fileName);

    if (fs.existsSync(filePath)) {
        console.log(`Imagem ${fileName} já existe. Pulando.`);
        return;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                const request = https.get(imageUrl, (response) => {
                    if (response.statusCode === 200) {
                        const fileStream = fs.createWriteStream(filePath);
                        response.pipe(fileStream);
                        fileStream.on('finish', () => {
                            fileStream.close();
                            console.log(`Baixado: ${fileName}`);
                            resolve();
                        });
                        fileStream.on('error', (err) => {
                            fs.unlink(filePath, () => {}); // Remove partially written file
                            console.error(`Erro ao escrever ${fileName}: ${err.message}`);
                            reject(err);
                        });
                    } else if (response.statusCode === 404) {
                        console.warn(`Variação ${symbolName} com tipo ${typeName} não encontrada (404). Pulando.`);
                        resolve(); // Resolve to not retry if 404
                        return;
                    } else {
                        const error = new Error(`Falha ao buscar '${symbolName}' com tipo '${typeName}'. Status: ${response.statusCode}`);
                        response.resume(); // Consume data to free up memory
                        reject(error);
                    }
                });

                request.on('error', (err) => {
                    console.error(`Erro na requisição para ${symbolName} com tipo ${typeName}: ${err.message}`);
                    reject(err);
                });

                request.setTimeout(30000, () => { // 30-second timeout
                    request.destroy();
                    reject(new Error(`Timeout ao baixar ${symbolName} com tipo ${typeName}`));
                });
            });
        } catch (error) {
            console.error(`Tentativa ${attempt} falhou para ${symbolName} com tipo ${typeName}: ${error.message}`);
            if (attempt === retries) {
                console.error(`Falha ao baixar ${symbolName} com tipo ${typeName} após ${retries} tentativas.`);
            } else {
                // Wait a bit before retrying
                await new Promise(resolveWait => setTimeout(resolveWait, 1000 * attempt));
            }
        }
    }
}

// Main function to orchestrate downloads
async function main() {
    console.log(`Iniciando download das variações de tipo para o logo '${symbolToDownload}' para a pasta '${outputFolder}'...`);

    for (const typeName of logoTypeParameters) {
        await downloadImageVariation(symbolToDownload, typeName);
        // Optional: Add a small delay to avoid overwhelming the server
        // await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    console.log('Downloads das variações de tipo concluídos (ou tentativas finalizadas).');
}

main().catch(err => {
    console.error("Erro fatal no script de download de tipos:", err);
});