//*---
// (1+λ)-ES: keep one current solution (array of Paper),
// each step tries λ mutations and keeps the best one if it is not worse.
// lambda = 1 -> (1+1)-ES
class ES {
    constructor(args) {
        this.papers = args.papers;
        this.fitness = args.fitness; // (papers) => score
        this.lambda = args.lambda || 1;
        this.sigma = args.sigma || 40; // step size (px), adapted by 1/5 success rule
        this.minSigma = args.minSigma || 1;
        this.maxSigma = args.maxSigma || 150;
        this.maxFolds = args.maxFolds || 5;
        this.stopAfter = args.stopAfter || 200; // stop after N steps without improvement

        this.score = this.fitness(this.papers);
        this.generation = 0;
        this.noImprove = 0;
        this.done = false;
        this.lastAction = "";

        // 1/5 success rule
        this.windowSize = 20;
        this.windowTrials = 0;
        this.windowSuccesses = 0;
    }

    step() {
        if (this.done) return;

        let best = null;
        for (let k = 0; k < this.lambda; k++) {
            let candidate = this.papers.slice(); // shallow copy, only the mutated paper is cloned
            let action = this.mutate(candidate);
            let score = this.fitness(candidate);
            if (!best || score > best.score) best = { papers: candidate, score, action };
        }

        this.generation++;
        let improved = best.score > this.score;

        // accept equal scores too, so it can drift on flat areas
        if (best.score >= this.score) {
            this.papers = best.papers;
            this.score = best.score;
            this.lastAction = best.action;
        }

        if (improved) {
            this.noImprove = 0;
            this.windowSuccesses++;
        } else {
            this.noImprove++;
        }

        // 1/5 success rule: succeed often -> bigger steps, rarely -> smaller steps
        this.windowTrials++;
        if (this.windowTrials >= this.windowSize) {
            let rate = this.windowSuccesses / this.windowTrials;
            this.sigma *= rate > 0.2 ? 1.22 : 0.82;
            this.sigma = constrain(this.sigma, this.minSigma, this.maxSigma);
            this.windowTrials = 0;
            this.windowSuccesses = 0;
        }

        if (this.noImprove >= this.stopAfter) this.done = true;
    }

    // mutate one random paper in place of the candidate array, return action name
    mutate(candidate) {
        let idx = floor(random(candidate.length));
        let p = candidate[idx].clone();
        candidate[idx] = p;

        let action = random([
            "translate", "translate", "translate",
            "rotate", "rotate",
            "fold", "fold",
            "refold",
            "unfold"
        ]);

        if (action == "fold") {
            let line = p.folds.length < this.maxFolds ? p.randomFoldLine() : null;
            if (line) p.addFold(line.a, line.b, line.mode);
            else action = "translate";
        } else if (action == "refold" || action == "unfold") {
            if (p.folds.length == 0) action = "translate";
            else if (action == "unfold") p.unfoldLast();
            else {
                // move the last fold line a little
                let last = p.folds[p.folds.length - 1];
                last.a = createVector(last.a.x + randomGaussian(0, this.sigma), last.a.y + randomGaussian(0, this.sigma));
                last.b = createVector(last.b.x + randomGaussian(0, this.sigma), last.b.y + randomGaussian(0, this.sigma));
                p.rebuild();
            }
        }

        if (action == "translate") {
            p.offset.add(randomGaussian(0, this.sigma), randomGaussian(0, this.sigma));
        } else if (action == "rotate") {
            p.angle += randomGaussian(0, this.sigma * 0.005);
        }

        return action + " #" + idx;
    }
}
//*---