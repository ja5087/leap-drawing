// JavaScript source code
var pointerCircle;
var labelText;
var boundaryDrawn = false;


function returnFingerName(finger) //enum the finger names
{
    var fingerTypes = ["THUMB", "INDEX", "MIDDLE", "RING", "PINKY"];
    return fingerTypes[finger.type];
}

function returnFingerOfType(fingers, type) //filter finger by type 
{
    var fingerList = [];
    var i = 0;
    for(var f=0; f<fingers.length;f++)
    {
        if (fingers[f] = type)
        {
            fingerList.push(fingers[f]);
        }
        i++;
    }
    return fingerList;
}

function vectorToNumString(vector, digits) //convert array to summary string
{
    if (typeof digits === "undefined") {
        digits = 1;
    }
    var vectorString = "(" + vector[0].toFixed(digits) 
        + "," + vector[1].toFixed(digits) + ","
        + vector[2].toFixed(digits) + ")";
    return vectorString;
}

function summarizePointables(frame) //summarize pointable to HTML 
{
    var pointablesSummary = " ";
    var pointables = frame.pointables
    for (var i = 0; i < pointables.length; i++) {
        if (pointables[i].valid) {
            pointablesSummary +=
                "<p>pointable ID:" + frame.pointables[i].id
                + " " + "pointable direction:" + vectorToNumString(pointables[i].direction)
                + " " + "pointable tipposition:" + vectorToNumString(pointables[i].tipPosition)
                + " " + "pointable length: " + pointables[i].length
                + " " + "finger type: " + returnFingerName(pointables[i]);
            
        }
    }
    return pointablesSummary;
}

//Old code that uses a Leap Loop instead of a custom loop
/*Leap.loop(controllerOptions, function(frame)
{
    var frameOutput = 
        "frame id: " + frame.id + " "
        + "frame timestamp: " + frame.timestamp;
    document.getElementById("frameData").innerHTML = frameOutput;

    var fingerOutput = summarizePointables(frame);
    if (fingerOutput == ' ')
    {
        document.getElementById("pointableData").innerHTML = 'waiting for input...';

    } else {
        document.getElementById("pointableData").innerHTML = fingerOutput;

    }

}
)*/

function fetchFingerCoordinates(finger) //STUB: TODO
{
    var fingerCoordinates;
    
    return fingerCoordinates;
}

var pathUpdateModule = (function () { //Creates module to update the current drawing path by Bonsai
    var pub = {};
    var lastX, lastY, deltaT;
    var fps = 60;
    var lastUpdateTime = 0;
    var pathOpen = false;
    var currentPath;
    pub.getCurrentPath = (function () { return currentPath; });
    pub.update = (function (position) {
        var dateObject = new Date;
        deltaT = dateObject.getTime() - lastUpdateTime;
        if (deltaT > 1 / fps * 1000) {
            // console.log("beginupdate " + position[2]  );
            if (position[2] < 0) {
                if (pathOpen == false) {
                    currentPath = [
                        ['moveTo', position[0], position[1]],
                        //['attr','strokeWidth',4],
                        //['attr','strokeColor','black'],
                        //['addTo','stage']
                    ];
                    //console.log('currentPathCloseUpdate');

                    pathOpen = true;
                    lastX = position[0];
                    lastY = position[1];
                } else {
                    currentPath.push(['lineTo', position[0], position[1]]);
                    currentPath.push(['closePath']);
                    paint.sendMessage('pushPath', currentPath);
                    lastX = position[0];
                    lastY = position[1];
                    currentPath = [
                        ['moveTo', lastX, lastY],
                        //['attr','strokeWidth',4],
                        //['attr','strokeColor','black'],
                        //['addTo','stage']
                    ];
                    //console.log('currentPathOpenUpdate: ' + currentPath);

                }
            } else {
                if (pathOpen == true) {
                    currentPath.push(['closePath']);
                    paint.sendMessage('pushPath', currentPath);
                    pathOpen = false;

                }
                lastUpdateTime = dateObject.getTime();

            }
        }
    });

    return pub;
})(); 

