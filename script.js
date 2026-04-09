const scrollModels = Array.from(document.querySelectorAll("[data-scroll-model]"));
const treeDock = document.querySelector(".tree-dock");
const treeViewer = document.querySelector("#psx-tree");

let scrollProgress = 0;
let lastScrollY = window.scrollY;
let treeAngle = 0;
let treeVelocity = 0;
let ticking = false;

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function parseDegrees(value) {
    return Number.parseFloat(value.replace("deg", ""));
}

function parseMeters(value) {
    return Number.parseFloat(value.replace("m", ""));
}

function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = scrollable > 0 ? window.scrollY / scrollable : 0;

    scrollModels.forEach((node, index) => {
        const viewer = node.querySelector("model-viewer");
        const yawStart = parseDegrees(node.dataset.orbitStart.split(" ")[0]);
        const pitchStart = parseDegrees(node.dataset.orbitStart.split(" ")[1]);
        const distanceStart = parseMeters(node.dataset.orbitStart.split(" ")[2]);
        const yawEnd = parseDegrees(node.dataset.orbitEnd.split(" ")[0]);
        const pitchEnd = parseDegrees(node.dataset.orbitEnd.split(" ")[1]);
        const distanceEnd = parseMeters(node.dataset.orbitEnd.split(" ")[2]);
        const fovStart = parseDegrees(node.dataset.fovStart);
        const fovEnd = parseDegrees(node.dataset.fovEnd);
        const phase = Math.min(1, Math.max(0, scrollProgress * 1.18 + index * 0.08));

        const yaw = lerp(yawStart, yawEnd, phase);
        const pitch = lerp(pitchStart, pitchEnd, phase);
        const distance = lerp(distanceStart, distanceEnd, phase);
        const fov = lerp(fovStart, fovEnd, phase);

        viewer.cameraOrbit = `${yaw.toFixed(2)}deg ${pitch.toFixed(2)}deg ${distance.toFixed(2)}m`;
        viewer.fieldOfView = `${fov.toFixed(2)}deg`;

        const driftY = Math.sin(scrollProgress * Math.PI * 2 + index) * 34;
        const driftX = Math.cos(scrollProgress * Math.PI * 1.6 + index * 0.7) * 24;
        const rotate = lerp(-18, 22, phase) + index * 3;
        const scale = 1 + Math.sin(scrollProgress * Math.PI + index) * 0.08;

        node.style.transform = [
            `translate(${driftX.toFixed(1)}px, ${driftY.toFixed(1)}px)`,
            node.classList.contains("node-kowloon") ? "rotate(-12deg) skewY(8deg)" : "",
            node.classList.contains("node-cranes") ? "rotate(17deg) skewX(-10deg) translateZ(120px)" : "",
            node.classList.contains("node-bread") ? "rotate(-28deg) skewX(14deg)" : "",
            node.classList.contains("node-autumn") ? "rotate(9deg) skewY(-14deg)" : "",
            `rotateZ(${rotate.toFixed(2)}deg)`,
            `scale(${scale.toFixed(3)})`
        ].join(" ");
    });
}

function onScroll() {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    treeVelocity += delta * 0.045;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateScrollState();
            ticking = false;
        });
        ticking = true;
    }
}

function animateTree() {
    treeVelocity *= 0.92;
    treeAngle += 0.22 + treeVelocity;

    if (treeDock && treeViewer) {
        const orbitYaw = 24 + scrollProgress * 240 + treeVelocity * 2.5;
        const orbitPitch = 78 - scrollProgress * 18;
        const orbitDistance = 100 - scrollProgress * 0.6;

        treeViewer.orientation = `0deg ${treeAngle.toFixed(2)}deg 0deg`;
        treeViewer.cameraOrbit =
            `${orbitYaw.toFixed(2)}deg ${orbitPitch.toFixed(2)}deg ${orbitDistance.toFixed(2)}m`;

        const sway = Math.sin(treeAngle * 0.02) * 10;
        const lift = Math.cos(treeAngle * 0.015) * 8;
        treeDock.style.transform =
            `translate3d(${sway.toFixed(2)}px, ${lift.toFixed(2)}px, 0) rotate(-7deg) scale(${(1 + scrollProgress * 0.06).toFixed(3)})`;
    }

    window.requestAnimationFrame(animateTree);
}

updateScrollState();
animateTree();

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateScrollState);
