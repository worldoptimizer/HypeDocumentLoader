# HypeDocumentLoader
![HypeDocumentLoader|690x487](https://playground.maxziebell.de/Hype/DocumentLoader/HypeDocumentLoader.jpg)   
<sup>The cover artwork is not hosted in this repository and &copy;opyrighted by Max Ziebell</sup>

This is a geeky extension. It uses a tiny runtime proxy to fetch the loader data directly offering instant access to it. This allows to read and maipulate some values you wouldn't usually haveaccess to … starting with a list of all associated resources. Some values are already part of the regular Hype API others are very geeky and useful to only a subset of developers. **Be reminded that the internal Hype data structure is not officially supported and could change at any time…** neither the less, this extension offers ways for certain projects to inspect files, layers, scenes and timelines for what ever reason that might be necessary. This extension offers two new Hype events.

---

#### `HypeDocumentData.setBuild`
The first thing that needs to be done and unfortunatly updated over time is declare the current Build number. You can find the current build number when opening the "about" dialog in Hype.

```
HypeDocumentData.setBuild(NUMBER);
```

---

#### `HypeDocumentData`
This callback acts as a filter and receveis the data in `event.data`. You can create and act upon the data. If you manipulate the data and want that to be passed on to the build process return it at the end of the callback.
```javascript
<script>	
	//EXAMPLE: Adding something to the head of the page
	function documentDataAddToHead(hypeDocument, element, event){
		console.log ('HypeDocumentData', event.data);
		// manipulate data. For example add something to the head 
		event.data.headAdditions.push('<!-- hello -->');
		// return to assign
		return event.data;
	}
	
	if("HYPE_eventListeners" in window === false) { 
		window.HYPE_eventListeners = Array();
	}
	window.HYPE_eventListeners.push({"type":"HypeDocumentData", "callback":documentDataAddToHead});
</script>
```

---

#### `HypeDocumentRender`
This callback offers a way to prevent Hype from rendering immediately and allows to delay/manage the render process. It receives the render command as part of the event as` event.render` and can be triggered at any time with `event.render();`. If you take over the time you want Hype to render disable regular rendering by returning false from the callback.
```javascript
<script>	
	//EXAMPLE: Render Hype with an one second delay
	function documentRender(hypeDocument, element, event){
		// create some visual feedback (totally optional)
		var containerElm = document.getElementById(event.id)
		var newElm = document.createElement('div');
		newElm.innerHTML = "<br>Let us delay this for 1 second!";
		containerElm.appendChild(newElm);
		// let us delay
		setTimeout(function(){
			event.render();
		},1000);
		// return false to block instant render
		return false;
	}

	if("HYPE_eventListeners" in window === false) { 
		window.HYPE_eventListeners = Array();
	}
	window.HYPE_eventListeners.push({"type":"HypeDocumentRender", "callback":documentRender});
</script>
```

---

**Child extension in the works:** Thinking about adding some helper functions to interpret the data...this will become its own extension using the event callback to not bloat the core functionality of this fine little helper. Have fun.

**Demo (output in the console):**  
[HypeDocumentLoader.html](https://playground.maxziebell.de/Hype/DocumentLoader/HypeDocumentLoader.html)

**Further code examples in the Wiki:**  
https://github.com/worldoptimizer/HypeDocumentLoader/wiki

**Versions:**\
`1.0	Initial release under MIT`  
`1.1   Removed additional loading request and asynchronicity`  
`1.2   Added notification system to allow further extensibility`  
`1.3   Tweaked notifyEvent to be additive, added hypeDocument.notifyEventAdditivum`  
`1.4   Added new event HypeDocumentRender, Refactored name to HypeDocumentLoader.js and event to HypeDocumentData`

Content Delivery Network (CDN)
--
Latest version can be linked into your project using the following in the head section of your project:
```html
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeDocumentLoader/HypeDocumentLoader.min.js"></script>
```

Optionally you can also link a SRI version or specific releases. 
Read more about that on the JsDelivr (CDN) page for this extension at https://www.jsdelivr.com/package/gh/worldoptimizer/HypeDocumentLoader

Learn how to use the latest extension version and how to combine extensions into one file at
https://github.com/worldoptimizer/HypeCookBook/wiki/Including-external-files-and-Hype-extensions
