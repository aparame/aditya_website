/**
 * Particle Background with Floating Robot "Sketch" Overlays
 */
const canvas = document.createElement('canvas');
canvas.id = 'canvas-bg';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');

let particles = [];
let robotParticles = [];
const particleCount = 80; // Reduced slightly for clutter
const robotCount = 25;     // Number of floating robots
const connectionDistance = 150;
const mouseRange = 200;

// Load Robot Image
const robotImg = new Image();
// Use the SVG we just created for now.
robotImg.src = 'images/robot_bg.png';

let mouse = {
    x: null,
    y: null
};

robotImg.onerror = () => {
    console.warn("Robot image failed to load.");
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', () => {
    initCanvas();
});

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    // Check if we are in light mode or dark mode (based on body bg)
    // For now, assuming light mode since user reverted everything
    // We'll use blue/gray particles for light mode

    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    robotParticles = [];
    for (let i = 0; i < robotCount; i++) {
        robotParticles.push(new RobotParticle());
    }
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        // Light mode colors: Blue/Gray
        ctx.fillStyle = 'rgba(23, 114, 208, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class RobotParticle {
    constructor() {
        this.reset();
        // Give them random initial positions
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2; // Slower than particles
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = 40 + Math.random() * 40; // Size between 40 and 80
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.opacity = 0.05 + Math.random() * 0.1; // Very faint (5% to 15%)
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        if (this.x < -100 || this.x > canvas.width + 100) this.vx *= -1;
        if (this.y < -100 || this.y > canvas.height + 100) this.vy *= -1;
    }

    draw() {
        if (!robotImg.complete) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw Faint "Sketch" style
        // We use low global alpha and maybe a composite operation
        ctx.globalAlpha = this.opacity;

        // Improve "sketch" look by using a filter if supported (most modern browsers)
        // High contrast + grayscale helps simulate a drawing from a colored icon
        ctx.filter = 'grayscale(100%) contrast(1.2)';

        ctx.drawImage(robotImg, -this.size / 2, -this.size / 2, this.size, this.size);

        ctx.restore();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw connections first (behind everything)
    ctx.strokeStyle = `rgba(23, 114, 208, 0.15)`; // Light blue
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                // Fading line based on distance
                ctx.beginPath();
                ctx.strokeStyle = `rgba(23, 114, 208, ${0.2 * (1 - dist / connectionDistance)})`;
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }

    // Draw Robots (Background elements)
    for (let i = 0; i < robotParticles.length; i++) {
        robotParticles[i].update();
        robotParticles[i].draw();
    }

    requestAnimationFrame(animate);
}

initCanvas();
animate();
