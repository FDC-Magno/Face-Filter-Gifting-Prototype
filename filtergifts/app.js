let facemesh = null
let video = null
let canvas = null
let ctx = null
let boundingCtx = null
let has_face = false
const pixi = PIXI
const pixiApp = new pixi.Application();
$('#faceGifts').append(pixiApp.view)

loadFaceMeshModel()
.then(detector => {
	facemesh = detector

	navigator.mediaDevices.getUserMedia({ video: true })
	.then(stream => {
		video = $('#camera').get(0);
		video.srcObject = stream
		video.play();

		requestAnimationFrame(drawFrame);
	}).catch(error => {
        console.log(error);
	});
})
.catch(error => {
	console.log(error)
});

async function loadFaceMeshModel() {
    try {
		const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
		const detectorConfig = {
			runtime: 'mediapipe',
			solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
			maxFaces: 1
		  }
		const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
		console.log('FaceMesh model loaded successfully!');
		return detector;
    } catch (error) {
      	console.error('Error loading FaceMesh model:', error);
    }
}

async function processFrame(frame) {
	const predictions = await facemesh.estimateFaces(frame); // Use async execution
	has_face = predictions.length > 0
	const landmarks = predictions.length > 0 ? predictions[0].keypoints : 0; // Access first prediction
	const boundingBox = predictions.length > 0 ? predictions[0].box : 0; // Access first prediction
	drawBoundingBox(landmarks, boundingBox)
}

function drawFrame() {
	canvas = $("#boundingBox")
	ctx = canvas[0].getContext('2d', { willReadFrequently: true })
	boundingCanvas = $("#boundingBoxCanvas")
	boundingCtx = boundingCanvas[0].getContext('2d', { willReadFrequently: true })
	boundingCtx.reset()
	ctx.drawImage(video, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.get(0).width, canvas.get(0).height);
	processFrame(imageData);
	requestAnimationFrame(drawFrame);
}

function drawBoundingBox(landmarks, face) {
	if(landmarks.length == 0 || landmarks == 0) return
	
	let x = landmarks[1].x - (face.width / 2)
	let y = landmarks[1].y - (face.height / 2)
	// Extract bounding box coordinates from the face data
	const width = face.width;
	const height = face.height;
  
	// Draw a red rectangle with a 2-pixel-wide stroke
	boundingCtx.strokeStyle = 'green';
	boundingCtx.lineWidth = 2;
	boundingCtx.strokeRect(x, y, width, height);
}

