onload = function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.bgcanvas = document.createElement('canvas'); // Backdrop | Grid
    var bgctx = canvas.bgcanvas.getContext('2d');

    canvas.contentcanvas = document.createElement('canvas'); // Faded | Lines
    var contentctx = canvas.contentcanvas.getContext('2d');
    
    canvas.fgcanvas = document.createElement('canvas'); // Foreground | Axes, Dots, Annotations
    var fgctx = canvas.fgcanvas.getContext('2d');
    
    canvas.tmpcanvas = document.createElement('canvas');
    var tmpctx = canvas.tmpcanvas.getContext('2d');
    
    var spacing = 50;
    
    var A = [[1,0],[0,1]];
    
    var lines = [];
    
    var timeResolution = 0.1;
    var timeScaleFactor = 0.00001;
    var maxTime = 3000;
    
    var lineCount = 400;
    var activePoint = 1;

    let lastTime;
    
    function compose()  {
        tmpctx.clearRect(0, 0, canvas.width, canvas.height);
        tmpctx.drawImage(canvas.contentcanvas, 0, 0);
        tmpctx.fillStyle = '#77f';
        tmpctx.globalCompositeOperation = "multiply";
        tmpctx.fillRect(0, 0, canvas.width, canvas.height);
        tmpctx.globalCompositeOperation = "source-over";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle   = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "difference";
        ctx.drawImage(canvas.contentcanvas, 0, 0);
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(canvas.bgcanvas, 0, 0);
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(canvas.tmpcanvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(canvas.fgcanvas, 0, 0);
    }
    
    
    function drawArrow(x1, y1, x2, y2, arrowSize, ctx) {
        // Unit vector in arrow direction
        var ux = x2 - x1;
        var uy = y2 - y1;
        var len = Math.sqrt(ux*ux + uy*uy);
        ux /= len;
        uy /= len;
        
        var tipPoints = [
                [
                    x2*spacing - ux*1.5*arrowSize,
                    y2*spacing - uy*1.5*arrowSize
                ],
                [
                    x2*spacing - ux*1.5*arrowSize + uy*arrowSize,
                    y2*spacing - uy*1.5*arrowSize - ux*arrowSize
                ],
                [
                    x2*spacing,
                    y2*spacing
                ],
                [
                    x2*spacing - ux*1.5*arrowSize - uy*arrowSize,
                    y2*spacing - uy*1.5*arrowSize + ux*arrowSize
                ],
                [
                    x2*spacing - ux*1.5*arrowSize,
                    y2*spacing - uy*1.5*arrowSize
                ]
            ];
        ctx.beginPath();
        ctx.moveTo(canvas.width/2 + x1*spacing, canvas.height/2 - y1*spacing);
        for (let i in tipPoints) {
            var point = tipPoints[i];
            ctx.lineTo(canvas.width/2 + point[0], canvas.height/2 - point[1]);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    function draw() {

        bgctx.fillStyle   = '#000';
        bgctx.fillRect(0, 0, canvas.width, canvas.height);
        
        fgctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Style definitions
        var point1Color = '#77f';
        var point2Color = '#f77';

        var pointSize = 7;
        
        
        // Grid
        {
            bgctx.lineWidth = 1;
            bgctx.strokeStyle = '#333';
            bgctx.fillStyle   = '#333';
            
            // Horizontal grid
            
            var currentValue = spacing;
            
            while(currentValue < canvas.height/2) {
                bgctx.beginPath();
                bgctx.moveTo(0, canvas.height/2+currentValue);
                bgctx.lineTo(canvas.width, canvas.height/2+currentValue);
                bgctx.moveTo(0, canvas.height/2-currentValue);
                bgctx.lineTo(canvas.width, canvas.height/2-currentValue);
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += spacing;
            }
            
            // Vertical grid
            
            currentValue = spacing;
            
            while(currentValue < canvas.width/2) {
                bgctx.beginPath();
                bgctx.moveTo(canvas.width/2+currentValue, 0);
                bgctx.lineTo(canvas.width/2+currentValue, canvas.height);
                bgctx.moveTo(canvas.width/2-currentValue, 0);
                bgctx.lineTo(canvas.width/2-currentValue, canvas.height);
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += spacing;
            }
        }
        
        
        // Axes
        {
            var arrowSize = 10;

            fgctx.lineWidth = 1;
            fgctx.strokeStyle = '#aaa';
            fgctx.fillStyle   = '#aaa';

            // x axis
            fgctx.beginPath();
            fgctx.moveTo(0, canvas.height/2);
            fgctx.lineTo(canvas.width, canvas.height/2);
            fgctx.lineTo(canvas.width-1.5*arrowSize, canvas.height/2-arrowSize);
            fgctx.lineTo(canvas.width-1.5*arrowSize, canvas.height/2+arrowSize);
            fgctx.lineTo(canvas.width, canvas.height/2);
            fgctx.closePath();
            fgctx.stroke();
            fgctx.fill();
            
            fgctx.lineWidth = 1;
            fgctx.strokeStyle = '#aaa';
            fgctx.fillStyle   = '#aaa';
            
            // y axis
            fgctx.beginPath();
            fgctx.moveTo(canvas.width/2, canvas.height);
            fgctx.lineTo(canvas.width/2, 0);
            fgctx.lineTo(canvas.width/2-arrowSize, 1.5*arrowSize);
            fgctx.lineTo(canvas.width/2+arrowSize, 1.5*arrowSize);
            fgctx.lineTo(canvas.width/2, 0);
            fgctx.closePath();
            fgctx.stroke();
            fgctx.fill();
        }
        
        // Eigenvectors
        
        
        document.getElementById("eigenvalues").onclick = draw;
        var drawEigenvalues = document.getElementById("eigenvalues").checked;
        for (let el of document.getElementsByClassName('eigenvalue_axislabel')) {
            console.log(drawEigenvalues);
            el.hidden = !drawEigenvalues;
        }

        
        document.getElementById("eigen").onclick = draw;
        if (document.getElementById("eigen").checked) {
            var a = A[0][0];
            var b = A[1][0];
            var c = A[0][1];
            var d = A[1][1];
            
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                // https://www.youtube.com/watch?v=e50Bj7jn9IQ
                var mean = (a+d)/2.;
                var product = a*d - b*c;
                
                if (mean**2-product >= 0) {
                    var l1 = mean + Math.sqrt(mean**2-product);
                    var l2 = mean - Math.sqrt(mean**2-product);
                    
                    function drawEigenvector (lambda, index) {
                        // http://people.math.harvard.edu/~knill/teaching/math21b2004/exhibits/2dmatrices/index.html
                        if (Math.abs(c) > Math.abs(b) && Math.abs(c) > 0.) {
                            var x = lambda - d;
                            var y = c;
                        }
                        else if (Math.abs(b) > 0.) {
                            var x = b;
                            var y = lambda - a;
                        }
                        else if (a != d) {
                            var x = index == 1 ? 1 : 0;
                            var y = index == 1 ? 0 : 1;
                        }
                        else {
                            return;
                        }
                            
                        // Normalize, length = eigenvalue
                        var length = Math.sqrt(x**2+y**2);
                        var x = x / length * lambda;
                        var y = y / length * lambda;
                        
                        bgctx.lineWidth = 4;
                        bgctx.strokeStyle = '#aafd';
                        bgctx.fillStyle   = '#aafd';
                        bgctx.globalAlpha = 0.7;
                        
                        if (lambda >= 0) {
                            drawArrow(
                                0, 0, 
                                x, y, 
                                6, bgctx
                            );
                            drawArrow(
                                0, 0, 
                                -x, -y, 
                                6, bgctx
                            );
                        }
                        else {
                            drawArrow(
                                x, y, 
                                0, 0, 
                                6, bgctx
                            );
                            drawArrow(
                                -x, -y, 
                                0, 0, 
                                6, bgctx
                            );
                        }
                        bgctx.globalAlpha = 1;
                    }
                    
                    drawEigenvector(l1, 1);
                    drawEigenvector(l2, 2);
                    
                    if (document.getElementById("eigenvalues").checked) {
                        fgctx.lineWidth = 4;
                        fgctx.strokeStyle = '#aafd';
                        fgctx.fillStyle   = '#aafd';
                        fgctx.globalAlpha = 0.8;
                        fgctx.beginPath();
                        fgctx.arc(l1*spacing+canvas.width/2, canvas.height/2, pointSize, 0, Math.PI * 2, true);
                        fgctx.closePath();
                        fgctx.stroke();
                        fgctx.beginPath();
                        fgctx.arc(l2*spacing+canvas.width/2, canvas.height/2, pointSize, 0, Math.PI * 2, true);
                        fgctx.closePath();
                        fgctx.stroke();
                        fgctx.globalAlpha = 1;
                    }
                }
                else if (document.getElementById("eigenvalues").checked) {
                    var pm_im = Math.sqrt(product-mean**2);
                    console.log(pm_im);
                    
                    fgctx.lineWidth = 4;
                    fgctx.strokeStyle = '#aafd';
                    fgctx.fillStyle   = '#aafd';
                    fgctx.globalAlpha = 0.8;
                    fgctx.beginPath();
                    fgctx.arc(mean*spacing+canvas.width/2, - pm_im*spacing + canvas.height/2, pointSize, 0, Math.PI * 2, true);
                    fgctx.closePath();
                    fgctx.stroke();
                    fgctx.beginPath();
                    fgctx.arc(mean*spacing+canvas.width/2, pm_im*spacing + canvas.height/2, pointSize, 0, Math.PI * 2, true);
                    fgctx.closePath();
                    fgctx.stroke();
                    fgctx.globalAlpha = 1;
                }
            }
        }
        
        // Handle vectors
        document.getElementById("handle").onclick = draw;
        if (document.getElementById("handle").checked) {
            bgctx.lineWidth = 3;
            bgctx.globalAlpha = 0.6;
            bgctx.strokeStyle = point1Color;
            bgctx.fillStyle = point1Color;
            drawArrow(
                1, 0, 
                A[0][0] + 1, A[0][1], 
                6, bgctx
            );
            bgctx.strokeStyle = point2Color;
            bgctx.fillStyle = point2Color;
            drawArrow(
                0, 1, 
                A[1][0], A[1][1] + 1, 
                6, bgctx
            );
            bgctx.globalAlpha = 1;
        }
        
        // On-axis vectors
        document.getElementById("onaxisvectors").onclick = draw;
        if (document.getElementById("onaxisvectors").checked) {
            bgctx.lineWidth = 3;
            bgctx.globalAlpha = 0.6;
            bgctx.strokeStyle = point1Color;
            bgctx.fillStyle = point1Color;
            for (var i = 1; i < canvas.width/2/spacing; i++) {
                drawArrow(
                    i, 0, 
                    A[0][0]*i + i, A[0][1]*i, 
                    6, bgctx
                );
                drawArrow(
                    -i, 0, 
                    - (A[0][0]*i + i), - A[0][1]*i, 
                    6, bgctx
                );
            }
            bgctx.strokeStyle = point2Color;
            bgctx.fillStyle = point2Color;
            for (var i = 1; i < canvas.height/2/spacing; i++) {
                drawArrow(
                    0, i, 
                    A[1][0]*i, A[1][1]*i + i, 
                    6, bgctx
                );
                drawArrow(
                    0, -i, 
                    - A[1][0]*i, - (A[1][1]*i + i), 
                    6, bgctx
                );
            }
            bgctx.globalAlpha = 1;
        }
        
        // Points
        {
            var x = A[0][0]*spacing;
            var y = A[0][1]*spacing;
            
            fgctx.beginPath();
            fgctx.lineWidth = 1;
            fgctx.strokeStyle = point1Color;
            fgctx.fillStyle   = point1Color;
            fgctx.arc(x+canvas.width/2, canvas.height/2-y, pointSize, 0, Math.PI * 2, true);
            fgctx.closePath();
            fgctx.fill();
            
            
            var x = A[1][0]*spacing;
            var y = A[1][1]*spacing;
            
            fgctx.beginPath();
            fgctx.lineWidth = 1;
            fgctx.strokeStyle = point2Color;
            fgctx.fillStyle   = point2Color;
            fgctx.arc(x+canvas.width/2, canvas.height/2-y, pointSize, 0, Math.PI * 2, true);
            fgctx.closePath();
            fgctx.fill();
        }
        
        var elements = ["Aa", "Ab", "Ac", "Ad"];
        
        for (var i = 0; i < 4; i++) {
            var el = document.getElementById(elements[i]);
            var val = parseFloat(el.value);
            var i1 = i%2;
            var i2 = (i-i1)/2;
            
            if (el.value != A[i1][i2]) {
                el.value = (A[i1][i2]).toFixed(2);
            }
        }
        
        compose();
    }
    
    function step(timestamp) {
        
        var elements = ["Aa", "Ab", "Ac", "Ad"];
        
        for (var i = 0; i < 4; i++) {
            var el = document.getElementById(elements[i]);
            var val = parseFloat(el.value);
            var i1 = i%2;
            var i2 = (i-i1)/2;
            
            if (isNaN(el.value)) {
                el.value = (A[i1][i2]).toFixed(2);
            }
            else if (val != A[i1][i2]) {
                A[i1][i2] = val;
                draw();
            }
        }
        
        if (lastTime === undefined)
            lastTime = timestamp;
        const elapsed = timestamp - lastTime;
        
        lastTime = timestamp;
        
        // Fade
        contentctx.globalCompositeOperation = "difference";
        contentctx.fillStyle   = '#020202';
        contentctx.fillRect(0, 0, canvas.width, canvas.height);
        contentctx.globalCompositeOperation = "source-over";

        // Draw lines
        contentctx.lineWidth = 1;
        contentctx.strokeStyle = '#fff';
        //contentctx.strokeStyle = '#44c';
        
        var toDelete = [];
        for (let i in lines) {
            var line = lines[i];
            contentctx.beginPath();
            contentctx.moveTo(canvas.width/2 + line["x"], canvas.height/2 - line["y"]);
            
            var desiredSteps = Math.min(Math.floor((timestamp - line["start"]) / timeResolution),line["currentSteps"] + 300.);
            while (line["currentSteps"] < desiredSteps) {
                line["currentSteps"] += 1;
                var dxdt = A[0][0]*line["x"] + A[1][0]*line["y"];
                var dydt = A[0][1]*line["x"] + A[1][1]*line["y"];
                
                line["x"] += dxdt*spacing*timeResolution*timeScaleFactor;
                line["y"] += dydt*spacing*timeResolution*timeScaleFactor;
                
                if (line["x"] < - canvas.width/2 || line["x"] > canvas.width/2 || line["y"] < - canvas.height/2 || line["y"] > canvas.height/2) {
                    toDelete.push(line);
                    break;
                }
                else if (timestamp - line["start"] > maxTime) {
                    toDelete.push(line);
                    break;
                }
            }
            
            contentctx.lineTo(canvas.width/2 + line["x"], canvas.height/2 - line["y"]);
            contentctx.closePath();
            contentctx.stroke();
            
        }
        
        for (let i in toDelete) {
            var line = toDelete[i];
            const index = lines.indexOf(line);
            if (index > -1) {
                lines.splice(index, 1);
            }
        }
        
        // Add lines
        while (lines.length < lineCount) {
            lines.push({
                "start": timestamp,
                "currentSteps": 0,
                "x": (Math.random()-0.5) * canvas.width,
                "y": (Math.random()-0.5) * canvas.height
            })
        }
        
        compose();
        
        window.requestAnimationFrame(step);
    }
    
    function onDrag(clientX, clientY) {
        var x = clientX - canvas.width/2;
        var y = -(clientY - canvas.height/2);
        
        if (activePoint == 1) {
            A[0][0] = x/spacing;
            A[0][1] = y/spacing;
        }
        else {
            A[1][0] = x/spacing;
            A[1][1] = y/spacing;
        }
        draw();
    }
    
    function onMouseMove(evt) {
        return onDrag(evt.clientX, evt.clientY);
    }
    
    function onTouchMove(evt) {
        return onDrag(evt.touches[0].clientX, evt.touches[0].clientY);
    }
    
    function onMouseDown(clientX, clientY) {
        var x = clientX - canvas.width/2;
        var y = -(clientY - canvas.height/2);
        
        var dist1squared = (x - A[0][0]*spacing)**2 + (y - A[0][1]*spacing)**2;
        var dist2squared = (x - A[1][0]*spacing)**2 + (y - A[1][1]*spacing)**2;
        if (dist1squared < dist2squared) {
            activePoint = 1;
        }
        else {
            activePoint = 2;
        }
        
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("touchmove", onTouchMove);
    }
    
    function onMouseUp(evt) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("touchmove", onTouchMove);
    }
    
    canvas.addEventListener("mousedown", function (evt) {
        return onMouseDown(evt.clientX, evt.clientY);
    });
    canvas.addEventListener("touchstart", function (evt) {
        return onMouseDown(evt.touches[0].clientX, evt.touches[0].clientY);
    });

    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchend", onMouseUp);

    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        canvas.bgcanvas.width = canvas.width;
        canvas.bgcanvas.height = canvas.height;
        
        canvas.contentcanvas.width = canvas.width;
        canvas.contentcanvas.height = canvas.height;
        
        canvas.fgcanvas.width = canvas.width;
        canvas.fgcanvas.height = canvas.height;
        
        canvas.tmpcanvas.width = canvas.width;
        canvas.tmpcanvas.height = canvas.height;
        
        lines = [];
        
        draw();
        ctx.drawImage(canvas.bgcanvas, 0, 0);
    }

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    window.requestAnimationFrame(step);
}
