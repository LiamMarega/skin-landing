const spray01 = new Proxy({"src":"/_astro/spray_01.CdHYArOB.webp","width":1000,"height":1000,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/liammarega/Documents/Projects/skin-landing/src/assets/resources/spray/spray_01.webp";
							}
							
							return target[name];
						}
					});

const tape02 = new Proxy({"src":"/_astro/tape_02.Du5Aq-eQ.webp","width":1127,"height":1456,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/liammarega/Documents/Projects/skin-landing/src/assets/resources/tapes/tape_02.webp";
							}
							
							return target[name];
						}
					});

export { spray01 as s, tape02 as t };
