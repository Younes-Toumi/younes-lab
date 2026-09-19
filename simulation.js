const particleSizeSlider = document.getElementById("particleSizeSlider");
const particleSizeValue = document.getElementById("particleSizeValue");
particleSizeValue.textContent = particleSizeSlider.value; // sync on load

particleSizeSlider.addEventListener("input", function () {
    particleSizeValue.textContent = particleSizeSlider.value;

    particleSize = Number(particleSizeSlider.value); // update the shared variable
    const newSize = particleSize;

    for (const particle of particles) {
        particle.element.style.width = `${newSize}px`;
        particle.element.style.height = `${newSize}px`;
    }
});

const particleCountSlider = document.getElementById("particleCountSlider");
const particleCountValue = document.getElementById("particleCountValue");
particleCountValue.textContent = particleCountSlider.value; // sync on load

particleCountSlider.addEventListener("input", function () {
    particleCountValue.textContent = particleCountSlider.value;

    const targetCount = Number(particleCountSlider.value);

    while (particles.length < targetCount) {
        createParticle();
    }
    while (particles.length > targetCount) {
        const removed = particles.pop();
        removed.element.remove();
    }
});


const temperatureSlider = document.getElementById("temperatureSlider");
const temperatureValue = document.getElementById("temperatureValue");
temperatureValue.textContent = temperatureSlider.value; // sync on load

// Reset Sliders whenever the page loads
temperatureSlider.value = 0;
temperatureValue.textContent = 0;

particleCountSlider.value = 10;
particleCountValue.textContent = 10;

particleSizeSlider.value = 20;
particleSizeValue.textContent = 20;


temperatureSlider.addEventListener("input", function () {

    temperatureValue.textContent = temperatureSlider.value;

    changeTemperature();

    updateTemperatureBackground();
});

const largeBox = document.getElementById("largeBox");
const smallBox = document.getElementById("smallBox");
const particlesContainer = document.getElementById("particles");


const thickness = 1;


// ============================================================
// TEMPERATURE -> VELOCITY SCALE
// ============================================================
// ============================================================
// TEMPERATURE
// ============================================================

function measureAverageKineticEnergy() {
    if (particles.length === 0) return 0;

    let totalKE = 0;
    for (const particle of particles) {
        totalKE += particle.velocityX ** 2 + particle.velocityY ** 2;
    }
    return totalKE / particles.length;
}

const referenceTemperature = Number(temperatureSlider.value); // captured once, at load
let referenceAverageKE = null; // filled in right after the initial particles exist

function updateTemperatureBackground() {

    const temperature = Number(temperatureSlider.value);

    // Normalize temperature from [-273, 273] to [-1, 1]
    const normalizedTemperature = temperature / 100;

    let red = 0;
    let blue = 0;

    if (normalizedTemperature > 0) {
        // Positive temperature -> red
        red = Math.round(80 * normalizedTemperature);
    } else {
        // Negative temperature -> blue
        blue = Math.round(80 * -normalizedTemperature);
    }

    largeBox.style.backgroundColor =
        `rgba(${red}, 0, ${blue}, 0.4)`;
}

// ============================================================
// CHANGE SYSTEM TEMPERATURE
// ============================================================

let previousTemperature =
    Number(temperatureSlider.value);


const minimumTemperature = Number(temperatureSlider.min);
const maximumTemperature = Number(temperatureSlider.max);

let previousAbsoluteTemperature =
    Number(temperatureSlider.value) - minimumTemperature;


function changeTemperature() {

    const sliderTemperature =
        Number(temperatureSlider.value);

    // Convert slider temperature to an absolute temperature.
    // The minimum slider value represents 0 K.
    const newAbsoluteTemperature =
        sliderTemperature - minimumTemperature;

    // Absolute zero -> all particle velocities become zero
    if (newAbsoluteTemperature === 0) {

        for (const particle of particles) {
            particle.velocityX = 0;
            particle.velocityY = 0;
        }

        previousAbsoluteTemperature = 0;
        return;
    }

    // If particles were previously frozen,
    // we need to give them a velocity again.
    if (previousAbsoluteTemperature === 0) {

        const targetScale =
            Math.sqrt(
                newAbsoluteTemperature /
                (maximumTemperature - minimumTemperature)
            );

        for (const particle of particles) {

            const angle =
                Math.random() * 2 * Math.PI;

            const speed =
                5 * targetScale;

            particle.velocityX =
                Math.cos(angle) * speed;

            particle.velocityY =
                Math.sin(angle) * speed;
        }

        previousAbsoluteTemperature =
            newAbsoluteTemperature;

        return;
    }

    // T ∝ v²
    // Therefore v_new / v_old = sqrt(T_new / T_old)
    const velocityScale =
        Math.sqrt(
            newAbsoluteTemperature /
            previousAbsoluteTemperature
        );

    for (const particle of particles) {

        particle.velocityX *= velocityScale;
        particle.velocityY *= velocityScale;
    }

    previousAbsoluteTemperature =
        newAbsoluteTemperature;
}

