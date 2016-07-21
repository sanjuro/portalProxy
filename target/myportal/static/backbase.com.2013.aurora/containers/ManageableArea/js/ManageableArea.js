(function () {
	var Container = b$.bdom.getNamespace('http://backbase.com/2013/portalView').getClass('container');
//  ----------------------------------------------------------------
	var ManageableArea = Container.extend(function (bdomDocument, node) {
		Container.apply(this, arguments);
		this.isPossibleDragTarget = true;
	}, {
		localName: 'ManageableArea',
		namespaceURI: 'http://backbase.com/2013/aurora',
		DOMReady: function() {
			Container.prototype.DOMReady.apply(this, arguments);

	        var page = this;
	        while (page.model.tag.toLowerCase() !== 'page' && page.model.tag.toLowerCase() !== 'portal' && page.model.tag.toLowerCase() !== 'application') {
	            page = page.parentNode;
	        };

			if (page.pageType == 'master'){ // master page
				if (!b$._private.htmlAPI.hasClass(this.htmlNode, 'bp-manageableArea-masterpage')) {
					b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-masterpage');
				};
			} else {
				page.isPossibleDragTarget = false;

				var oMessage = this.getDisplay('message');
				if (oMessage) {
					oMessage.parentNode.removeChild(oMessage);
				}
			};
		}
	}, {
		template: function(json) {
			var data = {item: json.model.originalItem};
			var sTemplate = backbase_com_2013_aurora.ManageableArea(data);
			return sTemplate;
		},
		handlers: {
			'DOMNodeInserted': function(event) {
				if (event.target.parentNode == this) {
					if (this.childNodes.length !== 0) {
						b$._private.htmlAPI.removeClass(this.htmlNode, 'bp-manageableArea-empty');
					};
				};
			},
			'DOMNodeInsertedIntoDocument': function(event) {
				if (event.target == this) {
					if (this.childNodes && this.childNodes.length == 0) {
						b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-empty');
					};
				};
			},
			'DOMNodeRemoved': function(event) {
				if (event.target.parentNode == this) {
					if (this.childNodes && this.childNodes.length == 0) {
						b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-empty');
					} else if (this.childNodes && this.childNodes.length == 1 && event.target == this.childNodes[0]) {
						b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-empty');
					};
				};
			},
			'dragEnter': function(event) {
				if (event.target == this && this.ownerDocument.dragManager.dragOptions.htmlNode.catalogItemJson) {
					var isManageableArea = this.ownerDocument.dragManager.dragOptions.htmlNode.catalogItemJson.preferences.isManageableArea;
					if (isManageableArea && isManageableArea.value == 'true') {
						b$._private.htmlAPI.addClass(this.htmlNode, 'bp-manageableArea-noDropZone');
					};
				};
			},
			'dragLeave': function(event) {
				if (event.target == this) {
					b$._private.htmlAPI.removeClass(this.htmlNode, 'bp-manageableArea-noDropZone');
				};
			}
		}
	});
})();
