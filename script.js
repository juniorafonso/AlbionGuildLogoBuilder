// Data initialization
const builderSymbolsList = [];
for (let i = 1; i <= 67; i++) {
    builderSymbolsList.push(`GUILDSYMBOL_${String(i).padStart(3, '0')}`);
}

const builderExtraSymbols = [
    "GUILDSYMBOL_VENDETTA", "GUILDSYMBOL_INSANE_EMPIRE", "GUILDSYMBOL_HAMMER_AND_SICKLE", 
    "GUILDSYMBOL_GOON", "GUILDSYMBOL_WAR_LEGEND", "GUILDSYMBOL_FINSTACK", 
    "GUILDSYMBOL_GENTLEMEN", "GUILDSYMBOL_HONOR_N_GLORY", "GUILDSYMBOL_NILFGAARD", 
    "GUILDSYMBOL_WILDWEST", "GUILDSYMBOL_CONFLICT", "GUILDSYMBOL_CZECO", 
    "GUILDSYMBOL_FURIA", "GUILDSYMBOL_HELMET", "GUILDSYMBOL_INFINITE", 
    "GUILDSYMBOL_RUSSIAN_BEARS", "GUILDSYMBOL_ZERATOR", "GUILDSYMBOL_ZORN", 
    "GUILDSYMBOL_MONEYGUILD", "GUILDSYMBOL_DEATH", "GUILDSYMBOL_EOS", 
    "GUILDSYMBOL_KOTD", "GUILDSYMBOL_SAY_MY_NAME", "GUILDSYMBOL_TRIDRA", 
    "GUILDSYMBOL_AD_HONORES", "GUILDSYMBOL_BLAM", "GUILDSYMBOL_WOLF", 
    "GUILDSYMBOL_HAMMERS", "GUILDSYMBOL_HOOD_AND_SCYTHE", "GUILDSYMBOL_ELEPHANT", 
    "GUILDSYMBOL_MASK", "GUILDSYMBOL_EAGLE", "GUILDSYMBOL_DRAGON", 
    "GUILDSYMBOL_CAT", "GUILDSYMBOL_RED_ARMY", "GUILDSYMBOL_ENVYBLACKONWHITE", 
    "GUILDSYMBOL_ROCKET_BEANS", "GUILDSYMBOL_SCOIA_TAEL", "GUILDSYMBOL_SMURFING_MONKEYS",
    "GUILDSYMBOL_SEX_AND_FLEX", "GUILDSYMBOL_ESCALATION"
];
builderSymbolsList.push(...builderExtraSymbols);
builderSymbolsList.sort();

const builderSchemaList = [
    "SCHEMA_01", "SCHEMA_02", "SCHEMA_03", "SCHEMA_04", "SCHEMA_05", 
    "SCHEMA_06", "SCHEMA_07", "SCHEMA_08", "SCHEMA_09"
];

const builderTypeList = [
    "ACTIVE_ALLIANCE", "ACTIVE_GUILD_CRYSTAL", "ACTIVE_GUILD_CRYSTAL_LEADER", 
    "ACTIVE_GUILD_GOLD", "ACTIVE_GUILD_GOLD_LEADER", "ACTIVE_GUILD_SILVER", 
    "ACTIVE_GUILD_SILVER_LEADER", "ACTIVE_GUILD_BRONZE", "ACTIVE_GUILD_BRONZE_LEADER", 
    "ACTIVE_GUILD_IRON", "ACTIVE_GUILD_IRON_LEADER", "ACTIVE_GUILD_UNRANKED",
    "PASSIVE_ALLIANCE", "PASSIVE_GUILD_CRYSTAL", "PASSIVE_GUILD_GOLD", 
    "PASSIVE_GUILD_SILVER", "PASSIVE_GUILD_BRONZE", "PASSIVE_GUILD_IRON", 
    "PASSIVE_GUILD_UNRANKED"
];

