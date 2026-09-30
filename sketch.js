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


    for (let i = 0; i < 2; i++) {

        paper.foldPaper();

        blendMode(BLEND);
        background(0);
        blendMode(SCREEN);
        paper.draw();

        await sleep(500);
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


    foldPaper() {

        this.temp = [];


        let piece = random(this.paperPieces.filter(p => p.status == true));


        let validLine = false;
        // // random fold line for testing
        while (!validLine) {
            this.foldingStartPt = createVector(
                random(this.x, this.x + this.w),
                this.y
            );

            this.foldingEndPt = createVector(
                random(this.x, this.x + this.w),
                this.y + this.h
            );

            if (this.checkIntersection(this.foldingStartPt, this.foldingEndPt, piece.vertices)) { validLine = true }
        }



        let foldMode = random(["RIGHT", "LEFT"])
            // console.log(intersectionPts);
            // let result = this.splitPiece(
            //     piece,
            //     this.foldingStartPt,
            //     this.foldingEndPt,
            //     foldMode
            // );

        // // console.log(result.left);
        // // console.log(result.right);

        // let idx = this.paperPieces.indexOf(piece);
        // this.paperPieces[idx].status = false;

        // let childLeft = new PaperPiece({
        //     parent: idx,
        //     vertices: result.left,
        // })

        // this.paperPieces.push(childLeft);
        // let leftIdx = this.paperPieces.length - 1;
        // this.paperPieces[idx].childs.push(leftIdx);


        // let childRight = new PaperPiece({
        //     parent: idx,
        //     vertices: result.right,
        // })

        // this.paperPieces.push(childRight);

        // let rightIdx = this.paperPieces.length - 1;
        // this.paperPieces[idx].childs.push(rightIdx);


        let idx = this.paperPieces.indexOf(piece);

        // get selected piece + siblings + childs
        let foldGroup = this.getFoldGroup(idx);

        // only keep active pieces
        foldGroup = foldGroup.filter(i => this.paperPieces[i].status == true);

        // console.log("foldGroup:", foldGroup);


        foldGroup.forEach(i => {

            let targetPiece = this.paperPieces[i];

            // only split pieces that the fold line crosses
            if (this.checkIntersection(
                    this.foldingStartPt,
                    this.foldingEndPt,
                    targetPiece.vertices
                )) {

                let result = this.splitPiece(
                    targetPiece,
                    this.foldingStartPt,
                    this.foldingEndPt,
                    foldMode
                );


                // parent becomes inactive
                targetPiece.status = false;


                // left child
                let childLeft = new PaperPiece({
                    parent: i,
                    vertices: result.left,
                });

                this.paperPieces.push(childLeft);

                let leftIdx = this.paperPieces.length - 1;
                targetPiece.childs.push(leftIdx);


                // right child
                let childRight = new PaperPiece({
                    parent: i,
                    vertices: result.right,
                });

                this.paperPieces.push(childRight);

                let rightIdx = this.paperPieces.length - 1;
                targetPiece.childs.push(rightIdx);
            }
            //*---
            // piece not crossed but entirely on the folding side -> reflect whole piece
            else {
                let onFoldSide = this.isLeft(
                    this.foldingStartPt,
                    this.foldingEndPt,
                    targetPiece.vertices[0]
                ) == (foldMode == "LEFT");

                if (onFoldSide) {
                    targetPiece.vertices = targetPiece.vertices.map(v =>
                        this.reflectByTwoPoints(
                            this.foldingStartPt,
                            this.foldingEndPt,
                            v.copy()
                        )
                    );
                }
            }
            //*---
        });


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

    // addLine(a, b) {
    //     let pts = [];
    //     let move = createVector(a.x - b.x, a.y - b.y);
    //     let d = move.mag();

    //     move.normalize();
    //     move.mult(this.resolution);
    //     let count = int(d / this.resolution);
    //     for (let i = 0; i < count + 1; i++) {
    //         let px = a.x - move.x * i;
    //         let py = a.y - move.y * i;
    //         pts.push(createVector(px, py));
    //     }
    //     return pts;
    // }

    // getCrease(originalPts, newPts) {
    //     let d1 = dist(originalPts[0].x, originalPts[0].y, newPts[0].x, newPts[0].y)
    //     let d2 = dist(originalPts[originalPts.length - 1].x, originalPts[originalPts.length - 1].y, newPts[0].x, newPts[0].y)

    //     if (d1 < d2) {
    //         newPts.reverse();
    //     }
    //     return newPts;
    // }

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

        // let u = -((a.x - b.x) * (a.y - c.y) -
        //         (a.y - b.y) * (a.x - c.x)) /
        //     denominator;


        //*---
        // treat fold line (c-d) as infinite line, only require hit on piece edge (a-b)
        if (t >= 0 && t <= 1) {
            //*---

            let px = a.x + t * (b.x - a.x);
            let py = a.y + t * (b.y - a.y);

            return createVector(px, py);
        }

        return null;
    }

    splitPiece(piece, a, b, foldMode) {

        let ptsLeft = [];
        let ptsRight = [];

        for (let i = 0; i < piece.vertices.length; i++) {

            let current = piece.vertices[i];
            let next = piece.vertices[(i + 1) % piece.vertices.length];

            let currentLeft = this.isLeft(a, b, current);
            let nextLeft = this.isLeft(a, b, next);


            // add current point
            if (foldMode == "LEFT") {
                if (currentLeft) {
                    let reflected = this.reflectByTwoPoints(
                        this.foldingStartPt,
                        this.foldingEndPt,
                        current.copy()
                    );
                    ptsLeft.push(reflected);
                } else {
                    ptsRight.push(current.copy());
                }
            } else {
                if (!currentLeft) {
                    let reflected = this.reflectByTwoPoints(
                        this.foldingStartPt,
                        this.foldingEndPt,
                        current.copy()
                    );
                    ptsRight.push(reflected);
                } else {
                    ptsLeft.push(current.copy());
                }
            }


            // edge crosses fold line
            if (currentLeft !== nextLeft) {

                let intersection = this.getIntersection(
                    current,
                    next,
                    a,
                    b
                );

                if (intersection) {
                    ptsLeft.push(intersection.copy());
                    ptsRight.push(intersection.copy());
                }
            }
        }

        return {
            left: ptsLeft,
            right: ptsRight
        };
    }

    checkIntersection(a, b, pts) {
        // let ifIntersect = false;
        let ifIntersect = []
        pts.forEach(p => {
                ifIntersect.push(this.isLeft(a, b, p));
            })
            // console.log(ifIntersect)
        let allRight = ifIntersect.every(val => val == false);
        let allLeft = ifIntersect.every(val => val == true)
        if (allRight || allLeft) return false;
        return true;

    }

    getChilds(idx) {
        let result = [];
        let piece = this.paperPieces[idx];

        piece.childs.forEach(childIndex => {
            result.push(childIndex);
            let sub = this.getChilds(childIndex);
            result.push(...sub);
        });

        return result;
    }

    getSiblings(idx) {
        let piece = this.paperPieces[idx];
        if (piece.parent == undefined) {
            return [idx];
        }
        return this.paperPieces[piece.parent].childs;
    }

    getFoldGroup(idx) {
        let group = [];
        let siblings = this.getSiblings(idx);

        siblings.forEach(siblingIndex => {
            group.push(siblingIndex);
            let descendants = this.getChilds(siblingIndex);
            group.push(...descendants);
        });

        return [...new Set(group)];
    }
}