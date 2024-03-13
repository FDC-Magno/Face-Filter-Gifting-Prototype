import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.onload = () => {
	// Access webcam and create canvas context
	const video = document.getElementById('camera');
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d', {willReadFrequently : true});
	const loader = new GLTFLoader();
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setSize(500, 500);
	document.body.appendChild(renderer.domElement);

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
				load3dMask()
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
		let photoWidth = box.width * 2;
		let photoHeight = box.height * 2;
		let xPosition = box.xMin;
		let yPosition = box.yMin;
		let offset = 50;
	
		// Adjust position based on nose tip if needed (e.g., for masks)
		let adjustedX = noseTip.x - (photoWidth / 2);
		let adjustedY = noseTip.y - (photoHeight / 2) - offset;

		image.src = photoUrl;
		ctx.drawImage(image, 0, 0, image.width, image.height, adjustedX, adjustedY, photoWidth, photoHeight);
	}

	async function load3dMask() {
		await loader.load(
			'assets/models/winter_hat.glb', // Replace with the path to your GLTF file
			(gltf) => {
			  const model = gltf.scene;
		  
			  // **Display the loaded model:**
			  scene.add(model);
		  
			  // (Optional) Additional adjustments
			  model.scale.set(1, 1, 1); // Adjust the scale if needed
			  model.position.set(0, 0, 0);  // Adjust the position if needed
		  
			  // Render the scene
			  renderer.render(scene, camera);
			},
			(xhr) => {
			  // Handle loading progress (optional)
			  console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error) => {
			  // Handle loading errors
			  console.error('Error loading GLTF:', error);
			}
		);
	}
}