// DOM elements
const schemaSelectorContainer = document.getElementById('builder-schema-selector');
const symbolSelectorContainer = document.getElementById('builder-symbol-selector');
const typeSelectorContainer = document.getElementById('builder-type-selector');

// Color pickers
const patternColor1Button = document.getElementById('pattern-color1-button');
const patternColor1Preview = patternColor1Button?.querySelector('.color-preview');
const patternColor1Popup = document.getElementById('pattern-color1-popup');

const patternColor2Button = document.getElementById('pattern-color2-button');
const patternColor2Preview = patternColor2Button?.querySelector('.color-preview');
const patternColor2Popup = document.getElementById('pattern-color2-popup');

const symbolColorButton = document.getElementById('symbol-color-button');
const symbolColorPreview = symbolColorButton?.querySelector('.color-preview');
const symbolColorPopup = document.getElementById('symbol-color-popup');

// Number inputs
const symbolScaleDisplay = document.getElementById('builder-symbolScale-display');
const symbolScaleDecrement = document.getElementById('builder-symbolScale-decrement');
const symbolScaleIncrement = document.getElementById('builder-symbolScale-increment');

const symbolOffsetYDisplay = document.getElementById('builder-symbolOffsetY-display');
const symbolOffsetYDecrement = document.getElementById('builder-symbolOffsetY-decrement');
const symbolOffsetYIncrement = document.getElementById('builder-symbolOffsetY-increment');

const gemsDisplay = document.getElementById('builder-gems-display');
const gemsDecrement = document.getElementById('builder-gems-decrement');
const gemsIncrement = document.getElementById('builder-gems-increment');

const sizeDisplay = document.getElementById('builder-size-display');
const sizeDecrement = document.getElementById('builder-size-decrement');
const sizeIncrement = document.getElementById('builder-size-increment');

// Preview elements
const logoPreviewImage = document.getElementById('logo-preview-image');
const generatedUrlTextarea = document.getElementById('generated-url');

// State variables
let currentSchema = builderSchemaList[0];
let currentSymbol = builderSymbolsList[0];
let currentType = builderTypeList[0];
let currentPatternColor1 = 2; // White (visually Color 1)
let currentPatternColor2 = 1; // Black (visually Color 2)
let currentSymbolColor = 3; // Dark Gray
let currentGems = 0;
let currentSize = 200;
let currentSymbolScale = 1.0;
let currentSymbolOffsetY = 0.0;

// Constants for limits
const SYMBOL_SETTINGS_STEP = 0.05;
const SYMBOL_SCALE_MIN = 0.5;
const SYMBOL_SCALE_MAX = 1.5;
const SYMBOL_OFFSETY_MIN = -0.5;
const SYMBOL_OFFSETY_MAX = 0.5;
const GEMS_MIN = 0;
const GEMS_MAX = 5;
const SIZE_MIN = 16;
const SIZE_MAX = 512;

// Utility functions
function getColorById(id) {
    return colorList.find(c => c.id === id);
}

function getRgbString(colorId) {
    const color = getColorById(colorId);
    return color ? `rgb(${color.r}, ${color.g}, ${color.b})` : '';
}

// Path builders for images
const schemaImagePathBuilder = (schemaName) => 
    `albion_logo_schema_variations/GUILDSYMBOL_SEX_AND_FLEX_SCHEMA_${schemaName}.png`;
    
const symbolImagePathBuilder = (symbolName) => 
    `albion_guild_logos/${symbolName}.png`;
    
const typeImagePathBuilder = (typeName) => 
    `albion_logo_type_variations/GUILDSYMBOL_SEX_AND_FLEX_TYPE_${typeName}.png`;

