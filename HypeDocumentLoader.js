/*!
Hype DocumentLoader 1.4.2
copyright (c) 2024 Max Ziebell, (https://maxziebell.de). MIT-license
*/
/*
* Version-History
* 1.0	Initial release under MIT
* 1.1   Removed additional loading request and asynchronicity
* 1.2   Added notification system to allow further extensibility
* 1.3   Tweaked notifyEvent to be additive, added hypeDocument.notifyEventAdditivum
* 1.4   Added new event HypeDocumentRender, Refactored extention to HypeDocumentLoader
* --- Semantic versioning ---
* 1.4.1   Fixed missing HYPE.document reference when blocking renderer
* 1.4.2   Added broad initialization across multiple build numbers automatically
*/

if("HypeDocumentLoader" in window === false) window['HypeDocumentLoader'] = (function () {
	
	let runtime = {};
	let documentLoaderInfo = {};
	let autoBuild = true;
	let autoBuildMin = 750;
	let autoBuildMax = 800;
	
	function extendHype (hypeDocument, element, event){
		/**
		* hypeDocument.documentLoaderInfo
		* @return {Object} raw document loader object
		*/
		hypeDocument.documentLoaderInfo = function(){
			return documentLoaderInfo[this.documentName()];
		}

		/**
		* hypeDocument.notifyEvent
		* @param {Object} containing at least type as name of event
		* @param {HTMLDivElement} element
		* @return {Boolean} returns event abortion clause or optional data
		*/
		hypeDocument.notifyEvent = function(event, element){
			return notifyEvent (event, null, element, this);
		}

		/**
		* hypeDocument.notifyEventAdditivum 
		* @param {Object} containing at least type as name of event
		* @param {HTMLDivElement} element
		* @param {String} optional event key to persist through callbacks
		* @return {Boolean} returns event abortion clause or optional data
		*/
		hypeDocument.notifyEventAdditivum = function(event, element, additivum){
			return notifyEvent (event, additivum, element, this);
		}	
	}

	/**
	* notifyEvent
	* @param {Object} containing at least type as name of event
	* @param {HTMLDivElement} element
	* @param {Object} hypeDocument
	* @return {Boolean} returns event abortion clause or optional data
	*/
	function notifyEvent (event, additivum, element, hypeDocument){
		var eventListeners = window['HYPE_eventListeners'];
	    if (eventListeners == null) {
	        return;
	    }
	    var result;
	    for (var i = 0; i < eventListeners.length; i++) {
	    	if (eventListeners[i]['type'] == event['type'] && eventListeners[i]['callback'] != null) {
	            result = eventListeners[i]['callback'](hypeDocument, element, event);
	            if (result === false) {
	                return false;
	            }
	            if (additivum) event[additivum] = result;
	        }
	    }
	    return result;
	}

	/**
	* setupBuild
	* @param {String} Build-Identifier (only number portion)
	*/
	function setBuild(build, isAutoBuild){
		if (!isAutoBuild) deleteAutoBuild(build);
		setupDocumentLoaderInfo('HYPE_'+build+'T', build);
		setupDocumentLoaderInfo('HYPE_'+build+'F', build);
	}

	/**
	 * setupAutoBuild
	 */
	function setupAutoBuild(){
		if (autoBuild) {
			for (let build=autoBuildMin; build<=autoBuildMax; build++){
				setBuild(build, true);
			}
		}
	}

	/**
	 * deleteAutoBuild
	 * @param {String} Build-Identifier
	 */
	function deleteAutoBuild(keepBuild){
		if (autoBuild) {
			for (let build=autoBuildMin; build<=autoBuildMax; build++){
				if(build!=keepBuild){
					delete window['HYPE_'+build+'T'];
					delete window['HYPE_'+build+'F'];
				}
			}
			autoBuild = false;
		}
	}

	/**
	* setupDocumentLoaderInfo
	* @param {String} Build-Identifier
	*/
	function setupDocumentLoaderInfo(kBuild, build) {
		if (kBuild) {
			var runtimeProxy = function (){
				// remove all other builds
				
				var a = arguments;
				if (a.length) deleteAutoBuild(build);
				var b = {
					documentName : a[0],
					mainContainerID: a[1],
					resources: a[2],
					resourcesFolderName: a[3],
					headAdditions: a[4],
					functions: a[5],
					sceneContainers: a[6],
					scenes: a[7],
					persistentSymbolDescendants: a[8],
					javascriptMapping: a[9],
					timingFunctions: a[10],
					loadingScreenFunction: a[11],
					hasPhysics: a[12],
					drawSceneBackgrounds: a[13],
					initialSceneIndex: a[14],
					useGraphicsAcceleration: a[15],
					useCSSReset: a[16],
					useCSSPositioning: a[17],
					useWebAudioAPI: a[18],
					useTouchEvents: a[19]
				};
				// make a deep copy
				var deepCopy = JSON.parse(JSON.stringify(b));
				// restore functions on copy
				for (var i in a[5]) { deepCopy.functions[i] = a[5][i]}
				deepCopy.loadingScreenFunction = a[11];
				// notifyEvent
				var c = notifyEvent({"type":"HypeDocumentData", "data":deepCopy}, 'data');
				// check for override
				if(typeof c === 'object') {					
					// remove read only vars
					var removeKeysInEvent = ['hasPhysics', 'documentName', 'mainContainerID'];
					for(var i in removeKeysInEvent) { delete c[removeKeysInEvent[i]]; }
					// map them back onto our arguments a and storage b
					a = Object.keys(b).map(function(key) {
						if (c[key]){
  							b[key] = c[key];
  							return c[key];
  						} else {
  							return b[key];
  						}
					});
				}
				//init and extend directly
				var h = new (Function.prototype.bind.apply(runtime[kBuild], [null].concat(Array.from(a))));
				extendHype(h['API']);
				
				// store, communicate render intent and render if needed
				var loader = {
					"type": "HypeDocumentRender",
					render: function(){
						// set API on render because it was blocked and set to {}
						window['HYPE']['documents'][b.documentName] = h['API'];
						h.z_o();
					},
					name: b.documentName,
					id: b.mainContainerID,
					data: b
				}
				// store for later use
				documentLoaderInfo[a[0]] = b;
				// notify
				var result = notifyEvent(loader);
				// check
				if (result!=false){
					return h;
				} else {
					return {
						API: {},
						z_o:function(){}
					}
				}
			}
			// observe using proxy
			Object.defineProperty(window, kBuild, {
				enumerable: true,
				configurable: true,
				get: function() {return runtime[kBuild] ? runtimeProxy : undefined;},
				set: function(h) {runtime[kBuild] = h;} 
			});
		} else {
			console.log('Hype DocumentLoader: Please provide a build')
		}
	}
	
	// create a bunch of build functions
	setupAutoBuild();

	if("HYPE_eventListeners" in window === false) { window.HYPE_eventListeners = Array();}

	/* Reveal Public interface to window['HypeDocumentLoader'] */
	return {
		version : '1.4.2',
		setBuild : setBuild
	};
})();
