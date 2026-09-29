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

}