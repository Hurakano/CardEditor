function loadSvgFile()
{
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var fileText = this.result;
        parseXmlFromString(fileText);
    }
    fileReader.readAsText(document.getElementById("svgFileSelector").files[0]);
}

svgData = {};
function parseXmlFromString(text)
{
    var xmlParser = new DOMParser();
    var xmlDom = xmlParser.parseFromString(text, 'text/xml');
    document.getElementById("svgContent").append(xmlDom.childNodes[0]);
    svgData["width"] = document.getElementsByTagName("svg")[0].getAttribute("width");
    svgData["height"] = document.getElementsByTagName("svg")[0].getAttribute("height");
}

function loadDescriptionFile()
{
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var fileText = this.result;
        var xmlParser = new DOMParser();
        var xmlDom = xmlParser.parseFromString(fileText, 'text/xml');
        readDescriptionFile(xmlDom);
    }
    fileReader.readAsText(document.getElementById("descriptionFileSelector").files[0]);
}

function readDescriptionFile(xml)
{
    var controlDiv = document.getElementById("controlElements");
    
    var textFields = xml.getElementsByTagName("textField");
    for(textField of textFields)
    {
        var elementText = "";
        for(tspan of document.getElementById(textField.attributes.elementId.value).getElementsByTagName("tspan"))
        {
            elementText += tspan.innerHTML + '\n';
        }
        elementText = elementText.slice(0, -1);
        
        var titleElement = document.createElement("p");
        titleElement.innerHTML = textField.attributes.title.value;
        controlDiv.appendChild(titleElement);
        
        var textFieldElement = document.createElement("textArea");
        textFieldElement.innerHTML = elementText;
        textFieldElement.setAttribute("cols", "50");
        var newElement = controlDiv.appendChild(textFieldElement);
        newElement.onchange = textareaModify.bind(newElement, textField.attributes.elementId.value);
    }
    
    var images = xml.getElementsByTagName("image");
    var index = 0;
    for(image of images)
    {
        var titleElement = document.createElement("p");
        titleElement.innerHTML = image.attributes.title.value;
        controlDiv.appendChild(titleElement);
        
        var imgModifyButton = document.createElement("input");
        imgModifyButton.setAttribute("id", "imageChange" + index);
        imgModifyButton.setAttribute("type", "file");
        imgModifyButton.setAttribute("onchange", 'loadNewImage("imageChange' + index + '", "' + image.getAttribute("elementId") + '")');
        controlDiv.appendChild(imgModifyButton);
        index += 1;
        
        var button = document.createElement("button");
        button.innerHTML = "←";
        var newElement = controlDiv.appendChild(button);
        newElement.onclick = moveImage.bind(newElement, image.attributes.elementId.value, "x", -1);
        button = document.createElement("button");
        button.innerHTML = "→";
        newElement = controlDiv.appendChild(button);
        newElement.onclick = moveImage.bind(newElement, image.attributes.elementId.value, "x", 1);
        button = document.createElement("button");
        button.innerHTML = "↑";
        newElement = controlDiv.appendChild(button);
        newElement.onclick = moveImage.bind(newElement, image.attributes.elementId.value, "y", -1);
        button = document.createElement("button");
        button.innerHTML = "↓";
        newElement = controlDiv.appendChild(button);
        newElement.onclick = moveImage.bind(newElement, image.attributes.elementId.value, "y", 1);
        
        button = document.createElement("button");
        button.innerHTML = "+";
        newElement = controlDiv.appendChild(button);
        newElement.onclick = scaleImage.bind(newElement, image.attributes.elementId.value, 1);
        button = document.createElement("button");
        button.innerHTML = "-";
        newElement = controlDiv.appendChild(button);
        newElement.onclick = scaleImage.bind(newElement, image.attributes.elementId.value, -1);
    }
}

function textareaModify(textElementId)
{
    var lines = this.value.split('\n');
    var textElement = document.getElementById(textElementId)
    var tspanArray = textElement.getElementsByTagName("tspan");
    
    var allTspans = document.getElementsByTagName("tspan");
    var currentId = parseInt(allTspans[allTspans.length-1].getAttribute("id").replace(/\D/g, ''), 10) + 1;
    
    for(var i = 0; i < lines.length; i += 1)
    {
        if(tspanArray.length > i)
        {
            tspanArray[i].innerHTML = lines[i];
        }
        else
        {
            var newTspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            newTspan.setAttribute("id", "tspan" + currentId);
            currentId += 1;
            var yPos = parseFloat(textElement.getAttribute("y"));
            yPos += i * (parseFloat(textElement.style["font-size"]) * parseFloat(textElement.style["line-height"]));
            newTspan.setAttribute("y", yPos);
            newTspan.setAttribute("x", textElement.getAttribute("x"));
            newTspan.innerHTML = lines[i];
            
            textElement.appendChild(newTspan);
        }
    }
    for(var i = tspanArray.length - 1; i > lines.length - 1; i -= 1)
    {
        textElement.removeChild(tspanArray[i]);
    }
}

function moveImage(imageId, attrib, direction)
{
    var imageElement = document.getElementById(imageId);
    var position = parseFloat(imageElement.getAttribute(attrib));
    position += direction;
    imageElement.setAttribute(attrib, position);
}

function scaleImage(imageId, inOut)
{
    var imageElement = document.getElementById(imageId);
    var width = parseFloat(imageElement.getAttribute("width"));
    var height = parseFloat(imageElement.getAttribute("height"));
    var aspect = width / height;
    width += 5 * inOut;
    height = width / aspect;
    imageElement.setAttribute("width", width);
    imageElement.setAttribute("height", height);
}

function saveSvg()
{
    // revert any scale that was done
    var svgElement = document.getElementsByTagName("svg")[0];
    svgElement.setAttribute("width", svgData["width"]);
    svgElement.setAttribute("height", svgData["height"]);

    var svg = document.querySelector('svg');
    var xmlData = (new XMLSerializer()).serializeToString(svg);
    var svgBlob = new Blob([xmlData], {type: 'image/svg+xml;charset=utf-8'});
    
    var tmpElement = document.createElement("a");
    tmpElement.href = window.URL.createObjectURL(svgBlob);
    tmpElement.download = "card.svg";
    document.body.appendChild(tmpElement);
    tmpElement.click();
    document.body.removeChild(tmpElement);
}

function zoomIn()
{
    var svgElement = document.getElementsByTagName("svg")[0];
    var width = parseInt(svgElement.getAttribute("width"), 10);
    var height = parseInt(svgElement.getAttribute("height"), 10);
    
    width = Math.round(width * 1.5);
    height = Math.round(height * 1.5);
    
    svgElement.setAttribute("width", width + "mm");
    svgElement.setAttribute("height", height + "mm");
}

function zoomOut()
{
    var svgElement = document.getElementsByTagName("svg")[0];
    var width = parseInt(svgElement.getAttribute("width"), 10);
    var height = parseInt(svgElement.getAttribute("height"), 10);
    
    width = Math.round(width / 1.5);
    height = Math.round(height / 1.5);
    
    svgElement.setAttribute("width", width + "mm");
    svgElement.setAttribute("height", height + "mm");
}

function loadNewImage(fileElemId, elementId)
{
    var imgFile = document.getElementById(fileElemId).files[0];
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var fileData = this.result;
        var imgElement = document.getElementById(elementId);
        imgElement.setAttribute("xlink:href", fileData);
    };
    
    fileReader.readAsDataURL(imgFile);
}
