let paper;


function setup() {
    createCanvas(800, 800);
    background(0);
    blendMode(SCREEN);

    paper = new Paper({
        x: 100,
        y: 100,
        w: 600,
        h: 600
    })
    paper.setup();
    paper.foldPaper();
    paper.draw();

    noStroke();


}

function draw() {}

class PaperPiece {
    constructor(args) {
        this.vertices = args.vertices;
        this.clr = args.clr || 100;
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


class Paper {
    constructor(args) {
        this.x = args.x;
        this.y = args.y;
        this.w = args.w;
        this.h = args.h;
        this.paperPieces = [];
        this.resolution = 5;

        // folding
        this.foldingStartPt;
        this.foldingEndPt;
    }

    setup() {
        let pts = [];
        let row = int(this.w / this.resolution);
        let col = int(this.h / this.resolution);


        for (let i = 0; i < row + 1; i++) {
            let px = this.x + i * this.resolution;
            let py = this.y;
            pts.push(createVector(px, py));
        }

        for (let i = 0; i < col - 1; i++) {
            let px = this.w + this.x;
            let py = this.y + (i + 1) * this.resolution;
            pts.push(createVector(px, py));
        }
        for (let i = 0; i < row + 1; i++) {
            let px = this.x + this.w - i * this.resolution;
            let py = this.h + this.y;
            pts.push(createVector(px, py));
        }
        for (let i = 0; i < col - 1; i++) {
            let px = this.x;
            let py = this.y + this.h - (i + 1) * this.resolution;
            pts.push(createVector(px, py))
        }

        let piece = new PaperPiece({
            vertices: pts
        })

        this.paperPieces.push(piece);





    }

    draw() {
        // this.pts.forEach(p => {
        //     push();
        //     translate(p.x, p.y);
        //     fill(255);
        //     noStroke();
        //     circle(0, 0, 2);
        //     pop();
        // })

        this.paperPieces.forEach(piece => {
            piece.draw();
        })
    }


    foldPaper() {

        this.temp = [];

        let piece = random(this.paperPieces);
        let index1 = Math.floor(Math.random() * piece.vertices.length);
        let index2;

        do {
            index2 = Math.floor(Math.random() * piece.vertices.length);
        } while (index1 === index2);

        this.foldingStartPt = piece.vertices[index1];
        this.foldingEndPt = piece.vertices[index2];

        // console.log(this.foldingStartPt, this.foldingEndPt)

        piece.vertices.forEach(v => {
            push();

            fill(255);
            if (this.isLeft(this.foldingStartPt, this.foldingEndPt, v)) {
                fill(255, 0, 0);
                let relected = this.reflectByTwoPoints(this.foldingStartPt, this.foldingEndPt, v);
                circle(relected.x, relected.y, 3);
            }
            circle(v.x, v.y, 3);
            pop();
        })


    }

    isLeft(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
    }

    reflectByTwoPoints(p1, p2, input) {
        let a = (p2.y - p1.y) / (p2.x - p1.x);
        let b = p1.y - a * p1.x;
        let px = input.x * (1 - pow(a, 2)) / (1 + pow(a, 2)) + (input.y - b) * (2 * a) / (pow(a, 2) + 1);
        let py = input.x * (2 * a) / (pow(a, 2) + 1) + (input.y - b) * (pow(a, 2) - 1) / (pow(a, 2) + 1) + b;
        return createVector(px, py);
    }
}