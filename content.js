var elements = document.body.getElementsByTagName('*');

for (var i = 0; i < elements.length; i++) {
    var current = elements[i];

    for (var j = 0; j < current.childNodes.length; j++) {
        var child = current.childNodes[j];

        if (child.nodeType === Node.TEXT_NODE) {
            child.textContent = child.textContent.replace(/General Manager at The Ivy Club/gi, 'Please make me tech chair please make me tech chair Anton heyyyy I wanna be tech chair it\'s me Abby not Phil btw');
        }
    }
}


