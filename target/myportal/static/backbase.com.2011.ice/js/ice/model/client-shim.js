/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : client-shim.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */

be.utils.define('be.ice.model.client', [
    'be.ice.util'
], function (util) {

	// utils
	var asRef = function(pref) {
		return {
			name: pref.name,
			value: pref.value,
			type: pref.dataType && pref.dataType.name || 'string'
		};
	};

	// main functions
	var getPreferences = function(widget) {
		return (
			widget &&
			widget.model &&
			widget.model.preferences &&
			widget.model.preferences.array ||
			[]
		)
		.map(asRef);
	};

	var getPreference = function(widget, name) {
		return getPreferences(widget)
			.filter(function(pref) {
				return pref.name == name;
			})
			[0];
	};

	var setPreference = function(widget, name, value, type) {
		type = type || 'string';
		if (!widget) return;

		var old = getPreference(widget, name) || {};
		if (old.value == value && old.type == type) return;

// console.log('setting pref', name, value, type);
		if (old.name && old.type == type) {
			widget.model.setPreference(name, value);
		} else {
			var pref = widget.model.createPreference(name, type, value);
			widget.model.setPreferenceNode(pref);
		}
	};

	var deletePreference = function(widget, name) {
        widget && widget.model.removePreference(name);
	};

	var savePreferences = util.fbind1(function(widget, success, error) {
		return widget && widget.model.save(success, error);
	});

	var getWidgetByName = function(name) {
		if (
			window.b$ &&
			window.b$.portal &&
			window.b$.portal.portalView &&
			window.b$.portal.portalView.getElementById
		) {
			return window.b$.portal.portalView.getElementById('VIEW-' + name);
		}
	};

	var getName = function(widget) {
		return widget && widget.model && widget.model.name;
	};

	return {
		getPreferences: getPreferences,
		getPreference: getPreference,
		setPreference: setPreference,
		deletePreference: deletePreference,
		savePreferences: savePreferences,
		getWidgetByName: getWidgetByName,
		getName: getName
	};
});
