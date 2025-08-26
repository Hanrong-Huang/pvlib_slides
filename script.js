document.addEventListener("DOMContentLoaded", function() {
    // Page visibility animation
    const pages = document.querySelectorAll('.page');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    pages.forEach(page => observer.observe(page));

    // Init visualizations and interactive elements
    initGlobe('globe-container');
    initGlobe('globe-container-qa');
    initWeatherToPowerDiagram('weather-to-power-diagram');
    initPowerChart();
    initTiltChart();
    
    // Highlight code blocks
    hljs.highlightAll();

    // Testimonial buttons
    const testimonialButtons = document.querySelectorAll('.interactive-buttons button');
    testimonialButtons.forEach(button => {
        button.addEventListener('click', () => showTestimonial(button.dataset.target));
    });

    // Code tabs
    const tabButtons = document.querySelectorAll('.code-tabs button');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => openTab(e, button.dataset.target));
    });

    // Run code button
    const runCodeBtn = document.getElementById('run-code-btn');
    if(runCodeBtn) {
        runCodeBtn.addEventListener('click', runPowerSimulation);
    }
    
    // Live Demo functionality
    initLiveDemo();
    
    // 3D Interactive functionality
    init3DInteractive();
    
    // Tilt slider
    const tiltSlider = document.getElementById('tilt-slider');
    if(tiltSlider) {
        tiltSlider.addEventListener('input', (e) => {
            document.getElementById('tilt-value').textContent = e.target.value;
            updateTiltChart(e.target.value);
        });
    }
});

function initGlobe(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg', () => {
        // Add a light source after texture loads
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(15, 15, 15);
        scene.add(pointLight);
    });

    const material = new THREE.MeshPhongMaterial({ 
        map: texture,
        specularMap: textureLoader.load('https://threejs.org/examples/textures/water.jpg'),
        shininess: 10
    });

    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    camera.position.z = 10;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', () => isDragging = true);
    container.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mouseleave', () => isDragging = false);
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };

        globe.rotation.y += deltaMove.x * 0.005;
        globe.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) {
            globe.rotation.y += 0.0005;
        }
        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function showTestimonial(id) {
    document.querySelectorAll('.testimonial').forEach(t => t.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
}

function initWeatherToPowerDiagram(containerId) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.getElementById(containerId);
    if (!svg) return;
    svg.innerHTML = '';

    const items = [
        { label: "Solar Position", icon: "☀️" },
        { label: "Irradiance", icon: "☁️" },
        { label: "POA Irradiance", icon: "🔳" },
        { label: "DC Power", icon: "➡️" },
        { label: "AC Power", icon: "🏠" }
    ];

    items.forEach((item, i) => {
        const x = 100 + i * 150;
        const g = document.createElementNS(svgNS, 'g');
        g.style.opacity = 0;
        g.style.animation = `fade-in 1s ease-in forwards ${i*0.5}s`;
        
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 180);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--text-color)');
        text.setAttribute('font-family', 'Poppins');
        text.textContent = item.label;
        g.appendChild(text);

        const icon = document.createElementNS(svgNS, 'text');
        icon.setAttribute('x', x);
        icon.setAttribute('y', 140);
        icon.setAttribute('font-size', '50');
        icon.setAttribute('text-anchor', 'middle');
        icon.textContent = item.icon;
        g.appendChild(icon);
        
        svg.appendChild(g);

        if (i < items.length - 1) {
            const line = document.createElementNS(svgNS, 'path');
            line.setAttribute('d', `M ${x + 50} 125 L ${x + 100} 125`);
            line.setAttribute('stroke', 'var(--primary-color)');
            line.setAttribute('stroke-width', 4);
            line.setAttribute('stroke-dasharray', 100);
            line.setAttribute('stroke-dashoffset', 100);
            line.setAttribute('marker-end', 'url(#arrowhead)');
            line.style.animation = `draw 1s forwards ${i*0.5 + 0.2}s`;
            svg.appendChild(line);
        }
    });

    svg.innerHTML += `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary-color)" />
            </marker>
        </defs>
        <style>
            @keyframes fade-in { to { opacity: 1; } } 
            @keyframes draw { to { stroke-dashoffset: 0; } }
        </style>`;
}

function openTab(evt, tabName) {
    document.querySelectorAll(".code-content").forEach(tc => tc.classList.remove("active"));
    document.querySelectorAll(".code-tabs button").forEach(b => b.classList.remove("active"));
    const tab = document.getElementById(tabName);
    if(tab) tab.classList.add("active");
    evt.currentTarget.classList.add("active");
}

let powerChart;
function initPowerChart() {
    const ctx = document.getElementById('power-chart')?.getContext('2d');
    if(!ctx) return;
    powerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'AC Power (W)',
                data: [],
                borderColor: 'var(--secondary-color)',
                backgroundColor: 'rgba(25, 135, 84, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { title: { display: true, text: 'Power (W)' } } }
        }
    });
}

function runPowerSimulation() {
    const data = Array.from({length: 24}, (_, i) => Math.max(0, 1200 * Math.sin((i - 5) / 17 * Math.PI) + Math.random() * 50));
    powerChart.data.datasets[0].data = data;
    powerChart.update('smooth');
}

let tiltChart;
function initTiltChart() {
    const ctx = document.getElementById('tilt-chart')?.getContext('2d');
    if(!ctx) return;
    tiltChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Energy (kWh)',
                data: [],
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'var(--primary-color)',
                borderWidth: 2
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Energy (kWh)' } } }
        }
    });
    updateTiltChart(30);
}

