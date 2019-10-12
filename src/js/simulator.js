const distanceScale = 100_000;
const massScale = 1_000_000_000_000_000_000;
const canvas = document.getElementById("canvas");
const canvas_container = document.getElementById("canvas-container");
const ctx = canvas.getContext("2d");
let pts = [];
let bodies = [];

function onAnimationFrame() {
    syncCanvasSize();
    update();
    render();

    requestAnimationFrame(onAnimationFrame);
}

function update() {
    bodies.forEach(b => updateBody(b));
}

function syncCanvasSize() {
    canvas.width = canvas_container.clientWidth;
    canvas.height = canvas_container.clientWidth;

}

function render() {
    drawPoints();
    bodies.forEach(b => renderBody(b));
}

function drawPoints() {
    pts.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
    });
}

setInterval(function () {
    bodies.forEach(b => {
        pts.push({
            "x": b.x / distanceScale,
            "y": b.y / distanceScale,
            "color": b.color,
        });
    });

}, 1000);

//
// Physics Code
//

createBody("Earth", 10_000_000, 10, 90, 400, "green", 0, 3.2);
createBody("Moon", 100_000, 2, 100, 400, "white", 0.0, .8 + 3.2);
createBody("Sun", 5_000_000_000, 25, 400, 400, "yellow", 0, 0);

function createBody(name, mass, radius, x, y, color, xVel, yVel) {
    if (!name || !mass || !radius || !x || !y || !color)
        throw new Error("Unallowed null/undefined component");

    let body = {
        "name": name,
        "radius": radius,
        "x": x * distanceScale,
        "y": y * distanceScale,
        "mass": mass * massScale,
        "color": color,
        "xVel": xVel ? (xVel * distanceScale) : 0.0,
        "yVel": yVel ? (yVel * distanceScale) : 0.0,
    }

    bodies.push(body);

    return body;
}

function applyGravity(body1, body2) {
    const G = 6.675e-10;
    let xDiff = Math.abs(body1.x - body2.x);
    let yDiff = Math.abs(body1.y - body2.y);

    let r = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

    let F = G * ((body1.mass * body2.mass) / Math.pow(r, 2));

    let angle = Math.atan2(yDiff, xDiff);
    let fVector = createVectorMagAngle(angle, F);
    fVector.divide(new Vector(body1.mass, body1.mass));

    body1.xVel += fVector.x * (body1.x > body2.x ? -1 : 1);
    body1.yVel += fVector.y * (body1.y > body2.y ? -1 : 1);
}

function updateBody(body) {
    if (!body) {
        console.log(body);
        return;
    }

    body.x += body.xVel;
    body.y += body.yVel;

    bodies.forEach(otherBody => {
        if (body != otherBody) {
            applyGravity(body, otherBody);
        }
    });
}

function renderBody(body) {
    ctx.fillStyle = body.color;
    ctx.beginPath();
    ctx.ellipse(body.x / distanceScale, body.y / distanceScale, body.radius, body.radius, 0, 0, 2 * Math.PI);
    ctx.fill();
}

//
// Vector Code
//

class Vector {
    constructor(x, y) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    divide(vector) {
        this.x /= vector.x;
        this.y /= vector.y;
    }

    getMagnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    print() {
        console.log("(" + this.x + ", " + this.y + ")")
    }
}

function createVectorMagAngle(angle, mag) {
    return new Vector(Math.cos(angle) * mag, Math.sin(angle) * mag);
}

requestAnimationFrame(onAnimationFrame);