var paint = bonsai.run(document.getElementById('paint'), { //Create Bonsai paint Object
    code: function () {
        stage.setBackgroundColor("#69c551");
        pointerCircle = new Circle(10, 10, 5)
            .addTo(stage)
            .attr('fillColor', "#46C2EB");

        
        stage.on('message:pointerUpdate', function (data) {
            pointerCircle.attr('x', data.x);
            //console.log("update success");
            pointerCircle.attr('y', data.y);
            //below if uncommented allows for the pointer size to change depending on z-index of pointer object
            /*if(data.z<0)
            {
                pointerCircle.attr('fillColor',"#B93D14");
            } else if(data.z>0) {
                pointerCircle.attr('fillColor',"#46C2EB");
            }
            pointerCircle.attr('radius', Math.abs(data.z));
            //console.log("zdata = " + data.z);*/
        }
            );
        stage.on('message', function (data) {
            //console.log("message received");
        });
        stage.on('message:pushPath', function(data) {
            new Path(data).attr('strokeWidth',4).attr('strokeColor','black').addTo(stage);
        })
    },
        width: 700,
        height: 700,
        framerate: 60
});
function arrayToFixed(array, digits) //rounds arrays of digits
{
    var roundedArray = [];
    for(i=0;i<array.length;i++)
    {
        roundedArray[i] = array[i].toFixed(digits);
    }
    return roundedArray;
}

function drawStraightPath(line) //draws paths from two points //draws a straight path in Bonsai given two points
{
        paint.sendMessage("pushPath", 
        [
            ['moveTo', line[0][0], line[0][1]],
            ['lineTo', line[1][0], line[1][1]]
        ]);
}
function scaleLeapPosition(position, originFrame, targetFrame, mode, opt) //scales Leap Positioning accordingly
{
    //This needs a lot of rewriting to be clearer


    var xWidth = targetFrame.renderer.width;
    var yHeight = targetFrame.renderer.height;
    var zDepth = 0;
    var currentInteractionBox = originFrame.interactionBox;
    var scaledPosition = [];
    if(mode==0) //normalized mode: Leap will handle automatic clamping and normalizing
    {
        var normalizedPosition = [];
         //get interactionBox from frame refer to Leap SDK
        normalizedPosition = currentInteractionBox.normalizePoint(position, true); //get clamped normalized point from 0-1 beginning bottom left back
        scaledPosition[0] = normalizedPosition[0] * xWidth; //scale up to canvas height
        scaledPosition[1] = (1 - normalizedPosition[1]) * yHeight; //flip y-axis to get coordinate for web canvas and scale up to canvas height
        scaledPosition[2] = normalizedPosition[2]*20;
        //console.log(scaledPosition);
        return scaledPosition;
    } else if (mode==1)
    {
        yScaleHeight = position[1]-(currentInteractionBox.center[1]-(currentInteractionBox.height/2)); //scaling needed to clamp value
        if(yScaleHeight<0)
            yScaleHeight = 0;
        scaledPosition[0] = (xWidth/currentInteractionBox.width)*(position[0]+currentInteractionBox.width/2);
        scaledPosition[1] = (yHeight/currentInteractionBox.height)*(currentInteractionBox.height-(yScaleHeight));
        console.log(position + " " + scaledPosition);
        return scaledPosition;
    } else if (mode==3) //custom box of 450 width, height is determined by app aspect ratio
    {
        const _leapMaxWidth = 450;
        opt = yHeight/xWidth;
        yScaleHeight = position[1]-150; //value clamped to avoid deadband
        if(yScaleHeight<0)
            yScaleHeight = 0;
        scaledPosition[0] = (xWidth/_leapMaxWidth)*(position[0])+xWidth/2;
        scaledPosition[1] = (yHeight/(_leapMaxWidth*opt))*(_leapMaxWidth*opt-(yScaleHeight)); 
        //console.log(scaledPosition );
        return scaledPosition; 
    } else if (mode==4) //full frustum area mapped to possible canvas, preserve aspect ratio
    {

        const _leapFrustumDimensions = [400,700,400]; //dimensions in bottombase, topbase, height with each base consisting of side length
        const _leapDeadbandOffset = 100; //offsets for deadband causing max height to be 500
        var leapAspectRatio = Math.max(_leapFrustumDimensions[0],_leapFrustumDimensions[1])/_leapFrustumDimensions[2];
        var appAspectRatio = xWidth/yHeight;
        var yScaleHeight = position[1]-_leapDeadbandOffset;
        var appWorkWidth, appWorkHeight;
        if(leapAspectRatio>=appAspectRatio) //when canvas is width-limited
        {
             appWorkWidth = xWidth;
             appWorkHeight = appWorkWidth/leapAspectRatio;
        }
        else if(leapAspectRatio<appAspectRatio) //when canvas is height-limited
        {
            appWorkHeight = yHeight;
            appWorkWidth = appWorkHeight*leapAspectRatio;//todo
        }
                if(boundaryDrawn==false)
        {
            drawStraightPath([[0.5*(xWidth-appWorkWidth),0],[0.5*(xWidth-appWorkWidth),yHeight]]);
            drawStraightPath([[0.5*(xWidth+appWorkWidth),0],[0.5*(xWidth+appWorkWidth),yHeight]]);
            drawStraightPath([[0,0.5*(yHeight-appWorkHeight)],[xWidth,0.5*(yHeight-appWorkHeight)]]);
            drawStraightPath([[0,0.5*(yHeight+appWorkHeight)],[xWidth,0.5*(yHeight+appWorkHeight)]]);
            drawStraightPath([[appWorkWidth/2,0.5*(yHeight+appWorkHeight)],[xWidth,0.5*yHeight]]);
            drawStraightPath([[appWorkWidth/2,0.5*(yHeight+appWorkHeight)],[0,0.5*yHeight]]);
            boundaryDrawn=true;
            console.log("boundary created");
        }
        leapClampedDimensions = position;
        //console.log("originaldimensions: " + position);
        if( leapClampedDimensions[0] < -300)
        {
            leapClampedDimensions[0] = -300;
        }
        if(leapClampedDimensions[0] > 300)
        {
            leapClampedDimensions[0] = 300;
        }
        if(leapClampedDimensions[1] > 400)
        {
            leapClampedDimensions[1] = 400;
        }

        //console.log("newdimensions: " + leapClampedDimensions);
        scaledPosition[0] = (appWorkWidth/_leapFrustumDimensions[1])*(leapClampedDimensions[0])+xWidth/2;
        scaledPosition[1] = (yHeight-(appWorkHeight/_leapFrustumDimensions[2])*(leapClampedDimensions[1]))-0.5*(yHeight-appWorkHeight); 
    }
    return scaledPosition;
        
}   

