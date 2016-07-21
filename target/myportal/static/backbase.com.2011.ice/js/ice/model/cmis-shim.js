/**
 * Copyright © 2013 Backbase B.V.
 */

window.be = window.be || {};
window.be.ice = window.be.ice || {};
window.be.ice.model = window.be.ice.model || {};

be.ice.model.cmis = (function($, util, cmis, b$, Promise) {
    'use strict';

    // small helper for cmis-client.js code below
    var bd = {
        contextRoot: util.getContextRoot()
    };

    /*
     * cmis-client.js readContent is synchronous. We make it asynchronous below
     */

    // helper
    var getProperties = function(entry){
        var properties = {};
            // urlMarker = '/content/atom/';

        if (entry) {
            $(entry).find('cmisra\\:object > cmis\\:properties, properties').children().each(function(i, property){
                properties[$(property).attr('propertyDefinitionId')] = {
                    property: $(property).find('cmis\\:value, value').text(),
                    displayName: $(property).attr('displayName')
                };
            });

            // Extend properties with: objectId, repositoryId, contentRef
            // properties.objectId = properties['cmis:objectId'].property;

            // retrieve repository ID from the url
            // var url = $(entry).find('atom\\:content, content').attr('src');
            // if(url && url.indexOf(urlMarker) > -1){
            //     properties.repositoryId = url.substring(url.indexOf(urlMarker) + urlMarker.length).split('/')[0];
            //     properties.contentRef = properties.repositoryId + ':' + properties.objectId;
            //     properties.path = util.getContentServiceProxyUrl(properties.repositoryId) + 'content?id=' + properties.objectId;
            // }
        }

        return properties;
    };

    var getRelationships = function(entry){
        var relationships = {};
        jQuery(entry).find("cmisra\\:object > cmis\\:relationship, relationship").each(function (i, relationship) {
            var relationshipId = jQuery(relationship).find('cmis\\:properties > cmis\\:propertyId[propertyDefinitionId="cmis\\:objectId"] > cmis\\:value, properties').text();
            relationships[relationshipId] = {};
            jQuery(relationship).find('cmis\\:properties, properties').children().each(function(j, property){
                relationships[relationshipId][jQuery(property).attr("propertyDefinitionId")] = jQuery(property).find("cmis\\:value, value").text()
            });
        });
        return relationships;
    };

    var properties2meta = function(properties){
        var meta = {};
        $.each(properties, function(prop, value) {
            meta[prop] = value.property;
        });
        return meta;
    };


    var prepareObject = function(responseDocument) {
        var properties = getProperties(responseDocument),
            relationships = getRelationships(responseDocument),
            url = $(responseDocument).find('atom\\:content, content').attr('src'),
            urlMarker = '/content/atom/';

        // This object should contain everything we might need in the future
        var obj = {
            objectId  : properties['cmis:objectId'].property,
            name: properties['cmis:name'].property,
            path:  url,
            meta: properties2meta(properties),
            relationships: relationships
        };

        if(url && url.indexOf(urlMarker) > -1){
            obj.repositoryId = url.substring(url.indexOf(urlMarker) + urlMarker.length).split('/')[0];
            obj.contentRef = obj.repositoryId + ':' + obj.objectId;
            // obj.path = util.getContentServiceProxyUrl(obj.repositoryId) + 'content?id=' + properties.objectId;
        }

        return obj;
    };

    var getEntryObject = function(id, repositoryId) {
        return getEntry(id, repositoryId).then(function(responseDocument){
            var object = prepareObject(responseDocument);
            return object;
        });
    };

    var getEntry = function(id, repositoryId) {
        repositoryId = repositoryId || 'contentRepository';
        var url = bd.contextRoot + '/content/atom/' + repositoryId + '/entry?id=' + id + '&includeRelationships=source';
        return be.utils.ajax({
            url: url,
            dataType: 'xml',
            cache: false,
            error: function(xhr){
                var error = be.utils.getErrorText(xhr);
                console.log(error ? error : 'Unknown error');
            }
        });
    };


    var fixedCmis = {

        getObject: function(path, successback, errorback, repository) {

            Promise.cmis.getObject(path, null, null, repository).then(function(responseDocument){
                if (responseDocument !== null) {
                    var object = prepareObject(responseDocument);
                    successback(object);
                }
            }).fail(function(error) {
                //console.log(error);
                if(error && error.status == 404){
                    errorback(error);
                }
            });

        },



        // this has to be here because the error handling is atrocious, and I
        // cannot fix it in cmis-client.js
        saveNewContent: function(params) {
          // helper
           var getThumbUrl = function(entry, url){
               var streamId = jQuery(entry).find("cmis\\:rendition, rendition").find("cmis\\:streamId, streamId").text();
               if(streamId){
                   url = url + "&streamId="+streamId;
                }else{
                   jQuery(entry).find("atom\\:link, link").each(function(i, link){
                       if(jQuery(link).attr('rel') == "alternate"){
                           url = jQuery(link).attr('href');
                       }
                   });
                }
                return url;
           };

          //TODO: create a CMIS container folder for each widget definition, not instance
    //old     var contentUId = false;
    //      try {
              var isText = false;
              if(params.type.indexOf("text") != -1){
                  isText = true;
              }
              var timeStamp = new Date();
              timeStamp = be.utils.ISODateString(timeStamp);

              if(params.objectType == null)
                params.objectType = "cmis:document";

              var properties =
                  [{"key": "cmis:createdBy", "value": bd.loggedInUserId || b$.portal.loggedInUserId},
                   {"key": "cmis:lastModifiedBy", "value": bd.loggedInUserId || b$.portal.loggedInUserId},
                   {"key": "cmis:objectTypeId", "value": params.objectType}];

              if(params.properties){
                  $.each(params.properties, function(key, value) {
                        if (value){
                            properties.push({"key": key, "value": value});
                        }
                    });
              }

              var templateData = {
                      uniqueId: params.fileName,
                      fileName: params.fileName,
                      mediatype: params.type,
                      timeStamp: timeStamp,
                      properties : properties
              };
              if(params.content != null){
                  var base64Content = $.base64.encode(params.content, isText);
                  templateData.base64DocumentContent = base64Content;
                  templateData.create = true;
              }
              var xmlContent = be.utils.processHTMLTemplateByUrl(bd.contextRoot + "/static/backbase.com.2011.ice/xml/cmis/xhtml-post.xml", templateData);

              //console.log('saveNewContent 1 ', params.path);
              fixedCmis.getObject(params.path, function(object){
                  var folderId = object.objectId;
                  if(folderId != false)
                  {
                    //console.log('saveNewContent 2 ', folderId);
                      var url = be.ice.util.getContentServiceProxyUrl(params.repository) + "children?id="+folderId+"&overwriteFlag=true";
    //old                 be.utils.ajax({
                      $.ajax({
                          url: url,
                          data: xmlContent,
                          dataType: "xml",
                          contentType: 'text/xml',  // or contentproxy dies!
                          type: "POST",
                          headers: {
                            bbCSRF: be.utils.getCookie('bbCSRF') // CSRF Support
                          },
                          encodeURI : false,
                          success: function(responseDocument) {
                              if (responseDocument != null) {
                                  var properties = getProperties(responseDocument);
                                  // contentUId = properties["cmis:objectId"].property;
                                  if(params.successCallback){
                                      url = be.ice.util.getContentServiceProxyUrl() + "content/"+properties["cmis:name"].property+"?id="+properties["cmis:objectId"].property;
                                      properties["url"] = {property: url, displayName: "URL"};
                                      var thumbUrl = getThumbUrl(responseDocument, url);
                                      properties["thumbUrl"] = {property: thumbUrl, displayName: "Thumbnail URL"};
                                      // params.successCallback(properties);
                                      params.successCallback(prepareObject(responseDocument));
                                  }
                              }
                          },
                          error:function(xhr){
                                  params.errorCallback(xhr);
                          }
                      });
                  }
                  else
                      console.log("bd.cmis.saveNewContent > unable to get root folder id");
              },
              params.errorCallback, params.repository);
        }
    };

    /*
     * make cmis-client.js functions work with promises:
     */

    // cmis promise functions
    var getObject = util.fbind1(fixedCmis.getObject);
    var createFolder = util.fnkbind(cmis.createFolder);
    var saveNewContent = util.fnkbind(fixedCmis.saveNewContent);
    var readContent = util.fbind1(fixedCmis.readContent);
    var updateContent = util.fnkbind(cmis.updateContent);
    var deleteContent = util.fnkbind(cmis.deleteContent);

    return {
        getEntry: getEntry,
        getEntryObject: getEntryObject,
        getObject: getObject,
        createFolder: createFolder,
        saveNewContent: saveNewContent,
        readContent: Promise.cmis.readContent,
        updateContent: updateContent,
        deleteContent: deleteContent
    };
})(jQuery, be.ice.util, be.cmis, b$, be.promise);
