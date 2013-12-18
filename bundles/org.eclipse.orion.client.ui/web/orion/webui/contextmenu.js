/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global window define document */

define([
	'orion/webui/littlelib', 
	'orion/webui/dropdown', 
	'orion/objects',
	'orion/webui/tooltip',
	'i18n!orion/nls/messages',
	'text!orion/webui/dropdownseparator.html'
], function(lib, mDropdown, objects, Tooltip, messages, DropdownSeparatorFragment) {

	var Dropdown = mDropdown.Dropdown;
	
	/**
	 * @class orion.webui.ContextMenu
	 * @extends orion.webui.Dropdown
	 * 
	 * Attaches context menu behavior to a given node.  
	 *
	 * @see orion.webui.Dropdown for more documentation
	 *
	 * @name orion.webui.contextmenu.ContextMenu
	 *
	 */
	function ContextMenu(options) {
		options.skipTriggerEventListeners = true; //we want different event listeners on the trigger node
		Dropdown.call(this, options); //invoke super constructor
		this._initialize(options);
	}
	
	ContextMenu.prototype = Object.create(Dropdown.prototype);
	
	objects.mixin(ContextMenu.prototype, /** @lends orion.webui.contextmenu.ContextMenu.prototype */ {
			
		_initialize: function(options) {
			var self = this;
			
			if (!this._dropdownNode.dropdown) {
				//used by commandRegistry to set the parentNode of a child dropdown menu
				this._dropdownNode.dropdown = this;
			}
			
			//add context menu event handlers
			this._boundcontextmenuEventHandler = this._contextmenuEventHandler.bind(this);
			this._boundContextMenuCloser = this._contextMenuCloser.bind(this);
			this._triggerNode.addEventListener("contextmenu", this._boundcontextmenuEventHandler, true); //$NON-NLS-0$
			window.addEventListener("contextmenu", this._boundContextMenuCloser, false); //$NON-NLS-0$
			
			//clicking on the trigger node should close the context menu
			this._triggerNode.addEventListener("click",  this._boundContextMenuCloser, false);//$NON-NLS-0$
		},
		
		_positionContextMenu: function(event) {
			var mouseLeft = event.clientX;
			var mouseTop = event.clientY;
			
			this._dropdownNode.style.left = mouseLeft + "px"; //$NON-NLS-0$
			this._dropdownNode.style.top = mouseTop + "px"; //$NON-NLS-0$
			this._dropdownNode.style.position = "fixed"; //$NON-NLS-0$		//TODO convert to absolute position
			
			var totalBounds = lib.bounds(this._boundingNode(this._triggerNode));
			var bounds = lib.bounds(this._dropdownNode);
			var bodyBounds = lib.bounds(document.body);
			var triggerBounds = lib.bounds(this._triggerNode);
			
			//ensure menu fits on page horizontally
			if ((bounds.left + bounds.width) > (bodyBounds.left + bodyBounds.width)) {
				if (this._triggerNode.classList.contains("dropdownMenuItem")) { //$NON-NLS-0$
					this._dropdownNode.style.left = -bounds.width + "px"; //$NON-NLS-0$
				} else {
					this._dropdownNode.style.left = (triggerBounds.left  - totalBounds.left - bounds.width + triggerBounds.width) + "px"; //$NON-NLS-0$	
				}
			}
			
			//ensure menu fits on page vertically
			var overflowY = (bounds.top + bounds.height) - (bodyBounds.top + bodyBounds.height);
			if (0 < overflowY) {
				//TODO improve bottom padding estimate
				this._dropdownNode.style.top = (bounds.top - overflowY) + "px";	//$NON-NLS-0$
			}
		},
		
		 _contextMenuCloser: function(event){
			this.close(event);
		},
		
		_contextmenuEventHandler: function(event){
			if (this.open(event)) {
				lib.stop(event);
			} else {
				this.close();
			}
		},		
	});
	
	ContextMenu.prototype.constructor = ContextMenu;
	
	// overrides Dropdown.protoype.open
	ContextMenu.prototype.open = function(event /* optional */) {
		var actionTaken = Dropdown.prototype.open.call(this, event); //call function in super class
		if (actionTaken) {
			if (event) {
				this._positionContextMenu(event);
			}
		}
		return actionTaken;
	};
	
	// overrides Dropdown.protoype.destroy
	ContextMenu.prototype.destroy = function() {
		this._triggerNode.removeEventListener("contextmenu", this._boundcontextmenuEventHandler, true); //$NON-NLS-0$
		this._triggerNode.removeEventListener("click",  this._boundContextMenuCloser, false); //$NON-NLS-0$
		window.removeEventListener("contextmenu", this._boundContextMenuCloser, false); //$NON-NLS-0$
		this._dropdownNode.dropdown = null;
		Dropdown.prototype.destroy.call(this); //call function in super class
	};
	
	//return the module exports
	return {ContextMenu: ContextMenu};
});