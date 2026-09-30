let paper;


async function setup() {
    createCanvas(800, 800);
    background(0);

    paper = new Paper({
        x: 100,
        y: 100,
        w: 600,
        h: 600
    })
    paper.setup();
    // paper.foldPaper();


    for (let i = 0; i < 10; i++) {

        paper.foldPaper();

        blendMode(BLEND);
        background(0);
        blendMode(SCREEN);
        paper.draw();

        await sleep(500);
        // save('myCanvas.jpg');
    }
    // paper.draw();

    noStroke();



}

function draw() {}

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

    draw() {
        fill(this.clr);
        beginShape();
        this.vertices.forEach(v => {
            vertex(v.x, v.y);
        })
        endShape(CLOSE);
    }
}