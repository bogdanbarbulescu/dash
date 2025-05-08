document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const redSlider = document.getElementById('red-slider');
    const greenSlider = document.getElementById('green-slider');
    const blueSlider = document.getElementById('blue-slider');
    const alphaSlider = document.getElementById('alpha-slider');

    const redValueSpan = document.getElementById('red-value');
    const greenValueSpan = document.getElementById('green-value');
    const blueValueSpan = document.getElementById('blue-value');
    const alphaValueSpan = document.getElementById('alpha-value');

    const liveColorSwatch = document.getElementById('live-color-swatch');
    const hexInput = document.getElementById('hex-input');
    const colorCodeDisplay = document.getElementById('color-code-display');
    const copyColorBtn = document.getElementById('copy-color-btn');
    const resetColorBtn = document.getElementById('reset-color-btn');

    const palettesContainer = document.getElementById('palettes-container');

    // Dashboard Elements to be colored
    const dashboardHeader = document.getElementById('dashboard-header');
    const dashboardSidebar = document.getElementById('dashboard-sidebar');
    const dashboardMainContent = document.getElementById('dashboard-main-content');
    const dashboardActionButton = document.getElementById('dashboard-action-button');

    // Array of dashboard elements for easier iteration by sliders
    const dashboardElements = [dashboardHeader, dashboardSidebar, dashboardMainContent, dashboardActionButton];


    // --- Default Values ---
    const DEFAULT_COLORS = { r: 128, g: 128, b: 128, a: 1 };
    const DEFAULT_DASHBOARD_COLORS = { // Specific defaults for dashboard parts
        header: { r: 43, g: 49, b: 59, a: 1 },    // #2B313B from first palette
        sidebar: { r: 74, g: 84, b: 98, a: 1 },   // #4A5462
        main: { r: 245, g: 245, b: 245, a: 1 }, // A light grey for main content #F5F5F5
        action: { r: 38, g: 166, b: 154, a: 1 }   // #26A69A
    };


    // --- Preset Palettes ---
    const PRESET_PALETTES = [
        { name: "Charcoal Teal", colors: ["#2B313B", "#4A5462", "#F0F2F5", "#26A69A"] }, // Main content usually lighter
        { name: "Cream & Mint", colors: ["#F5F0E1", "#A0D2DB", "#FFFFFF", "#00897B"] },
        { name: "Navy Beige", colors: ["#1A237E", "#3949AB", "#FAF0E6", "#D7CCC8"] },
        { name: "Mono Light Dark", colors: ["#F5F5F5", "#333333", "#FFFFFF", "#0D47A1"] }, // Header, Sidebar, Main, Action
        { name: "Oceanic Blues", colors: ["#2C3E50", "#4A90E2", "#E9F3FF", "#A0D2DB"] },
        { name: "Coral Contrast", colors: ["#FF7F50", "#34495E", "#FAFAFA", "#F0F0F0"] }, // Action can be light if header dark
        { name: "Clear Sky", colors: ["#4285F4", "#E0EFFF", "#FFFFFF", "#0D47A1"] },
        { name: "Forest Greens", colors: ["#1B5E20", "#388E3C", "#F1F8E9", "#81C784"] },
    ];

    // --- Helper Functions ---
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function getBrightness(r, g, b) {
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    function setTextColorForContrast(element, r, g, b, a = 1) {
        const brightness = getBrightness(r, g, b);
        // For elements like header/sidebar, we generally want clear contrast.
        // For main content, text color might need different logic if its bg is always light.
        if (element === dashboardMainContent && a > 0.8) { // Special handling for main content text
             element.style.color = brightness > 180 ? '#333333' : '#555555'; // Keep text darkish on light bg
        } else if (a < 0.4) {
            element.style.color = '#333333';
        } else {
            element.style.color = brightness > 128 ? '#333333' : '#ffffff';
        }
    }

    // --- Core Update Function (applies SLIDER color to ALL dashboard elements) ---
    function updateDashboardWithSliderColor() {
        const r = parseInt(redSlider.value);
        const g = parseInt(greenSlider.value);
        const b = parseInt(blueSlider.value);
        const a = parseFloat(alphaSlider.value);

        redValueSpan.textContent = r;
        greenValueSpan.textContent = g;
        blueValueSpan.textContent = b;
        alphaValueSpan.textContent = a.toFixed(2);

        const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        const hexColor = rgbToHex(r, g, b);

        liveColorSwatch.style.backgroundColor = rgbaColor;
        colorCodeDisplay.textContent = `${rgbaColor} / ${hexColor.toUpperCase()}`;
        if (hexInput !== document.activeElement) {
            hexInput.value = hexColor.toUpperCase();
        }

        // Apply the current SLIDER-DRIVEN color to ALL dashboard elements
        dashboardElements.forEach(element => {
            if (element) { // Check if element exists
                element.style.backgroundColor = rgbaColor;
                setTextColorForContrast(element, r, g, b, a);
            }
        });
    }

    // --- Function to apply a selected palette to the dashboard ---
    function applyPaletteToDashboard(palette) {
        const [headerHex, sidebarHex, mainBgHex, actionHex] = palette.colors;

        // 1. Set main sliders and UI to the FIRST color of the palette (e.g., Header color)
        const firstColorRgb = hexToRgb(headerHex);
        if (firstColorRgb) {
            redSlider.value = firstColorRgb.r;
            greenSlider.value = firstColorRgb.g;
            blueSlider.value = firstColorRgb.b;
            alphaSlider.value = 1; // Default to opaque for palette application

            redValueSpan.textContent = firstColorRgb.r;
            greenValueSpan.textContent = firstColorRgb.g;
            blueValueSpan.textContent = firstColorRgb.b;
            alphaValueSpan.textContent = (1).toFixed(2);

            const firstRgba = `rgba(${firstColorRgb.r}, ${firstColorRgb.g}, ${firstColorRgb.b}, 1)`;
            liveColorSwatch.style.backgroundColor = firstRgba;
            colorCodeDisplay.textContent = `${firstRgba} / ${headerHex.toUpperCase()}`;
            if (hexInput !== document.activeElement) {
                hexInput.value = headerHex.toUpperCase();
            }
        }

        // 2. Apply specific palette colors to dashboard components (all fully opaque)
        const elementsAndColors = [
            { el: dashboardHeader, hex: headerHex },
            { el: dashboardSidebar, hex: sidebarHex },
            { el: dashboardMainContent, hex: mainBgHex },
            { el: dashboardActionButton, hex: actionHex }
        ];

        elementsAndColors.forEach(({ el, hex }) => {
            if (el && hex) {
                const rgb = hexToRgb(hex);
                if (rgb) {
                    el.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    setTextColorForContrast(el, rgb.r, rgb.g, rgb.b, 1); // Alpha = 1 for palette colors
                }
            }
        });
    }

    // --- Populate Palettes ---
    function populatePalettes() {
        if (!palettesContainer) return;
        palettesContainer.innerHTML = ''; // Clear existing palettes if any

        PRESET_PALETTES.forEach(palette => {
            const swatch = document.createElement('div');
            swatch.classList.add('palette-swatch');
            swatch.title = `Apply ${palette.name}`;

            palette.colors.forEach(colorHex => {
                const band = document.createElement('div');
                band.classList.add('palette-color-band');
                band.style.backgroundColor = colorHex;
                swatch.appendChild(band);
            });

            swatch.addEventListener('click', () => {
                applyPaletteToDashboard(palette);
            });
            palettesContainer.appendChild(swatch);
        });
    }

    // --- Event Listeners ---
    [redSlider, greenSlider, blueSlider, alphaSlider].forEach(slider => {
        slider.addEventListener('input', updateDashboardWithSliderColor);
    });

    hexInput.addEventListener('change', () => {
        let hexValue = hexInput.value.trim();
        const rgb = hexToRgb(hexValue);
        if (rgb) {
            redSlider.value = rgb.r;
            greenSlider.value = rgb.g;
            blueSlider.value = rgb.b;
            updateDashboardWithSliderColor();
        } else {
            const r = parseInt(redSlider.value);
            const g = parseInt(greenSlider.value);
            const b = parseInt(blueSlider.value);
            hexInput.value = rgbToHex(r, g, b).toUpperCase();
        }
    });

    copyColorBtn.addEventListener('click', () => {
        const colorToCopy = colorCodeDisplay.textContent.split('/')[0].trim();
        navigator.clipboard.writeText(colorToCopy)
            .then(() => {
                const originalText = copyColorBtn.textContent;
                copyColorBtn.textContent = 'Copied!';
                setTimeout(() => copyColorBtn.textContent = originalText, 1500);
            })
            .catch(err => console.error('Failed to copy: ', err));
    });

    function resetToDefaultDashboardTheme() {
        // Apply default dashboard colors
        const defaultPalette = {
            name: "Default",
            colors: [
                rgbToHex(DEFAULT_DASHBOARD_COLORS.header.r, DEFAULT_DASHBOARD_COLORS.header.g, DEFAULT_DASHBOARD_COLORS.header.b),
                rgbToHex(DEFAULT_DASHBOARD_COLORS.sidebar.r, DEFAULT_DASHBOARD_COLORS.sidebar.g, DEFAULT_DASHBOARD_COLORS.sidebar.b),
                rgbToHex(DEFAULT_DASHBOARD_COLORS.main.r, DEFAULT_DASHBOARD_COLORS.main.g, DEFAULT_DASHBOARD_COLORS.main.b),
                rgbToHex(DEFAULT_DASHBOARD_COLORS.action.r, DEFAULT_DASHBOARD_COLORS.action.g, DEFAULT_DASHBOARD_COLORS.action.b)
            ]
        };
        applyPaletteToDashboard(defaultPalette);

        // Also reset sliders to the first default dashboard color (header)
        redSlider.value = DEFAULT_DASHBOARD_COLORS.header.r;
        greenSlider.value = DEFAULT_DASHBOARD_COLORS.header.g;
        blueSlider.value = DEFAULT_DASHBOARD_COLORS.header.b;
        alphaSlider.value = DEFAULT_DASHBOARD_COLORS.header.a;

        // Manually update displays for the first color
        redValueSpan.textContent = DEFAULT_DASHBOARD_COLORS.header.r;
        greenValueSpan.textContent = DEFAULT_DASHBOARD_COLORS.header.g;
        blueValueSpan.textContent = DEFAULT_DASHBOARD_COLORS.header.b;
        alphaValueSpan.textContent = DEFAULT_DASHBOARD_COLORS.header.a.toFixed(2);
        const firstRgba = `rgba(${DEFAULT_DASHBOARD_COLORS.header.r}, ${DEFAULT_DASHBOARD_COLORS.header.g}, ${DEFAULT_DASHBOARD_COLORS.header.b}, ${DEFAULT_DASHBOARD_COLORS.header.a})`;
        liveColorSwatch.style.backgroundColor = firstRgba;
        colorCodeDisplay.textContent = `${firstRgba} / ${defaultPalette.colors[0].toUpperCase()}`;
        hexInput.value = defaultPalette.colors[0].toUpperCase();
    }

    resetColorBtn.addEventListener('click', resetToDefaultDashboardTheme);


    // --- Initial Setup ---
    function initializeApp() {
        populatePalettes();
        resetToDefaultDashboardTheme(); // Start with the default dashboard theme
    }

    initializeApp();
});