function computePercentageError(value, theoretical)
{
    return (Math.abs(value-theoretical)/theoretical)*100;
}

function computeAbsoluteError(value, theoretical)
{
    return Math.abs(value-theoretical);
}

function updateObjectPositionData(HandPosition, scaledHandPosition, frame) //update to the status report below
{
    document.getElementById("objectPositionData").innerHTML = "scaled object position (px): " + arrayToFixed(scaledHandPosition, 2)  
    + "<p> raw object position (mm): " + arrayToFixed(HandPosition, 2)
    + "<p> magnitude: " + vectorModule.vectorToMagnitude(HandPosition); //update information in div
}


var averageStateModule = (function() { //this is javascript modules. when interactinboxstate is accessed, the pub object is returned which contains functions to manipulate the current interactaverage
    var average = 0;
    var size = 0;

    var pub = {};

    pub.addtoAverage = function(value) {
      average = (size*average + value)/(size+1);
      size++;
    }
    
    pub.subtractFromAverage = function(value){
    average = (size*average - value)/(size-1);
    size--;
    };

    pub.getAverage  = function() {
        return average;
    }
    return pub;
}
);

function dimensionToVolume(dimensions)
{
    var volume=1;
    for(i=0;i<dimensions.length;i++)
    {
        volume *= dimensions[i];
    }
    return volume;
}

var vectorModule = (function(){ //module to handle Vector math
    var pub = {};
    pub.vectorToMagnitude = (function (vector)
        {
            var magnitude=0;
            var i=0;
            for(i=0;i<vector.length;i++)
            {
                magnitude += vector[i] * vector[i];
            }
            //console.log(magnitude);
            return Math.pow(magnitude, 1/i);
        });

    pub.normalizeVector = (function (vector)
    {
        var normalizedVector = [];
        var magnitude = vectorModule.vectorToMagnitude(vector);
        for(i=0;i<vector.length;i++)
        {
            normalizedVector[i] = vector[i]/magnitude;
        }
        return normalizedVector;
    });    

    pub.cross = (function(a,b)
    {
        
    });
    return pub;

})();

