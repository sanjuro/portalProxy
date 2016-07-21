/**
 * Copyright © 2013 Backbase B.V.
 */

window.be = window.be || {};
window.be.ice = window.be.ice || {};
window.be.ice.model = window.be.ice.model || {};

be.ice.model.portal = (function(client) {
	// add client stuff
	var getPreferences = client.getPreferences;
	var getPreference = client.getPreference;
	var setPreference = client.setPreference;
	var deletePreference = client.deletePreference;
	var savePreferences = client.savePreferences;
	var getName = client.getName;
	var getWidgetByName = client.getWidgetByName;

	var getReferences = function(widget) {
		return getPreferences(widget)
			.filter(function(pref) {
				return pref.type == 'contentRef' || pref.type == 'linkRef';
			});
	};

	var names = function(refs) {
		return refs
			.map(function(ref) {
				return ref.name;
			})
			.sort();
	};
	var lookup = function(names) {
		return names
			.reduce(function(obj, name) {
				obj[name] = true;
				return obj;
			}, {});
	};

	var updateReferences = function(widget, newrefs) {
		var oldrefs = getReferences(widget);
		var newnamelookup = lookup(names(newrefs));

		oldrefs
			.filter(function(ref) {
				return !newnamelookup[ref.name];
			})
			.forEach(function(ref) {
console.log('deleting pref', ref);
				deletePreference(widget, ref.name);
			});

		newrefs
			// don't save templateUrl, it can be different in designmode
			.filter(function(ref) {
				return ref.name != 'templateUrl';
			})
			.forEach(function(ref) {
// console.log('set pref', ref);
				setPreference(widget, ref.name, ref.value, ref.type);
			});
	};

	var saveModel = function(widget, newmodel) {
		updateReferences(widget, newmodel);
		return savePreferences(widget);
	};

   return {
		getPreferences: getPreferences,
		getPreference: getPreference,
		setPreference: setPreference,
		deletePreference: deletePreference,
		savePreferences: savePreferences,
		getName: getName,
		getWidgetByName: getWidgetByName,

		getReferences: getReferences,
		updateReferences: updateReferences,
		saveModel: saveModel
	};
})(be.ice.model.client);