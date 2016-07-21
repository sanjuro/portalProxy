/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : content.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */

be.utils.define('be.ice.model.content', [
	'jQuery',
    'be.ice.model.cmis',
    'be.ice.util',
    'be.utils'
], function ($, cmis, util, Utils) {

	'use strict';

	var getObject = cmis.getObject;
	var createFolder = cmis.createFolder;
	var saveNewContent = cmis.saveNewContent;
	var cmisReadContent = cmis.readContent;
	var updateContent = cmis.updateContent;
	var deleteContent = cmis.deleteContent;

	var config = {
		// ASSUMPTION: absolute urls point into static folder, relative into CS
		// absoluteUrl: /^https?:\/\/|^\$\(contextRoot\)\//,
		absoluteUrl: /^\$\(contextRoot\)\//,
		rootMarker: '$(contextRoot)',
		contextRoot: util.getContextRoot()
	};

	var relToContentRef = function(jsonStr, relationships){
        for (var relId in relationships) {
            if (relationships.hasOwnProperty(relId)) {
                jsonStr = jsonStr.replace(new RegExp('rel:' + relId, "g"), ['cs', relationships[relId]['bb:targetRepositoryId'] === 'contentRepository' ? 'contentRepository' : '@portalRepository', relationships[relId]['cmis:targetId']].join(':'));
            }
        }
        return jsonStr;
    };

	// folder helpers
	var getFolders = function(path) {
		return path.split('/').slice(1)
			.reduce(function(folders, folder) {
				var previous = folders.slice(-1) || '';
				folders.push(previous + '/' + folder);
				return folders;
			}, []);
	};
	var getOrCreateFolder = function(folder) {
		return getObject({
			path: folder,
			repository: be.ice.model.repositoryId
		}, null, null, be.ice.model.repositoryId)
			// .fail doesn't chain, so use .then(null, failHandler)
			.then(null, function() {
				return createFolder({
					path: folder.replace(/\/[^\/]+$/, '') || '/',
					folderName: folder.replace(/^.*\//, ''),
					repository: be.ice.model.repositoryId
				});
			});
	};

	// api
	var createContent = function(path, content, meta) {
		// TODO: cleanup
		var fileName = path.replace(/^.*\//, ''),
			isRichText = meta && meta['cmis:objectTypeId'] === 'bb:richtext',
			contentType = (isRichText ? 'text/html' : 'application/json') + '; charset=utf-8',
			objectType = isRichText ? 'bb:richtext' : 'bb:structuredcontent';

		path = path.replace(/\/[^\/]+$/, '');
		var save = util.bind(saveNewContent, {
			path: path,
			fileName: fileName,
			content: content,
			// type 'text' cannot be versioned...
			//type: 'bb:richtext',
			type: contentType,
			objectType: objectType, //bd.uiEditingOptions.cmisTypeData['text'],
			properties: meta,
			repository: be.ice.model.repositoryId
		});

		// save the content directly (fast path)
		return save()
			// .fail doesn't chain, so use .then(null, failHandler)
			.then(null, function(xhr) {
				if (xhr.status == 404) {
					// cannot save, folder doesn't exist yet (slow path)
					// check / create all folders on path
					return util.chain(getFolders(path)
						.map(function(folder) {
							return util.bind(getOrCreateFolder, folder);
						})
						// now folder should exist, so try again
						.concat(save)
					).then(function(results) {
						// cleanup return values, no need to return all
						// folder check/create results
						return results[results.length - 1];
					});
				}
				return xhr;
			});
	};


    /**
     * [readObject combine cmis.getObject and cmis.readContent together]
     */
	var readObject = function(path) {
		if (config.absoluteUrl.test(path)) {
			return getTemplate(path);
		} else {

			var deferred = $.Deferred();

			getEntryObject(path).then(function(object) {
				// console.log('readObject', object);
				var meta = object.meta;

				// only read content stream for bb:richtext
				if(meta && (meta['cmis:objectTypeId'] == 'bb:structuredcontent' || meta['cmis:objectTypeId'] == 'bb:richtext')) {

					if (meta['cmis:contentStreamLength'] != '0') {
						cmisReadContent(object.objectId, null, null, object.repositoryId).then(function(content) {
							// cleanup reachtext
							object.content = relToContentRef(content, object.relationships);
							deferred.resolve(object);
						});
					} else {
						deferred.resolve(object);
					}

				} else {
					object.browserRef = path;
					deferred.resolve(object);
				}
			}, function(error){
				deferred.resolve({
					error: 'Can not read CMIS object by path'
				});
			});
			return deferred.promise();
		}
	};

    /**
     * [getTemplate wrapper for cmis.readContent]
     */
	var getTemplate = function(path) {
		// TODO: move to model.js
		path = path.replace(config.rootMarker, config.contextRoot);
		return Utils.loadTemplateByUrl(path, true)
			// strip off status and xhr params
			.then(function(data) {
				return {content: data};
			});
	};

    /**
     * [readContent wrapper for cmis.readContent]
     */
	var readContent = function(path) {
		if (config.absoluteUrl.test(path)) {
			return getTemplate(path);
		} else {
			return getEntryObject(path)
				.then(function(object) {
					return cmisReadContent({
						contentUid: object.objectId
					});
				})
				// .fail doesn't chain, so use .then(null, failHandler)
				.then(null, function() {
					return $.when('');
				});
		}
	};

	/**
	 * [getEntryObject description]
	 * @param  {[type]} path [description]
	 * @return Promise to return object {objectId: '...', name: '...', contentRef: '...'}
	 */
	var getEntryObject = function(path) {
		var ref = path.split(':');
		if(ref && ref.length === 2){ // [repo]:[objectId]
			return cmis.getEntryObject(ref[1], ref[0]).then(function(data){
				return data;
			});
		} else if(ref && ref.length === 3){ // cs:[repo]:[objectId]
			if (ref[1] === '@portalRepository'){
				ref[1] = be.ice.model.repositoryId;
			}
			return cmis.getEntryObject(ref[2], ref[1]).then(function(data){
				return data;
			});
		}
		return cmis.getObject({
			path: path,
			repository: be.ice.model.repositoryId
		}).then(function(data){
			return data;
		});
	};





	return {
		createContent: createContent,
		readObject: readObject,
		readContent: readContent,

		// TODO: fix return value, it returns [] on update
		updateContent: function(path, content, meta) {
			// console.log('updateContent', path, content, meta);

			return getEntryObject(path)
				// (fast path)
				.then(function(object) {
					// console.log('updateContent', object);
					var isRichText = meta && meta['cmis:objectTypeId'] === 'bb:richtext',
						contentType = (isRichText ? 'text/html' : 'application/json') + '; charset=utf-8';

					if (isRichText) {
						delete meta['cmis:objectTypeId'];
					}

					return updateContent({
						ContentUid: object.objectId,
						content: content,
						properties: meta,
						repository: object.repositoryId,
						type: contentType
					});
				},
				function(xhr) {
					if (xhr.status == 404) {
						// console.log('createContent', path, content, meta);
						// doesn't exist, so try create instead (slow path)
						return createContent(path, content, meta);
					}
					return xhr;
				});
		},


		// TODO: test this
		// TODO: remove empty folders as well?
		deleteContent: function(path) {
			return getObject(path)
				.then(function(object) {
					return deleteContent({
						objectId: object.id
					});
				});
		},
		getId: function(path) {
			return getObject(path)
				// catch the 404s
				.then(null, function() {
					return $.when('');
				});
		}
	};
});
