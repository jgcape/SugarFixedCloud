const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");
const video = document.getElementById('video');
const scanText = document.getElementById('scanText');
const scanIcon = document.getElementById('scanIcon');
const cameraBtnText = document.getElementById('cameraBtnText');
const openCameraIcon = document.getElementById('openCameraIcon');
const results = document.getElementById('results');


const Recycling_classes = ["Cardboard: Yellow bin.", "Glass: Purple bin.", 'Hard plastic: Yellow bin.',"Metal: Yellow bin.", 'Organic: Green Bin',"Paper: Yellow bin."];


const captureOptions = {
    audio: false,
    video: true,
    video: { facingMode: "environment" },
};
var counter = 0;

//Requests camera access from user and begins video stream. 
const openCamera = () => {
    counter = 1;
    scanIcon.innerText = 'camera';
    scanText.innerText = "scan item";
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.getUserMedia(captureOptions).then(function (stream) {
            video.srcObject = stream;
            video.play();
            context.clearRect(0, 0, canvas.width, canvas.height);
        })
    };
}
//Takes a photo for verification prior to sending.
const takePhoto = () => {
    if (counter != 0) {
        if (counter == 1) {
            counter = 2;
            cameraBtnText.innerText = "retake photo";
            openCameraIcon.innerText = "cached";
            scanIcon.innerText = "file_upload";
            scanText.innerText = "process item";
            canvas.height = $('video').innerHeight();
            canvas.width = $('video').innerWidth();
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        else {
            predict();
        }
    }
}

//classifier

var model;
var predResult = document.getElementById("result");
async function initialize() {
    model = await tf.loadLayersModel('mymodel/model.json');
}
async function predict() {
    // action for the submit button
    var image = new Image();
    image.src = canvas.toDataURL();
    image.onload = () => {

        let offset = tf.scalar(127.5);
        let tensorImg = tf.browser.fromPixels(image).resizeNearestNeighbor([160, 160]).toFloat().sub(offset).div(offset).expandDims();
        console.log(tensorImg);
        console.log(tensorImg.shape);
        model.predict(tensorImg).data().then(predictions => {
            let top3 = Array.from(predictions)
                .map((p, i) => {
                    return {
                        probability: p.toFixed(2),
                        className: Recycling_classes[i]
                    }
                }).sort((a, b) => {
                    return b.probability - a.probability;
                }).slice(0, 1);
                console.log(top3);
                results.innerText = "Result:"+ JSON.stringify(top3) + "            If the probability is low, think about it! If you're not sure, bin it!";  
            // dispatchEvent({ type: 'Prediction_success', predictions: top3 })
        });        

    }

    // Ran out of time for this bit! Will finish later.
    // predictions && predictions.map((pred, predIndex) => {
    //     const { className, probability } = pred;
    //     const score = probability.toFixed(2);
    //     const trClass = (score > 0.8) ? "table-success"
    //         :
    //         (score > 0.5) ? "table-info"
    //             : (score <= 0.1) ? "table-danger"
    //                 : "";
    //     return (
    //         results.innerText = '<tr key={`pred-${predIndex}-${probability}`} className={trClass}><th scope="row">{predIndex + 1}</th><td>{className}</td><td>{score}</td>+</tr>'
    //     )
    // })
}
initialize();


$(function () {
    $('#takePhoto').click(() => {
        takePhoto()
    });
    $('#openCamera').click(() => {
        openCamera()
    });
});