function updateTiltChart(tilt) {
    // A more realistic simulation of monthly energy based on tilt
    const annualInsolation = [3.5, 4.5, 5.5, 6.5, 7.0, 7.5, 7.2, 6.8, 6.0, 5.0, 4.0, 3.2];
    const optimalTilt = 32; // Latitude
    const energy = annualInsolation.map(insol => 
        (insol * (1 - 0.005 * Math.abs(tilt - optimalTilt))) * 30 * 0.8 // 30 days, 80% efficiency factor
    );
    tiltChart.data.datasets[0].data = energy;
    tiltChart.update();
}

// Simplified Live Demo Implementation
let demoChart;
let simulationData = {};
let currentLocation = 'sydney';
let currentTilt = 30;
let currentSize = 5.0;

function initLiveDemo() {
    const runSimulationBtn = document.getElementById('run-simulation-btn');
    const locationSelect = document.getElementById('location-select');
    const tiltSlider = document.getElementById('tilt-slider-demo');
    const sizeSlider = document.getElementById('size-slider');
    
    // Run simulation button
    if (runSimulationBtn) {
        runSimulationBtn.addEventListener('click', runPVSimulation);
    }
    
    // Location selector
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            currentLocation = e.target.value;
            updateCodeWithParameters();
        });
    }
    
    // Tilt slider
    if (tiltSlider) {
        tiltSlider.addEventListener('input', (e) => {
            currentTilt = parseInt(e.target.value);
            document.getElementById('tilt-display').textContent = currentTilt + '°';
            updateCodeWithParameters();
        });
    }
    
    // Size slider  
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            currentSize = parseFloat(e.target.value);
            document.getElementById('size-display').textContent = currentSize.toFixed(1) + ' kW';
            updateCodeWithParameters();
        });
    }
    
    // Initialize chart
    initDemoChart();
    
    // Update code with initial parameters
    updateCodeWithParameters();
}

function updateCodeWithParameters() {
    const locationNames = {
        sydney: 'Sydney',
        melbourne: 'Melbourne', 
        brisbane: 'Brisbane',
        perth: 'Perth',
        adelaide: 'Adelaide'
    };
    
    const locations = {
        sydney: { lat: -33.8688, lon: 151.2093 },
        melbourne: { lat: -37.8136, lon: 144.9631 },
        brisbane: { lat: -27.4698, lon: 153.0251 },
        perth: { lat: -31.9505, lon: 115.8605 },
        adelaide: { lat: -34.9285, lon: 138.6007 }
    };
    
    const loc = locations[currentLocation];
    const codeElement = document.querySelector('#demo-code code');
    
    if (codeElement) {
        const updatedCode = `# Complete PV System Simulation with pvlib
import pvlib
import pandas as pd
import numpy as np

# 1. Define location (${locationNames[currentLocation]}, Australia)
location = pvlib.location.Location(
    latitude=${loc.lat}, longitude=${loc.lon},
    name='${locationNames[currentLocation]}', altitude=58, tz='Australia/${locationNames[currentLocation]}'
)

# 2. Create time series for one day
times = pd.date_range('2025-08-20 06:00', '2025-08-20 18:00', 
                     freq='30min', tz='Australia/${locationNames[currentLocation]}')

# 3. Get clear sky irradiance data
clearsky = location.get_clearsky(times)

# 4. Define PV system parameters
system_size_kw = ${currentSize.toFixed(1)}  # System size in kW
tilt_angle = ${currentTilt}       # Panel tilt angle in degrees

# Module parameters (typical silicon PV)
module_params = {
    'pdc0': 320,           # DC power at STC (W)
    'gamma_pdc': -0.004,   # Power temperature coefficient (/°C)
}

# 5. Create PV system
from pvlib.pvsystem import PVSystem, FixedMount, Array
from pvlib.modelchain import ModelChain

mount = FixedMount(surface_tilt=tilt_angle, surface_azimuth=180)
array = Array(
    mount=mount,
    module_parameters=module_params,
    temperature_model_parameters={'a': -3.56, 'b': -0.075, 'deltaT': 3}
)

# Calculate number of modules for desired system size
modules_needed = int(system_size_kw * 1000 / module_params['pdc0'])

system = PVSystem(
    arrays=[array],
    inverter_parameters={'pdc0': system_size_kw * 1000, 'eta_inv_nom': 0.96}
)

# 6. Run simulation
mc = ModelChain(system, location, 
                aoi_model='physical', spectral_model='no_loss')

# Create weather data with temperature
weather = clearsky.copy()
weather['temp_air'] = 25 + 5 * np.sin((times.hour - 12) / 6 * np.pi)
weather['wind_speed'] = 2.0

# Run the simulation
mc.run_model(weather)

# 7. Extract and display results
ac_power_kw = mc.results.ac / 1000  # Convert to kW
daily_energy = ac_power_kw.sum() * 0.5  # kWh (30min intervals)
peak_power = ac_power_kw.max()
capacity_factor = (daily_energy / (system_size_kw * 12)) * 100  # 12h day

print(f"System Size: {system_size_kw} kW")
print(f"Peak Power: {peak_power:.2f} kW")
print(f"Daily Energy: {daily_energy:.2f} kWh")
print(f"Capacity Factor: {capacity_factor:.1f}%")`;

        codeElement.textContent = updatedCode;
        
        // Re-highlight code
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(codeElement);
        }
    }
}

