/*!
 *	----------------------------------------------------------------
 *	Copyright Backbase b.v. 2003/2012
 *	All rights reserved.
 *	----------------------------------------------------------------
 *	Version 5.5
 *	Author : Backbase R&D - Amsterdam - New York
 *	----------------------------------------------------------------
 */



(function($) {
	"use strict";
	var Class = b$.Class;

	var NS = b$.bdom.getNamespace('http://backbase.com/2012/portalView');
	var Container = NS.getClass('container');
	var layouts = b$.view.bdom.layout;

	var ResizableColumnLayout = NS.getClass('ResizableColumnLayout');

	/*
	- Relative
	- Absolute
	- AbsolutePool
	*/

	var getCoordinates = function (elm) {
		var r = $(elm).offset();
		var c = {
			x:r.left,
			y:r.top,
			left:r.left,
			top:r.top,
			w:elm.offsetWidth,
			h:elm.offsetHeight
		};
		return c;
	};
	var findParentByClass = function (elm, className) {
		while (elm) {
			if ($(elm).hasClass(className))return elm;
			elm = elm.parentNode;
		}
	};

//	function OrderSort(a, b) {
//		a = parseInt(a.getOrderPreference()) || 0;
//		b = parseInt(b.getOrderPreference()) || 0;
//		return a - b;
//	};
//
//	function isInside (tx,ty,x,y,w,h) {
//	//	console.log(x>=x2 , x<=x2+w , y>=y2 , y<=y2+h)
//		if(tx>=x && tx<=x+w && ty>=y && ty<=y+h )
//			return true;
//		return false;
//	}
//
//
//	function findModel (doc, model) {
//		for (var n in doc.all) {
//			if (doc.all[n].model == model) {
//				return doc.all[n];
//			}
//		}
//	}

	function refreshContainerOnPrefModified(bDomView, prefList) {
		var isChange = false,
			prefArray = prefList && prefList.length? prefList : ['padding', 'numberOfColumns', 'columnWidths', 'rowHeights', 'fixedHeight'];

		bDomView.addEventListener('preferencesSaved', function (ev) {
			//console.log('preferencesSaved ', ev)
			if(isChange){
				//console.log('refreshHTML from preferencesSaved')
				bDomView.refreshHTML(function(){
					isChange = false;
				});
			}
		},false, bDomView);

		bDomView.model.addEventListener('PrefModified', function (ev) {
			if(!isChange && bDomView.model.name === ev.target.name){
				if($.inArray(ev.attrName, prefArray) !== -1){
					//console.log('isChange = true from PrefModified')
					isChange = true;
				}
			}
		}, false, bDomView);
	}


	var ColumnContainer = NS.registerElement('Column_table', Container.extend(function (bdomDocument, namespaceURI, localName, node) {
			Container.call(this, bdomDocument, namespaceURI, localName, node);
			this.isPossibleDragTarget = true;
		}, {
			buildHTML: function(elm){
				var oDocument = document;
				elm = Container.prototype.buildHTML.call(this, elm);
				this.htmlAreas = $('> table > tbody > tr > td', elm);

				if (this.getPreference('isManageableArea') == true) {
					this.addEventListenerManageableArea();
				};

				return elm;
			},
			readyHTML: function(){
				refreshContainerOnPrefModified(this);
	
				if (this.getPreference('isManageableArea') == true) {
					this.initManageableArea();
				};
			},
			getContainerTemplate: function() {
				var oData = this.model.getJSON(),
					aPreferences = oData.preferences,
					columnNumber = 1,
					fallbackContainerTmpl,
					i, oPreference;

				for (i = 0; i < aPreferences.length; i++) {
					oPreference = aPreferences[i];
					if (oPreference.name == 'numberOfColumns') {
						columnNumber = oPreference.value || 1;
						break;
					}
				}
				fallbackContainerTmpl = '<div class="bp-container bp-ColumnLayout bp-ui-dragRoot">' +
						'<table cellspacing="0" class="bp-ColumnLayout-table">' + '<tbody>' + '<tr class="bp-ColumnLayout-tr">';
				for (i = 0; i < columnNumber; i++) {
					fallbackContainerTmpl += '<td class="bp-area bp-align-top bp-ColumnLayout-td bp-ColumnLayout-column-' + i + '">' + '</td>';
				}
				fallbackContainerTmpl += '</tr>' + '</tbody>' + '</table>' + '</div>';
				return fallbackContainerTmpl;
			},
			initManageableArea: function() {
				var page = this;
				while (page.model.tag.toLowerCase() !== 'page' && page.model.tag.toLowerCase() !== 'portal' && page.model.tag.toLowerCase() !== 'application') {
					page = page.parentNode;
				};

				if (page.pageType == 'master'){ // master page
					if (!b$._private.htmlAPI.hasClass(this.htmlNode, 'bp-manageableArea-masterpage')) {
						b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-masterpage');
					};
                    var oMessageRoot = $('.bp-manageableArea--message', this.htmlNode);
                    if(oMessageRoot.length == 0){
                        oMessageRoot = document.createElement('div');
                        oMessageRoot.setAttribute('class', 'bp-manageableArea--message');
                        var message1 = document.createElement('div');
                        var text1 = document.createTextNode('Manageable area');
                        var message2 = document.createElement('div');
                        var text2 = document.createTextNode('Reordering, deleting and adding items');
                        var message3 = document.createElement('div');
                        var text3 = document.createTextNode('is allowed on regular pages');
    
                        message1.appendChild(text1);
                        message2.appendChild(text2);
                        message3.appendChild(text3);
    
                        oMessageRoot.appendChild(message1);
                        oMessageRoot.appendChild(message2);
                        oMessageRoot.appendChild(message3);
    
                        this.htmlNode.appendChild(oMessageRoot);
                    }
				} else {
					page.isPossibleDragTarget = false;
				};

			},
			addEventListenerManageableArea: function() {
				this.addEventListener('DOMNodeInserted', function(event) {
					if (event.target.parentNode == this) {
						if (this.childNodes.length !== 0) {
							b$._private.htmlAPI.removeClass(this.htmlNode, 'bp-manageableArea-empty');
						};
					};
				}, false);
				this.addEventListener('DOMNodeInsertedIntoDocument', function(event) {
					if (event.target == this) {
						if (this.childNodes && this.childNodes.length == 0) {
							b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-empty');
						};
					};
				}, false);
				this.addEventListener('DOMNodeRemoved', function(event) {
					if (event.target.parentNode == this) {
						if (this.childNodes && this.childNodes.length == 0) {
							b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-empty');
						} else if (this.childNodes && this.childNodes.length == 1 && event.target == this.childNodes[0]) {
							b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-empty');
						};
					};
				}, false);
				this.addEventListener('dragEnter', function(event) {
					if (event.target == this && this.ownerDocument.dragManager.dragOptions.htmlNode.catalogItemJson) {
						var isManageableArea = this.ownerDocument.dragManager.dragOptions.htmlNode.catalogItemJson.preferences.isManageableArea;
						if (isManageableArea && isManageableArea.value == 'true') {
							b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-noDropZone');
						};
					};
				}, false);
				this.addEventListener('dragLeave', function(event) {
					if (event.target == this) {
						b$._private.htmlAPI.removeClass(this.htmlNode, 'bp-manageableArea-noDropZone');
					};
				}, false);
			}
		})
	);


	var ColumnContainerResizable = NS.registerElement('Column_table_resizable', ColumnContainer.extend(function (bdomDocument, namespaceURI, localName, node) {
		ColumnContainer.call(this, bdomDocument, namespaceURI, localName, node);
		this.isPossibleDragTarget = true;
		this.layout = new ResizableColumnLayout(this);
	}, {
		buildHTML: function(elm){
			var oDocument = document, i, l;
			elm = Container.prototype.buildHTML.call(this, elm);

			var sProfile = {
				'ADMIN' : 0,
				'CREATOR' : -1,
				'COLLABORATOR' : -2,
				'CONTRIBUTOR': -3,
				'CONSUMER' : -4
			};
			var secProfile = sProfile[this.model.securityProfile];
			if (secProfile >= sProfile['CREATOR']){
				$(elm).addClass('bp-can-resize');
			}

			this.htmlAreas = $('> table > tbody > tr > td', elm);

			this.aCoords = [];
			this.numberOfColumns = Math.abs(parseInt(this.getPreference('numberOfColumns'))) || 1;
			var widths = this.getPreference('columnWidths').split(',').map(function(a){return parseFloat(a)});
			var w = this.constrainProportions(widths, this.numberOfColumns);
			if (w.toString() !== widths.toString()){
				widths = w;
				this.setPreference('columnWidths', widths.map(function(a){return a+'%'}).join(','));
				this.model.save();
			}
			// if (widths.length != this.numberOfColumns || widths.length === 1 && widths[0] === "0"){
			// 	widths = [];
			// 	for (i = 0; i < this.numberOfColumns; i++){
			// 		widths.push(100 / this.numberOfColumns);
			// 	}
			// }
			for (i = 0, l = widths.length; i < l; i++){
				this.aCoords.push(widths[i]);
			}

			this.htmlResizerGrips = [];

			for(i=0;i<elm.childNodes.length;i++){
				//if(htmlAPI.hasClass(elm.childNodes[i], 'bp-ui-resizeGrip')){
				if($(elm.childNodes[i]).hasClass('bp-ui-resizeGrip')){
					this.htmlResizerGrips.push(elm.childNodes[i]);
				}
			}

			this.resizeIndicators = [];

			for(i=0;i<elm.childNodes.length;i++){
				if($(elm.childNodes[i]).hasClass('bp-ui-resizeIndicator')){
					this.resizeIndicators.push(elm.childNodes[i]);
				}
			}


			return elm;
		},

		getContainerTemplate: function() {
			var oData = this.model.getJSON(),
				aPreferences = oData.preferences,
				columnNumber = 1,
				paddingValue = 5,
				fallbackContainerTmpl,
				i, oPreference;
			for (i = 0; i < aPreferences.length; i++) {
				oPreference = aPreferences[i];
				if (oPreference.name == 'numberOfColumns') {
					columnNumber = oPreference.value || 1;
					break;
				}
				if (oPreference.name === 'padding'){
					paddingValue = parseInt(oPreference.value);
				}
			}
			fallbackContainerTmpl = '<div class="bp-container bp-ColumnLayout bp-ui-dragRoot">' +
					'<table cellspacing="0" class="bp-ColumnLayout-table" style="border-spacing:' + paddingValue + 'px; border-collapse: separate;">' + '<tbody>' + '<tr class="bp-ColumnLayout-tr">';
			for (i = 0; i < columnNumber; i++) {
				fallbackContainerTmpl += '<td class="bp-area bp-align-top bp-ColumnLayout-td bp-ColumnLayout-column-' + i + '">' + '</td>';
			}
			fallbackContainerTmpl += '</tr>' + '</tbody>' + '</table>';
			for (i = 0; i < columnNumber-1; i++){
				fallbackContainerTmpl += '<div class="aa-resizebar bp-ui-resizeGrip"><div class="aa-resizebar-inner"></div></div>';
			}
			fallbackContainerTmpl += '<div class="bp-ui-resizeIndicator"></div>';
			fallbackContainerTmpl += '<div class="bp-ui-resizeIndicator"></div>';
			fallbackContainerTmpl += '</div>';
			return fallbackContainerTmpl;
		},

		readyHTML: function () {
			var This = this;
			this.addEventListener('dragDrop', function(event){
				var dm = this.ownerDocument.dragManager;
				// this.resizeIndicators[0].style.display = 'none';
				// this.resizeIndicators[1].style.display = 'none';
				if (findParentByClass(dm.dragOptions.target, dm.cqs_resizeGrip)){
					var widths = this.constrainProportions(this.aCoords, this.numberOfColumns);
					widths = widths.map(function(a){return a+'%'}).join(',');
					this.setPreference('columnWidths', widths);
					this.model.save();
				}
			});
			this.addEventListener('dragEnter', function(event){
				var dm = this.ownerDocument.dragManager;
				if (this.htmlResizerGrips.indexOf(dm.dragOptions.target) !== -1){
					// this.resizeIndicators[0].style.display = 'block';
					// this.resizeIndicators[1].style.display = 'block';
				}
			});
			This.model.addEventListener('PrefModified', function (ev) {
				This.aCoords = [];
				This.numberOfColumns = Math.abs(parseInt(This.getPreference('numberOfColumns'))) || 1;
				var widths = This.getPreference('columnWidths').split(',').map(function(a){return parseFloat(a)});
				for (var i = 0, l = widths.length; i < l; i++){
					This.aCoords.push(widths[i]);
				}
				This.reflow();
			}, false, This);


			refreshContainerOnPrefModified(this, ['padding', 'numberOfColumns']);

			this.reflow();
		},

		_containerReflow: function(){
			this.reflow();
		},

		m_resize: function (event, dm) {
			// debugger
			var x = event.clientX,
				y = event.clientY,
				a, k;

			var dx = x;
			var left = this.htmlResizerGrips.indexOf(dm.dragOptions.target);
			var right = left + 1;
			var totalWidth = Number(this.aCoords[left]) + Number(this.aCoords[right]);
			// console.log('total:'+totalWidth);

			var oCoord = getCoordinates(this.htmlNode);

			var shift = oCoord.left + (left > 0 ? this.htmlAreas[left-1].offsetLeft + this.htmlAreas[left-1].offsetWidth : 0);

			x = (x - shift) / (oCoord.w) * 100;
			x = x < 0 ? 0 : x > totalWidth ? totalWidth : x;

			this.aCoords[left] = x;
			this.aCoords[right] = totalWidth - x;
			// console.log(this.aCoords);
			this.reflow();


			var offsetTop = $(this.htmlNode).offset().top;
			var offsetLeft = $(this.htmlNode).offset().left;
			var gripTop = this.htmlResizerGrips[left].offsetTop;
			var gripBottom = this.htmlResizerGrips[left].offsetTop + this.htmlResizerGrips[left].offsetHeight - this.resizeIndicators[0].offsetHeight;
			var gripLeft = this.htmlResizerGrips[left].offsetLeft;
			this.resizeIndicators[0].innerHTML = Math.round(this.aCoords[left]) + '%';
			this.resizeIndicators[0].style.top = Math.min(Math.max((event.clientY - offsetTop - 8), gripTop), gripBottom) + 'px';
			this.resizeIndicators[0].style.left = (gripLeft - 38) + 'px';
			this.resizeIndicators[1].innerHTML = Math.round(this.aCoords[right]) + '%';
			this.resizeIndicators[1].style.top = Math.min(Math.max((event.clientY - offsetTop - 8), gripTop), gripBottom) + 'px';
			this.resizeIndicators[1].style.left = (gripLeft + 13) + 'px';

			var areas = this.getAreaOrderedChildren();
			if (areas[left]){
				for (a = 0, k = areas[left].length; a < k; a++){
					if (areas[left][a].model.tag === 'container'){
						areas[left][a].reflow(); // reflow nested layouts
					}
				}
			}
			if (areas[right]){
				for (a = 0, k = areas[right].length; a < k; a++){
					if (areas[right][a].model.tag === 'container'){
						areas[right][a].reflow(); // reflow nested layouts
					}
				}
			}



		}

	})
	);
}(jQuery));
