//*---
// Fitness: render papers to a small offscreen buffer and compare with a target mask
// score = (covered inside target - outsideWeight * covered outside target) / target area
//   -> 1 means target fully covered with nothing outside
class RectFitness {
    constructor(args) {
        this.target = args.target; // { x, y, w, h } in canvas px
        this.scale = args.scale || 0.125; // 800px canvas -> 100px buffer
        this.outsideWeight = args.outsideWeight == undefined ? 1 : args.outsideWeight;

        this.pg = createGraphics(ceil(width * this.scale), ceil(height * this.scale));
        this.pg.pixelDensity(1);

        // target mask: 1 = inside target
        this.mask = new Uint8Array(this.pg.width * this.pg.height);
        this.targetCount = 0;
        for (let y = 0; y < this.pg.height; y++) {
            for (let x = 0; x < this.pg.width; x++) {
                let px = (x + 0.5) / this.scale;
                let py = (y + 0.5) / this.scale;
                let inside =
                    px >= this.target.x && px <= this.target.x + this.target.w &&
                    py >= this.target.y && py <= this.target.y + this.target.h;
                this.mask[y * this.pg.width + x] = inside ? 1 : 0;
                if (inside) this.targetCount++;
            }
        }
    }

    evaluate(papers) {
        let g = this.pg;
        g.push();
        g.background(0);
        g.noStroke();
        g.scale(this.scale);
        papers.forEach(p => p.draw(g));
        g.pop();

        g.loadPixels();
        let inside = 0;
        let outside = 0;
        for (let i = 0; i < this.mask.length; i++) {
            if (g.pixels[i * 4] > 0) {
                if (this.mask[i]) inside++;
                else outside++;
            }
        }
        return (inside - this.outsideWeight * outside) / this.targetCount;
    }

    drawTarget() {
        push();
        noFill();
        stroke(255, 0, 0);
        rect(this.target.x, this.target.y, this.target.w, this.target.h);
        // textSize(this.target.w * 3);
        // textAlign(CENTER, CENTER);
        // text("A", this.target.x, this.target.y);
        // circle(this.target.x, this.target.y, this.target.w)
        pop();
    }
}
//*---