function runPVSimulation() {
    const runBtn = document.getElementById('run-simulation-btn');
    
    // Update button state
    if (runBtn) {
        const originalText = runBtn.innerHTML;
        runBtn.innerHTML = '⏳ Simulating...';
        runBtn.disabled = true;
        
        setTimeout(() => {
            // Generate simulation data
            generatePVData();
            
            // Update charts
            updateDemoChart();
            
            // Show results
            displayResults();
            
            runBtn.innerHTML = '✅ Simulation Complete';
            setTimeout(() => {
                runBtn.innerHTML = originalText;
                runBtn.disabled = false;
            }, 2000);
        }, 1500);
    }
}

function updateCodeDisplay(stepNumber) {
    const codeElement = document.querySelector('#demo-code code');
    if (!codeElement) return;
    
    const codes = {
        1: `# Step 1: Import Libraries
import pvlib
import pandas as pd
import numpy as np

print("📚 Libraries imported successfully!")
print(f"Using pvlib version: {pvlib.__version__}")`,
        
        2: `# Step 2: Define Location (Sydney)
location = pvlib.location.Location(
    latitude=-33.8688, 
    longitude=151.2093,
    name='Sydney', 
    altitude=58, 
    tz='Australia/Sydney'
)

print(f"📍 Location: {location.name}")
print(f"Coordinates: {location.latitude:.2f}°, {location.longitude:.2f}°")`,
        
        3: `# Step 3: Create PV System
from pvlib.pvsystem import PVSystem, FixedMount, Array

mount = FixedMount(surface_tilt=30, surface_azimuth=180)
array = Array(
    mount=mount,
    module_parameters={'pdc0': 320, 'gamma_pdc': -0.004},
    temperature_model_parameters={'a': -3.56, 'b': -0.075, 'deltaT': 3}
)

system = PVSystem(
    arrays=[array],
    inverter_parameters={'pdc0': 12000, 'eta_inv_nom': 0.96}
)

print(f"🔋 System created with {array.module_parameters['pdc0']}W modules")
print(f"Tilt: {mount.surface_tilt}°, Azimuth: {mount.surface_azimuth}°")`,
        
        4: `# Step 4: Get Weather Data
times = pd.date_range('2025-08-20', periods=24, freq='H', tz='Australia/Sydney')

# Get clear sky irradiance data
clearsky = location.get_clearsky(times)
print("🌤️ Clear sky irradiance data retrieved")
print(f"Peak GHI: {clearsky['ghi'].max():.0f} W/m²")

# Add temperature and wind data
weather = clearsky.copy()
weather['temp_air'] = 20 + 8 * np.sin((times.hour - 6) / 12 * np.pi).clip(0)
weather['wind_speed'] = 2 + np.random.normal(0, 0.5, len(times)).clip(0.5, 5)`,
        
        5: `# Step 5: Run ModelChain Simulation
from pvlib.modelchain import ModelChain

mc = ModelChain(
    system, location, 
    aoi_model='physical', 
    spectral_model='no_loss'
)

# Run the complete simulation
mc.run_model(weather)

print("⚡ Simulation completed!")
print(f"Daily AC energy: {mc.results.ac.sum()/1000:.1f} kWh")
print(f"Peak AC power: {mc.results.ac.max():.0f} W")`,
        
        6: `# Step 6: Analyze Results
import matplotlib.pyplot as plt

# Extract results
ac_power = mc.results.ac
dc_power = mc.results.dc
cell_temp = mc.results.cell_temperature

# Key metrics
daily_energy = ac_power.sum() / 1000  # kWh
peak_power = ac_power.max()  # W
avg_efficiency = (ac_power.sum() / weather['ghi'].sum()) * 100

print("📊 Analysis Results:")
print(f"• Daily Energy: {daily_energy:.1f} kWh")
print(f"• Peak Power: {peak_power:.0f} W") 
print(f"• System Efficiency: {avg_efficiency:.1f}%")
print(f"• Peak Cell Temperature: {cell_temp.max():.1f}°C")`
    };
    
    codeElement.textContent = codes[stepNumber] || codes[1];
    
    // Re-highlight code
    if (typeof hljs !== 'undefined') {
        hljs.highlightElement(codeElement);
    }
}

function updateOutput(stepNumber) {
    const outputContent = document.getElementById('demo-output-content');
    if (!outputContent) return;
    
    const outputs = {
        1: `📚 Libraries imported successfully!
Using pvlib version: 0.10.2`,
        
        2: `📍 Location: Sydney
Coordinates: -33.87°, 151.21°`,
        
        3: `🔋 System created with 320W modules
Tilt: 30°, Azimuth: 180°`,
        
        4: `🌤️ Clear sky irradiance data retrieved
Peak GHI: 1045 W/m²`,
        
        5: `⚡ Simulation completed!
Daily AC energy: 8.4 kWh
Peak AC power: 2847 W`,
        
        6: `📊 Analysis Results:
• Daily Energy: 8.4 kWh
• Peak Power: 2847 W
• System Efficiency: 18.7%
• Peak Cell Temperature: 47.3°C`
    };
    
    outputContent.innerHTML = `<pre>${outputs[stepNumber] || 'Click a step to see output!'}</pre>`;
}

function runCurrentStep() {
    const location = document.getElementById('location-select')?.value || 'sydney';
    
    // Update button state
    const runStepBtn = document.getElementById('run-step-btn');
    if (runStepBtn) {
        const originalText = runStepBtn.innerHTML;
        runStepBtn.innerHTML = '⏳ Running...';
        runStepBtn.disabled = true;
        
        setTimeout(() => {
            runStepBtn.innerHTML = '✅ Completed';
            runStepBtn.disabled = false;
            
            // Mark step as completed
            completedSteps.add(currentStep);
            setActiveStep(currentStep); // Refresh to show completed state
            
            // Reset button text after a moment
            setTimeout(() => {
                runStepBtn.innerHTML = originalText;
            }, 1500);
        }, 1000);
    }
    
    // Generate or update data based on current step
    generateDemoData(location);
    
    // Show progressive visualization based on step
    updateVisualizationForStep(currentStep);
    
    // Update the chart if we're at a step that shows results
    if (currentStep >= 4) {
        updateDemoChart();
    }
}

