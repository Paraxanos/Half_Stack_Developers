declare module 'three' {
	export const LinearFilter: any;
	export const GLSL3: any;

	export class Texture {
		constructor(...args: any[]);
		minFilter: any;
		magFilter: any;
		generateMipmaps: any;
		needsUpdate: any;
	}

	export class Uniform {
		constructor(value?: any);
		value: any;
	}

	export class WebGLRenderer {
		constructor(params?: any);
		domElement: any;
		setSize(...args: any[]): void;
		setPixelRatio(...args: any[]): void;
		getPixelRatio(): number;
		setClearAlpha(alpha: number): void;
		setClearColor(color: any, alpha?: number): void;
		render(...args: any[]): void;
		dispose(): void;
	}

	export class Scene {
		constructor();
		add(...args: any[]): void;
		remove(...args: any[]): void;
	}

	export class OrthographicCamera {
		constructor(...args: any[]);
	}

	export class ShaderMaterial {
		constructor(params?: any);
		uniforms: any;
		dispose(): void;
	}

	export class Clock {
		constructor();
		getElapsedTime(): number;
		getDelta(): number;
	}

	export class Vector2 {
		constructor(x?: number, y?: number);
		x: number;
		y: number;
		set(x: number, y: number): this;
	}

	export class Color {
		constructor(color?: any);
		set(color: any): this;
	}

	export class PlaneGeometry {
		constructor(...args: any[]);
		dispose(): void;
	}

	export class Mesh<G = any, M = any> {
		constructor(geometry?: G, material?: M);
		geometry: G;
		material: M;
	}
}
