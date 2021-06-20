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
    
    var spacing = 10;
    
    var lines = [];
    
    var timeResolution = 0.1;
    var timeScaleFactor = 0.00001;
    var maxTime = 3000;
    
    var lineCount = 400;

    let lastTime;
    
    let stepMod = 0;
    
    var rot1 = 0;
    var rot2 = 0;
    
    var startdrag = undefined;
    var startrot = undefined;
    
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
    
    function matrixDotArray(matrix, array) {
        var res = []
        for (let i in matrix) {
            var sum = 0;
            for (let j in matrix[i]) {
                sum += matrix[i][j]*array[j];
            }
            res.push(sum);
        }
        return res;
    }
    
    // to 2d
    function to2d(x3d, y3d, z3d) {
        var pos = [x3d, -y3d, z3d];
        var rotz = [
                [Math.cos(-rot1/180*Math.PI), -Math.sin(-rot1/180*Math.PI), 0],
                [Math.sin(-rot1/180*Math.PI),  Math.cos(-rot1/180*Math.PI), 0],
                [0, 0, 1]
            ];
        var rotx = [
                [1, 0, 0],
                [0, Math.cos(rot2/180*Math.PI), -Math.sin(rot2/180*Math.PI)],
                [0, Math.sin(rot2/180*Math.PI),  Math.cos(rot2/180*Math.PI)]
            ];
        
        var [x, unused, y] = matrixDotArray(rotx, matrixDotArray(rotz, pos));
        
        return [x, y];
    }
    
    // to 2d canvas
    function to2dc(x3d, y3d, z3d) {
        var [x, y] = to2d(x3d, y3d, z3d);
        return [x*spacing + canvas.width/2, -y*spacing + canvas.height*3/4];
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
            bgctx.strokeStyle = '#111';
            bgctx.fillStyle   = '#111';
            
            // xz grid
            bgctx.globalAlpha = ((Math.cos(rot1*2/180*Math.PI)+1)/2
                        * (Math.cos(rot2*2/180*Math.PI)+1)/2)**2;
            
            // Horizontal grid
            
            var currentValue = 0;
            
            while(currentValue < canvas.height/2/spacing*2) {
                bgctx.beginPath();
                bgctx.moveTo(...to2dc(-canvas.width/2./spacing*2, 0, currentValue));
                bgctx.lineTo(...to2dc( canvas.width/2./spacing*2, 0, currentValue));
                bgctx.moveTo(...to2dc(-canvas.width/2./spacing*2, 0, -currentValue));
                bgctx.lineTo(...to2dc( canvas.width/2./spacing*2, 0, -currentValue));
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += 1;
            }
            
            // Vertical grid
            
            currentValue = 0;
            
            while(currentValue < canvas.width/2/spacing*2) {
                bgctx.beginPath();
                bgctx.moveTo(...to2dc(currentValue, 0, -canvas.height/2/spacing*2));
                bgctx.lineTo(...to2dc(currentValue, 0,  canvas.height/2/spacing*2));
                bgctx.moveTo(...to2dc(-currentValue, 0, -canvas.height/2/spacing*2));
                bgctx.lineTo(...to2dc(-currentValue, 0,  canvas.height/2/spacing*2));
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += 1;
            }
            
            // yz grid
            bgctx.globalAlpha = ((Math.cos((rot1*2+180)/180*Math.PI)+1)/2
                        * (Math.cos(rot2*2/180*Math.PI)+1)/2)**2;
            
            // Horizontal grid
            
            var currentValue = 0;
            
            while(currentValue < canvas.height/2/spacing*2) {
                bgctx.beginPath();
                bgctx.moveTo(...to2dc(0, -canvas.width/2./spacing*2, currentValue));
                bgctx.lineTo(...to2dc(0,  canvas.width/2./spacing*2, currentValue));
                bgctx.moveTo(...to2dc(0, -canvas.width/2./spacing*2, -currentValue));
                bgctx.lineTo(...to2dc(0,  canvas.width/2./spacing*2, -currentValue));
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += 1;
            }
            
            // Vertical grid
            
            currentValue = 0;
            
            while(currentValue < canvas.width/2/spacing*2) {
                bgctx.beginPath();
                bgctx.moveTo(...to2dc(0, currentValue, -canvas.height/2/spacing*2));
                bgctx.lineTo(...to2dc(0, currentValue,  canvas.height/2/spacing*2));
                bgctx.moveTo(...to2dc(0, -currentValue, -canvas.height/2/spacing*2));
                bgctx.lineTo(...to2dc(0, -currentValue,  canvas.height/2/spacing*2));
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += 1;
            }
            
            // xy grid
            bgctx.globalAlpha = ((Math.cos((rot2*2+180)/180*Math.PI)+1)/2)**2;
            
            var extent = Math.sqrt(canvas.height**2+canvas.width**2)/2/spacing;
            
            currentValue = 0;
            
            while(currentValue < extent*2) {
                bgctx.beginPath();
            
                // Horizontal grid
                bgctx.moveTo(...to2dc(-extent*2, currentValue, 0));
                bgctx.lineTo(...to2dc( extent*2, currentValue, 0));
                bgctx.moveTo(...to2dc(-extent*2, -currentValue, 0));
                bgctx.lineTo(...to2dc( extent*2, -currentValue, 0));
                
                // Vertical grid
                bgctx.moveTo(...to2dc(currentValue, -extent*2, 0));
                bgctx.lineTo(...to2dc(currentValue,  extent*2, 0));
                bgctx.moveTo(...to2dc(-currentValue, -extent*2, 0));
                bgctx.lineTo(...to2dc(-currentValue,  extent*2, 0));
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += 1;
            }
            
            
            currentValue = 0;
            
            while(currentValue < canvas.width/2/spacing) {
                bgctx.beginPath();
                bgctx.closePath();
                bgctx.stroke();
                
                currentValue += 1;
            }
            
            bgctx.globalAlpha = 1;
        }
        
        
        // Axes
        {
            var arrowSize = 10;
            

            bgctx.lineWidth = 1;
            bgctx.strokeStyle = '#aaa';
            bgctx.fillStyle   = '#aaa';
            bgctx.globalAlpha = 0.7;
            
            bgctx.beginPath();
            bgctx.moveTo(...to2dc(0, 0, 0));
            bgctx.lineTo(...to2dc(5, 0, 0));
            bgctx.moveTo(...to2dc(0, 0, 0));
            bgctx.lineTo(...to2dc(0, 5, 0));
            bgctx.moveTo(...to2dc(0, 0, 0));
            bgctx.lineTo(...to2dc(0, 0, 5));
            bgctx.closePath();
            bgctx.stroke();
            
            bgctx.font = "15px sans-serif";
            var [x,y] = to2dc(5,0,0);
            bgctx.fillText("x", x-10, y+15);
            
            var [x,y] = to2dc(0,5,0);
            bgctx.fillText("y", x-10, y+15);
            
            var [x,y] = to2dc(0,0,5);
            bgctx.fillText("z", x-10, y+15);
            bgctx.globalAlpha = 1;
        }
        
        /*
        // Points
        
        var point1Color = '#77f';
        {
            var pointSize = 7;
            
            var x = rot1*spacing/100;
            var y = rot2*spacing/100;
            
            fgctx.beginPath();
            fgctx.lineWidth = 1;
            fgctx.strokeStyle = point1Color;
            fgctx.fillStyle   = point1Color;
            fgctx.arc(x+canvas.width/2, canvas.height/2-y, pointSize, 0, Math.PI * 2, true);
            fgctx.closePath();
            fgctx.fill();
        }
        
        var el = document.getElementById("mu");
        var val = parseFloat(el.value);
        
        if (el.value != mu) {
            el.value = mu.toFixed(2);
        }
        */
        
        compose();
    }
    
    function step(timestamp) {
        var el = document.getElementById("sigma");
        if (isNaN(el.value)) {
            lines = [];
            return;
        }
        var sigma = parseFloat(el.value);
        
        var el = document.getElementById("rho");
        if (isNaN(el.value)) {
            lines = [];
            return;
        }
        var rho = parseFloat(el.value);
        
        var el = document.getElementById("beta");
        if (isNaN(el.value)) {
            lines = [];
            return;
        }
        var beta = parseFloat(el.value);
            
        
        if (lastTime === undefined)
            lastTime = timestamp;
        const elapsed = timestamp - lastTime;
        
        lastTime = timestamp;
        
        // Fade
        contentctx.globalCompositeOperation = "difference";
        contentctx.fillStyle   = '#020202';
        contentctx.fillRect(0, 0, canvas.width, canvas.height);
        contentctx.fillRect(0, 0, canvas.width, canvas.height);
        contentctx.fillRect(0, 0, canvas.width, canvas.height);
        contentctx.fillRect(0, 0, canvas.width, canvas.height);
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
            contentctx.moveTo(...to2dc(line["x"]/spacing, line["y"]/spacing, line["z"]/spacing));
            
            var desiredSteps = Math.min(Math.floor((timestamp - line["start"]) / timeResolution),line["currentSteps"] + 300.);
            while (line["currentSteps"] < desiredSteps) {
                line["currentSteps"] += 1;
                var x = line["x"]/spacing;
                var y = line["y"]/spacing;
                var z = line["z"]/spacing;
                
                var dxdt = sigma*y-sigma*x;
                var dydt = rho*x-x*z-y;
                var dzdt = x*y-beta*z;
                    
                line["x"] += dxdt*spacing**2*timeResolution*timeScaleFactor;
                line["y"] += dydt*spacing**2*timeResolution*timeScaleFactor;
                line["z"] += dzdt*spacing**2*timeResolution*timeScaleFactor;
                if (document.getElementById("respawn").checked) {
                    if (timestamp - line["start"] > maxTime && Math.random() < 0.6/desiredSteps) {
                        toDelete.push(line);
                        break;
                    }
                }
            }
            
            contentctx.lineTo(...to2dc(line["x"]/spacing, line["y"]/spacing, line["z"]/spacing));
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
            var scaling = document.getElementById("respawnorigin").checked ? 1/100:1;
            lines.push({
                "start": timestamp,
                "currentSteps": 0,
                "x": (Math.random()-0.5) * canvas.width*scaling,
                "y": (Math.random()-0.5) * canvas.width*scaling,
                "z": (Math.random()-0.5) * canvas.height*scaling
            })
        }
        
        compose();
        
        window.requestAnimationFrame(step);
    }
    
    function onDrag(clientX, clientY) {
        var dx = (startdrag[0] - clientX)/canvas.width*2*2;
        var dy = (startdrag[1] - clientY)/canvas.height*2*2;
        
        rot1 = ((startrot[0] - dx*360+180)%360-360)%360+180;
        rot2 = Math.max(-90, Math.min(0, startrot[1] + dy*180));
        
        contentctx.clearRect(0, 0, canvas.width, canvas.height);
        draw();
    }
    
    function onMouseMove(evt) {
        return onDrag(evt.clientX, evt.clientY);
    }
    
    function onTouchMove(evt) {
        return onDrag(evt.touches[0].clientX, evt.touches[0].clientY);
    }
    
    function onMouseDown(clientX, clientY) {
        startdrag = [clientX, clientY];
        startrot = [rot1, rot2];
        
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("touchmove", onTouchMove);
    }
    
    function onMouseUp(evt) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("touchmove", onTouchMove);
        
        startdrag = undefined;
        startrot = undefined;
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
        
        draw();
        ctx.drawImage(canvas.bgcanvas, 0, 0);
    }
    
    function respawnAll() {
        lines = [];
        draw();
    }
    
    document.getElementById("respawnall").onclick = respawnAll;

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    window.requestAnimationFrame(step);
}
