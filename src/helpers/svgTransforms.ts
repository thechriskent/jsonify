export const svgCircleToPathD = (cx: string = '0', cy: string = '0', r: string = '0'): string => {
    const cxNum = Number(cx);
    const cyNum = Number(cy);
    const rNum = Number(r);

    return `M${cxNum - rNum},${cyNum}a${rNum},${rNum} 0 1,0 ${rNum * 2},0a${rNum},${rNum} 0 1,0 -${rNum * 2},0`;
};

export const svgEllipseToPathD = (cx: string = '0', cy: string = '0', rx: string = '0', ry: string = '0'): string => {
    // Convert cx, cy, rx, and ry to numbers
    const cxNum = Number(cx);
    const cyNum = Number(cy);
    const rxNum = Number(rx);
    const ryNum = Number(ry);

    // Check if rx or ry is 'auto' or any non-number value and set them to '0'
    const validRx = !isNaN(rxNum) ? rxNum : 0;
    const validRy = !isNaN(ryNum) ? ryNum : 0;

    return `M ${cxNum - validRx} ${cyNum} a ${validRx} ${validRy} 0 1 0 ${2 * validRx} 0 a ${validRx} ${validRy} 0 1 0 ${-2 * validRx} 0`;
};

export const svgRectToPathD = (x: string = '0', y: string = '0', width: string = '0', height: string = '0', rx: string = '0', ry: string = '0'): string => {
    // Check if width, height, rx, or ry is 'auto' or any non-number value and set them to '0'
    width = (typeof width === 'number' || !isNaN(Number(width))) ? Number(width).toString() : '0';
    height = (typeof height === 'number' || !isNaN(Number(height))) ? Number(height).toString() : '0';
    rx = (typeof rx === 'number' || !isNaN(Number(rx))) ? Number(rx).toString() : '0';
    ry = (typeof ry === 'number' || !isNaN(Number(ry))) ? Number(ry).toString() : '0';

    return `M ${x} ${y} h ${width} a ${rx} ${ry} 0 0 1 ${rx} ${ry} v ${height} a ${rx} ${ry} 0 0 1 -${rx} ${ry} h ${-width} a ${rx} ${ry} 0 0 1 -${rx} -${ry} v ${-height} a ${rx} ${ry} 0 0 1 ${rx} -${ry}`;
};

export const svgLineToPathD = (x1: string = '0', y1: string = '0', x2: string = '0', y2: string = '0'): string => {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
};

export const svgPolyToPathD = (points: string = '', polygon: boolean = false): string => {
    // Validate points string
    if (!/^(\s*\d+\s*,\s*\d+\s*)*$/.test(points)) {
        return '';
    }

    // Split points string into array of points
    const pointsArray = points.trim().split(/\s+/);

    // Convert points array to path string
    let pathD = '';
    for (let i = 0; i < pointsArray.length; i++) {
        const [x, y] = pointsArray[i].split(',');
        pathD += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
    }

    if(polygon) {
        // Close the path to make it a polygon
        pathD += 'Z';
    }

    return pathD.trim();
};