// Populate selectors
function populateVisualSelector(container, items, currentVal, onSelect, imagePathBuilder) {
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(itemValue => {
        const div = document.createElement('div');
        div.classList.add('visual-selector-item');
        div.dataset.value = itemValue;
        
        if (imagePathBuilder) {
            const img = document.createElement('img');
            img.src = imagePathBuilder(itemValue);
            img.alt = itemValue;
            
            img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
                img.style.display = 'none';
                div.textContent = itemValue.split('_').pop();
            };
            
            div.appendChild(img);
        } else {
            div.textContent = itemValue;
        }
        
        if (itemValue === currentVal) {
            div.classList.add('selected');
        }
        
        div.addEventListener('click', () => {
            container.querySelectorAll('.selected')
                .forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            onSelect(itemValue);
        });
        
        container.appendChild(div);
    });
}

function createColorOptions(popup, selectedColorId, onSelect) {
    popup.innerHTML = '';
    
    colorList.forEach(color => {
        const option = document.createElement('div');
        option.classList.add('color-option');
        option.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        option.title = color.name || `Color ${color.id}`;
        
        if (color.id === selectedColorId) {
            option.classList.add('selected');
        }
        
        option.addEventListener('click', () => {
            popup.querySelectorAll('.selected')
                .forEach(el => el.classList.remove('selected'));
            option.classList.add('selected');
            onSelect(color.id);
            popup.style.display = 'none';
        });
        
        popup.appendChild(option);
    });
}

function initializeColorPicker(button, popup, colorId, updateFunction) {
    if (!button || !popup) return;
    
    const colorPreview = button.querySelector('.color-preview');
    if (colorPreview) {
        colorPreview.style.backgroundColor = getRgbString(colorId);
    }
    
    createColorOptions(popup, colorId, (newColorId) => {
        if (colorPreview) {
            colorPreview.style.backgroundColor = getRgbString(newColorId);
        }
        updateFunction(newColorId);
    });
    
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other popups
        const allPopups = document.querySelectorAll('.color-popup');
        allPopups.forEach(p => {
            if (p !== popup) p.style.display = 'none';
        });
        
        // Remove active state from all buttons
        document.querySelectorAll('.color-picker-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Toggle current popup
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
        
        // Toggle active state on current button
        button.classList.toggle('active', !isVisible);
    });
    
    // Position and hide popup initially
    popup.style.position = 'absolute';
    popup.style.top = '100%';
    popup.style.left = '0';
    popup.style.display = 'none'; // Ensure popup is initially hidden
    button.style.position = 'relative';
}

// Update functions
function updatePatternColor(colorId) {
    currentPatternColor = colorId;
    updateLogoPreview();
}

function updateSymbolColor(colorId) {
    currentSymbolColor = colorId;
    updateLogoPreview();
}

function updateSchema(value) {
    currentSchema = value;
    updateLogoPreview();
}

function updateSymbol(value) {
    currentSymbol = value;
    updateLogoPreview();
}

function updateType(value) {
    currentType = value;
    updateLogoPreview();
}

function updateSymbolScale(newValue) {
    currentSymbolScale = Math.max(SYMBOL_SCALE_MIN, 
                          Math.min(SYMBOL_SCALE_MAX, 
                                   parseFloat(newValue.toFixed(2))));
    symbolScaleDisplay.textContent = currentSymbolScale.toFixed(2);
    updateLogoPreview();
}

function updateSymbolOffsetY(newValue) {
    currentSymbolOffsetY = Math.max(SYMBOL_OFFSETY_MIN, 
                           Math.min(SYMBOL_OFFSETY_MAX, 
                                    parseFloat(newValue.toFixed(2))));
    symbolOffsetYDisplay.textContent = currentSymbolOffsetY.toFixed(2);
    updateLogoPreview();
}

function updateGems(newValue) {
    currentGems = Math.max(GEMS_MIN, Math.min(GEMS_MAX, newValue));
    gemsDisplay.textContent = currentGems;
    updateLogoPreview();
}

function updateSize(newValue) {
    currentSize = Math.max(SIZE_MIN, Math.min(SIZE_MAX, newValue));
    sizeDisplay.textContent = currentSize;
    updateLogoPreview();
}

