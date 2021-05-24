onload = function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.bgcanvas = document.createElement('canvas'); // Backdrop | Grid
    bgctx = canvas.bgcanvas.getContext('2d');

    canvas.contentcanvas = document.createElement('canvas'); // Faded | Lines
    contentctx = canvas.contentcanvas.getContext('2d');
    
    canvas.fgcanvas = document.createElement('canvas'); // Foreground | Axes, Dots, Annotations
    fgctx = canvas.fgcanvas.getContext('2d');
    
    canvas.tmpcanvas = document.createElement('canvas');
    tmpctx = canvas.tmpcanvas.getContext('2d');
    
    var spacing = 50;
    var A = [[spacing,0],[0,spacing]];
    
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
        
        // Points
        
        var point1Color = '#77f';
        var point2Color = '#f77';
        {
            var pointSize = 7;
            
            var x = A[0][0];
            var y = A[0][1];
            
            fgctx.beginPath();
            fgctx.lineWidth = 1;
            fgctx.strokeStyle = point1Color;
            fgctx.fillStyle   = point1Color;
            fgctx.arc(x+canvas.width/2, canvas.height/2-y, pointSize, 0, Math.PI * 2, true);
            fgctx.closePath();
            fgctx.fill();
            
            
            var x = A[1][0];
            var y = A[1][1];
            
            fgctx.beginPath();
            fgctx.lineWidth = 1;
            fgctx.strokeStyle = point2Color;
            fgctx.fillStyle   = point2Color;
            fgctx.arc(x+canvas.width/2, canvas.height/2-y, pointSize, 0, Math.PI * 2, true);
            fgctx.closePath();
            fgctx.fill();
        }
        
        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                document.getElementById("A").rows[i].cells[j].innerHTML = (A[j][i]/spacing).toFixed(2);;
            }
        }
        
        compose();
    }
    
    function step(timestamp) {
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
                
                line["x"] += dxdt*timeResolution*timeScaleFactor;
                line["y"] += dydt*timeResolution*timeScaleFactor;
                
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
            A[0][0] = x;
            A[0][1] = y;
        }
        else {
            A[1][0] = x;
            A[1][1] = y;
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
        
        var dist1squared = (x - A[0][0])**2 + (y - A[0][1])**2;
        var dist2squared = (x - A[1][0])**2 + (y - A[1][1])**2;
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