function updateVisualizationForStep(stepNumber) {
    if (!demoChart) return;
    
    const activeTab = document.querySelector('.chart-tab.active')?.dataset.chart || 'power';
    
    // Progressive data revelation based on step
    let dataToShow = [];
    
    if (stepNumber >= 4) { // Weather data available
        if (activeTab === 'irradiance') {
            dataToShow = demoData.irradiance;
        } else if (activeTab === 'temperature') {
            dataToShow = demoData.temperature;
        }
    }
    
    if (stepNumber >= 5) { // Power simulation available
        if (activeTab === 'power') {
            dataToShow = demoData.power;
        }
    }
    
    // Update chart with appropriate data
    if (dataToShow.length > 0) {
        demoChart.data.datasets[0].data = dataToShow;
        demoChart.update('smooth');
    }
}

function runCompleteDemo() {
    const location = document.getElementById('location-select')?.value || 'sydney';
    
    // Reset completed steps
    completedSteps.clear();
    
    // Generate realistic data based on location
    generateDemoData(location);
    
    // Run through all steps with animation
    let step = 1;
    const runStep = () => {
        setActiveStep(step);
        
        // Mark as completed after a delay
        setTimeout(() => {
            completedSteps.add(step);
            setActiveStep(step); // Refresh to show completed state
        }, 1200);
        
        if (step < 6) {
            step++;
            setTimeout(runStep, 1500);
        } else {
            // Update final chart
            setTimeout(() => {
                updateDemoChart();
            }, 1200);
        }
    };
    
    runStep();
}

function generateDemoData(location) {
    const locations = {
        sydney: { lat: -33.87, peak: 1045, temp: 25 },
        melbourne: { lat: -37.81, peak: 985, temp: 22 },
        brisbane: { lat: -27.47, peak: 1125, temp: 28 },
        perth: { lat: -31.95, peak: 1165, temp: 26 },
        adelaide: { lat: -34.93, peak: 1055, temp: 24 }
    };
    
    const loc = locations[location];
    const hours = Array.from({length: 24}, (_, i) => i);
    
    // Generate power curve
    demoData.power = hours.map(h => {
        if (h < 6 || h > 18) return 0;
        const solar_factor = Math.sin((h - 6) / 12 * Math.PI);
        return Math.max(0, loc.peak * solar_factor * 2.5 + Math.random() * 100);
    });
    
    // Generate irradiance
    demoData.irradiance = hours.map(h => {
        if (h < 6 || h > 18) return 0;
        const solar_factor = Math.sin((h - 6) / 12 * Math.PI);
        return Math.max(0, loc.peak * solar_factor + Math.random() * 50);
    });
    
    // Generate temperature
    demoData.temperature = hours.map(h => {
        const daily_temp = loc.temp + 10 * Math.sin((h - 6) / 12 * Math.PI);
        return Math.max(15, daily_temp + Math.random() * 5);
    });
    
    demoData.labels = hours.map(h => `${h}:00`);
}

function generatePVData() {
    const locations = {
        sydney: { lat: -33.87, peak_ghi: 1045, temp_base: 25 },
        melbourne: { lat: -37.81, peak_ghi: 985, temp_base: 22 },
        brisbane: { lat: -27.47, peak_ghi: 1125, temp_base: 28 },
        perth: { lat: -31.95, peak_ghi: 1165, temp_base: 26 },
        adelaide: { lat: -34.93, peak_ghi: 1055, temp_base: 24 }
    };
    
    const loc = locations[currentLocation];
    const times = [];
    
    // Generate 30-minute intervals from 6:00 to 18:00
    for (let hour = 6; hour <= 18; hour += 0.5) {
        const h = Math.floor(hour);
        const m = (hour % 1) * 60;
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    
    simulationData.times = times;
    simulationData.power_ac = [];
    simulationData.irradiance_ghi = [];
    simulationData.irradiance_poa = [];
    simulationData.efficiency = [];
    
    times.forEach((time, i) => {
        const hour = 6 + i * 0.5;
        
        // Solar elevation factor (bell curve)
        const solar_elevation = Math.max(0, Math.sin((hour - 6) / 12 * Math.PI));
        
        // GHI calculation
        const ghi = loc.peak_ghi * solar_elevation;
        
        // POA calculation with tilt optimization
        const tilt_factor = 1 + 0.3 * Math.cos((currentTilt - loc.lat) * Math.PI / 180);
        const poa = ghi * tilt_factor;
        
        // Temperature effect
        const temp_ambient = loc.temp_base + 8 * Math.sin((hour - 6) / 12 * Math.PI);
        const temp_cell = temp_ambient + 25; // Cell heating
        const temp_coeff = 1 - 0.004 * (temp_cell - 25); // -0.4%/°C
        
        // AC power calculation
        const dc_power = currentSize * (poa / 1000) * temp_coeff; // kW
        const inverter_eff = 0.96;
        const ac_power = Math.max(0, dc_power * inverter_eff);
        
        // System efficiency
        const efficiency = ghi > 0 ? (ac_power / currentSize) * (1000 / ghi) * 100 : 0;
        
        simulationData.power_ac.push(ac_power);
        simulationData.irradiance_ghi.push(ghi);
        simulationData.irradiance_poa.push(poa);
        simulationData.efficiency.push(Math.min(efficiency, 25)); // Cap at 25%
    });
}

function initDemoChart() {
    const ctx = document.getElementById('demo-chart');
    if (!ctx) return;
    
    demoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'AC Power (kW)',
                data: [],
                borderColor: '#1976D2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top'
                },
                title: { 
                    display: true, 
                    text: 'PV System Performance',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { 
                        display: true, 
                        text: 'AC Power (kW)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                },
                x: {
                    title: { 
                        display: true, 
                        text: 'Time of Day',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                }
            }
        }
    });
}

