const sentences = [
    { text: 'hello world', video: 'videos/hello.mp4' },
    { text: 'i love reading', video: 'videos/love_reading.mp4' }
];

let currentIndex = 0;
const sentenceElement = document.getElementById('sentence');
const feedbackElement = document.getElementById('feedback');
const videoElement = document.getElementById('video');
const speakButton = document.getElementById('speak-button');

speakButton.addEventListener('click', handleButtonClick);

function handleButtonClick() {
    if (speakButton.textContent === 'skip video') {
        skipVideo();
    } else {
        startRecognition();
    }
}

function startRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('speech recognition not supported');
        alert('speech recognition api not supported in this browser');
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    
    // Update button to show listening state
    speakButton.textContent = 'listening...';
    speakButton.classList.add('listening');
    speakButton.disabled = true;

    recognition.start();

    recognition.onstart = function () {
        console.log('speech recognition started');
    };

    recognition.onerror = function (event) {
        console.error('speech recognition error: ', event.error);
        alert('error occurred in recognition: ' + event.error);
        resetButtonState(); // Reset button if there's an error
    };

    recognition.onresult = (event) => {
        const saidText = event.results[0][0].transcript.toLowerCase();
        console.log('you said: ', saidText);
        feedbackElement.textContent = saidText;

        if (saidText === sentences[currentIndex].text) {
            feedbackElement.style.color = 'green';
            playVideo(sentences[currentIndex].video);
        } else {
            feedbackElement.style.color = 'red';
            feedbackElement.textContent = `${saidText} (try again)`;
        }

        resetButtonState(); // Reset button after result
    };

    recognition.onspeechend = function () {
        recognition.stop();
        console.log('speech recognition ended');
        resetButtonState(); // Reset button after speech ends
    };
}

function resetButtonState() {
    speakButton.textContent = 'tap to say';
    speakButton.classList.remove('listening');
    speakButton.disabled = false;
}

function playVideo(videoSrc) {
    console.log('playing video: ', videoSrc);
    videoElement.src = videoSrc;
    videoElement.style.display = 'block';
    videoElement.play();
    
    // Ensure button is updated to "skip video"
    speakButton.textContent = 'skip video';
    speakButton.classList.remove('listening');
    speakButton.disabled = false;
    console.log('button text set to: ', speakButton.textContent);

    videoElement.onended = () => {
        resetForNextSentence();
    };
}

function skipVideo() {
    console.log('skipping video');
    videoElement.pause();
    videoElement.style.display = 'none';
    resetForNextSentence();
}

function resetForNextSentence() {
    currentIndex++;
    if (currentIndex >= sentences.length) {
        currentIndex = 0;  // Loop back to the first sentence
    }
    sentenceElement.textContent = sentences[currentIndex].text;
    feedbackElement.textContent = '';
    videoElement.style.display = 'none';
    speakButton.textContent = 'tap to say';
    speakButton.disabled = false;
}
