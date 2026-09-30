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

            if (checkIntersection(this.foldingStartPt, this.foldingEndPt, piece.vertices)) { validLine = true }
        }



        let foldMode = random(["RIGHT", "LEFT"])

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
                    let reflected = reflectByTwoPoints(
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