function updateDemoChart() {
    if (!demoChart || !simulationData.power_ac) return;
    
    const activeTab = document.querySelector('.chart-tab.active')?.dataset.chart || 'power';
    
    let data, label, color, yAxisLabel;
    switch(activeTab) {
        case 'power':
            data = simulationData.power_ac;
            label = 'AC Power Output';
            color = '#1976D2';
            yAxisLabel = 'AC Power (kW)';
            break;
        case 'irradiance':
            data = simulationData.irradiance_ghi;
            label = 'Global Horizontal Irradiance';
            color = '#FF9800';
            yAxisLabel = 'Irradiance (W/m²)';
            break;
        case 'efficiency':
            data = simulationData.efficiency;
            label = 'System Efficiency';
            color = '#4CAF50';
            yAxisLabel = 'Efficiency (%)';
            break;
        default:
            data = simulationData.power_ac;
            label = 'AC Power Output';
            color = '#1976D2';
            yAxisLabel = 'AC Power (kW)';
    }
    
    demoChart.data.labels = simulationData.times;
    demoChart.data.datasets[0].data = data;
    demoChart.data.datasets[0].label = label;
    demoChart.data.datasets[0].borderColor = color;
    demoChart.data.datasets[0].backgroundColor = color + '20';
    demoChart.options.scales.y.title.text = yAxisLabel;
    demoChart.update('smooth');
}

function displayResults() {
    const peakPower = Math.max(...simulationData.power_ac);
    const dailyEnergy = simulationData.power_ac.reduce((sum, power) => sum + power * 0.5, 0); // 0.5h intervals
    const capacityFactor = (dailyEnergy / (currentSize * 12)) * 100; // 12h day
    
    document.getElementById('peak-power-result').textContent = peakPower.toFixed(2) + ' kW';
    document.getElementById('daily-energy-result').textContent = dailyEnergy.toFixed(1) + ' kWh';
    document.getElementById('capacity-factor-result').textContent = capacityFactor.toFixed(1) + '%';
}


// Chart tab switching for simplified demo
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chart-tab')) {
        // Update tab active state
        document.querySelectorAll('.chart-tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update insights (show for all chart types)
        document.querySelectorAll('.insights').forEach(insight => insight.classList.remove('active'));
        const chartType = e.target.dataset.chart;
        if (chartType === 'power' || chartType === 'irradiance' || chartType === 'efficiency') {
            const targetInsight = document.getElementById(chartType + '-insights');
            if (targetInsight) targetInsight.classList.add('active');
        }
        
        // Update chart if simulation data exists
        if (simulationData.power_ac && simulationData.power_ac.length > 0) {
            updateDemoChart();
        }
    }
});

// 3D Interactive PV System Implementation
let scene3D, camera3D, renderer3D, controls3D;
let pvPanels = [];
let sunSphere, sunLight;
let generationChart3D;
let current3DParams = {
    location: 'sydney',
    tilt: 30,
    azimuth: 180,
    arrayWidth: 4,
    arrayHeight: 3,
    timeOfDay: 12,
    dayOfYear: 172
};

function init3DInteractive() {
    const container = document.getElementById('threejs-container');
    if (!container) return;

    // Initialize Three.js scene
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0x87ceeb);
    
    // Camera setup
    camera3D = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera3D.position.set(10, 8, 10);
    
    // Renderer setup
    renderer3D = new THREE.WebGLRenderer({ antialias: true });
    renderer3D.setSize(container.clientWidth, container.clientHeight);
    renderer3D.shadowMap.enabled = true;
    renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer3D.domElement);
    
    // Add orbit controls
    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.05;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene3D.add(ambientLight);
    
    sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(0, 10, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene3D.add(sunLight);
    
    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene3D.add(ground);
    
    // Add sun visualization
    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
    scene3D.add(sunSphere);
    
    // Create initial PV array
    create3DPVArray();
    
    // Initialize generation chart
    initGenerationChart();
    
    // Setup event listeners
    setup3DEventListeners();
    
    // Update initial display
    update3DSystem();
    
    // Initial generation profile update
    setTimeout(() => {
        updateGenerationProfile();
    }, 100);
    
    // Start animation loop
    animate3D();
}