// Add these missing update functions
function updatePatternColor1(colorId) {
    currentPatternColor1 = colorId;
    updateLogoPreview();
}

function updatePatternColor2(colorId) {
    currentPatternColor2 = colorId;
    updateLogoPreview();
}

// Update logo preview function
function updateLogoPreview() {
    if (!logoPreviewImage) return;

    const baseUrl = "https://render.albiononline.com/v1/guild/logo.png";
    const params = new URLSearchParams();

    params.append('symbol', currentSymbol);
    params.append('schema', currentSchema);
    
    // Map in-game color 1 (primary) to API's secondarySchemaColor
    // Map in-game color 2 (secondary) to API's primarySchemaColor
    params.append('secondarySchemaColor', currentPatternColor1.toString());
    params.append('primarySchemaColor', currentPatternColor2.toString());
    
    params.append('symbolColor', currentSymbolColor.toString());
    params.append('type', currentType);
    params.append('size', currentSize.toString());

    if (currentSymbolScale !== 1) {
        params.append('symbolScale', currentSymbolScale.toFixed(2));
    }
    
    if (currentSymbolOffsetY !== 0) {
        params.append('symbolOffsetY', currentSymbolOffsetY.toFixed(2));
    }
    
    if (currentGems !== 0) {
        params.append('gems', currentGems.toString());
    }

    const imageUrl = `${baseUrl}?${params.toString()}`;
    logoPreviewImage.src = imageUrl;
    
    if (generatedUrlTextarea) {
        generatedUrlTextarea.value = imageUrl;
    }
}

// Initialize the UI
function initializeUI() {
    // Populate visual selectors
    populateVisualSelector(schemaSelectorContainer, builderSchemaList, currentSchema, updateSchema, schemaImagePathBuilder);
    populateVisualSelector(symbolSelectorContainer, builderSymbolsList, currentSymbol, updateSymbol, symbolImagePathBuilder);
    populateVisualSelector(typeSelectorContainer, builderTypeList, currentType, updateType, typeImagePathBuilder);
    
    // Initialize color pickers
    initializeColorPicker(patternColor1Button, patternColor1Popup, currentPatternColor1, updatePatternColor1);
    initializeColorPicker(patternColor2Button, patternColor2Popup, currentPatternColor2, updatePatternColor2);
    initializeColorPicker(symbolColorButton, symbolColorPopup, currentSymbolColor, updateSymbolColor);
    
    // Setup number input buttons
    symbolScaleDecrement.addEventListener('click', () => updateSymbolScale(currentSymbolScale - SYMBOL_SETTINGS_STEP));
    symbolScaleIncrement.addEventListener('click', () => updateSymbolScale(currentSymbolScale + SYMBOL_SETTINGS_STEP));
    
    symbolOffsetYDecrement.addEventListener('click', () => updateSymbolOffsetY(currentSymbolOffsetY - SYMBOL_SETTINGS_STEP));
    symbolOffsetYIncrement.addEventListener('click', () => updateSymbolOffsetY(currentSymbolOffsetY + SYMBOL_SETTINGS_STEP));
    
    gemsDecrement.addEventListener('click', () => updateGems(currentGems - 1));
    gemsIncrement.addEventListener('click', () => updateGems(currentGems + 1));
    
    sizeDecrement.addEventListener('click', () => updateSize(currentSize - 4));
    sizeIncrement.addEventListener('click', () => updateSize(currentSize + 4));
    
    // Close color popups when clicking outside
    document.addEventListener('click', (e) => {
        const isColorButton = e.target.closest('.color-picker-button');
        const isColorPopup = e.target.closest('.color-popup');
        
        if (!isColorButton && !isColorPopup) {
            document.querySelectorAll('.color-popup').forEach(popup => {
                popup.style.display = 'none';
            });
            
            document.querySelectorAll('.color-picker-button').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    });
    
    // Initial update
    updateLogoPreview();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUI);