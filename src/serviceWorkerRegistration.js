// serviceWorkerRegistration.js

// Check if service workers are supported
export function register() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
}