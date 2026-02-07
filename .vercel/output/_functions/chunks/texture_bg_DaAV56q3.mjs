const spray02 = new Proxy({"src":"/_astro/spray_02.De2273ZD.webp","width":1000,"height":1000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/liammarega/Documents/Projects/skin-landing/src/assets/resources/spray/spray_02.webp";
							}
							
							return target[name];
						}
					});

const textureBg = new Proxy({"src":"/_astro/texture_bg.CxwrAWC2.webp","width":1600,"height":832,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/liammarega/Documents/Projects/skin-landing/src/assets/resources/textures/texture_bg.webp";
							}
							
							return target[name];
						}
					});

export { spray02 as s, textureBg as t };
