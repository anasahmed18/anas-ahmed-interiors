// Joke API endpoint
const JOKE_API = 'https://official-joke-api.appspot.com/random_joke';

const jokeText = document.getElementById('jokeText');
const jokeBtn = document.getElementById('jokeBtn');
const copyBtn = document.getElementById('copyBtn');
const loading = document.getElementById('loading');

// Fetch a random joke from the API
async function getJoke() {
    loading.style.display = 'block';
    jokeBtn.disabled = true;
    
    try {
        const response = await fetch(JOKE_API);
        const data = await response.json();
        
        // Format the joke
        const fullJoke = `${data.setup}\n\n${data.punchline}`;
        jokeText.textContent = fullJoke;
        
        // Add animation
        jokeText.style.animation = 'none';
        setTimeout(() => {
            jokeText.style.animation = 'fadeIn 0.5s ease-out';
        }, 10);
        
    } catch (error) {
        jokeText.textContent = '😢 Oops! Failed to load joke. Please try again!';
        console.error('Error fetching joke:', error);
    } finally {
        loading.style.display = 'none';
        jokeBtn.disabled = false;
    }
}

// Copy joke to clipboard
function copyToClipboard() {
    const jokeContent = jokeText.textContent;
    
    navigator.clipboard.writeText(jokeContent).then(() => {
        // Show feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy joke');
    });
}

// Event listeners
jokeBtn.addEventListener('click', getJoke);
copyBtn.addEventListener('click', copyToClipboard);

// Load a joke on page load
window.addEventListener('load', getJoke);