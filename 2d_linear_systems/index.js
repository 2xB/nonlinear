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
    
    let stepMod = 0;
    
    function xValToPos(x) {
        return x + canvas.width/2;
    }

    function yValToPos(y) {
        return y + canvas.height/2;
    }
    
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

    function draw() {

        bgctx.fillStyle   = '#000';
        bgctx.fillRect(0, 0, canvas.width, canvas.height);
        
        fgctx.clearRect(0, 0, canvas.width, canvas.height);
        
        
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
        
        document.getElementById("eigen").onclick = draw;
        if (document.getElementById("eigen").checked) {
            var a = A[0][0];
            var b = A[1][0];
            var c = A[0][1];
            var d = A[1][1];
            
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
                    
                    fgctx.lineWidth = 4;
                    fgctx.strokeStyle = '#aafd';
                    fgctx.fillStyle   = '#aafd';
                    
                    fgctx.beginPath();
                    fgctx.moveTo(canvas.width/2 - x*spacing, canvas.height/2 - y*spacing);
                    fgctx.lineTo(canvas.width/2 + x*spacing, canvas.height/2 + y*spacing);
                    fgctx.closePath();
                    fgctx.stroke();
                    
                    
                    var tipSize = 0.5;
                    var endSize = 0.1;
                    if (lambda >= 0) {
                        fgctx.lineWidth = 6;
                        fgctx.beginPath();
                        fgctx.moveTo(canvas.width/2 - x*spacing, canvas.height/2 - y*spacing);
                        fgctx.lineTo(canvas.width/2 - x*spacing*(1-tipSize), canvas.height/2 - y*spacing*(1-tipSize));
                        fgctx.moveTo(canvas.width/2 + x*spacing, canvas.height/2 + y*spacing);
                        fgctx.lineTo(canvas.width/2 + x*spacing*(1-tipSize), canvas.height/2 + y*spacing*(1-tipSize));
                        fgctx.closePath();
                        fgctx.stroke();
                        
                        fgctx.beginPath();
                        fgctx.lineWidth = 8;
                        fgctx.moveTo(canvas.width/2 - x*spacing, canvas.height/2 - y*spacing);
                        fgctx.lineTo(canvas.width/2 - x*spacing*(1-endSize), canvas.height/2 - y*spacing*(1-endSize));
                        fgctx.moveTo(canvas.width/2 + x*spacing, canvas.height/2 + y*spacing);
                        fgctx.lineTo(canvas.width/2 + x*spacing*(1-endSize), canvas.height/2 + y*spacing*(1-endSize));
                        fgctx.closePath();
                        fgctx.stroke();
                    }
                    else {
                        fgctx.lineWidth = 6;
                        fgctx.beginPath();
                        fgctx.moveTo(canvas.width/2, canvas.height/2);
                        fgctx.lineTo(canvas.width/2 - x*spacing*tipSize, canvas.height/2 - y*spacing*tipSize);
                        fgctx.moveTo(canvas.width/2, canvas.height/2);
                        fgctx.lineTo(canvas.width/2 + x*spacing*tipSize, canvas.height/2 + y*spacing*tipSize);
                        fgctx.closePath();
                        fgctx.stroke();
                        
                        fgctx.beginPath();
                        fgctx.lineWidth = 8;
                        fgctx.beginPath();
                        fgctx.moveTo(canvas.width/2, canvas.height/2);
                        fgctx.lineTo(canvas.width/2 - x*spacing*endSize, canvas.height/2 - y*spacing*endSize);
                        fgctx.moveTo(canvas.width/2, canvas.height/2);
                        fgctx.lineTo(canvas.width/2 + x*spacing*endSize, canvas.height/2 + y*spacing*endSize);
                        fgctx.closePath();
                        fgctx.stroke();
                    }
                }
                
                drawEigenvector(l1, 1);
                drawEigenvector(l2, 2);
            }
        }
        
        // Points
        
        var point1Color = '#77f';
        var point2Color = '#f77';
        {
            var pointSize = 7;
            
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
            contentctx.moveTo(canvas.width/2 + line["x"], canvas.height/2 + line["y"]);
            
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
            
            contentctx.lineTo(canvas.width/2 + line["x"], canvas.height/2 + line["y"]);
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
