const https = require('https');
const fs = require('fs');
const path = require('path');

const renderServerBaseUrl = "https://render.albiononline.com/v1/guild/logo.png";
const symbolToDownload = "GUILDSYMBOL_SEX_AND_FLEX"; // The specific symbol
const outputFolder = 'albion_logo_schema_variations'; // New folder for schema variations

// Fixed parameters for consistency (can be adjusted if needed)
const primarySchemaColor = "3"; // Default, can be varied if desired
const secondarySchemaColor = "1"; // Default
const symbolColor = "2"; // Color of the symbol/icon itself
const imageSize = "128"; // Desired size for these variations
const defaultType = "PASSIVE_GUILD_UNRANKED"; // A default type, as schema is the focus

const schemaParameters = [
    "SCHEMA_01", "SCHEMA_02", "SCHEMA_03", "SCHEMA_04", "SCHEMA_05",
    "SCHEMA_06", "SCHEMA_07", "SCHEMA_08", "SCHEMA_09"
];

// Create the output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`Pasta '${outputFolder}' criada.`);
}

// Function to download a single image variation based on schema
async function downloadSchemaVariation(symbolName, schemaName, retries = 3) {
    const imageUrl = `${renderServerBaseUrl}?schema=${schemaName}&primarySchemaColor=${primarySchemaColor}&secondarySchemaColor=${secondarySchemaColor}&symbol=${symbolName}&type=${defaultType}&size=${imageSize}&symbolColor=${symbolColor}`;
    // Filename includes the schema name for clarity
    const fileName = `${symbolName}_SCHEMA_${schemaName}.png`; 
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
                        console.warn(`Variação ${symbolName} com schema ${schemaName} não encontrada (404). Pulando.`);
                        resolve(); // Resolve to not retry if 404
                        return;
                    } else {
                        const error = new Error(`Falha ao buscar '${symbolName}' com schema '${schemaName}'. Status: ${response.statusCode}`);
                        response.resume(); // Consume data to free up memory
                        reject(error);
                    }
                });

                request.on('error', (err) => {
                    console.error(`Erro na requisição para ${symbolName} com schema ${schemaName}: ${err.message}`);
                    reject(err);
                });

                request.setTimeout(30000, () => { // 30-second timeout
                    request.destroy();
                    reject(new Error(`Timeout ao baixar ${symbolName} com schema ${schemaName}`));
                });
            });
        } catch (error) {
            console.error(`Tentativa ${attempt} falhou para ${symbolName} com schema ${schemaName}: ${error.message}`);
            if (attempt === retries) {
                console.error(`Falha ao baixar ${symbolName} com schema ${schemaName} após ${retries} tentativas.`);
            } else {
                // Wait a bit before retrying
                await new Promise(resolveWait => setTimeout(resolveWait, 1000 * attempt));
            }
        }
    }
}

// Main function to orchestrate downloads
async function main() {
    console.log(`Iniciando download das variações de schema para o logo '${symbolToDownload}' para a pasta '${outputFolder}'...`);

    for (const schemaName of schemaParameters) {
        await downloadSchemaVariation(symbolToDownload, schemaName);
        // Optional: Add a small delay to avoid overwhelming the server
        // await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    console.log('Downloads das variações de schema concluídos (ou tentativas finalizadas).');
}

main().catch(err => {
    console.error("Erro fatal no script de download de schemas:", err);
});