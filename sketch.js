//*---
const NUM_PAPERS = 3;
const ITER_PER_FRAME = 20; // ES steps per frame

let fitness;
let es;
let myFont;

async function setup() {
    createCanvas(800, 800);
    myFont = await loadFont("Inter-Black.otf");
    textFont(myFont)

    // target: centered 200x200 rect
    fitness = new RectFitness({
        target: { x: width / 2 - 100, y: height / 2 - 100, w: 200, h: 200 },
        scale: 0.125,
        outsideWeight: 1
    });

    let papers = [];
    for (let i = 0; i < NUM_PAPERS; i++) {
        let p = new Paper({
            x: random(width),
            y: random(height / 3, height / 3 * 2),
            w: random(150, 350),
            h: random(150, 350)
        });
        p.rebuild();
        papers.push(p);
    }

    es = new ES({
        papers,
        fitness: ps => fitness.evaluate(ps),
        lambda: 1
    });
}

function draw() {
    for (let i = 0; i < ITER_PER_FRAME; i++) es.step();

    blendMode(BLEND);
    background(0);
    blendMode(SCREEN);
    noStroke();
    es.papers.forEach(p => p.draw());

    blendMode(BLEND);
    fitness.drawTarget();

    fill(255);
    noStroke();
    textSize(14);
    text(
        "gen " + es.generation +
        "   score " + nf(es.score, 1, 3) +
        "   sigma " + nf(es.sigma, 1, 1) +
        "   last " + es.lastAction +
        (es.done ? "   DONE" : ""),
        10, 20
    );
}
//*---

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


class PaperPiece {
    constructor(args) {
        this.vertices = args.vertices;
        this.clr = args.clr || 100;
        this.parent = args.parent;
        this.childs = [];
        this.status = true;
    }

    //*---
    draw(g = window) {
            g.fill(this.clr);
            g.beginShape();
            this.vertices.forEach(v => {
                g.vertex(v.x, v.y);
            })
            g.endShape(CLOSE);
        }
        //*---
}