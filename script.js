const scrollModel = document.querySelector("[data-scroll-model]");
const masthead = document.querySelector(".masthead");
const scene = document.querySelector(".scene");
const continueButton = document.querySelector(".continue-button");
const cursorDot = document.querySelector(".cursor-dot");


let redirectTime = "1000";
let redirectURL = "/portfolio/";
let timeoutHandle;

function timedRedirect() {
    timeoutHandle = window.setTimeout("location.href = redirectURL;",redirectTime);
} 
function stopTimer() {
    clearTimeout(timeoutHandle);
} 



function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function parseDegrees(value) {
    return Number.parseFloat(value.replace("deg", ""));
}

function parseMeters(value) {
    return Number.parseFloat(value.replace("m", ""));
}

function mapCameraProgress(rawProgress) {
    if (rawProgress <= 0.58) {
        return (rawProgress / 0.58) * 0.38;
    }

    if (rawProgress <= 0.92) {
        return 0.38 + ((rawProgress - 0.58) / 0.34) * 0.42;
    }

    return 0.8 + ((rawProgress - 0.92) / 0.08) * 0.2;
}

function updateScrollState() {
    if (!scrollModel) {
        return;
    }

    const viewer = scrollModel.querySelector("model-viewer");
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const progress = Math.min(1, Math.max(0, mapCameraProgress(rawProgress)));

    const [yawStart, pitchStart, distanceStart] = scrollModel.dataset.orbitStart.split(" ");
    const [yawMid, pitchMid, distanceMid] = scrollModel.dataset.orbitMid.split(" ");
    const [yawEnd, pitchEnd, distanceEnd] = scrollModel.dataset.orbitEnd.split(" ");

    let yaw;
    let pitch;
    let distance;

    if (progress <= 0.8) {
        const phase = progress / 0.8;
        yaw = lerp(parseDegrees(yawStart), parseDegrees(yawMid), phase);
        pitch = lerp(parseDegrees(pitchStart), parseDegrees(pitchMid), phase);
        distance = lerp(parseMeters(distanceStart), parseMeters(distanceMid), phase);
    } else {
        const phase = (progress - 0.8) / 0.2;
        yaw = lerp(parseDegrees(yawMid), parseDegrees(yawEnd), phase);
        pitch = lerp(parseDegrees(pitchMid), parseDegrees(pitchEnd), phase);
        distance = lerp(parseMeters(distanceMid), parseMeters(distanceEnd), phase);
    }

    const fov = lerp(
        parseDegrees(scrollModel.dataset.fovStart),
        parseDegrees(scrollModel.dataset.fovEnd),
        progress
    );

    viewer.setAttribute(
        "camera-orbit",
        `${yaw.toFixed(2)}deg ${pitch.toFixed(2)}deg ${distance.toFixed(2)}m`
    );
    viewer.setAttribute("field-of-view", `${fov.toFixed(2)}deg`);

    const transition = Math.min(1, Math.max(0, rawProgress / 0.22));

    if (masthead) {
        masthead.style.opacity = (1 - transition).toFixed(3);
        masthead.style.transform = `translateY(${(transition * -2).toFixed(2)}rem)`;
    }

    if (scene) {
        scene.style.opacity = transition.toFixed(3);
    }

    if (continueButton) {
        const buttonFade = Math.min(1, Math.max(0, (rawProgress - 0.9) / 0.08));
        continueButton.style.opacity = buttonFade.toFixed(3);
        continueButton.style.pointerEvents = buttonFade > 0.98 ? "auto" : "none";
    }
}

function onScroll() {
    updateScrollState();
}

updateScrollState();

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateScrollState);

if (continueButton) {
    continueButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        timedRedirect();
    });
}

if (cursorDot) {
    window.addEventListener("mousemove", (event) => {
        cursorDot.style.transform =
            `translate(${event.clientX.toFixed(0)}px, ${event.clientY.toFixed(0)}px)`;
    });
}
