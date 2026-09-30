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

        pts.push(createVector(this.x, this.y));
        pts.push(createVector(this.x + this.w, this.y));
        pts.push(createVector(this.x + this.w, this.y + this.h));
        pts.push(createVector(this.x, this.y + this.h));

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

        this.paperPieces.filter(piece => piece.status == true).forEach(piece => {
            piece.draw();
        })
    }


    // foldPaper() {

    //     this.temp = [];

    //     let piece = random(this.paperPieces);
    //     let index1 = Math.floor(Math.random() * piece.vertices.length);
    //     let index2;

    //     do {
    //         index2 = Math.floor(Math.random() * piece.vertices.length);
    //     } while (index1 === index2);

    //     this.foldingStartPt = piece.vertices[index1];
    //     this.foldingEndPt = piece.vertices[index2];

    //     // console.log(this.foldingStartPt, this.foldingEndPt)

    //     let ptsRight = [];
    //     let ptsLeft = [];
    //     piece.vertices.forEach(v => {
    //         push();

    //         fill(255);
    //         if (this.isLeft(this.foldingStartPt, this.foldingEndPt, v)) {
    //             fill(255, 0, 0);
    //             let relected = this.reflectByTwoPoints(this.foldingStartPt, this.foldingEndPt, v);
    //             ptsLeft.push(relected);
    //             circle(relected.x, relected.y, 3);
    //         } else {
    //             ptsRight.push(v);
    //         }
    //         circle(v.x, v.y, 3);
    //         pop();
    //     })

    //     let newPts = this.addLine(this.foldingStartPt, this.foldingEndPt);
    //     // console.log(newPts);
    //     newPts.forEach(n => {
    //         push();
    //         fill(255, 255, 0);
    //         circle(n.x, n.y, 3);
    //         pop();
    //     })

    //     // console.log(this.paperPieces.indexOf(piece));
    //     let idx = this.paperPieces.indexOf(piece);
    //     this.paperPieces[idx].status = false;

    //     let childLeft = new PaperPiece({
    //         parent: idx,
    //         vertices: ptsLeft.concat(this.getCrease(ptsLeft, newPts)),
    //     })

    //     this.paperPieces.push(childLeft);


    // }

    foldPaper() {

        this.temp = [];

        let piece = random(this.paperPieces);

        // random fold line for testing
        this.foldingStartPt = createVector(
            random(this.x, this.x + this.w),
            this.y
        );

        this.foldingEndPt = createVector(
            random(this.x, this.x + this.w),
            this.y + this.h
        );


        let ptsRight = [];
        let ptsLeft = [];
        let intersectionPts = [];


        // find intersections
        for (let i = 0; i < piece.vertices.length; i++) {

            let current = piece.vertices[i];
            let next = piece.vertices[(i + 1) % piece.vertices.length];

            let intersection = this.getIntersection(
                current,
                next,
                this.foldingStartPt,
                this.foldingEndPt
            );

            if (intersection) {
                intersectionPts.push(intersection);
            }
        }


        // separate points
        piece.vertices.forEach(v => {

            push();

            fill(255);

            if (this.isLeft(
                    this.foldingStartPt,
                    this.foldingEndPt,
                    v
                )) {

                fill(255, 0, 0);

                let reflected = this.reflectByTwoPoints(
                    this.foldingStartPt,
                    this.foldingEndPt,
                    v
                );

                ptsLeft.push(reflected);

                circle(reflected.x, reflected.y, 5);

            } else {

                ptsRight.push(v);
            }

            circle(v.x, v.y, 5);

            pop();
        })


        // draw intersection points
        intersectionPts.forEach(n => {

            push();

            fill(255, 255, 0);
            circle(n.x, n.y, 8);

            pop();
        })


        console.log(intersectionPts);
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

    addLine(a, b) {
        let pts = [];
        let move = createVector(a.x - b.x, a.y - b.y);
        let d = move.mag();

        move.normalize();
        move.mult(this.resolution);
        let count = int(d / this.resolution);
        for (let i = 0; i < count + 1; i++) {
            let px = a.x - move.x * i;
            let py = a.y - move.y * i;
            pts.push(createVector(px, py));
        }
        return pts;
    }

    getCrease(originalPts, newPts) {
        let d1 = dist(originalPts[0].x, originalPts[0].y, newPts[0].x, newPts[0].y)
        let d2 = dist(originalPts[originalPts.length - 1].x, originalPts[originalPts.length - 1].y, newPts[0].x, newPts[0].y)

        if (d1 < d2) {
            newPts.reverse();
        }
        return newPts;
    }

    getIntersection(a, b, c, d) {

        let denominator =
            (a.x - b.x) * (c.y - d.y) -
            (a.y - b.y) * (c.x - d.x);

        if (denominator == 0) {
            return null;
        }

        let t =
            ((a.x - c.x) * (c.y - d.y) -
                (a.y - c.y) * (c.x - d.x)) /
            denominator;

        let u = -((a.x - b.x) * (a.y - c.y) -
                (a.y - b.y) * (a.x - c.x)) /
            denominator;


        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {

            let px = a.x + t * (b.x - a.x);
            let py = a.y + t * (b.y - a.y);

            return createVector(px, py);
        }

        return null;
    }
}