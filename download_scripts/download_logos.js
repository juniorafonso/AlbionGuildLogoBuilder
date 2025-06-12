const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = "https://render.albiononline.com/v1/guild/logo.png?schema=SCHEMA_01&primarySchemaColor=3&secondarySchemaColor=1&symbol=";
const commonParams = "&size=200&symbolColor=2&type=PASSIVE_GUILD_UNRANKED";
const outputFolder = 'albion_guild_logos'; // Nome da pasta onde os logos serão salvos

// Cria a pasta de saída se ela não existir
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`Pasta '${outputFolder}' criada.`);
}

// Função para baixar uma imagem
async function downloadImage(symbolName, retries = 3) {
    const imageUrl = `${baseUrl}${symbolName}${commonParams}`;
    const fileName = `${symbolName}.png`;
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
                            fs.unlink(filePath, () => {}); // Remove o arquivo parcialmente escrito
                            console.error(`Erro ao escrever ${fileName}: ${err.message}`);
                            reject(err);
                        });
                    } else if (response.statusCode === 404) {
                        console.warn(`Imagem ${symbolName} não encontrada (404). Pulando.`);
                        resolve(); // Resolve para não tentar novamente se for 404
                        return;
                    }
                    else {
                        const error = new Error(`Falha ao buscar '${symbolName}'. Status: ${response.statusCode}`);
                        response.resume(); // Consome dados para liberar memória
                        reject(error);
                    }
                });

                request.on('error', (err) => {
                    console.error(`Erro na requisição para ${symbolName}: ${err.message}`);
                    reject(err);
                });

                request.setTimeout(30000, () => { // Timeout de 30 segundos
                    request.destroy();
                    reject(new Error(`Timeout ao baixar ${symbolName}`));
                });
            });
        } catch (error) {
            console.error(`Tentativa ${attempt} falhou para ${symbolName}: ${error.message}`);
            if (attempt === retries) {
                console.error(`Falha ao baixar ${symbolName} após ${retries} tentativas.`);
            } else {
                // Espera um pouco antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}

// Função principal para orquestrar os downloads
async function main() {
    const symbolsToDownload = [];

    // Logos GUILDSYMBOL_001 a GUILDSYMBOL_067
    for (let i = 1; i <= 67; i++) {
        const symbolNumber = String(i).padStart(3, '0');
        symbolsToDownload.push(`GUILDSYMBOL_${symbolNumber}`);
    }

    // Logos extras
    const extraSymbols = [
        "GUILDSYMBOL_VENDETTA", "GUILDSYMBOL_INSANE_EMPIRE", "GUILDSYMBOL_HAMMER_AND_SICKLE",
        "GUILDSYMBOL_GOON", "GUILDSYMBOL_WAR_LEGEND", "GUILDSYMBOL_FINSTACK",
        "GUILDSYMBOL_GENTLEMEN", "GUILDSYMBOL_HONOR_N_GLORY", "GUILDSYMBOL_NILFGAARD",
        "GUILDSYMBOL_WILDWEST", "GUILDSYMBOL_CONFLICT", "GUILDSYMBOL_CZECO",
        "GUILDSYMBOL_FURIA", "GUILDSYMBOL_HELMET", "GUILDSYMBOL_INFINITE",
        "GUILDSYMBOL_RUSSIAN_BEARS", "GUILDSYMBOL_ZERATOR", "GUILDSYMBOL_ZORN",
        "GUILDSYMBOL_MONEYGUILD", "GUILDSYMBOL_DEATH", "GUILDSYMBOL_EOS",
        "GUILDSYMBOL_KOTD", "GUILDSYMBOL_SAY_MY_NAME", "GUILDSYMBOL_TRIDRA",
        "GUILDSYMBOL_AD_HONORES", "GUILDSYMBOL_BLAM", "GUILDSYMBOL_WOLF",
        "GUILDSYMBOL_HAMMERS", "GUILDSYMBOL_HOOD_AND_SCYTHE",
        "GUILDSYMBOL_ELEPHANT", "GUILDSYMBOL_MASK", "GUILDSYMBOL_EAGLE",
        "GUILDSYMBOL_DRAGON", "GUILDSYMBOL_CAT",
        "GUILDSYMBOL_RED_ARMY", "GUILDSYMBOL_ENVYBLACKONWHITE", "GUILDSYMBOL_ROCKET_BEANS",
        "GUILDSYMBOL_SCOIA_TAEL", "GUILDSYMBOL_SMURFING_MONKEYS", "GUILDSYMBOL_SEX_AND_FLEX",
        "GUILDSYMBOL_ESCALATION"
    ];

    symbolsToDownload.push(...extraSymbols);

    console.log(`Iniciando download de ${symbolsToDownload.length} logos para a pasta '${outputFolder}'...`);

    for (const symbolName of symbolsToDownload) {
        await downloadImage(symbolName);
        // Adiciona um pequeno atraso para não sobrecarregar o servidor (opcional)
        // await new Promise(resolve => setTimeout(resolve, 200)); // 200ms de atraso
    }

    console.log('Downloads concluídos (ou tentativas finalizadas).');
}

main().catch(err => {
    console.error("Erro fatal no script:", err);
});