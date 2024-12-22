import '@babylonjs/core';

declare global {
    interface Window {
        BABYLON: {
            Inspector: {
                IsVisible: boolean;
                Hide(): void;
                Show(): void;
            };
        };
    }
}

export {};
