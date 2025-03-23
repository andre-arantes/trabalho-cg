document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  const rasterizationDropdown = document.getElementById(
    "rasterizationDropdown"
  );
  const transformationDropdown = document.getElementById(
    "transformationDropdown"
  );
  const rotationInput = document.getElementById("rotationInput");
  const scalingInput = document.getElementById("scalingInput");
  const translationInput = document.getElementById("translationInput");
  const clippingDropdown = document.getElementById("clippingDropdown");
  const rasterButton = document.getElementById("rasterButton");
  const transformationButton = document.getElementById("transformationButton");
  const clippingButton = document.getElementById("clippingButton");
  const clippingAreaButton = document.getElementById("clippingAreaButton");
  const clearButton = document.getElementById("clearButton");

  let activePoints = [];
  let drawnPoints = [];

  canvas.addEventListener("mousedown", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    activePoints.push({ x, y });
    drawPoint(x, y);
  });

  rasterButton.addEventListener("click", function () {
    const rasterAlgorithm = rasterizationDropdown.value;
    if (activePoints.length < 2) {
      alert("Selecione pelo menos dois pontos no canvas!");
      return;
    }

    let newShape = [...activePoints];

    if (rasterAlgorithm === "DDA") {
      for (let i = 0; i < activePoints.length; i++) {
        let next = (i + 1) % activePoints.length;
        ddaAlgorithm(
          activePoints[i].x,
          activePoints[i].y,
          activePoints[next].x,
          activePoints[next].y,
          "black"
        );
      }
    } else if (rasterAlgorithm === "Bresenham") {
      for (let i = 0; i < activePoints.length; i++) {
        let next = (i + 1) % activePoints.length;
        bresenhamAlgorithm(
          activePoints[i].x,
          activePoints[i].y,
          activePoints[next].x,
          activePoints[next].y,
          "black"
        );
      }
    } else if (rasterAlgorithm === "BresenhamCircle") {
      if (activePoints.length < 2) {
        alert("Selecione pelo menos dois pontos no canvas!");
      } else {
        const x1 = activePoints[0].x;
        const y1 = activePoints[0].y;
        const x2 = activePoints[1].x;
        const y2 = activePoints[1].y;
        const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        circ(x1, y1, r, "black");
      }
    }

    drawnPoints.push(newShape);
    activePoints = [];
  });

  clippingAreaButton.addEventListener("click", function () {
    if (activePoints.length < 2) {
      alert("Selecione pelo menos dois pontos no canvas!");
      return;
    }
    const x1 = activePoints[0].x;
    const y1 = activePoints[0].y;
    const x2 = activePoints[1].x;
    const y2 = activePoints[1].y;
    const xmin = Math.min(x1, x2);
    const ymin = Math.min(y1, y2);
    const xmax = Math.max(x1, x2);
    const ymax = Math.max(y1, y2);
    ddaAlgorithm(xmin, ymin, xmax, ymin, "black");
    ddaAlgorithm(xmax, ymin, xmax, ymax, "black");
    ddaAlgorithm(xmax, ymax, xmin, ymax, "black");
    ddaAlgorithm(xmin, ymax, xmin, ymin, "black");
  });

  transformationButton.addEventListener("click", function () {
    const transformationType = transformationDropdown.value;
    if (transformationType === "Translation") {
      const translationValue = translationInput.value.trim();
      const cleanedTranslation = translationValue.replace(/[()]/g, "");
      const [tx, ty] = cleanedTranslation.split(",").map(Number);

      context.clearRect(0, 0, canvas.width, canvas.height);
      let newDrawnPoints = [];

      for (const shape of drawnPoints) {
        let transformedShape = shape.map((point) =>
          translation(point.x, point.y, tx, ty)
        );
        newDrawnPoints.push(transformedShape);

        for (let i = 0; i < transformedShape.length; i++) {
          let next = (i + 1) % transformedShape.length;
          ddaAlgorithm(
            transformedShape[i].x,
            transformedShape[i].y,
            transformedShape[next].x,
            transformedShape[next].y,
            "black"
          );
        }
      }

      drawnPoints = newDrawnPoints;
    } else if (transformationType === "Rotation") {
      const rotationValue = rotationInput.value.trim();
      const angle = Number(rotationValue) * (Math.PI / 180);

      context.clearRect(0, 0, canvas.width, canvas.height);
      let newDrawnPoints = [];

      for (const shape of drawnPoints) {
        let transformedShape = shape.map((point) =>
          rotation(point.x, point.y, angle)
        );
        newDrawnPoints.push(transformedShape);

        for (let i = 0; i < transformedShape.length; i++) {
          let next = (i + 1) % transformedShape.length;
          ddaAlgorithm(
            transformedShape[i].x,
            transformedShape[i].y,
            transformedShape[next].x,
            transformedShape[next].y,
            "black"
          );
        }
      }

      drawnPoints = newDrawnPoints;
    } else if (transformationType === "Scaling") {
      const scaleValue = scalingInput.value.trim();
      const cleanedScale = scaleValue.replace(/[()]/g, "");
      const [sx, sy] = cleanedScale.split(",").map(Number);

      context.clearRect(0, 0, canvas.width, canvas.height);
      let newDrawnPoints = [];

      for (const shape of drawnPoints) {
        let transformedShape = shape.map((point) =>
          scale(point.x, point.y, sx, sy)
        );
        newDrawnPoints.push(transformedShape);

        for (let i = 0; i < transformedShape.length; i++) {
          let next = (i + 1) % transformedShape.length;
          ddaAlgorithm(
            transformedShape[i].x,
            transformedShape[i].y,
            transformedShape[next].x,
            transformedShape[next].y,
            "black"
          );
        }
      }

      drawnPoints = newDrawnPoints;
    } else if (transformationType.includes("Reflection")) {
      let axis = "";
      if (transformationType === "ReflectionX") {
        axis = "x";
      } else if (transformationType === "ReflectionY") {
        axis = "y";
      } else {
        axis = "xy";
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      let newDrawnPoints = [];

      for (const shape of drawnPoints) {
        let transformedShape = shape.map((point) =>
          reflection(point.x, point.y, axis)
        );
        newDrawnPoints.push(transformedShape);

        for (let i = 0; i < transformedShape.length; i++) {
          let next = (i + 1) % transformedShape.length;
          ddaAlgorithm(
            transformedShape[i].x,
            transformedShape[i].y,
            transformedShape[next].x,
            transformedShape[next].y,
            "black"
          );
        }
      }

      drawnPoints = newDrawnPoints;
    }
  });

  clippingButton.addEventListener("click", function () {
    const clippingAlgorithm = clippingDropdown.value;
    if (clippingAlgorithm === "CohenSutherland") {
      if (activePoints.length < 2) {
        alert("Selecione pelo menos dois pontos no canvas!");
        return;
      }
      const x1 = activePoints[0].x;
      const x2 = activePoints[1].x;
      const y1 = activePoints[0].y;
      const y2 = activePoints[1].y;
      const xmin = Math.min(x1, x2);
      const ymin = Math.min(y1, y2);
      const xmax = Math.max(x1, x2);
      const ymax = Math.max(y1, y2);

      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drawnPoints.length; i++) {
        let shape = drawnPoints[i];
        for (let j = 0; j < shape.length; j++) {
          let next = (j + 1) % shape.length;
          cohenSutherlandAlgorithm(
            shape[j].x,
            shape[j].y,
            shape[next].x,
            shape[next].y,
            xmin,
            ymin,
            xmax,
            ymax,
            "black"
          );
        }
      }
    } else if (clippingAlgorithm === "LiangBarsky") {
      if (activePoints.length < 2) {
        alert("Selecione pelo menos dois pontos no canvas!");
        return;
      }
      const x1 = activePoints[0].x;
      const y1 = activePoints[0].y;
      const x2 = activePoints[1].x;
      const y2 = activePoints[1].y;
      const xmin = Math.min(x1, x2);
      const ymin = Math.min(y1, y2);
      const xmax = Math.max(x1, x2);
      const ymax = Math.max(y1, y2);

      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drawnPoints.length; i++) {
        let shape = drawnPoints[i];
        for (let j = 0; j < shape.length; j++) {
          let next = (j + 1) % shape.length;
          liangBarskyAlgorithm(
            shape[j].x,
            shape[j].y,
            shape[next].x,
            shape[next].y,
            xmin,
            ymin,
            xmax,
            ymax,
            "black"
          );
        }
      }
    }
  });

  clearButton.addEventListener("click", function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    activePoints = [];
    drawnPoints = [];
  });

  function drawPoint(x, y) {
    context.fillStyle = "red";
    context.fillRect(x, y, 3, 3);
  }

  function ddaAlgorithm(x1, y1, x2, y2, color) {
    context.fillStyle = color;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));
    let xIncrement = dx / steps;
    let yIncrement = dy / steps;

    let x = x1,
      y = y1;
    for (let i = 0; i <= steps; i++) {
      context.fillRect(Math.round(x), Math.round(y), 2, 2);
      x += xIncrement;
      y += yIncrement;
    }
  }

  function bresenhamAlgorithm(x1, y1, x2, y2, color) {
    let dx = Math.abs(x2 - x1),
      dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1,
      sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      context.fillStyle = color;
      context.fillRect(x1, y1, 1, 1);
      if (x1 === x2 && y1 === y2) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
  }

  function circleBresemhamAlgorithm(a, b, xc, yc, color) {
    context.fillStyle = color;
    context.fillRect(xc + a, yc + b, 1, 1);
    context.fillRect(xc + a, yc - b, 1, 1);
    context.fillRect(xc - a, yc + b, 1, 1);
    context.fillRect(xc - a, yc - b, 1, 1);
    context.fillRect(xc + b, yc + a, 1, 1);
    context.fillRect(xc + b, yc - a, 1, 1);
    context.fillRect(xc - b, yc + a, 1, 1);
    context.fillRect(xc - b, yc - a, 1, 1);
  }

  function circ(xc, yc, r, color) {
    let x = 0;
    let y = r;
    let p = 3 - 2 * r;
    circleBresemhamAlgorithm(x, y, xc, yc, color);
    while (x < y) {
      if (p < 0) {
        p += 4 * x + 6;
      } else {
        p += 4 * (x - y) + 10;
        y--;
      }
      x++;
      circleBresemhamAlgorithm(x, y, xc, yc, color);
    }
  }

  function scale(x, y, sx, sy) {
    let newX = x * sx;
    let newY = y * sy;

    newX = Math.max(0, Math.min(canvas.width - 1, newX));
    newY = Math.max(0, Math.min(canvas.height - 1, newY));

    return { x: newX, y: newY };
  }

  function translation(x, y, tx, ty) {
    let newX = x + tx;
    let newY = y + ty;

    newX = Math.max(0, Math.min(canvas.width - 1, newX));
    newY = Math.max(0, Math.min(canvas.height - 1, newY));

    return { x: newX, y: newY };
  }

  function rotation(x, y, angle) {
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    let newX = x - centerX;
    let newY = y - centerY;

    let rotatedX = newX * Math.cos(angle) - newY * Math.sin(angle);
    let rotatedY = newX * Math.sin(angle) + newY * Math.cos(angle);

    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY,
    };
  }

  function reflection(x, y, axis) {
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    if (axis === "x") {
      return { x: x, y: 2 * centerY - y };
    } else if (axis === "y") {
      return { x: 2 * centerX - x, y: y };
    } else {
      return { x: 2 * centerX - x, y: 2 * centerY - y };
    }
  }
  function getRegionCode(x, y, xmin, ymin, xmax, ymax) {
    let code = 0;
    if (x < xmin) {
      code += 1;
    }
    if (x > xmax) {
      code += 2;
    }
    if (y < ymin) {
      code += 4;
    }
    if (y > ymax) {
      code += 8;
    }
    return code;
  }

  function cohenSutherlandAlgorithm(
    x1,
    y1,
    x2,
    y2,
    xmin,
    ymin,
    xmax,
    ymax,
    color
  ) {
    let accept = false;

    while (true) {
      let code1 = getRegionCode(x1, y1, xmin, ymin, xmax, ymax);
      let code2 = getRegionCode(x2, y2, xmin, ymin, xmax, ymax);

      if ((code1 | code2) === 0) {
        accept = true;
        break;
      } else if ((code1 & code2) !== 0) {
        break;
      } else {
        let codeOut = code1 !== 0 ? code1 : code2;
        let x, y;

        if (codeOut & 8) {
          x = x1 + ((x2 - x1) * (ymax - y1)) / (y2 - y1);
          y = ymax;
        } else if (codeOut & 4) {
          x = x1 + ((x2 - x1) * (ymin - y1)) / (y2 - y1);
          y = ymin;
        } else if (codeOut & 2) {
          y = y1 + ((y2 - y1) * (xmax - x1)) / (x2 - x1);
          x = xmax;
        } else if (codeOut & 1) {
          y = y1 + ((y2 - y1) * (xmin - x1)) / (x2 - x1);
          x = xmin;
        }

        if (codeOut === code1) {
          x1 = x;
          y1 = y;
        } else {
          x2 = x;
          y2 = y;
        }
      }
    }

    if (accept) {
      ddaAlgorithm(x1, y1, x2, y2, color);
    }
  }

  function liangBarskyAlgorithm(x1, y1, x2, y2, xmin, ymin, xmax, ymax, color) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let p = [-dx, dx, -dy, dy];
    let q = [x1 - xmin, xmax - x1, y1 - ymin, ymax - y1];
    let u1 = 0;
    let u2 = 1;

    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) {
          return;
        }
      } else {
        let r = q[i] / p[i];
        if (p[i] < 0) {
          u1 = Math.max(u1, r);
        } else {
          u2 = Math.min(u2, r);
        }
      }
    }

    if (u1 < u2) {
      let x1Clip = x1 + u1 * dx;
      let y1Clip = y1 + u1 * dy;
      let x2Clip = x1 + u2 * dx;
      let y2Clip = y1 + u2 * dy;
      ddaAlgorithm(x1Clip, y1Clip, x2Clip, y2Clip, color);
    }
  }
});