// ============================
// Moving nameplate
// ============================

let boxX;
let boxY;

let boxVelocityX;
let boxVelocityY;


function createBox() {

    const boxWidth = smallBox.offsetWidth;
    const boxHeight = smallBox.offsetHeight;

    // Random position inside the large box
    boxX = Math.random() * (largeBox.clientWidth - boxWidth);
    boxY = Math.random() * (largeBox.clientHeight - boxHeight);

    // Random velocity direction
    const speed = 3;

    const angle = Math.random() * 2 * Math.PI;

    boxVelocityX = Math.cos(angle) * speed;
    boxVelocityY = Math.sin(angle) * speed;
}

 createBox();


// ============================
// Particles
// ============================

let numberOfParticles = particleCountSlider.value;

let particleSize = particleSizeSlider.value;

const particles = [];


function isParticleInsideSmallBox(x, y) {

    const r = particleSize / 2;

    const particleCenterX = x + r;
    const particleCenterY = y + r;

    const boxWidth = smallBox.offsetWidth;
    const boxHeight = smallBox.offsetHeight;

    const boxCenterX = boxX + boxWidth / 2;
    const boxCenterY = boxY + boxHeight / 2;

    const dx = particleCenterX - boxCenterX;
    const dy = particleCenterY - boxCenterY;

    const overlapX =
        r + boxWidth / 2 - Math.abs(dx);

    const overlapY =
        r + boxHeight / 2 - Math.abs(dy);

    return overlapX > 0 && overlapY > 0;
}
function createParticle() {

    const element = document.createElement("div");
    element.classList.add("particle");
    element.style.width = `${particleSize}px`;
    element.style.height = `${particleSize}px`;
    particlesContainer.appendChild(element);

    let x;
    let y;

    do {
        x = Math.random() * (largeBox.clientWidth - particleSize);
        y = Math.random() * (largeBox.clientHeight - particleSize);

    } while (isParticleInsideSmallBox(x, y));

    particles.push({
        element: element,
        x: x,
        y: y,
        velocityX: (Math.random() - 0.5) * 5,
        velocityY: (Math.random() - 0.5) * 5
    });
}

for (let i = 0; i < numberOfParticles; i++) {
    createParticle();
}

referenceAverageKE = measureAverageKineticEnergy();

// ============================
// particle-particle collision
// ============================
function handleParticleToParticleCollisions() {

    const collisionCoefficient = 1; // represent e in the J formula 

    // particle 1
    for (let i = 0; i < particles.length; i++) {

        // particle 2
        for (let j = i + 1; j < particles.length; j++) {

            const p1 = particles[i];
            const p2 = particles[j];

            // particle sizes do not change 
            const r1 = particles[i].element.offsetWidth / 2;
            const r2 = particles[j].element.offsetWidth / 2;

            // assuming density = 1 -> mass = volume and has h = 1m thickness
            const m1 = thickness * Math.PI * r1 * r1;
            const m2 = thickness * Math.PI * r2 * r2;


            // particle centers
            const p1CenterX = p1.x + r1;
            const p1CenterY = p1.y + r1;

            const p2CenterX = p2.x + r2;
            const p2CenterY = p2.y + r2;

            // distance between centers
            const dx = p2CenterX - p1CenterX;
            const dy = p2CenterY - p1CenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            // particles touch when the distance between
            // their centers equals the sum of their radii
            const minimumDistance = r1 + r2;

            // are p1 and p2 in collision range? -> yes
            if (distance < minimumDistance && distance > 0) {

                // normal vector
                const nx = dx / distance;
                const ny = dy / distance;

                // are the particles moving toward each other?
                const relVelocity =
                    (p2.velocityX - p1.velocityX) * nx +
                    (p2.velocityY - p1.velocityY) * ny;

                
                // they are already moving apart
                if (relVelocity > 0) {
                    continue;
                }

                // impulse formula
                const J = 
                    - (1 + collisionCoefficient) * (relVelocity) /
                      (1/m1 + 1/m2);

                // Elastic collision: exchange normal components
                p1.velocityX -= J/m1 * nx;
                p1.velocityY -= J/m1 * ny;

                p2.velocityX += J/m2 * nx;
                p2.velocityY += J/m2 * ny;

                // separate the particles
                const overlap = minimumDistance - distance;

                p1.x -= nx * overlap / 2;
                p1.y -= ny * overlap / 2;

                p2.x += nx * overlap / 2;
                p2.y += ny * overlap / 2;
            }
        }
    }
}