var pointablesModule = (function() { //module to help handle Pointable operations
    var pub = {};
    pub.getMax = (function (pointables, property) { //get the Pointable with highest magnitude of property in a Pointables
        var maxIndex=0;
        for(i=0;i<pointables.length;i++)
        {
            if(vectorModule.vectorToMagnitude(pointables[i][property])>vectorModule.vectorToMagnitude(pointables[maxIndex][property]))
            {
            maxIndex=i;
            }
            
        }
        //console.log(pointables[maxIndex].tipVelocity);
        return pointables[maxIndex];
    });

    pub.getMin = (function (pointables, property) { //get the Pointable with lowest magnitude of property in a Pointables
        var minIndex=0;
        for(i=0;i<pointables.length;i++)
        {
            if(vectorModule.vectorToMagnitude(pointables[i][property])<vectorModule.vectorToMagnitude(pointableList[minIndex][property])){
                minIndex=i;
            }
        }
        return pointables[minIndex];
    });
    pub.getAngle = (function (position, normal) //get the angle from Leap Origin using trig
    {
        var angle;
        var normalizedPosition = vectorModule.normalizeVector(position);
        angle = Math.atan2(vectorToMagnitude())
    });
    return pub;
})(); //make sure u have the (); at the end it's extremely important for the module programing to work;

var interactionBoxRecord = (function () { //record the size of interaction box as given by LeapJS
    var minBoxSize = [1000,1000,1000];
    var maxBoxSize = [0,0,0];
    var pub = {};
    pub.update = (function (interactionBox) {
        if(dimensionToVolume(interactionBox.size)<dimensionToVolume(minBoxSize))
        {
            minBoxSize = interactionBox.size;
            console.log('minbox updated');
        } else if (dimensionToVolume(interactionBox.size)>dimensionToVolume(maxBoxSize))
        {
            maxBoxSize = interactionBox.size;
            console.log('maxbox updated');
        }
    });

    pub.getMinBox = (function () 
    {
        return minBoxSize;
    });

    pub.getMaxBox = (function () 
    {
        return maxBoxSize;
    });
    return pub;
}());


function updateInteractionBoxData(frame) //update interaction box data to the HTML status below
{
    var currentInteractionBox = frame.interactionBox;
    interactionBoxRecord.update(currentInteractionBox);
    document.getElementById("interactionBoxData").innerHTML = "interaction box size:" + arrayToFixed(currentInteractionBox.size, 2)
    + "    interaction box center:" + arrayToFixed(currentInteractionBox.center, 2)
    + "    minBoxSize = " + arrayToFixed(interactionBoxRecord.getMinBox(),2)
    + "    maxBoxSize = " + arrayToFixed(interactionBoxRecord.getMaxBox(),2);
    + "    currentNormalizedPosition = " + arrayToFixed(currentInteractionBox.normalizePoint(frame.pointables[0].tipPosition, true));
    //console.log(currentInteractionBox.size);
    //console.log('interactionboxdataupdate');
}

function mainLoop(controller) { //main loop that runs the drawing program
    window.setInterval(function () {
        var frame = controller.frame();
        var frameOutput =
        "frame id: " + frame.id + " "
        + "frame timestamp: " + frame.timestamp;
        document.getElementById("frameData").innerHTML = frameOutput;

        var fingerOutput = summarizePointables(frame);
        if (fingerOutput == ' ') {
            document.getElementById("pointableData").innerHTML = 'waiting for input... please place hand over leap';

        } else {
            document.getElementById("pointableData").innerHTML = fingerOutput;

        }
       
        var currentObject = pointablesModule.getMax(frame.pointables,"tipVelocity");
        //console.log(currentHand);
        if (currentObject!=null)
        {
            var currentPosition = currentObject.stabilizedTipPosition;
            var currentScaleMode = 4;
            var scaledPosition = scaleLeapPosition(currentPosition,frame,paint,currentScaleMode,9/16);
            //scaledPosition = scaleLeapPosition(currentHand.stabilizedPalmPosition, frame, 1, 0.01); //mode=0 means interactionbox used, mode=1 means absolute box (specified in array as opt) is used
            //console.log(currentHand.palmPosition);
            var scaledX = scaledPosition[0];
            var scaledY = scaledPosition[1];
            var scaledZ = scaledPosition[2];

            paint.sendMessage('pointerUpdate', { x: scaledX, y: scaledY , z: currentPosition[2]/2}); //not using a scaledZ to get radius effect
            updateObjectPositionData(currentPosition, scaledPosition, frame);
            updateInteractionBoxData(frame);
            pathUpdateModule.update([scaledPosition[0],scaledPosition[1],currentPosition[2]]);
            //console.log(scaledPosition);
        }

        //paint.sendMessage('pointerUpdate', { x: 400, y: 500 });
    }, 13);
}

window.onload = function start() { //initializes on window load
    var controllerOptions = {host: '127.0.0.1', port: 6437, frameEventName: 'animationFrame', useAllPlugins: true, enableGestures: true };
    var leapController = new Leap.Controller(controllerOptions);
    leapController.connect();
    mainLoop(leapController);
}