function create3DPVArray() {
    // Clear existing panels
    pvPanels.forEach(panel => scene3D.remove(panel));
    pvPanels = [];
    
    const panelWidth = 1.6;
    const panelHeight = 1.0;
    const panelThickness = 0.05;
    const spacing = 0.1;
    
    // Panel geometry and materials
    const panelGeometry = new THREE.BoxGeometry(panelWidth, panelThickness, panelHeight);
    const panelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a237e,
        shininess: 100,
        specular: 0x444444
    });
    
    // Create panel array
    for (let x = 0; x < current3DParams.arrayWidth; x++) {
        for (let z = 0; z < current3DParams.arrayHeight; z++) {
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            
            // Position panels
            panel.position.x = (x - (current3DParams.arrayWidth - 1) / 2) * (panelWidth + spacing);
            panel.position.z = (z - (current3DParams.arrayHeight - 1) / 2) * (panelHeight + spacing);
            panel.position.y = panelThickness / 2;
            
            // Apply tilt and azimuth
            panel.rotation.x = -THREE.MathUtils.degToRad(current3DParams.tilt);
            panel.rotation.y = THREE.MathUtils.degToRad(current3DParams.azimuth - 180);
            
            panel.castShadow = true;
            panel.receiveShadow = true;
            
            scene3D.add(panel);
            pvPanels.push(panel);
        }
    }
}

function updateSunPosition() {
    const locations = {
        sydney: { lat: -33.87, lon: 151.21 },
        melbourne: { lat: -37.81, lon: 144.96 },
        brisbane: { lat: -27.47, lon: 153.03 },
        perth: { lat: -31.95, lon: 115.86 },
        adelaide: { lat: -34.93, lon: 138.60 },
        darwin: { lat: -12.46, lon: 130.84 },
        hobart: { lat: -42.88, lon: 147.33 }
    };
    
    const loc = locations[current3DParams.location];
    const hour = current3DParams.timeOfDay;
    const dayOfYear = current3DParams.dayOfYear;
    
    // Simplified solar position calculation
    const declination = 23.45 * Math.sin(THREE.MathUtils.degToRad(360 * (284 + dayOfYear) / 365));
    const hourAngle = 15 * (hour - 12);
    
    const elevation = Math.asin(
        Math.sin(THREE.MathUtils.degToRad(declination)) * Math.sin(THREE.MathUtils.degToRad(loc.lat)) +
        Math.cos(THREE.MathUtils.degToRad(declination)) * Math.cos(THREE.MathUtils.degToRad(loc.lat)) * Math.cos(THREE.MathUtils.degToRad(hourAngle))
    );
    
    const azimuth = Math.atan2(
        Math.sin(THREE.MathUtils.degToRad(hourAngle)),
        Math.cos(THREE.MathUtils.degToRad(hourAngle)) * Math.sin(THREE.MathUtils.degToRad(loc.lat)) - Math.tan(THREE.MathUtils.degToRad(declination)) * Math.cos(THREE.MathUtils.degToRad(loc.lat))
    );
    
    const elevationDeg = THREE.MathUtils.radToDeg(elevation);
    const azimuthDeg = THREE.MathUtils.radToDeg(azimuth) + 180;
    
    // Position sun
    const sunDistance = 15;
    const sunX = sunDistance * Math.cos(elevation) * Math.sin(azimuth);
    const sunY = sunDistance * Math.sin(elevation);
    const sunZ = sunDistance * Math.cos(elevation) * Math.cos(azimuth);
    
    if (sunSphere) {
        sunSphere.position.set(sunX, Math.max(sunY, 0.5), sunZ);
        sunLight.position.copy(sunSphere.position);
        sunLight.intensity = Math.max(0, Math.sin(elevation));
    }
    
    // Update display values
    document.getElementById('sun-elevation').textContent = elevationDeg.toFixed(1) + '°';
    document.getElementById('sun-azimuth').textContent = azimuthDeg.toFixed(1) + '°';
    
    // Calculate angle of incidence
    const panelNormalX = Math.sin(THREE.MathUtils.degToRad(current3DParams.tilt)) * Math.sin(THREE.MathUtils.degToRad(current3DParams.azimuth));
    const panelNormalY = Math.cos(THREE.MathUtils.degToRad(current3DParams.tilt));
    const panelNormalZ = Math.sin(THREE.MathUtils.degToRad(current3DParams.tilt)) * Math.cos(THREE.MathUtils.degToRad(current3DParams.azimuth));
    
    const sunVectorX = -sunX / sunDistance;
    const sunVectorY = -sunY / sunDistance;
    const sunVectorZ = -sunZ / sunDistance;
    
    const dotProduct = panelNormalX * sunVectorX + panelNormalY * sunVectorY + panelNormalZ * sunVectorZ;
    const aoi = Math.acos(Math.max(0, Math.min(1, dotProduct)));
    const aoiDeg = THREE.MathUtils.radToDeg(aoi);
    
    document.getElementById('aoi-value').textContent = aoiDeg.toFixed(1) + '°';
    
    return { elevation: elevationDeg, azimuth: azimuthDeg, aoi: aoiDeg };
}