// ============================
// particle-box collision
// ============================
function handleParticleToBoxCollisions() {

    updateTemperatureBackground();

    const boxLeft = boxX;
    const boxTop = boxY;

    const boxRight = boxX + smallBox.offsetWidth;
    const boxBottom = boxY + smallBox.offsetHeight;

    const boxWidth = smallBox.offsetWidth;
    const boxHeight = smallBox.offsetHeight;

    const collisionCoefficient = 1; // represent e in the J formula 

    // particle
    for (let i = 0; i < particles.length; i++) {

        const particle = particles[i];

        // particle + box sizes that remain the same 
        const r = particle.element.offsetWidth / 2;

        const particleWidth = 2*r;
        const particleHeight = 2*r;

        // assuming mass = volume
        const m = thickness * Math.PI * r * r;
        const M = thickness * boxWidth * boxHeight



        // particle + box center
        const particleCenterX = particle.x + r;
        const particleCenterY = particle.y + r;

        const boxCenterX = boxX + boxWidth / 2;
        const boxCenterY = boxY + boxHeight / 2;

        const dx = particleCenterX - boxCenterX;
        const dy = particleCenterY - boxCenterY;
    
        const overlapX = (particleWidth + boxWidth) / 2 - Math.abs(dx);
        const overlapY = (particleHeight + boxHeight) / 2 - Math.abs(dy);

        // collision
        if (overlapX > 0 && overlapY > 0) {
            let nx;
            let ny;

            if (overlapX < overlapY) {
                nx = Math.sign(dx);
                ny = 0;
                particle.x += nx * overlapX;   // push out of the box on the x-axis
            } else {
                nx = 0;
                ny = Math.sign(dy);
                particle.y += ny * overlapY;   // push out of the box on the y-axis
            }

            const relVelocityX = particle.velocityX - boxVelocityX;
            const relVelocityY = particle.velocityY - boxVelocityY;

            // rel velocity along collision normal
            const relVelocity = relVelocityX * nx + relVelocityY * ny;

            // already separating
            if (relVelocity > 0) {
                continue;
            }

            const J = 
                -(1 + collisionCoefficient) * relVelocity /
                (1/m + 1/M);

            particle.velocityX += (J / m) * nx;
            particle.velocityY += (J / m) * ny;

            boxVelocityX -= (J / M) * nx;
            boxVelocityY -= (J / M) * ny;

        }

    }
}


// ============================
// Animation
// ============================

function animate() {

    // ------------------------
    // Move nameplate
    // ------------------------

    boxX += boxVelocityX;
    boxY += boxVelocityY;

    const maxBoxX = largeBox.clientWidth - smallBox.offsetWidth;
    const maxBoxY = largeBox.clientHeight - smallBox.offsetHeight;

    if (boxX <= 0) {
        boxX = 0;
        boxVelocityX *= -1;
    } else if (boxX >= maxBoxX) {
        boxX = maxBoxX;
        boxVelocityX *= -1;
    }

    if (boxY <= 0) {
        boxY = 0;
        boxVelocityY *= -1;
    } else if (boxY >= maxBoxY) {
        boxY = maxBoxY;
        boxVelocityY *= -1;
    }

    smallBox.style.transform =
        `translate(${boxX}px, ${boxY}px)`;


    // ------------------------
    // Move particles
    // ------------------------

    for (const particle of particles) {

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        const radius = particle.element.offsetWidth / 2;
        const diameter = radius * 2;

        const maxX = largeBox.clientWidth - diameter;
        const maxY = largeBox.clientHeight - diameter;

        if (particle.x <= 0) {
            particle.x = 0;
            particle.velocityX *= -1;
        } else if (particle.x >= maxX) {
            particle.x = maxX;
            particle.velocityX *= -1;
        }

        if (particle.y <= 0) {
            particle.y = 0;
            particle.velocityY *= -1;
        } else if (particle.y >= maxY) {
            particle.y = maxY;
            particle.velocityY *= -1;
        }

        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
    }


    handleParticleToParticleCollisions();
    handleParticleToBoxCollisions();


    requestAnimationFrame(animate);
}


animate();