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

temperatureSlider.addEventListener("input", function () {
    temperatureValue.textContent = temperatureSlider.value;
});

const largeBox = document.getElementById("largeBox");
const smallBox = document.getElementById("smallBox");
const particlesContainer = document.getElementById("particles");


// ============================
// Moving nameplate
// ============================

let boxX = 0;
let boxY = 0;

let boxVelocityX = 2;
let boxVelocityY = 2;


// ============================
// Particles
// ============================

let numberOfParticles = particleCountSlider.value;

let particleSize = particleSizeSlider.value;

const particles = [];


function createParticle() {
    const element = document.createElement("div");
    element.classList.add("particle");
    element.style.width = `${particleSize}px`;
    element.style.height = `${particleSize}px`;
    particlesContainer.appendChild(element);

    particles.push({
        element: element,
        x: Math.random() * (largeBox.clientWidth - particleSize),
        y: Math.random() * (largeBox.clientHeight - particleSize),
        velocityX: (Math.random() - 0.5) * 5,
        velocityY: (Math.random() - 0.5) * 5
    });
}

for (let i = 0; i < numberOfParticles; i++) {
    createParticle();
}
// ============================
// Particle Collision
// ============================
function handleParticleCollisions() {

    const boxLeft = boxX;
    const boxTop = boxY;

    const boxRight = boxX + smallBox.offsetWidth;
    const boxBottom = boxY + smallBox.offsetHeight;

    for (let i = 0; i < particles.length; i++) {

        for (let j = i + 1; j < particles.length; j++) {

            const p1 = particles[i];
            const p2 = particles[j];

            // Current particle sizes
            const r1 = p1.element.offsetWidth / 2;
            const r2 = p2.element.offsetWidth / 2;

            // Particle centers
            const p1CenterX = p1.x + r1;
            const p1CenterY = p1.y + r1;

            const p2CenterX = p2.x + r2;
            const p2CenterY = p2.y + r2;

            // Distance between centers
            const dx = p2CenterX - p1CenterX;
            const dy = p2CenterY - p1CenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            // Particles touch when the distance between
            // their centers equals the sum of their radii
            const minimumDistance = r1 + r2;

            if (distance < minimumDistance && distance > 0) {

                const nx = dx / distance;
                const ny = dy / distance;

                // Are the particles moving toward each other?
                const relativeVelocity =
                    (p2.velocityX - p1.velocityX) * nx +
                    (p2.velocityY - p1.velocityY) * ny;

                // They are already moving apart
                if (relativeVelocity > 0) {
                    continue;
                }

                const tx = -ny;
                const ty = nx;

                const v1n =
                    p1.velocityX * nx +
                    p1.velocityY * ny;

                const v1t =
                    p1.velocityX * tx +
                    p1.velocityY * ty;

                const v2n =
                    p2.velocityX * nx +
                    p2.velocityY * ny;

                const v2t =
                    p2.velocityX * tx +
                    p2.velocityY * ty;

                // Elastic collision: exchange normal components
                p1.velocityX = v2n * nx + v1t * tx;
                p1.velocityY = v2n * ny + v1t * ty;

                p2.velocityX = v1n * nx + v2t * tx;
                p2.velocityY = v1n * ny + v2t * ty;

                // Separate the particles
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

    if (boxX <= 0 || boxX >= maxBoxX) {
        boxVelocityX *= -1;
    }

    if (boxY <= 0 || boxY >= maxBoxY) {
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


    handleParticleCollisions();


    requestAnimationFrame(animate);
}


animate();