function setup3DEventListeners() {
    // Location selector
    const locationSelect = document.getElementById('location-3d-select');
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            current3DParams.location = e.target.value;
            update3DSystem();
        });
    }
    
    // Tilt slider
    const tiltSlider = document.getElementById('tilt-3d-slider');
    if (tiltSlider) {
        tiltSlider.addEventListener('input', (e) => {
            current3DParams.tilt = parseInt(e.target.value);
            document.getElementById('tilt-3d-value').textContent = current3DParams.tilt;
            updatePanelOrientation();
            updateSunPosition();
            updateGenerationProfile();
        });
    }
    
    // Azimuth slider
    const azimuthSlider = document.getElementById('azimuth-3d-slider');
    if (azimuthSlider) {
        azimuthSlider.addEventListener('input', (e) => {
            current3DParams.azimuth = parseInt(e.target.value);
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const dirIndex = Math.round(current3DParams.azimuth / 45) % 8;
            document.getElementById('azimuth-3d-value').textContent = current3DParams.azimuth + '° (' + directions[dirIndex] + ')';
            updatePanelOrientation();
            updateSunPosition();
            updateGenerationProfile();
        });
    }
    
    // Array size sliders
    const widthSlider = document.getElementById('array-width-slider');
    if (widthSlider) {
        widthSlider.addEventListener('input', (e) => {
            current3DParams.arrayWidth = parseInt(e.target.value);
            document.getElementById('array-width-value').textContent = current3DParams.arrayWidth;
            create3DPVArray();
            updateSystemInfo();
            updateGenerationProfile();
        });
    }
    
    const heightSlider = document.getElementById('array-height-slider');
    if (heightSlider) {
        heightSlider.addEventListener('input', (e) => {
            current3DParams.arrayHeight = parseInt(e.target.value);
            document.getElementById('array-height-value').textContent = current3DParams.arrayHeight;
            create3DPVArray();
            updateSystemInfo();
            updateGenerationProfile();
        });
    }
    
    // Time controls
    const timeSlider = document.getElementById('time-slider');
    if (timeSlider) {
        timeSlider.addEventListener('input', (e) => {
            current3DParams.timeOfDay = parseInt(e.target.value);
            const hour = current3DParams.timeOfDay;
            document.getElementById('time-value').textContent = hour.toString().padStart(2, '0') + ':00';
            updateSunPosition();
            updateGenerationProfile();
        });
    }
    
    const dateSlider = document.getElementById('date-slider');
    if (dateSlider) {
        dateSlider.addEventListener('input', (e) => {
            current3DParams.dayOfYear = parseInt(e.target.value);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let day = current3DParams.dayOfYear;
            let month = 0;
            while (day > daysInMonth[month]) {
                day -= daysInMonth[month];
                month++;
            }
            document.getElementById('date-value').textContent = current3DParams.dayOfYear + ' (' + months[month] + ' ' + day + ')';
            updateSunPosition();
            updateGenerationProfile();
        });
    }
    
    // View control buttons
    document.getElementById('reset-view')?.addEventListener('click', () => {
        camera3D.position.set(10, 8, 10);
        controls3D.reset();
    });
    
    document.getElementById('top-view')?.addEventListener('click', () => {
        camera3D.position.set(0, 15, 0);
        camera3D.lookAt(0, 0, 0);
    });
    
    document.getElementById('side-view')?.addEventListener('click', () => {
        camera3D.position.set(15, 5, 0);
        camera3D.lookAt(0, 0, 0);
    });
    
    document.getElementById('sun-view')?.addEventListener('click', () => {
        if (sunSphere) {
            const sunPos = sunSphere.position;
            camera3D.position.set(sunPos.x * 0.8, sunPos.y * 0.8, sunPos.z * 0.8);
            camera3D.lookAt(0, 0, 0);
        }
    });
}

function updatePanelOrientation() {
    pvPanels.forEach(panel => {
        panel.rotation.x = -THREE.MathUtils.degToRad(current3DParams.tilt);
        panel.rotation.y = THREE.MathUtils.degToRad(current3DParams.azimuth - 180);
    });
}

function updateSystemInfo() {
    const totalPanels = current3DParams.arrayWidth * current3DParams.arrayHeight;
    const systemCapacity = totalPanels * 0.32; // 320W per panel
    
    document.getElementById('total-panels').textContent = totalPanels;
    document.getElementById('system-capacity').textContent = systemCapacity.toFixed(2) + ' kW';
}

function update3DSystem() {
    create3DPVArray();
    updateSunPosition();
    updateSystemInfo();
    updateGenerationProfile();
}

