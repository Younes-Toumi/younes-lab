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

const numberOfParticles = 10;

const particleSize = 8;

const particles = [];


// Create particles
for (let i = 0; i < numberOfParticles; i++) {

    const element = document.createElement("div");

    element.classList.add("particle");

    particlesContainer.appendChild(element);


    const particle = {

        element: element,

        x: Math.random() * (largeBox.clientWidth - particleSize),

        y: Math.random() * (largeBox.clientHeight - particleSize),

        velocityX: (Math.random() - 0.5) * 4,

        velocityY: (Math.random() - 0.5) * 4
    };

    particles.push(particle);
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


        // Left / right walls

        if (
            particle.x <= 0 ||
            particle.x >= largeBox.clientWidth - particleSize
        ) {
            particle.velocityX *= -1;
        }


        // Top / bottom walls

        if (
            particle.y <= 0 ||
            particle.y >= largeBox.clientHeight - particleSize
        ) {
            particle.velocityY *= -1;
        }


        // Update visual position

        particle.element.style.transform =
            `translate(${particle.x}px, ${particle.y}px)`;
    }


    requestAnimationFrame(animate);
}


animate();