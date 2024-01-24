window.onload = () => {
	// Access webcam and create canvas context
	const video = document.getElementById('camera');
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d', {willReadFrequently : true});
	let detector = null;

	// Load face mesh detection model
	async function loadModel() {
		const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
		const detectorConfig = {
			runtime: 'mediapipe',
			solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
			maxFaces: 1
			}
		detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
		console.log('FaceMesh model loaded successfully!');
		startVideo(detector)
	}

	loadModel()
	.then(() => {
		startVideo()
	})

	function startVideo() {
		navigator.mediaDevices.getUserMedia({ video: true })
		.then(stream => {
			video.srcObject = stream;
			video.onplay = () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				requestAnimationFrame(renderLoop)
			}
		})
		.catch(error => console.error('Error accessing webcam:', error));
	}

	async function renderLoop() {
		// Capture video frame and draw it on canvas
		ctx.drawImage(video, 0, 0);

		// Extract face landmarks
		const predictions = await detector.estimateFaces(ctx.getImageData(0, 0, canvas.width, canvas.height));
		if (predictions.length == 0) requestAnimationFrame(renderLoop)
		else {
			// const landmarks = predictions[0].keypoints; // Get first face data

			// // Placeholder logic for overlay and 3D model positioning
			// // Based on your chosen assets and library, adapt this section
			// const faceBox = predictions[0].box; // Access bounding box data
			// // Extract bounding box coordinates from the face data
			// let x = landmarks[1].x - (faceBox.width / 2)
			// let y = landmarks[1].y - (faceBox.height / 2)
			// const width = faceBox.width;
			// const height = faceBox.height;
			// // Draw a rectangle around the face with desired style
			// ctx.strokeStyle = 'green'; // Adjust colour and other styling as needed
			// ctx.lineWidth = 2;
			// ctx.strokeRect(x, y, width, height);
			
			drawPhotoOnFace('assets/images/face_filters/16740136-removebg-preview.png', predictions)
			requestAnimationFrame(renderLoop);
		}
	}

	function drawPhotoOnFace(photoUrl, landmarkData) {
		const image = new Image();
		
		const { keypoints, box } = landmarkData[0]; // Access landmark and bounding box data
		const noseTip = keypoints[1]; // Find nose tip
	
		// Calculate photo dimensions and position based on bounding box
		photoWidth = box.width*2;
		photoHeight = box.height*2;
		xPosition = box.xMin;
		yPosition = box.yMin;
		offset = 50;
	
		// Adjust position based on nose tip if needed (e.g., for masks)
		adjustedX = noseTip.x - (photoWidth / 2);
		adjustedY = noseTip.y - (photoHeight / 2) - offset;

		image.src = photoUrl;
		ctx.drawImage(image, 0, 0, image.width, image.height, adjustedX, adjustedY, photoWidth, photoHeight);
	}
}

