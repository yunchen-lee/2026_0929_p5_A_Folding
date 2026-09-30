function isLeft(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
}

function reflectByTwoPoints(p1, p2, input) {
    // vector form, also works for vertical fold lines (slope = Infinity)
    let d = p5.Vector.sub(p2, p1).normalize();
    let v = p5.Vector.sub(input, p1);
    let proj = p5.Vector.mult(d, v.dot(d));
    return p5.Vector.add(p1, proj).mult(2).sub(p1).sub(v);
}


function getIntersection(a, b, c, d) {

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

    if (t >= 0 && t <= 1) {


        let px = a.x + t * (b.x - a.x);
        let py = a.y + t * (b.y - a.y);

        return createVector(px, py);
    }

    return null;
}

function checkIntersection(a, b, pts) {
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