function initGenerationChart() {
    const ctx = document.getElementById('generation-profile-chart');
    if (!ctx) return;
    
    generationChart3D = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 13}, (_, i) => `${i + 6}:00`),
            datasets: [{
                label: 'Power Output (kW)',
                data: [],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        font: { size: 14, weight: 'bold' }
                    }
                },
                title: {
                    display: true,
                    text: 'Daily Power Generation Profile',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    min: 0,
                    suggestedMax: 5,
                    title: { 
                        display: true, 
                        text: 'Power Output (kW)',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + ' kW';
                        },
                        font: { size: 12 }
                    },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                },
                x: {
                    title: { 
                        display: true, 
                        text: 'Time of Day',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateGenerationProfile() {
    if (!generationChart3D) return;

    const systemCapacity = current3DParams.arrayWidth * current3DParams.arrayHeight * 0.32; // kW
    const powerData = [];
    let dailyEnergy = 0;
    let peakPower = 0;

    const tiltRad = THREE.MathUtils.degToRad(current3DParams.tilt);
    const albedo = 0.2; // Typical ground reflectance

    for (let hour = 6; hour <= 18; hour++) {
        const tempParams = { ...current3DParams, timeOfDay: hour };
        const sunPos = calculateSunPosition(tempParams);

        if (sunPos.elevation > 0) {
            const solarElevationRad = THREE.MathUtils.degToRad(sunPos.elevation);
            const solarZenithRad = Math.PI / 2 - solarElevationRad;
            const aoiRad = THREE.MathUtils.degToRad(sunPos.aoi);

            // 1. Calculate GHI (simplified clear-sky model)
            const airMass = 1 / Math.sin(solarElevationRad);
            const ghi = 1000 * Math.pow(0.7, Math.pow(airMass, 0.678)); // W/m²

            // 2. Estimate DNI and DHI from GHI
            const Kt = 0.75; // Assume a constant clear-sky index
            const diffuseFraction = 1 / (1 + Math.exp(-5 + 8.6 * Kt));
            const dhi = ghi * diffuseFraction;
            const dni = (ghi - dhi) / Math.cos(solarZenithRad);

            // 3. Transpose to Plane of Array (POA) irradiance
            const poa_beam = dni * Math.cos(aoiRad);
            const poa_sky_diffuse = dhi * (1 + Math.cos(tiltRad)) / 2;
            const poa_ground_diffuse = ghi * albedo * (1 - Math.cos(tiltRad)) / 2;
            const poa_global = poa_beam + poa_sky_diffuse + poa_ground_diffuse;

            // 4. Calculate AC Power
            const tempCoeff = -0.004; // %/°C
            const cellTemp = 25 + (poa_global / 1000) * 20; // Simplified cell temp
            const tempFactor = 1 + tempCoeff * (cellTemp - 25);
            
            const moduleEfficiency = 0.20;
            const inverterEfficiency = 0.96;
            
            const panelArea = current3DParams.arrayWidth * current3DParams.arrayHeight * 1.6 * 1.0; // m²
            const dcPower = (poa_global / 1000) * panelArea * moduleEfficiency * tempFactor;
            const acPower = Math.max(0, dcPower * inverterEfficiency);

            powerData.push(acPower);
            dailyEnergy += acPower; // 1-hour interval
            peakPower = Math.max(peakPower, acPower);
        } else {
            powerData.push(0);
        }
    }

    generationChart3D.data.datasets[0].data = powerData;
    const yAxisMax = Math.max(peakPower * 1.2, 1);
    generationChart3D.options.scales.y.suggestedMax = yAxisMax;
    generationChart3D.update();

    const capacityFactor = dailyEnergy > 0 ? (dailyEnergy / (systemCapacity * 12)) * 100 : 0;
    const annualYield = dailyEnergy * 365;

    document.getElementById('daily-energy').textContent = dailyEnergy.toFixed(1) + ' kWh';
    document.getElementById('peak-power').textContent = peakPower.toFixed(2) + ' kW';
    document.getElementById('capacity-factor').textContent = capacityFactor.toFixed(1) + '%';
    document.getElementById('annual-yield').textContent = (annualYield >= 1000 ?
        (annualYield / 1000).toFixed(1) + ' MWh' :
        annualYield.toFixed(0) + ' kWh');
}

function calculateSunPosition(params) {
    const locations = {
        sydney: { lat: -33.87, lon: 151.21 },
        melbourne: { lat: -37.81, lon: 144.96 },
        brisbane: { lat: -27.47, lon: 153.03 },
        perth: { lat: -31.95, lon: 115.86 },
        adelaide: { lat: -34.93, lon: 138.60 },
        darwin: { lat: -12.46, lon: 130.84 },
        hobart: { lat: -42.88, lon: 147.33 }
    };
    
    const loc = locations[params.location];
    const hour = params.timeOfDay;
    const dayOfYear = params.dayOfYear;
    
    // Simplified solar position calculation
    const declination = 23.45 * Math.sin(THREE.MathUtils.degToRad(360 * (284 + dayOfYear) / 365));
    const hourAngle = 15 * (hour - 12);
    
    const elevation = Math.asin(
        Math.sin(THREE.MathUtils.degToRad(declination)) * Math.sin(THREE.MathUtils.degToRad(loc.lat)) +
        Math.cos(THREE.MathUtils.degToRad(declination)) * Math.cos(THREE.MathUtils.degToRad(loc.lat)) * Math.cos(THREE.MathUtils.degToRad(hourAngle))
    );
    
    const azimuth = Math.atan2(
        Math.sin(THREE.MathUtils.degToRad(hourAngle)),
        Math.cos(THREE.MathUtils.degToRad(hourAngle)) * Math.sin(THREE.MathUtils.degToRad(loc.lat)) - Math.tan(THREE.MathUtils.degToRad(declination)) * Math.cos(THREE.MathUtils.degToRad(loc.lat))
    );
    
    const elevationDeg = THREE.MathUtils.radToDeg(elevation);
    const azimuthDeg = THREE.MathUtils.radToDeg(azimuth) + 180;
    
    // Calculate angle of incidence
    const panelNormalX = Math.sin(THREE.MathUtils.degToRad(params.tilt)) * Math.sin(THREE.MathUtils.degToRad(params.azimuth));
    const panelNormalY = Math.cos(THREE.MathUtils.degToRad(params.tilt));
    const panelNormalZ = Math.sin(THREE.MathUtils.degToRad(params.tilt)) * Math.cos(THREE.MathUtils.degToRad(params.azimuth));
    
    const sunDistance = 15;
    const sunX = sunDistance * Math.cos(elevation) * Math.sin(azimuth);
    const sunY = sunDistance * Math.sin(elevation);
    const sunZ = sunDistance * Math.cos(elevation) * Math.cos(azimuth);
    
    const sunVectorX = -sunX / sunDistance;
    const sunVectorY = -sunY / sunDistance;
    const sunVectorZ = -sunZ / sunDistance;
    
    const dotProduct = panelNormalX * sunVectorX + panelNormalY * sunVectorY + panelNormalZ * sunVectorZ;
    const aoi = Math.acos(Math.max(0, Math.min(1, dotProduct)));
    const aoiDeg = THREE.MathUtils.radToDeg(aoi);
    
    return { elevation: elevationDeg, azimuth: azimuthDeg, aoi: aoiDeg };
}

function animate3D() {
    requestAnimationFrame(animate3D);
    
    if (controls3D) {
        controls3D.update();
    }
    
    if (renderer3D && scene3D && camera3D) {
        renderer3D.render(scene3D, camera3D);
    }
}
