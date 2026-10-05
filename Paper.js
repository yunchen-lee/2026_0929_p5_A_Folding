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


        // ES algorithm
        this.folds = [];
        this.angle = 0;
        this.offset = createVector(0, 0);
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

    //*---
    // g: draw target (main canvas by default, or an offscreen p5.Graphics for fitness)
    draw(g = window) {
        g.push();
        g.translate(this.x + this.w / 2 + this.offset.x, this.y + this.h / 2 + this.offset.y);
        g.rotate(this.angle);
        g.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
        this.paperPieces.filter(piece => piece.status == true).forEach(piece => {
            piece.draw(g);
        })
        g.pop();
    }

    // copy genes (x, y, w, h, folds, angle, offset) and rebuild the shape
    clone() {
        let p = new Paper({
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        });
        p.folds = this.folds.map(f => ({ a: f.a.copy(), b: f.b.copy(), mode: f.mode }));
        p.angle = this.angle;
        p.offset = this.offset.copy();
        p.rebuild();
        return p;
    }

    // random fold line (in local coords) that crosses at least one active piece
    randomFoldLine(tries = 20) {
        let active = this.paperPieces.filter(p => p.status == true);
        let pts = active.flatMap(p => p.vertices);
        let minX = Math.min(...pts.map(v => v.x));
        let maxX = Math.max(...pts.map(v => v.x));
        let minY = Math.min(...pts.map(v => v.y));
        let maxY = Math.max(...pts.map(v => v.y));

        for (let t = 0; t < tries; t++) {
            let a = createVector(random(minX, maxX), random(minY, maxY));
            let ang = random(TWO_PI);
            let b = createVector(a.x + cos(ang) * 100, a.y + sin(ang) * 100);

            if (active.some(p => checkIntersection(a, b, p.vertices))) {
                return { a, b, mode: random(["LEFT", "RIGHT"]) };
            }
        }
        return null;
    }
    //*---

    rebuild() {
        this.paperPieces = [];
        this.setup();
        this.folds.forEach(f => {
            this.foldPaper(f.a, f.b, f.mode);
        })
    }

    addFold(a, b, mode) {
        this.folds.push({ a, b, mode });
        this.rebuild();

    }

    unfoldLast() {
        this.folds.pop();
        this.rebuild();
    }

    foldPaper(startPt, endPt, foldMode) {

        this.foldingStartPt = startPt;
        this.foldingEndPt = endPt;


        // let piece = random(this.paperPieces.filter(p => p.status == true));


        // let validLine = false;
        // // // random fold line for testing
        // while (!validLine) {
        //     this.foldingStartPt = createVector(
        //         random(this.x, this.x + this.w),
        //         this.y
        //     );

        //     this.foldingEndPt = createVector(
        //         random(this.x, this.x + this.w),
        //         this.y + this.h
        //     );

        //     if (checkIntersection(this.foldingStartPt, this.foldingEndPt, piece.vertices)) { validLine = true }
        // }



        // let foldMode = random(["RIGHT", "LEFT"])

        // a real fold goes through every layer, so fold all active pieces
        // (siblings + childs only covers everything up to the 2nd fold)
        let foldGroup = this.paperPieces
            .map((_, i) => i)
            .filter(i => this.paperPieces[i].status == true);

        // console.log("foldGroup:", foldGroup);


        foldGroup.forEach(i => {

            let targetPiece = this.paperPieces[i];

            // only split pieces that the fold line crosses
            if (checkIntersection(
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
                let onFoldSide = isLeft(
                    this.foldingStartPt,
                    this.foldingEndPt,
                    targetPiece.vertices[0]
                ) == (foldMode == "LEFT");

                if (onFoldSide) {
                    targetPiece.vertices = targetPiece.vertices.map(v =>
                        reflectByTwoPoints(
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



    splitPiece(piece, a, b, foldMode) {

        let ptsLeft = [];
        let ptsRight = [];

        for (let i = 0; i < piece.vertices.length; i++) {

            let current = piece.vertices[i];
            let next = piece.vertices[(i + 1) % piece.vertices.length];

            let currentLeft = isLeft(a, b, current);
            let nextLeft = isLeft(a, b, next);


            // add current point
            if (foldMode == "LEFT") {
                if (currentLeft) {
                    let reflected = reflectByTwoPoints(
                        a,
                        b,
                        current.copy()
                    );
                    ptsLeft.push(reflected);
                } else {
                    ptsRight.push(current.copy());
                }
            } else {
                if (!currentLeft) {
                    let reflected = reflectByTwoPoints(
                        a,
                        b,
                        current.copy()
                    );
                    ptsRight.push(reflected);
                } else {
                    ptsLeft.push(current.copy());
                }
            }


            // edge crosses fold line
            if (currentLeft !== nextLeft) {

                let intersection = getIntersection(
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